const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'../docs'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'catalogue.js'),'utf8'),ctx);
const {layouts,groups}=ctx.window.SELCA_CATALOGUE;
assert(layouts.length>0,'No layouts');assert.equal(new Set(layouts.map(l=>l.id)).size,layouts.length,'Duplicate IDs');
const groupIds=new Set(groups.map(g=>g.id));let custom=0;
for(const l of layouts){assert(groupIds.has(l.styleGroupId),`Missing category: ${l.name}`);assert(l.name.trim());assert(l.canvas.width>0&&l.canvas.height>0);
 const refs=new Map(l.assetReferences.map(a=>[a.assetId,a.relativePath]));
 const check=p=>{assert(p&&p.startsWith('assets/')&&!p.includes('..'),`Invalid path: ${p}`);assert(fs.existsSync(path.join(root,p)),`Missing ${p}`);};
 for(const a of l.assetReferences)check(a.relativePath);for(const a of l.decorations)check(a.source);for(const a of l.imageLayers)check(refs.get(a.assetId));if(l.background.mode==='image')check(refs.get(l.background.imageAssetId));if(l.background.mode==='transparent')custom++;
 for(const a of [...l.photoSlots,...l.decorations,...l.imageLayers])for(const k of ['x','y','width','height'])assert(Number.isFinite(a[k]),`${l.name}: bad ${k}`);
}
for(const file of ['app.js','catalogue.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'));
console.log(`PASS: ${layouts.length} layouts, ${groups.length} categories, ${custom} customisable backgrounds; all assets resolve.`);

// Test holder classification boundaries independently of canvas orientation/pose count.
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const helpers=app.slice(app.indexOf(' const reviewedModerate='),app.indexOf(' const capacityText='));
const sizes={};vm.runInNewContext(helpers+';this.classify=capacity;',sizes);
const classify=(w,h,rotation=0,name='Boundary fixture')=>sizes.classify({name},{width:w,height:h,rotation});
for(const [ratio,expected] of [[.8449,2],[.845,6],[1,6],[1.25,6],[1.2501,8],[2,8]])assert.equal(classify(ratio*1000,1000),expected);
for(const rotation of [90,-90,270,450,89.9,270.1])assert.equal(classify(1500,600,rotation),2);
assert.equal(classify(600,1500,90),8);assert.equal(classify(1500,600,180),8);
for(const name of ['6 Poses004','land6shot','3pose strip001','2 Strip - Frame1']){
 assert.equal(classify(1350,1000,0,name),6);assert.equal(classify(600,1000,0,name),2);assert.equal(classify(2000,1000,0,name),8);
}
for(const l of layouts){
 const visible=l.photoSlots.filter(a=>!a.hidden);
 assert(visible.length,`${l.name}: no visible holders`);
 for(const a of visible)assert([2,6,8].includes(sizes.classify(l,a)));
}
console.log('PASS: capacity boundaries, quarter-turns, portrait priority, reviewed exceptions and all visible holders.');
