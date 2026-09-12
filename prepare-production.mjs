import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync,lstatSync} from 'node:fs';
import {resolve} from 'node:path';
import vm from 'node:vm';
const [sourceArg,outArg,version]=process.argv.slice(2),source=resolve(sourceArg),out=resolve(outArg);
if(!/^\d+$/.test(version))throw Error('Numeric release version required');
mkdirSync(out,{recursive:true});
const read=n=>readFileSync(resolve(source,n),'utf8');
function replaceOnce(text,from,to){if(text.split(from).length!==2)throw Error('Environment conversion mismatch: '+from);return text.replace(from,to);}
let html=read('index.html');
for(const [a,b] of [
 ["const APP_ENV = 'staging';","const APP_ENV = 'production';"],
 ["const SUPABASE_URL = 'https://mjzhljlhjsbnnxyekmwy.supabase.co';","const SUPABASE_URL = 'https://lsetixbyarexggxsihen.supabase.co';"],
 ["const SUPABASE_ANON_KEY = 'sb_publishable_7f69TqsA11Ol_iLitneqEw_ker_V9px';","const SUPABASE_ANON_KEY = 'sb_publishable_hbv-ismSGLV_QDHffrT-qA_PK3X81XO';"],
 ["const OFFLINE_QUEUE_KEY = 'kioskHelperOfflineEvents:staging:' + SUPABASE_URL;","const OFFLINE_QUEUE_KEY = 'kioskHelperOfflineEvents';"],
 ['<title>🧪 [테스트 서버] PHOTOISM 헬퍼</title>','<title>PHOTOISM 헬퍼</title>'],
 ['<meta name="theme-color" content="#7a3b12">','<meta name="theme-color" content="#1f1f23">'],
 ['<meta name="apple-mobile-web-app-title" content="🧪테스트 헬퍼">','<meta name="apple-mobile-web-app-title" content="포토이즘 헬퍼">']
])html=replaceOnce(html,a,b);
html=html.replace(/<div id="stagingBanner">[^<]*<\/div>/,'');
if(html.includes('mjzhljlhjsbnnxyekmwy')||html.includes('sb_publishable_7f69TqsA11Ol_iLitneqEw_ker_V9px')||html.includes('id="stagingBanner"'))throw Error('Staging configuration leaked');
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))new vm.Script(match[1]);
writeFileSync(resolve(out,'index.html'),html);
let sw=read('sw.js');if(!/const CACHE_NAME = 'photoism-helper-staging-v\d+';/.test(sw))throw Error('Cache conversion mismatch');
sw=sw.replace(/const CACHE_NAME = 'photoism-helper-staging-v\d+';/,"const CACHE_NAME = 'photoism-helper-v"+version+"';").replace('^photoism-helper-staging-v','^photoism-helper-v');new vm.Script(sw);writeFileSync(resolve(out,'sw.js'),sw);
const manifest=JSON.parse(read('manifest.json'));Object.assign(manifest,{name:'포토이즘 헬퍼',short_name:'포토이즘 헬퍼',description:'포토이즘·스내피즘 키오스크 진단 도구',theme_color:'#1f1f23'});writeFileSync(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
for(const name of ['icon-192.png','icon-512.png','assets','css','js','images','fonts']){const path=resolve(source,name);if(existsSync(path)){if(lstatSync(path).isSymbolicLink())throw Error('Symlink not allowed');cpSync(path,resolve(out,name),{recursive:true});}}
writeFileSync(resolve(out,'.nojekyll'),'');
console.log('Production bundle verified: '+version);
