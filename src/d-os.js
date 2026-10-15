
/* ================= SYSTEM: okna, dock, pasek menu, nakładki, zasilanie ================= */
const wins=new Map(); let wseq=0, zTop=10, focusedW=null, cascade=0;
const winsOf=id=>[...wins.values()].filter(w=>w.id===id);
const activeId=()=>focusedW&&wins.has(focusedW.wid)?focusedW.id:null;
const dockSpace=()=>S.dockHide?12:S.dockSize+26;

function openApp(id,opts={}){
  const a=APPS[id]; if(!a)return null;
  closeMenus(); closeSpot(); closeLaunchpad(); if(mcOn)exitMC();
  if(a.special){a.special();return null}
  const ex=winsOf(id).pop();
  if(ex&&(!a.multi||(a.reuse&&!opts.new)||(!opts.new&&!opts.file&&!opts.path))){
    if(ex.min)unmin(ex); focus(ex); if(ex.onopen)ex.onopen(opts); return ex;
  }
  const wasRunning=winsOf(id).length>0;
  const win=el('div','win'), tb=el('div','tb'), body=el('div','body');
  tb.innerHTML='<div class="lights"><i class="c r"></i><i class="c y"></i><i class="c g"></i></div><div class="ttl"></div>';
  win.append(tb,body);
  /* rozmiar okna rośnie razem z ekranem; aplikacje o stałym układzie zostają w swoim rozmiarze */
  const f=(small()||a.fixed)?1:Math.min(1.9,Math.max(1,Math.min(innerWidth/1180,innerHeight/720)));
  let bw=(a.w||640)*f, bh=(a.h||420)*f; if(a.big&&!small()){bw=innerWidth*.86;bh=innerHeight*.84}
  const W=Math.floor(Math.min(bw,innerWidth-16)), H=Math.floor(Math.min(bh,innerHeight-MB-(small()?76:dockSpace()+14)));
  const off=(small()||a.big)?0:((cascade++%5)*26);
  win.style.cssText=`width:${W}px;height:${H}px;left:${Math.max(8,Math.min(innerWidth-W-8,(innerWidth-W)/2-(a.big?0:70)+off))}px;top:${Math.max(MB+6,Math.min(innerHeight-H-dockSpace()-4,MB+14+(small()?0:off)))}px`;
  const w={wid:++wseq,id,el:win,min:false,max:false,cleanups:[],opts};
  w.title=t=>{$('.ttl',tb).textContent=t};
  w.close=()=>closeWin(w);
  w.on=(n,f)=>w.cleanups.push(on(n,f));
  w.title(a.name);
  wins.set(w.wid,w);
  if(!a.fixed){const rs=el('div','rs');win.append(rs);resizer(w,rs)}
  $('#windows').append(win);
  a.render(body,w,opts);
  dragger(w,tb);
  win.addEventListener('pointerdown',()=>{if(!mcOn)focus(w)},true);
  win.addEventListener('click',()=>{if(mcOn){exitMC();focus(w)}});
  $('.c.r',tb).onclick=e=>{e.stopPropagation();closeWin(w)};
  $('.c.y',tb).onclick=e=>{e.stopPropagation();doMin(w)};
  $('.c.g',tb).onclick=e=>{e.stopPropagation();toggleMax(w)};
  tb.addEventListener('dblclick',e=>{if(!e.target.closest('.lights'))toggleMax(w)});
  focus(w); refreshDock();
  if(!wasRunning){const dk=dockEl(id);if(dk){dk.classList.add('bounce');setTimeout(()=>dk.classList.remove('bounce'),1200)}}
  return w;
}
function focus(w){
  wins.forEach(o=>o.el.classList.toggle('front',o===w));
  w.el.style.zIndex=++zTop; focusedW=w; buildMenubar();
}
function nextFocus(){
  const rest=[...wins.values()].filter(o=>!o.min).sort((a,b)=>b.el.style.zIndex-a.el.style.zIndex)[0];
  if(rest)focus(rest);else{focusedW=null;buildMenubar()}
}
function closeWin(w){
  if(!wins.has(w.wid))return;
  w.cleanups.forEach(f=>{try{f()}catch(e){}}); wins.delete(w.wid);
  w.el.classList.add('closing'); setTimeout(()=>w.el.remove(),200);
  nextFocus(); refreshDock();
}
/* efekt „genie”: okno zwęża się lejkiem i wsuwa w ikonę w docku */
function genie(w,out){
  const dk=dockEl(w.id), r=w.el.getBoundingClientRect(); let cx=innerWidth/2, cy=innerHeight-30, iw=44;
  if(dk){const k=dk.getBoundingClientRect();cx=k.left+k.width/2;cy=k.top+k.height/2;iw=k.width}
  const tx=cx-(r.left+r.width/2), ty=cy-(r.top+r.height/2), maxIn=.5*(1-Math.min(1,iw/r.width));
  const N=16, steps=12, fr=[];
  const poly=p=>{
    const inset=f=>(maxIn*Math.pow(f,1.7)*p).toFixed(3), pts=[];
    for(let i=0;i<=N;i++){const f=i/N;pts.push(`${(inset(f)*100).toFixed(2)}% ${(f*100).toFixed(2)}%`)}
    for(let i=N;i>=0;i--){const f=i/N;pts.push(`${((1-inset(f))*100).toFixed(2)}% ${(f*100).toFixed(2)}%`)}
    return 'polygon('+pts.join(',')+')';
  };
  for(let i=0;i<=steps;i++){
    const p=i/steps, e=p*p*(3-2*p);
    fr.push({offset:p,transform:`translate(${(tx*e).toFixed(1)}px,${(ty*e).toFixed(1)}px) scale(${(1-.93*e).toFixed(3)},${(1-.96*e).toFixed(3)})`,clipPath:poly(Math.min(1,p*1.6)),opacity:p>.88?Math.max(0,1-(p-.88)*8):1});
  }
  const frames=out?fr:fr.slice().reverse().map((f,i)=>Object.assign({},f,{offset:i/steps}));
  try{return w.el.animate(frames,{duration:out?640:560,easing:'linear',fill:'both'})}catch(e){return null}
}
function doMin(w){
  if(w.min)return; w.min=true; w.el.classList.remove('front');
  const a=genie(w,true);
  const fin=()=>{if(w.min){w.el.classList.add('min');if(a)a.cancel()}};
  if(a)a.finished.then(fin).catch(fin); else fin();
  setTimeout(fin,760);
  sfx('pop'); nextFocus(); refreshDock();
}
function unmin(w){
  w.el.classList.remove('min'); w.min=false;
  const a=genie(w,false); if(a){a.finished.then(()=>a.cancel()).catch(()=>{});setTimeout(()=>a.cancel(),680)}
  refreshDock();
}
function toggleMax(w){
  if(APPS[w.id].fixed)return;
  const s=w.el.style; w.el.classList.add('animating'); setTimeout(()=>w.el.classList.remove('animating'),360);
  if(!w.max){w.prev={l:s.left,t:s.top,w:s.width,h:s.height};s.left='0px';s.top=MB+'px';s.width='100%';s.height=`calc(100% - ${MB+dockSpace()}px)`;w.max=true}
  else{Object.assign(s,{left:w.prev.l,top:w.prev.t,width:w.prev.w,height:w.prev.h});w.max=false}
}
function dragger(w,h){
  h.addEventListener('pointerdown',e=>{
    if(e.target.closest('.lights')||w.max||mcOn)return;
    const sx=e.clientX,sy=e.clientY,ox=w.el.offsetLeft,oy=w.el.offsetTop;
    h.setPointerCapture(e.pointerId);
    const mv=ev=>{w.el.style.left=(ox+ev.clientX-sx)+'px';w.el.style.top=Math.min(innerHeight-40,Math.max(MB,oy+ev.clientY-sy))+'px'};
    const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up)};
    h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);
  });
}
function resizer(w,h){
  h.addEventListener('pointerdown',e=>{
    if(w.max)return; e.stopPropagation(); focus(w);
    const sx=e.clientX,sy=e.clientY,ow=w.el.offsetWidth,oh=w.el.offsetHeight;
    h.setPointerCapture(e.pointerId);
    const mv=ev=>{w.el.style.width=Math.max(260,ow+ev.clientX-sx)+'px';w.el.style.height=Math.max(180,oh+ev.clientY-sy)+'px'};
    const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up)};
    h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);
  });
}
function closeAll(){[...wins.values()].forEach(closeWin)}
/* pełny ekran całej przeglądarki (wymaga kliknięcia lub klawisza użytkownika) */
function toggleFullscreen(){
  try{
    const d=document, e=d.documentElement;
    if(d.fullscreenElement||d.webkitFullscreenElement){const r=(d.exitFullscreen||d.webkitExitFullscreen).call(d);if(r&&r.catch)r.catch(()=>{})}
    else{const r=(e.requestFullscreen||e.webkitRequestFullscreen).call(e);if(r&&r.catch)r.catch(()=>{})}
  }catch(err){}
}
addEventListener('fullscreenchange',()=>{refreshDock();const b=$('#fsbtn');if(b)b.title=document.fullscreenElement?'Zamknij pełny ekran':'Pełny ekran'});

