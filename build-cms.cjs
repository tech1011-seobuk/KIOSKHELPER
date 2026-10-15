// Produces a single, credential-free Supabase dashboard deployment file.
const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
const root=__dirname;
(async()=>{
 const entry=path.join(root,'supabase/functions/cms-membership/index.mjs');
 const result=await esbuild.build({absWorkingDir:root,stdin:{contents:fs.readFileSync(entry,'utf8'),loader:'js',sourcefile:entry},tsconfigRaw:{},
 plugins:[{name:'explicit-local-files',setup(b){
  b.onResolve({filter:/.*/},a=>a.path==='fast-xml-parser'?{path:'npm:fast-xml-parser@5.11.2',external:true}:{path:path.resolve(path.dirname(a.importer||entry),a.path),namespace:'local'});
  b.onLoad({filter:/.*/,namespace:'local'},a=>({contents:fs.readFileSync(a.path,'utf8'),loader:'js'}));
 }}],bundle:true,format:'esm',platform:'neutral',target:'es2022',write:false});
 const output=path.resolve(process.argv[2]||'../../outputs/cms-integration/cms-membership.deploy.ts');
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,result.outputFiles[0].text);console.log('CMS server bundle ready');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
