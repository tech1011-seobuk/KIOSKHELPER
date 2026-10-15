import {createS3Reader,createMappingService,sha256} from '../_shared/cms-mapping.mjs';
import {createMembershipHandler} from '../_shared/cms-membership.mjs';
const url=Deno.env.get('SUPABASE_URL');
if(url!=='https://lsetixbyarexggxsihen.supabase.co')throw new Error('PRODUCTION_PROJECT_REQUIRED');
const mapping=createMappingService(createS3Reader({accessKeyId:Deno.env.get('CMS_MAPPING_AWS_KEY'),secretAccessKey:Deno.env.get('CMS_MAPPING_AWS_SECRET')}));
Deno.serve(createMembershipHandler({url,serviceKey:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),anonKey:Deno.env.get('SUPABASE_ANON_KEY'),mapping,sha256}));