/* ---------- Mission Control ---------- */
let mcOn=false, mcLabels=[];
function toggleMC(){
  if(mcOn)return exitMC();
  const list=[...wins.values()].filter(w=>!w.min); if(!list.length)return;
  closeMenus(); mcOn=true; $('#mcbg').classList.add('on'); $('#windows').classList.add('mcmode');
  const n=list.length, cols=Math.ceil(Math.sqrt(n)), rows=Math.ceil(n/cols);
  const X0=30, Y0=MB+40, cw=(innerWidth-X0*2)/cols, ch=(innerHeight-Y0-120)/rows;
  list.forEach((w,i)=>{
    const c=i%cols, r=Math.floor(i/cols), el_=w.el;
    const ww=el_.offsetWidth, wh=el_.offsetHeight, s=Math.min((cw-30)/ww,(ch-40)/wh,1);
    const tx=X0+cw*c+cw/2-(el_.offsetLeft+ww/2), ty=Y0+ch*r+ch/2-(el_.offsetTop+wh/2)-8;
    el_.classList.add('mc'); el_.style.transform=`translate(${tx}px,${ty}px) scale(${s})`;
    const l=el('div','mclab'); l.textContent=APPS[w.id].name; l.style.left=(X0+cw*c+cw/2)+'px'; l.style.top=(Y0+ch*r+ch/2+wh*s/2)+'px'; $('#desk').append(l); mcLabels.push(l);
  });
}
function exitMC(){
  if(!mcOn)return; mcOn=false; $('#mcbg').classList.remove('on'); $('#windows').classList.remove('mcmode');
  wins.forEach(w=>{w.el.style.transform='';setTimeout(()=>w.el.classList.remove('mc'),460)});
  mcLabels.forEach(l=>l.remove()); mcLabels=[];
}
$('#mcbg').onclick=exitMC;

