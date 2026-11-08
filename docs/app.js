'use strict';
(() => {
 const {groups,layouts}=window.SELCA_CATALOGUE;
 const $=id=>document.getElementById(id);
 const groupNames=new Map(groups.map(g=>[g.id,g.name]));
 const knownIds=new Set(layouts.map(l=>l.id));
 let saved=new Set();
 try { const value=JSON.parse(localStorage.getItem('selcabooth.saved.v1')||'[]'); if(Array.isArray(value)) saved=new Set(value.filter(id=>knownIds.has(id))); } catch {}
 let activeGroup='all',savedOnly=false,customOnly=false,selected=null,opener=null,toastTimer;
 const colours=new Map();
 const palette=[['White','#ffffff'],['Lavender','#dac9ef'],['Blush','#f5cbdc'],['Butter','#fff0b5'],['Sage','#cbdac5'],['Blue','#c9e4f2'],['Plum','#70142f'],['Black','#111111']];
 const custom=l=>l.customisable;
 const capacityText=n=>n===2?'1–2 people':n===6?'4–6 people':'Up to 8 people';
 function recommendation(l){
  const box=document.createElement('div');box.className='recommendation';
  const p=document.createElement('p');p.className='overall';p.textContent=`Recommended overall: ${capacityText(l.recommended)}`;box.append(p);
  if(l.mixed){const note=document.createElement('p');note.textContent='Based on the smallest photo opening.';box.append(note);}
  return box;
 }
 function preview(l,colour='#fff') {
  const box=document.createElement('div');box.className='rendered-preview';
  const img=document.createElement('img');img.src=l.preview;img.alt=`${l.name} frame preview. Recommended overall: ${capacityText(l.recommended)}.`;img.decoding='async';
  if(custom(l)){img.dataset.background='true';img.style.backgroundColor=colour;}
  box.append(img);return box;
 }
 function wheel(){const w=document.createElement('span');w.className='wheel';w.setAttribute('aria-hidden','true');return w;}
 function announce(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2400);}
 function syncSaved(){
  $('saved-count').textContent=saved.size;
  document.querySelectorAll('.heart').forEach(b=>{const yes=saved.has(b.dataset.id);b.textContent=yes?'♥':'♡';b.setAttribute('aria-pressed',yes);b.setAttribute('aria-label',`${yes?'Unsave':'Save'} ${b.dataset.name}`);});
  if(selected){const yes=saved.has(selected.id);$('save-detail').textContent=yes?'♥ Saved frame':'♡ Save this frame';$('save-detail').setAttribute('aria-pressed',yes);}
 }
 function toggleSave(id){const added=!saved.has(id);if(added)saved.add(id);else saved.delete(id);let persisted=true;try{localStorage.setItem('selcabooth.saved.v1',JSON.stringify([...saved]));}catch{persisted=false;}syncSaved();if(savedOnly)render();announce(persisted?(added?'Frame saved on this device':'Frame removed from saved'):'Saved for this visit only');}
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const b=e.target,l=layouts.find(l=>l.id===b.dataset.id);b.replaceChildren(preview(l,colours.get(l.id)||'#ffffff'));b.setAttribute('aria-busy','false');observer.unobserve(b);}}),{rootMargin:'600px'}):null;
 function card(l){
  const article=document.createElement('article');article.className='card';
  const b=document.createElement('button');b.className='preview-button';b.dataset.id=l.id;b.setAttribute('aria-label',`View ${l.name}`);b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-busy','true');b.addEventListener('click',()=>openDetail(l,b));
  const heart=document.createElement('button');heart.className='heart';heart.dataset.id=l.id;heart.dataset.name=l.name;heart.addEventListener('click',()=>toggleSave(l.id));
  const meta=document.createElement('div');meta.className='card-meta';const heading=document.createElement('h3');heading.textContent=l.name;meta.append(heading);if(l.new){const badge=document.createElement('span');badge.className='new-badge';badge.textContent='New';meta.append(badge);}
  if(custom(l)){const c=document.createElement('button');c.className='custom-indicator';c.append(wheel(),document.createTextNode('Choose your colour'));c.addEventListener('click',()=>openDetail(l,c));meta.append(c);}
  else{const label=document.createElement('p');label.textContent=groupNames.get(l.styleGroupId).replace('POSE','pose');meta.append(label);}
  article.append(b,heart,meta,recommendation(l));if(observer)observer.observe(b);else{b.replaceChildren(preview(l,colours.get(l.id)||'#fff'));b.setAttribute('aria-busy','false');}return article;
 }
 function render(){
  if(observer)observer.disconnect();
  const q=$('search').value.trim().toLowerCase();const result=layouts.filter(l=>(activeGroup==='all'||l.styleGroupId===activeGroup)&&(!savedOnly||saved.has(l.id))&&(!customOnly||custom(l))&&l.name.toLowerCase().includes(q));
  $('grid').replaceChildren(...result.map(card));$('empty').hidden=result.length>0;$('result-count').textContent=`${result.length} ${result.length===1?'frame':'frames'}${savedOnly?' saved':' to explore'}`;
  $('saved-filter').setAttribute('aria-pressed',savedOnly);$('saved-top').setAttribute('aria-pressed',savedOnly);$('custom-filter').setAttribute('aria-pressed',customOnly);
  document.querySelectorAll('#categories button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.group===activeGroup));syncSaved();
 }
 function setColour(value){if(!selected||!custom(selected)||!/^#[\da-f]{6}$/i.test(value))return;colours.set(selected.id,value);$('detail-stage').querySelector('[data-background]').style.backgroundColor=value;$('colour').value=value;$('hex').textContent=value.toUpperCase();document.querySelectorAll('#swatches button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.colour===value.toLowerCase()));}
 function openDetail(l,trigger){
  selected=l;opener=trigger||document.activeElement;
  $('detail-title').textContent=l.name;$('detail-group').textContent=groupNames.get(l.styleGroupId);
  const poses=l.poses;
  $('detail-meta').textContent=`${poses} ${poses===1?'pose':'poses'} · ${l.orientation} layout`;
  $('detail-stage').replaceChildren(preview(l,colours.get(l.id)||'#ffffff'));
  $('detail-recommendation').replaceChildren(recommendation(l));
  $('colour-panel').hidden=!custom(l);$('fixed-note').hidden=custom(l);syncSaved();
  if(custom(l))setColour(colours.get(l.id)||'#ffffff');
  if(!$('detail').open)$('detail').showModal();document.body.classList.add('modal-open');$('close').focus();
 }
 $('close').addEventListener('click',()=>$('detail').close());
 $('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=$('detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('detail').close();}});
 $('detail').addEventListener('close',()=>{document.body.classList.remove('modal-open');render();const id=selected?.id;const restored=id&&[...document.querySelectorAll('.preview-button')].find(b=>b.dataset.id===id);(restored||$('search')).focus({preventScroll:true});selected=null;});
 $('save-detail').addEventListener('click',()=>selected&&toggleSave(selected.id));
 $('copy-name').addEventListener('click',async()=>{if(!selected)return;try{await navigator.clipboard.writeText(selected.name);announce('Frame name copied');}catch{announce(`Frame name: ${selected.name}`);}});
 for(const [name,colour] of palette){const b=document.createElement('button');b.style.background=colour;b.dataset.colour=colour;b.setAttribute('aria-label',name);b.title=name;b.setAttribute('aria-pressed',false);b.addEventListener('click',()=>setColour(colour));$('swatches').append(b);}
 $('colour').addEventListener('input',e=>setColour(e.target.value));$('colour-reset').addEventListener('click',()=>setColour('#ffffff'));
 const categoryLabels=g=>{const m=g.name.match(/^(\d+) POSE/);return m?`${m[1]} ${m[1]==='1'?'pose':'poses'}`:g.name==='2 STRIP'?'Strips':g.name==='FRIDGE MAGNET + KEYCHAIN'?'Magnet + keychain':g.name;};
 for(const g of [{id:'all',name:'All'},...groups]){const b=document.createElement('button');b.dataset.group=g.id;b.textContent=g.id==='all'?`All ${layouts.length}`:`${categoryLabels(g)} (${layouts.filter(l=>l.styleGroupId===g.id).length})`;b.setAttribute('aria-pressed',g.id==='all');b.addEventListener('click',()=>{activeGroup=g.id;render();});$('categories').append(b);}
 function showKeychains(){activeGroup=groups.find(g=>g.name==='FRIDGE MAGNET + KEYCHAIN').id;savedOnly=customOnly=false;$('search').value='';render();$('collection').scrollIntoView({behavior:'instant'});}
 $('new-keychains').addEventListener('click',()=>showKeychains());
 window.addEventListener('hashchange',()=>{if(location.hash==='#magnet-keychain')showKeychains();});
 $('search').addEventListener('input',render);$('custom-filter').addEventListener('click',()=>{customOnly=!customOnly;render();});$('saved-filter').addEventListener('click',()=>{savedOnly=!savedOnly;render();});$('saved-top').addEventListener('click',()=>{savedOnly=!savedOnly;render();$('collection').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
 $('reset').addEventListener('click',()=>{activeGroup='all';savedOnly=customOnly=false;$('search').value='';render();});
 for(const name of ['3 FRAME3','3 FRAME4','1 FRAME3']){const l=layouts.find(l=>l.name===name);if(l){const div=document.createElement('div');div.className='hero-frame';div.append(preview(l));$('hero-frames').append(div);}}
 render();
 if(location.hash==='#magnet-keychain')showKeychains();
})();
