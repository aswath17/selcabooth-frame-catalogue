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