/* ---------- dock ---------- */
const PINNED=['finder','launchpad','browser','photos','music','notes','reminders','calendar','appstore','terminal','settings'];
const dl={}; /* postęp pobierania aplikacji z App Store (0..1) */
const dockEl=id=>$(`#dock .dk[data-app="${id}"]`);
const dockBase=()=>{const fit=Math.floor((innerWidth-48)/(dockIds().length+1))-8;return Math.max(24,Math.min(small()?38:S.dockSize,fit))};
function dockIds(){
  const ids=[...PINNED,...S.installed.filter(i=>APPS[i])];
  Object.keys(dl).forEach(i=>{if(!ids.includes(i))ids.push(i)});
  wins.forEach(w=>{if(!ids.includes(w.id)&&!APPS[w.id].nodock)ids.push(w.id)});
  return ids;
}
const storeTodo=()=>['workdocs','mathdocs','wykresy','paybud'].filter(i=>!S.installed.includes(i));
const ringSVG=p=>`<svg viewBox="0 0 26 26" width="46%" height="46%"><circle cx="13" cy="13" r="10" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/><circle cx="13" cy="13" r="10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(62.8*p).toFixed(1)} 62.8" transform="rotate(-90 13 13)"/></svg>`;
function dockProgress(id,p){
  let b=dockEl(id); if(!b){refreshDock();b=dockEl(id)} if(!b)return;
  b.classList.add('dling'); let r=$('.dlr',b); if(!r){r=el('div','dlr');b.append(r)} r.innerHTML=ringSVG(p);
}
/* kosz: aplikacje z App Store odinstalowuje, resztę przenosi do kosza */
function trashPath(p){
  const n=VFS.get(p); if(!n)return;
  if(n.k==='app'){
    if(S.installed.includes(n.app)){sfx('trash');uninstallApp(n.app)}
    else notify('Nie można usunąć','„'+APPS[n.app].name+'” jest aplikacją systemową.','finder');
    return;
  }
  if(p==='/'||p===HOME||p==='/Applications'){notify('Nie można usunąć','To jest folder systemowy.','finder');return}
  try{sfx('trash');VFS.trash(p)}catch(e){notify('Nie można usunąć',e.message,'finder')}
}
function trashFull(){const t=VFS.get(TRASH);return t&&Object.keys(t.c).length>0}
function refreshDock(){
  const d=$('#dock'); d.innerHTML=''; const B=dockBase();
  const add=(id,label)=>{
    const b=el('button','dk'+(winsOf(id).length?' run':'')+(dl[id]!=null?' dling':''),icon(id)+'<i class="dot"></i>'+(dl[id]!=null?'<div class="dlr">'+ringSVG(dl[id])+'</div>':''));
    if(id==='appstore'&&storeTodo().length)b.append(el('i','badge',String(storeTodo().length)));
    b.dataset.app=id; b.dataset.label=label; b.style.width=b.style.height=B+'px'; b.setAttribute('aria-label',label);
    b.onclick=()=>{sfx('click');openApp(id)};
    b.oncontextmenu=e=>{
      e.preventDefault(); const run=winsOf(id).length, a=APPS[id];
      popMenu([[a.name,()=>{},'',{off:true}],'-',['Otwórz',()=>openApp(id)],...(run?[['Zakończ',()=>winsOf(id).forEach(closeWin)]]:[]),...(S.installed.includes(id)?[['Odinstaluj',()=>uninstallApp(id)]]:[])],e.clientX,e.clientY-120);
    };
    d.append(b);
  };
  dockIds().forEach(id=>add(id,APPS[id].name));
  d.append(el('div','dsep')); add(trashFull()?'trashfull':'trash','Kosz');
  const t=d.lastChild; t.onclick=()=>openApp('finder',{path:TRASH});
  t.ondragover=e=>{if(e.dataTransfer.types.includes('text/x-path')){e.preventDefault();t.classList.add('over')}};
  t.ondragleave=()=>t.classList.remove('over');
  t.ondrop=e=>{e.preventDefault();t.classList.remove('over');e.dataTransfer.getData('text/x-path').split('\n').filter(Boolean).forEach(trashPath)};
  t.oncontextmenu=e=>{e.preventDefault();popMenu([['Opróżnij kosz',emptyTrash,'',{off:!trashFull()}]],e.clientX,e.clientY-60)};
  dockMagnifyReset();
}
function emptyTrash(){sfx('trash');VFS.emptyTrash();notify('Kosz opróżniony','Wszystkie elementy zostały usunięte.','finder')}
function dockMagnifyReset(){const B=dockBase();$$('#dock .dk').forEach(b=>b.style.width=b.style.height=B+'px')}
$('#dock').addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||!S.magnify||small())return; const B=dockBase(), M=B*1.62;
  $$('#dock .dk').forEach(b=>{const r=b.getBoundingClientRect(),d=e.clientX-(r.left+r.width/2),s=B+(M-B)*Math.exp(-(d*d)/(2*58*58));b.style.width=b.style.height=s+'px'});
});
$('#dock').addEventListener('pointerleave',dockMagnifyReset);
addEventListener('pointermove',e=>{
  if(!S.dockHide)return;
  if(e.clientY>innerHeight-6&&!dockPeek){dockPeek=true;applySettings()}
  else if(dockPeek&&e.clientY<innerHeight-120){dockPeek=false;applySettings()}
});
addEventListener('resize',refreshDock);
on('fs',()=>{const full=trashFull();if(refreshDock.last!==full){refreshDock.last=full;refreshDock()}});

/* ---------- menu ---------- */
let menuEl=null;
function closeMenus(){
  $$('.dropdown,#cc,#nc').forEach(x=>x.remove()); menuEl=null;
  $$('#menubar .mi.open').forEach(x=>x.classList.remove('open'));
}
function popMenu(items,x,y){
  closeMenus();
  const m=el('div','dropdown');
  items.forEach(it=>{
    if(it==='-'){m.append(el('div','sep'));return}
    const o=it[3]||{}, d=el('div','dd'+(o.off?' off':'')+(o.chk?' chk':''),'<span></span><small></small>');
    d.firstChild.textContent=it[0]; d.lastChild.textContent=it[2]||'';
    d.onclick=e=>{e.stopPropagation();closeMenus();it[1]()}; m.append(d);
  });
  document.body.append(m); const r=m.getBoundingClientRect();
  m.style.left=Math.max(4,Math.min(x,innerWidth-r.width-4))+'px'; m.style.top=Math.max(MB,Math.min(y,innerHeight-r.height-4))+'px';
  menuEl=m; return m;
}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.dropdown,#mbl,#cc,#nc,#ccbtn,#clock,#wifi,#bat'))closeMenus()});
document.addEventListener('contextmenu',e=>{if(!e.target.closest('input,textarea'))e.preventDefault()});

