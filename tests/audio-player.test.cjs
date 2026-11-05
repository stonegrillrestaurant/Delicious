const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../audio-player/index.html'),'utf8');
const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
class Element {
 constructor(id=''){this.id=id;this.value='';this.innerHTML='';this.textContent='';this.dataset={};this.style={setProperty(){}};this.listeners={};this.attributes={};this.children=[];this.classList={toggle(){},add(){},remove(){}};this.options=[];}
 addEventListener(name,fn,options={}){(this.listeners[name]??=[]).push({fn,once:options.once});}
 removeEventListener(name,fn){this.listeners[name]=(this.listeners[name]||[]).filter(e=>e.fn!==fn);}
 dispatch(name){const list=[...(this.listeners[name]||[])];for(const e of list){if(e.once)this.removeEventListener(name,e.fn);e.fn({target:this});}}
 setAttribute(name,value){this.attributes[name]=value;}
 append(...children){this.children.push(...children);}
 appendChild(child){this.children.push(child);}
 matches(){return false;}
}
function player({saved={},blockedStorage=false,deferPlay=false}={}){
 const elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 const audio=el('audio');Object.assign(audio,{volume:1,playbackRate:1,paused:true,currentTime:0,duration:120,ended:false,load(){},pause(){this.paused=true;this.dispatch('pause')},play(){this.paused=false;this.playCalls=(this.playCalls||0)+1;if(deferPlay)return new Promise(resolve=>this.resolvePlay=resolve);return Promise.resolve()}});
 el('volume').value='1';el('speed').value='1';el('speed').options=['0.75','1','1.25','1.5','2'].map(value=>({value}));el('searchInput').value='';
 const localStorage={getItem(k){if(blockedStorage)throw Error('Storage blocked');return Object.hasOwn(saved,k)?saved[k]:null},setItem(k,v){if(blockedStorage)throw Error('Storage blocked');saved[k]=v}};
 const sandbox={console,URL,Promise,Number,Math,JSON,String,Array,localStorage,document:{getElementById:el,createElement:()=>new Element(),createDocumentFragment:()=>new Element(),addEventListener(){},title:''},window:{location:{href:'https://stonegrillresto.net/audio-player/'},addEventListener(){}},navigator:{},setTimeout,clearTimeout};const ctx=vm.createContext(sandbox);vm.runInContext(script,ctx);return {el,audio,ctx,saved,run:s=>vm.runInContext(s,ctx)};
}
test('a new visitor keeps normal volume; an explicitly saved mute is preserved',()=>{assert.equal(player().audio.volume,1);assert.equal(player({saved:{'ninox-volume':'0'}}).audio.volume,0)});
test('blocked browser storage does not prevent the player loading or playback',async()=>{const p=player({blockedStorage:true});assert.ok(p.el('title').textContent);await p.run('playAudio()');assert.equal(p.audio.paused,false)});
test('switching tracks removes the prior metadata restore handler',()=>{const p=player({saved:{'ninox-playback-position':JSON.stringify({index:0,time:80})}});p.run('loadTrack(1)');p.audio.dispatch('loadedmetadata');assert.equal(p.audio.currentTime,0)});
test('a playlist selection calls play in the click turn without waiting for metadata',()=>{const p=player();p.run('loadTrack(1,{autoplay:true})');assert.equal(p.audio.playCalls,1)});
test('Pause responds immediately while play is still pending',()=>{const p=player({deferPlay:true});p.run('playAudio()');p.run('pauseAudio()');assert.equal(p.audio.paused,true);p.audio.resolvePlay()});
test('playback restores the saved position for the selected track',()=>{const p=player({saved:{'ninox-playback-position':JSON.stringify({index:0,time:40})}});p.audio.dispatch('loadedmetadata');assert.equal(p.audio.currentTime,40)});
