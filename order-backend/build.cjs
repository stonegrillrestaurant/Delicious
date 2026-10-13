'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=__dirname,config=JSON.parse(fs.readFileSync(path.join(root,'firebase.json'),'utf8'));
if(config.hosting?.site!=='stone-grill-orders-test'||config.hosting?.public!=='public')throw Error('Expected test Hosting site and generated public folder.');
const output=path.join(root,'public'),marker=path.join(output,'.generated-by-stone-grill-build');
if(fs.existsSync(output)&&!fs.existsSync(marker))throw Error('Existing public folder is not a generated build. Use a fresh GitHub checkout; your deployed files were not changed.');
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});fs.writeFileSync(marker,'Generated from tracked source.\n');
fs.cpSync(path.join(root,'web'),output,{recursive:true});
fs.cpSync(path.join(root,'../order/staff'),path.join(output,'order/staff'),{recursive:true});
fs.copyFileSync(path.join(root,'../order/firebase-config.js'),path.join(output,'order/firebase-config.js'));
fs.copyFileSync(path.join(root,'functions/menu.json'),path.join(output,'order/assets/menu.json'));
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk(output);
for(const file of files){
 if(file.endsWith('.js')){const check=spawnSync(process.execPath,['--input-type=module','--check'],{input:fs.readFileSync(file),encoding:'utf8'});if(check.status!==0)throw Error(path.relative(output,file)+' syntax error: '+check.stderr);}
 if(file.endsWith('.json')||file.endsWith('.webmanifest'))JSON.parse(fs.readFileSync(file,'utf8'));
 if(file.endsWith('.html')){
  let html=fs.readFileSync(file,'utf8').replaceAll('https://stonegrillresto.net/order/','https://stone-grill-orders-test.web.app/order/');
  if(!html.includes('name="robots"'))html=html.replace('</head>','<meta name="robots" content="noindex,nofollow"></head>');
  fs.writeFileSync(file,html);
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
   const value=match[1];if(/^(?:https?:|tel:|mailto:|data:|#)/.test(value))continue;
   let target=value.split(/[?#]/)[0];if(!target)continue;target=target.startsWith('/')?path.join(output,target):path.resolve(path.dirname(file),target);
   if(!target.startsWith(output+path.sep))throw Error('Link escapes Hosting output: '+value);
   if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
   if(!fs.existsSync(target))throw Error('Missing local resource '+value+' in '+path.relative(output,file));
  }
 }
}
console.log('Complete test-site build: '+files.length+' files; local resources and JavaScript syntax checked.');