function powerItems(){return[['Uśpij',sleepNow],['Uruchom ponownie…',()=>confirmPower('restart')],['Wyłącz…',()=>confirmPower('shutdown')],'-',['Zablokuj ekran',()=>login(),'⌃⌘Q'],['Wyloguj '+S.user+'…',()=>confirmPower('logout')]]}
function menus(){
  const id=activeId(), a=id?APPS[id]:APPS.finder, front=id?focusedW:null, ex=c=>()=>document.execCommand(c);
  const fileExtra=front&&front.menu?[ '-',...front.menu]:[];
  return[
    {h:LOGO(15),aria:'Menu systemu',items:[['O tym komputerze',()=>openApp('about')],'-',['Ustawienia systemowe…',()=>openApp('settings')],['App Store…',()=>openApp('appstore')],'-',['Wymuś zakończenie…',forceQuit,'⌥⌘⎋'],'-',...powerItems()]},
    {h:esc(a.name),b:1,items:[['O programie '+a.name,()=>openApp('about')],'-',['Ustawienia…',()=>openApp('settings'),'⌘,'],'-',['Ukryj '+a.name,()=>front&&doMin(front),'⌘H'],['Zakończ '+a.name,()=>id&&winsOf(id).forEach(closeWin),'⌘Q']]},
    {h:'Plik',items:[...(a.multi?[['Nowe okno',()=>openApp(id||'finder',{new:true}),'⌘N']]:[]),['Zamknij okno',()=>front&&closeWin(front),'⌘W'],...fileExtra]},
    {h:'Edycja',items:[['Cofnij',ex('undo'),'⌘Z'],'-',['Wytnij',ex('cut'),'⌘X'],['Kopiuj',ex('copy'),'⌘C'],['Wklej',ex('paste'),'⌘V'],['Zaznacz wszystko',ex('selectAll'),'⌘A']]},
    {h:'Widok',items:[['Pełny ekran',toggleFullscreen,'⌃⌘F'],['Pełny rozmiar okna',()=>front&&toggleMax(front)],['Mission Control',toggleMC,'F3'],['Launchpad',openLaunchpad,'F4'],'-',['Przełącz tryb ciemny',toggleTheme]]},
    {h:'Okno',items:[['Minimalizuj',()=>front&&doMin(front),'⌘M'],['Powiększ',()=>front&&toggleMax(front)],'-',...[...wins.values()].map(w=>[APPS[w.id].name+(w.min?' (zminimalizowane)':''),()=>{if(w.min)unmin(w);focus(w)}])]},
    {h:'Pomoc',items:[['Szukaj',openSpot,'⌘?'],['Skróty klawiszowe',()=>dialog({title:'Skróty klawiszowe',msg:'Ctrl + Spacja: Spotlight\nF3 lub Ctrl + ↑: Mission Control\nF4: Launchpad\nEsc: zamyka menu i nakładki\nTab w Terminalu: uzupełnianie\nCtrl + S w Edytorze tekstu: zapis',buttons:[{label:'OK',primary:true}]})]]}
  ];
}
function buildMenubar(){
  const box=$('#mbl'); box.innerHTML='';
  menus().forEach(m=>{
    const b=el('button','mi'+(m.b?' b':''),m.h); if(m.aria)b.setAttribute('aria-label',m.aria);
    b.onclick=e=>{e.stopPropagation();const open=b.classList.contains('open');closeMenus();if(!open)showMenu(b,m.items)};
    b.onpointerenter=()=>{if(menuEl&&menuEl.dataset.bar&&!b.classList.contains('open'))showMenu(b,m.items)};
    box.append(b);
  });
}
function showMenu(anchor,items){
  const r=anchor.getBoundingClientRect(); const m=popMenu(items,r.left,MB+2); m.dataset.bar='1'; anchor.classList.add('open');
}

/* ---------- okna dialogowe ---------- */
function dialog({title,msg='',input,value='',buttons,ic,body}){
  const o=el('div','modal'), d=el('div','dlg');
  d.innerHTML=`<div class="dic">${ic||icon('about')}</div><div style="min-width:0"><h4></h4><p></p>${input!=null?'<input class="dinp" spellcheck="false" autocomplete="off">':''}</div><div class="dbt"></div>`;
  $('h4',d).textContent=title; $('p',d).textContent=msg;
  const inp=$('.dinp',d); if(inp){inp.value=value;inp.placeholder=input||''}
  if(body)d.children[1].append(body);
  o.append(d); document.body.append(o);
  const close=()=>{document.removeEventListener('keydown',key,true);o.remove()};
  const btns=buttons||[{label:'OK',primary:true}];
  btns.forEach(b=>{const x=el('button','btn'+(b.primary?' p':''));x.textContent=b.label;x.onclick=()=>{if(!b.cb||b.cb(inp?inp.value:undefined)!==false)close()};b.el=x;$('.dbt',d).append(x)});
  function key(e){
    if(e.key==='Enter'){const p=btns.find(b=>b.primary);if(p){e.preventDefault();e.stopPropagation();p.el.click()}}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();const c=btns.find(b=>b.cancel)||btns[0];c.el.click()}
  }
  document.addEventListener('keydown',key,true);
  setTimeout(()=>{if(inp){inp.focus();inp.select()}else{const p=btns.find(b=>b.primary);p&&p.el.focus()}},30);
  return{close,setMsg:t=>{$('p',d).textContent=t}};
}

