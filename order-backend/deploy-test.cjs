'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=__dirname,config=JSON.parse(fs.readFileSync(path.join(root,'firebase.json'),'utf8'));
if(config.hosting?.site!=='stone-grill-orders-test'||config.functions?.length!==1||config.functions[0].codebase!=='stone-grill-orders')throw Error('Deployment target must be the Stone Grill test site and orders codebase.');
const steps=[['npm',['ci','--prefix','functions']],['npm',['ci','--prefix','ui-tests']],['npm',['test']],['firebase',['deploy','--only','functions:stone-grill-orders,firestore:rules,firestore:indexes,storage','--project','stone-grill-app']],['node',['migrate-references.cjs'],'functions'],['firebase',['deploy','--only','hosting','--project','stone-grill-app']]];
if(process.argv.includes('--dry-run')){console.log('TEST ONLY · stone-grill-orders-test.web.app');for(const [command,args,subdir] of steps)console.log((subdir?subdir+': ':'')+command+' '+args.join(' '));process.exit(0);}
if(process.versions.node.split('.')[0]!=='22')throw Error('Use Node 22 before deploying: nvm install 22');
const envfile=path.join(root,'functions/.env.stone-grill-app');if(!fs.existsSync(envfile))fs.copyFileSync(path.join(root,'functions/.env.example'),envfile);
for(const [command,args,subdir] of steps){
 const result=spawnSync(command,args,{cwd:subdir?path.join(root,subdir):root,stdio:'inherit',shell:false});
 if(result.error){console.error(result.error.message);process.exit(1);}if(result.status!==0){console.error('Stopped. Hosting was not published unless its final deployment succeeded. See the failed step above.');process.exit(result.status||1);}
}
console.log('Test ordering pages, profiles, staff dashboard and backend deployed. Production domain was not switched.');
