// Server-only: never bundle this module or S3 credentials into the static site.
import { XMLParser, XMLValidator } from 'fast-xml-parser';

export const CMS_S3 = Object.freeze({
  region: 'ap-northeast-2',
  host: 'seobuk-cms-member-store-mapping.s3.ap-northeast-2.amazonaws.com',
  manifest: '/cms-member-store-mapping/latest/manifest.json',
  xml: '/cms-member-store-mapping/latest/user-store.xml',
});
const encoder = new TextEncoder();
const utf8 = new TextDecoder('utf-8', { fatal: true });
const hex = bytes => [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2, '0')).join('');
export const sha256 = async value => hex(await crypto.subtle.digest('SHA-256', value));
async function hmac(key, value) {
  const imported = await crypto.subtle.importKey('raw', typeof key === 'string' ? encoder.encode(key) : key,
    {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', imported, encoder.encode(value)));
}
export class CmsMappingError extends Error {
  constructor(code) { super(code); this.name = 'CmsMappingError'; this.code = code; }
}
function reject(code) { throw new CmsMappingError(code); }

// Only the two fixed object paths are accepted. No S3 list/write/delete operations.
export function createS3Reader({ accessKeyId, secretAccessKey, fetchImpl = fetch, clock = () => new Date() }) {
  if (!accessKeyId || !secretAccessKey) reject('CMS_NOT_CONFIGURED');
  return async function readObject(path) {
    if (path !== CMS_S3.manifest && path !== CMS_S3.xml) reject('CMS_PATH_NOT_ALLOWED');
    const now = clock().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = now.slice(0, 8), scope = `${date}/${CMS_S3.region}/s3/aws4_request`;
    const empty = await sha256(encoder.encode(''));
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalHeaders = `host:${CMS_S3.host}\nx-amz-content-sha256:${empty}\nx-amz-date:${now}\n`;
    const canonical = ['GET', path, '', canonicalHeaders, signedHeaders, empty].join('\n');
    const key = await hmac(await hmac(await hmac(await hmac('AWS4' + secretAccessKey, date), CMS_S3.region), 's3'), 'aws4_request');
    const signature = hex(await hmac(key, ['AWS4-HMAC-SHA256', now, scope, await sha256(encoder.encode(canonical))].join('\n')));
    const signal = AbortSignal.timeout(15000);
    let response;
    try {
      response = await fetchImpl(`https://${CMS_S3.host}${path}`, {
        method: 'GET', redirect: 'error', signal,
        headers: {'x-amz-content-sha256': empty, 'x-amz-date': now,
          authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`},
      });
    } catch { reject('CMS_UNAVAILABLE'); }
    if (!response.ok || !response.body) reject('CMS_UNAVAILABLE');
    const limit = path === CMS_S3.manifest ? 65536 : 8 * 1024 * 1024;
    if (Number(response.headers.get('content-length')) > limit) { await response.body.cancel(); reject('CMS_TOO_LARGE'); }
    const reader = response.body.getReader(), chunks = [];
    let size = 0;
    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        size += value.length;
        if (size > limit) { await reader.cancel(); reject('CMS_TOO_LARGE'); }
        chunks.push(value);
      }
    } catch (error) {
      if (error instanceof CmsMappingError) throw error;
      reject('CMS_UNAVAILABLE');
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return bytes;
  };
}

export function parseManifest(bytes) {
  let value;
  try { value = JSON.parse(utf8.decode(bytes)); } catch { reject('CMS_MANIFEST_INVALID'); }
  // Live export uses xmlSha256; dataSha256 hashes another representation and must not be used for XML.
  const hash = value?.xmlSha256 ?? value?.sha256;
  if (typeof hash !== 'string' || !/^[a-fA-F0-9]{64}$/.test(hash) ||
      !Number.isSafeInteger(value.rowCount) || value.rowCount < 1 || value.rowCount > 100000) reject('CMS_MANIFEST_INVALID');
  if (value.xmlSha256 && value.sha256 && value.xmlSha256.toLowerCase() !== value.sha256.toLowerCase()) reject('CMS_MANIFEST_INVALID');
  return Object.freeze({hash: hash.toLowerCase(), rowCount: value.rowCount, generatedAt: value.generatedAt ?? null});
}

export async function parseMapping(bytes, manifest) {
  if (await sha256(bytes) !== manifest.hash) reject('CMS_HASH_MISMATCH');
  let xml;
  try { xml = utf8.decode(bytes); } catch { reject('CMS_XML_INVALID'); }
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) reject('CMS_XML_INVALID');
  let document;
  try {
    document = new XMLParser({ignoreAttributes: false, ignoreDeclaration: true,
      parseTagValue: false, trimValues: false, processEntities: true,
      isArray: (_name, path) => path === 'user_store_list.item',
    }).parse(xml);
  } catch { reject('CMS_XML_INVALID'); }
  const root = document?.user_store_list;
  if (!root || typeof root !== 'object' || Object.keys(document).length !== 1 ||
      Object.keys(root).some(key => key !== 'item' && !key.startsWith('@_') && !(key === '#text' && !String(root[key]).trim())) || !Array.isArray(root.item)) reject('CMS_SCHEMA_INVALID');
  if (root.item.length !== manifest.rowCount) reject('CMS_COUNT_MISMATCH');
  const byId = new Map(), normalized = new Map();
  for (const item of root.item) {
    if (!item || Object.keys(item).filter(key => !(key === '#text' && !String(item[key]).trim())).sort().join(',') !== 'store_name,user_id') reject('CMS_SCHEMA_INVALID');
    const id = item.user_id, store = item.store_name;
    if (typeof id !== 'string' || typeof store !== 'string' || !id.trim() || !store.trim() ||
        id.length > 100 || store.length > 300 || /[\u0000-\u001f\u007f]/.test(id) ||
        /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(store)) reject('CMS_FIELDS_INVALID');
    if (!byId.has(id)) byId.set(id, new Set());
    // Preserve source strings, Korean, leading zeroes and case exactly.
    byId.get(id).add(store);
    const normalizedId = id.trim();
    if (!normalized.has(normalizedId)) normalized.set(normalizedId, new Set());
    normalized.get(normalizedId).add(id);
  }
  return {manifest, byId, normalized};
}

export function matchCmsId(mapping, submittedId) {
  if (typeof submittedId !== 'string' || !submittedId.trim() || submittedId.length > 100 || /[\u0000-\u001f\u007f]/.test(submittedId)) reject('CMS_ID_INVALID');
  const id = submittedId.trim(), candidates = mapping.normalized.get(id);
  if (!candidates?.size) reject('CMS_ID_NOT_FOUND');
  // Never silently merge IDs differing by whitespace. Padded source IDs need upstream correction.
  if (candidates.size !== 1 || !candidates.has(id)) reject('CMS_ID_NEEDS_REVIEW');
  return {cmsId: id, stores: [...mapping.byId.get(id)].sort((a, b) => a.localeCompare(b, 'ko')),
    mappingHash: mapping.manifest.hash};
}

// Re-check the manifest on each lookup. Unchanged content skips XML; outages never serve stale approval data.
export function createMappingService(readObject) {
  let cached, inFlight;
  async function refresh() {
    for (let attempt = 0; attempt < 2; attempt++) {
      const manifest = parseManifest(await readObject(CMS_S3.manifest));
      if (cached?.manifest.hash === manifest.hash) {
        if (cached.manifest.rowCount !== manifest.rowCount) reject('CMS_COUNT_MISMATCH');
        return cached;
      }
      try { cached = await parseMapping(await readObject(CMS_S3.xml), manifest); return cached; }
      catch (error) { if (error.code !== 'CMS_HASH_MISMATCH' || attempt === 1) throw error; }
    }
  }
  return {async lookup(id) {
    if (!inFlight) inFlight = refresh().finally(() => { inFlight = undefined; });
    return matchCmsId(await inFlight, id);
  }};
}