/* ---------- powiadomienia ---------- */
const notifs=[];
function notify(title,body,app,onclick){
  notifs.unshift({title,body,app,t:Date.now()}); if(notifs.length>30)notifs.pop();
  if(S.dnd)return; sfx('notify');
  const n=el('div','banner',(app&&APPS[app]?icon(app):icon('about'))+'<div><b></b><span></span></div>');
  $('b',n).textContent=title; $('span',n).textContent=body; $('#banners').append(n);
  if(onclick){n.style.pointerEvents='auto';n.onclick=()=>{n.remove();onclick()}}
  setTimeout(()=>{n.classList.add('out');setTimeout(()=>n.remove(),300)},4500);
}

/* ---------- Spotlight ---------- */
let spSel=0, spRows=[];
function closeSpot(){const s=$('#spot');if(s)s.remove()}
function openSpot(){
  closeMenus(); if($('#spot'))return;
  const s=el('div'); s.id='spot';
  s.innerHTML='<div class="box"><div class="q"><svg class="ico" width="24" height="24" viewBox="0 0 15 15" style="color:var(--fg2)"><circle cx="6.3" cy="6.3" r="4.6"/><path d="m10 10 3.6 3.6"/></svg><input id="spi" placeholder="Spotlight" autocomplete="off" spellcheck="false" aria-label="Spotlight"></div><div class="res" id="spr"></div></div>';
  document.body.append(s);
  s.onpointerdown=e=>{if(e.target===s)closeSpot()};
  const i=$('#spi'); i.focus(); i.oninput=()=>{spSel=0;spRender()};
  i.onkeydown=e=>{
    const n=spRows.length;
    if(e.key==='ArrowDown'){spSel=(spSel+1)%Math.max(1,n);spMark();e.preventDefault()}
    else if(e.key==='ArrowUp'){spSel=(spSel+n-1)%Math.max(1,n);spMark();e.preventDefault()}
    else if(e.key==='Enter'){const r=spRows[spSel];if(r){closeSpot();r[3]()}}
  };
}
function spMark(){$$('.sr').forEach((x,j)=>x.classList.toggle('sel',j===spSel))}
function spRender(){
  const q=$('#spi').value.trim().toLowerCase(), box=$('#spr'); box.innerHTML=''; spRows=[];
  if(!q)return;
  if(/^[\d\s+\-*/().,%^]+$/.test(q)&&/\d/.test(q)&&/[+\-*/%^]/.test(q)){
    try{const v=Function('"use strict";return('+q.replace(/,/g,'.').replace(/\^/g,'**')+')')();if(isFinite(v))spRows.push([icon('calc'),'= '+(+v.toPrecision(12)).toLocaleString('pl-PL',{maximumFractionDigits:10}),'Kalkulator',()=>openApp('calc')])}catch(e){}
  }
  Object.keys(APPS).filter(k=>!APPS[k].nodock&&APPS[k].name.toLowerCase().includes(q)&&(BASE_APPS.includes(k)||S.installed.includes(k))).forEach(k=>spRows.push([icon(k),APPS[k].name,'Aplikacja',()=>openApp(k)]));
  let found=0;
  VFS.walk(HOME,(p,n)=>{if(found>=6||!n||p===HOME||p.startsWith(TRASH))return;const nm=p.split('/').pop();if(nm.startsWith('.'))return;if(nm.toLowerCase().includes(q)){found++;spRows.push([n.t==='d'?folderSVG:fileSVG(n.k==='img'?'img':'doc'),nm,n.t==='d'?'Folder':'Dokument',()=>openNode(p)])}});
  if(/ciemn|dark|motyw/.test(q))spRows.push(['','Przełącz tryb ciemny','Ustawienie',toggleTheme]);
  ['restart:Uruchom ponownie','wyłącz:Wyłącz komputer','uśpij:Uśpij'].forEach(x=>{const[k,l]=x.split(':');if(q.length>2&&k.startsWith(q))spRows.push(['',l,'System',k==='restart'?()=>confirmPower('restart'):k==='uśpij'?sleepNow:()=>confirmPower('shutdown')])});
  if(!spRows.length)spRows.push(['','Brak wyników','',()=>{}]);
  spRows.forEach((r,i)=>{
    const d=el('div','sr'+(i===spSel?' sel':''),(r[0]||'<span style="width:28px"></span>')+'<b></b><small></small>');
    $('b',d).textContent=r[1]; $('small',d).textContent=r[2];
    d.onclick=()=>{closeSpot();r[3]()}; d.onpointerenter=()=>{spSel=i;spMark()}; box.append(d);
  });
}
$('#spbtn').onclick=e=>{e.stopPropagation();openSpot()};
$('#fsbtn').onclick=e=>{e.stopPropagation();toggleFullscreen()};

/* ---------- Launchpad ---------- */
function closeLaunchpad(){const l=$('#launch');if(l)l.remove()}
function openLaunchpad(){
  if($('#launch')){closeLaunchpad();return}
  closeMenus(); const o=el('div'); o.id='launch';
  o.innerHTML='<input placeholder="Szukaj" aria-label="Szukaj aplikacji" autocomplete="off"><div class="lgrid"></div>'; document.body.append(o);
  const draw=q=>{
    const g=$('.lgrid',o); g.innerHTML='';
    [...BASE_APPS,...S.installed].filter((id,i,a)=>APPS[id]&&!APPS[id].special&&a.indexOf(id)===i&&APPS[id].name.toLowerCase().includes(q)).forEach((id,i)=>{
      const it=el('div','li',icon(id)+'<span></span>'); $('span',it).textContent=APPS[id].name; it.style.animationDelay=(i*18)+'ms';
      it.onclick=e=>{e.stopPropagation();closeLaunchpad();openApp(id)}; g.append(it);
    });
  };
  draw(''); const i=$('input',o); i.focus(); i.oninput=()=>draw(i.value.trim().toLowerCase());
  o.onclick=e=>{if(e.target===o||e.target.classList.contains('lgrid'))closeLaunchpad()};
}

/* ---------- pasek stanu: zegar, bateria, Wi-Fi, centrum sterowania ---------- */
function tick(){
  const d=new Date();
  $('#clock').innerHTML='<span class="wd">'+d.toLocaleDateString('pl-PL',{weekday:'short',day:'numeric',month:'short'}).replace(/,/g,'')+'&nbsp; </span>'+pad(d.getHours())+':'+pad(d.getMinutes());
}
tick(); setInterval(tick,10000);
let batLevel=0.87, batChg=false;
function batDraw(){$('#bat').innerHTML=`<span style="font-size:12px;margin-right:5px;opacity:.85">${Math.round(batLevel*100)}%</span><svg width="26" height="13" viewBox="0 0 26 13"><rect x=".5" y=".5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".55"/><rect x="2" y="2" width="${Math.max(2,19*batLevel)}" height="9" rx="2" fill="${batLevel<.2&&!batChg?'#ff453a':'currentColor'}"/><rect x="24" y="4" width="1.5" height="5" rx=".7" fill="currentColor" opacity=".55"/></svg>`}
batDraw();
try{navigator.getBattery&&navigator.getBattery().then(b=>{const u=()=>{batLevel=b.level;batChg=b.charging;batDraw()};u();b.onlevelchange=u;b.onchargingchange=u})}catch(e){}
$('#bat').onclick=e=>{e.stopPropagation();const r=$('#bat').getBoundingClientRect();popMenu([['Bateria: '+Math.round(batLevel*100)+'%',()=>{},'',{off:true}],[batChg?'Źródło zasilania: zasilacz':'Źródło zasilania: bateria',()=>{},'',{off:true}],'-',['Ustawienia baterii…',()=>openApp('settings')]],r.left,MB+2)};
$('#bat').style.cursor='default';
function wifiDraw(){$('#wifi').innerHTML=`<svg class="ico" width="17" height="14" viewBox="0 0 17 14" style="opacity:${S.wifi?1:.4}"><path d="M1.5 5a10 10 0 0 1 14 0M4 7.8a6.4 6.4 0 0 1 9 0M6.4 10.4a3 3 0 0 1 4.2 0"/><circle cx="8.5" cy="12.4" r=".9" fill="currentColor" stroke="none"/></svg>`}
wifiDraw();
$('#wifi').onclick=e=>{e.stopPropagation();const r=$('#wifi').getBoundingClientRect();popMenu([['Wi-Fi: '+(S.wifi?'włączone':'wyłączone'),()=>{S.wifi=!S.wifi;saveS();wifiDraw()},'',{chk:S.wifi}],'-',...(S.wifi?[['Sieć domowa (połączono)',()=>{},'',{chk:true}],['Kawiarnia',()=>{}],['Biuro 5G',()=>{}]]:[]),'-',['Ustawienia sieci…',()=>openApp('settings')]],r.left-80,MB+2)};
on('music',()=>{
  const m=$('#musicx'); m.hidden=!(Music&&Music.playing);
  m.innerHTML=Music&&Music.playing?'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18V6l10-2v12" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="6.5" cy="18" r="3"/><circle cx="16.5" cy="16" r="3"/></svg>':'';
});
$('#musicx').onclick=()=>openApp('music');

$('#ccbtn').onclick=e=>{
  e.stopPropagation(); if($('#cc')){closeMenus();return} closeMenus();
  const p=el('div'); p.id='cc';
  const tile=(id,ico,t,sub,onv)=>`<button class="cc-row" id="${id}"><span class="pill ${onv?'':'off'}">${ico}</span><span><b>${t}</b><small>${sub}</small></span></button>`;
  const np=Music&&Music.cur!=null;
  p.innerHTML=`<div class="cc-grid">${tile('cc-wifi','<svg class="ico" width="16" height="14" viewBox="0 0 17 14"><path d="M1.5 5a10 10 0 0 1 14 0M4 7.8a6.4 6.4 0 0 1 9 0M6.4 10.4a3 3 0 0 1 4.2 0"/></svg>','Wi-Fi',S.wifi?'Włączone':'Wyłączone',S.wifi)}${tile('cc-bt','<svg class="ico" width="14" height="16" viewBox="0 0 14 16"><path d="m3 4.5 8 7-4 3.500V1.500l4 3.500-8 7"/></svg>','Bluetooth',S.bt?'Włączony':'Wyłączony',S.bt)}${tile('cc-dark','<svg class="ico" width="16" height="16" viewBox="0 0 16 16"><path d="M13 9.500A5.500 5.500 0 0 1 6.500 3 5.500 5.500 0 1 0 13 9.500z"/></svg>','Tryb ciemny',isDark()?'Wł.':'Wył.',isDark())}${tile('cc-dnd','<svg class="ico" width="16" height="16" viewBox="0 0 16 16"><path d="M8 2a6 6 0 1 0 6 6"/></svg>','Nie przeszkadzać',S.dnd?'Wł.':'Wył.',S.dnd)}</div>
  <div class="cc-sl"><label for="br">Jasność</label><input type="range" id="br" min="30" max="100" value="${S.brightness}"></div>
  <div class="cc-sl"><label for="vo">Dźwięk</label><input type="range" id="vo" min="0" max="100" value="${S.volume}"></div>
  ${np?`<div class="cc-sl" style="display:flex;align-items:center;gap:10px"><div style="flex:1;min-width:0"><b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(TRACKS[Music.cur].name)}</b><small style="color:var(--fg2)">${esc(TRACKS[Music.cur].artist)}</small></div><button class="tbtn" id="cc-pp">${Music.playing?'Pauza':'Odtwórz'}</button></div>`:''}`;
  document.body.append(p);
  const rerender=()=>{p.remove();$('#ccbtn').click()};
  $('#cc-wifi').onclick=()=>{S.wifi=!S.wifi;saveS();wifiDraw();rerender()};
  $('#cc-bt').onclick=()=>{S.bt=!S.bt;saveS();rerender()};
  $('#cc-dark').onclick=()=>{toggleTheme();rerender()};
  $('#cc-dnd').onclick=()=>{S.dnd=!S.dnd;saveS();rerender()};
  $('#br').oninput=e=>{S.brightness=+e.target.value;saveS();applySettings()};
  $('#vo').oninput=e=>{S.volume=+e.target.value;saveS();applySettings()};
  const pp=$('#cc-pp'); if(pp)pp.onclick=()=>{musicToggle();rerender()};
};
$('#clock').onclick=e=>{
  e.stopPropagation(); if($('#nc')){closeMenus();return} closeMenus();
  const p=el('div'); p.id='nc'; const d=new Date();
  p.innerHTML=`<div style="font-size:12px;color:var(--fg2);text-transform:uppercase;letter-spacing:.06em;font-weight:600">${d.toLocaleDateString('pl-PL',{weekday:'long'})}</div><div style="font-size:26px;font-weight:700">${d.toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'})}</div><div style="margin-top:14px;font-weight:600">Powiadomienia</div>`;
  if(!notifs.length)p.append(el('div','nrow','<span style="color:var(--fg2)">Brak nowych powiadomień</span>'));
  notifs.forEach(n=>{const r=el('div','nrow',(n.app&&APPS[n.app]?icon(n.app):icon('about'))+'<div><b></b><span></span></div>');$('b',r).textContent=n.title;$('span',r).textContent=n.body;p.append(r)});
  document.body.append(p);
};

/* ---------- ekran: start, logowanie, uśpienie, wyłączenie ---------- */
const scr=$('#screen'); let sessionOn=false;
function setScreen(cls,html){scr.hidden=false;scr.className=cls;scr.innerHTML=html}
const IC_SLEEP='<svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M13 9.500A5.500 5.500 0 0 1 6.500 3 5.500 5.500 0 1 0 13 9.500z"/></svg>';
const IC_RESTART='<svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M13 8a5 5 0 1 1-1.500-3.500M13 2.500v3h-3"/></svg>';
const IC_POWER='<svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 1.500v6M4.500 4a5.500 5.500 0 1 0 7 0"/></svg>';
function boot(){
  setScreen('boot',`<div class="bl">${LOGO(76)}</div><div class="bar"><i></i></div>`);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const i=$('.bar i',scr);if(i)i.style.width='100%'}));
  setTimeout(()=>{if(scr.classList.contains('boot'))login()},3100);
}
function login(){
  closeMenus(); const d=new Date();
  setScreen('login',`<div class="big"><b>${pad(d.getHours())}:${pad(d.getMinutes())}</b><span>${d.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long'})}</span></div>
  <div class="av" style="background:${S.avatar}">${esc((S.user[0]||'G').toUpperCase())}</div><div class="nm">${esc(S.user)}</div>
  <div class="pw"><input type="password" placeholder="Wpisz hasło" autocomplete="off" aria-label="Hasło"><button aria-label="Zaloguj">→</button></div>
  <div class="hint">Wpisz dowolne hasło albo naciśnij Enter</div>
  <div class="pwr"><button data-a="sleep"><i>${IC_SLEEP}</i>Uśpij</button><button data-a="restart"><i>${IC_RESTART}</i>Uruchom ponownie</button><button data-a="shut"><i>${IC_POWER}</i>Wyłącz</button></div>`);
  const i=$('input',scr); setTimeout(()=>i.focus(),50);
  i.onkeydown=e=>{if(e.key==='Enter')unlock()}; $('.pw button',scr).onclick=unlock;
  $$('.pwr button',scr).forEach(b=>b.onclick=()=>({sleep:sleepNow,restart:()=>doPower('restart'),shut:()=>doPower('shutdown')})[b.dataset.a]());
}
function unlock(){
  sfx('chime'); scr.classList.add('fade');
  if(S.autoFs&&!document.fullscreenElement)toggleFullscreen();
  setTimeout(()=>{scr.hidden=true;scr.className='';scr.innerHTML=''},520);
  if(!sessionOn){sessionOn=true;startSession()}
}
function startSession(){
  openApp('finder'); setTimeout(()=>notify('Witaj, '+S.user,'System jest gotowy. Naciśnij Ctrl + Spacja, aby wyszukać.','finder'),900);
  if(storeTodo().length)setTimeout(()=>notify('Nowe w App Store','Pobierz Work Docs, Math Docs, Wykresy i Pay Buddy. Kliknij, aby otworzyć.','appstore',()=>openApp('appstore')),5600);
}
function wakeOnce(next){
  setTimeout(()=>{
    const h=()=>{scr.removeEventListener('pointerdown',h);removeEventListener('keydown',h,true);next()};
    scr.addEventListener('pointerdown',h);addEventListener('keydown',h,true);
  },700);
}
function offScreen(){
  setScreen('off','<div class="offhint">Kliknij lub naciśnij dowolny klawisz, aby włączyć komputer</div>');
  wakeOnce(()=>{sfx('chime');boot()});
}
function sleepNow(){closeMenus();if(Music&&Music.playing)musicToggle();setScreen('sleep','');wakeOnce(login)}
function shutting(then){setScreen('shut',`<div class="bl">${LOGO(76)}</div><div class="spin"></div>`);setTimeout(then,1800)}
function doPower(kind){
  closeMenus(); closeLaunchpad(); closeSpot(); sfx('down');
  musicStop(); closeAll(); sessionOn=false;
  if(kind==='logout'){setTimeout(login,500);return}
  setTimeout(()=>shutting(()=>kind==='restart'?boot():offScreen()),650);
}
function confirmPower(kind){
  const t={restart:['Czy na pewno chcesz teraz uruchomić ponownie komputer?','Uruchom ponownie','zostanie uruchomiony ponownie'],shutdown:['Czy na pewno chcesz teraz wyłączyć komputer?','Wyłącz','zostanie wyłączony'],logout:['Czy na pewno chcesz wylogować użytkownika '+S.user+'?','Wyloguj','wyloguje użytkownika']}[kind];
  let n=60, done=false;
  const msg=()=>kind==='logout'?'Wylogowanie nastąpi automatycznie za '+n+' s.':'Jeśli nic nie zrobisz, komputer '+t[2]+' automatycznie za '+n+' s.';
  const dlg=dialog({title:t[0],msg:msg(),ic:icon('about'),buttons:[{label:'Anuluj',cancel:true,cb:()=>{done=true;clearInterval(iv)}},{label:t[1],primary:true,cb:()=>{done=true;clearInterval(iv);doPower(kind)}}]});
  const iv=setInterval(()=>{if(done)return clearInterval(iv);n--;dlg.setMsg(msg());if(n<=0){clearInterval(iv);dlg.close();doPower(kind)}},1000);
}
function forceQuit(){
  const ids=[...new Set([...wins.values()].map(w=>w.id))]; let sel=ids[0];
  const body=el('div'); body.style.cssText='margin-top:10px;border:1px solid var(--line);border-radius:8px;max-height:160px;overflow:auto';
  const draw=()=>{body.innerHTML='';ids.forEach(id=>{const r=el('div','sl'+(id===sel?' on':''),'<span style="width:20px;height:20px;display:block">'+icon(id)+'</span><span></span>');$('span:last-child',r).textContent=APPS[id].name;r.onclick=()=>{sel=id;draw()};body.append(r)});if(!ids.length)body.textContent='Brak uruchomionych aplikacji.'};
  draw();
  dialog({title:'Wymuś zakończenie programu',msg:'Wybierz aplikację do zamknięcia.',body,buttons:[{label:'Anuluj',cancel:true},{label:'Wymuś zakończenie',primary:true,cb:()=>{if(sel)winsOf(sel).forEach(closeWin)}}]});
}

/* ---------- pulpit: ikony, menu kontekstowe, upuszczanie plików ---------- */
function drawIcons(){
  const box=$('#icons'); box.innerHTML='';
  const items=[['MGS HD','/',{t:'d',disk:1}],...VFS.list(HOME+'/Desktop').filter(([n])=>!n.startsWith('.')).map(([n,node])=>[n,HOME+'/Desktop/'+n,node])];
  items.forEach(([n,p,node])=>{
    const ico=node.disk?diskSVG:node.t==='d'?folderSVG:node.k==='app'?icon(node.app):fileSVG(node.k==='img'?'img':'doc');
    const d=el('div','di',ico+'<span></span>'); $('span',d).textContent=n; d.draggable=!node.disk; d.dataset.path=p;
    d.onclick=e=>{e.stopPropagation();$$('.di').forEach(x=>x.classList.remove('sel'));d.classList.add('sel')};
    d.ondblclick=()=>openNode(p);
    d.ondragstart=e=>{e.dataTransfer.setData('text/x-path',p);e.dataTransfer.effectAllowed='move'};
    d.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();d.click();popMenu([['Otwórz',()=>openNode(p)],...(node.disk?[]:[['Przenieś do kosza',()=>trashPath(p)]])],e.clientX,e.clientY)};
    box.append(d);
  });
}
function newItem(dir,kind){
  const isDir=kind==='dir';
  dialog({title:isDir?'Nowy folder':'Nowy dokument tekstowy',msg:'Podaj nazwę.',input:'Nazwa',value:isDir?'Nowy folder':'Bez tytułu.txt',buttons:[{label:'Anuluj',cancel:true},{label:'Utwórz',primary:true,cb:v=>{
    v=(v||'').trim().replace(/\//g,'-'); if(!v)return false;
    try{isDir?VFS.mkdir(dir+'/'+v):VFS.write(dir+'/'+v,'')}catch(e){notify('Nie można utworzyć',e.message,'finder')}
  }}]});
}
$('#desk').addEventListener('contextmenu',e=>{
  if(e.target.closest('.win,#dock,#menubar,.di'))return;
  e.preventDefault(); popMenu([['Nowy folder',()=>newItem(HOME+'/Desktop','dir')],['Nowy dokument tekstowy',()=>newItem(HOME+'/Desktop','file')],'-',['Otwórz Terminal',()=>openApp('terminal',{new:true})],['Zmień tapetę…',()=>openApp('settings',{pane:'wall'})]],e.clientX,e.clientY);
});
$('#desk').addEventListener('click',e=>{if(!e.target.closest('.di'))$$('.di').forEach(x=>x.classList.remove('sel'))});
$('#desk').addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('text/x-path'))e.preventDefault()});
$('#desk').addEventListener('drop',e=>{
  const p=e.dataTransfer.getData('text/x-path'); if(!p)return; e.preventDefault();
  try{VFS.mv(p,HOME+'/Desktop')}catch(err){notify('Nie można przenieść',err.message,'finder')}
});
on('fs',drawIcons);

/* ---------- skróty klawiszowe ---------- */
addEventListener('keydown',e=>{
  if(!scr.hidden)return;
  if((e.ctrlKey||e.metaKey)&&e.code==='Space'){e.preventDefault();$('#spot')?closeSpot():openSpot()}
  else if(e.key==='F3'||(e.ctrlKey&&e.key==='ArrowUp'&&!e.target.closest('textarea,input'))){e.preventDefault();toggleMC()}
  else if(e.key==='F4'){e.preventDefault();openLaunchpad()}
  else if(e.key==='Escape'){closeMenus();closeSpot();closeLaunchpad();exitMC()}
});
