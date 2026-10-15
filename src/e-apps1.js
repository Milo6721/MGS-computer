
/* ================= IKONY I REJESTR APLIKACJI ================= */
function icon(id){
  if(LOGOS[id])return `<svg class="app" viewBox="0 0 60 60" aria-hidden="true"><image href="${LOGOS[id]}" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice"/></svg>`;
  const g='g'+uid++, d=new Date();
  const top=(a,b)=>`<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="60" height="60" rx="14" fill="url(#${g})"/>`;
  const petals=['#ff5f57','#ffbd2e','#f6e03a','#7ed957','#28c8a0','#3ba1ff','#8e6bff','#ff6bd0'].map((c,i)=>`<ellipse cx="30" cy="19" rx="6.5" ry="11" transform="rotate(${i*45} 30 30)" fill="${c}" opacity=".78"/>`).join('');
  const lp=['#ff5f57','#ffbd2e','#28c840','#0a84ff','#bf5af2','#ff9f0a','#5ac8fa','#ff375f','#30d158'].map((c,i)=>`<rect x="${10+(i%3)*14}" y="${10+Math.floor(i/3)*14}" width="11" height="11" rx="3" fill="${c}"/>`).join('');
  const B={
    finder:()=>top('#7fd0ff','#1a6cf0')+'<path d="M0 14A14 14 0 0 1 14 0h16v60H14A14 14 0 0 1 0 46z" fill="#eaf5ff"/><rect x="15" y="14" width="3" height="10" rx="1.5" fill="#12306b"/><rect x="42" y="14" width="3" height="10" rx="1.5" fill="#fff"/><path d="M13 40q17 11 34 0" stroke="#12306b" stroke-width="3" fill="none" stroke-linecap="round"/>',
    launchpad:()=>top('#dfe2e9','#9ba2b0')+lp,
    browser:()=>top('#6ec6ff','#0a62e0')+'<circle cx="30" cy="30" r="20" fill="#fff" opacity=".96"/><path d="M41 19 33 33 27 27z" fill="#ff3b30"/><path d="M19 41 27 27 33 33z" fill="#dfe3ea"/>',
    workdocs:()=>top('#4f8cff','#1f4fd8')+'<path d="M16 9h20l10 10v30a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3z" fill="#fff"/><path d="M36 9v10h10z" fill="#c9d8ff"/><path d="M19 28h22M19 34h22M19 40h14" stroke="#8aa8f0" stroke-width="2.6" stroke-linecap="round"/>',
    mathdocs:()=>top('#34d3a6','#0b8f74')+'<path d="M16 9h20l10 10v30a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3z" fill="#fff"/><path d="M36 9v10h10z" fill="#bff1e3"/><text x="29" y="43" text-anchor="middle" font-size="22" font-weight="700" fill="#0b8f74" font-family="Georgia,serif">∑</text>',
    photos:()=>top('#ffffff','#eeeef2')+petals,
    music:()=>top('#ff6b81','#e0143c')+'<path d="M24 38V18l18-4v20" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="40" r="5.5" fill="#fff"/><circle cx="38" cy="36" r="5.5" fill="#fff"/>',
    notes:()=>top('#fffef6','#f2edd2')+'<path d="M0 14A14 14 0 0 1 14 0h32a14 14 0 0 1 14 14v9H0z" fill="#ffc93a"/><g stroke="#cfcab0" stroke-width="2" stroke-linecap="round"><path d="M10 33h40M10 41h40M10 49h26"/></g>',
    reminders:()=>top('#ffffff','#eeeff3')+[['#ff9f0a',18],['#0a84ff',30],['#30d158',42]].map(c=>`<circle cx="17" cy="${c[1]}" r="4.5" fill="${c[0]}"/><path d="M27 ${c[1]}h22" stroke="#d1d1d6" stroke-width="3" stroke-linecap="round"/>`).join(''),
    calendar:()=>top('#ffffff','#f0f0f2')+`<text x="30" y="17" text-anchor="middle" font-size="9" font-weight="700" fill="#ff3b30" font-family="system-ui,sans-serif">${d.toLocaleString('pl-PL',{month:'short'}).replace('.','').toUpperCase()}</text><text x="30" y="49" text-anchor="middle" font-size="30" font-weight="300" fill="#1d1d1f" font-family="system-ui,sans-serif">${d.getDate()}</text>`,
    appstore:()=>top('#5ec8ff','#0a6cf0')+'<path d="M17 25h26l-2 20a3 3 0 0 1-3 3H22a3 3 0 0 1-3-3z" fill="#fff"/><path d="M24 25v-4a6 6 0 0 1 12 0v4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M26 33a4 4 0 0 0 8 0" stroke="#1a79f2" stroke-width="3" fill="none" stroke-linecap="round"/>',
    terminal:()=>top('#46464a','#0d0d0f')+'<text x="9" y="39" font-family="Menlo,Consolas,monospace" font-size="22" font-weight="700" fill="#fff">&gt;_</text>',
    settings:()=>top('#c3c7d0','#7f8490')+'<circle cx="30" cy="30" r="15" fill="none" stroke="#2c2f36" stroke-width="7" stroke-dasharray="3.5 2.39"/><circle cx="30" cy="30" r="11.5" fill="#2c2f36"/><circle cx="30" cy="30" r="5" fill="#c3c7d0"/>',
    calc:()=>top('#4d4d52','#1b1b1d')+'<rect x="9" y="8" width="42" height="14" rx="3" fill="#2a2a2c"/><g fill="#8e8e93"><circle cx="15" cy="32" r="4.5"/><circle cx="26" cy="32" r="4.5"/><circle cx="37" cy="32" r="4.5"/><circle cx="15" cy="43" r="4.5"/><circle cx="26" cy="43" r="4.5"/><circle cx="37" cy="43" r="4.5"/></g><g fill="#ff9f0a"><circle cx="48" cy="32" r="4.5"/><circle cx="48" cy="43" r="4.5"/></g>',
    clock:()=>top('#2b2b2e','#000')+'<circle cx="30" cy="30" r="22" fill="#fff"/><path d="M30 30V16M30 30l9 5" stroke="#1d1d1f" stroke-width="3" stroke-linecap="round"/><path d="M30 30l7-14" stroke="#ff9f0a" stroke-width="1.6" stroke-linecap="round"/>',
    textedit:()=>top('#ffffff','#e9eaee')+'<path d="M10 16h30M10 25h30M10 34h18" stroke="#c7c9d1" stroke-width="3" stroke-linecap="round"/><path d="M35 46l2-8 14-14 6 6-14 14z" fill="#ffc93a"/><path d="M35 46l2-8 6 6z" fill="#f4a261"/>',
    activity:()=>top('#2a2c33','#0e0f12')+'<path d="M8 40h10l6-18 8 24 6-16h14" stroke="#30d158" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    preview:()=>top('#8ad0ff','#2f7bf0')+'<rect x="11" y="13" width="38" height="34" rx="3" fill="#fff"/><path d="M14 43l10-12 7 8 6-6 9 10z" fill="#4cc38a"/><circle cx="38" cy="23" r="3.5" fill="#ffc93a"/>',
    minesweeper:()=>top('#c9ced8','#8b92a1')+'<circle cx="30" cy="30" r="11" fill="#1d1d1f"/><g stroke="#1d1d1f" stroke-width="3.5" stroke-linecap="round"><path d="M30 13v6M30 41v6M13 30h6M41 30h6M18 18l4 4M38 38l4 4M42 18l-4 4M22 38l-4 4"/></g><circle cx="26" cy="26" r="3" fill="#fff" opacity=".8"/>',
    g2048:()=>top('#f6b44a','#e8892a')+'<text x="30" y="38" text-anchor="middle" font-size="19" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">2048</text>',
    snake:()=>top('#7fe08a','#1e9b4a')+'<path d="M12 44h20a8 8 0 0 0 0-16H24a5 5 0 0 1 0-10h22" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="46" cy="18" r="2" fill="#1e9b4a"/>',
    sketch:()=>top('#fffdf4','#f1ecd6')+'<path d="M12 44c8-14 14 4 22-8s8-8 14-14" stroke="#0a84ff" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M38 46l2-7 13-13 5 5-13 13z" fill="#ff5f57"/>',
    pomodoro:()=>top('#ff7a59','#e03c2a')+'<circle cx="30" cy="34" r="16" fill="#fff"/><path d="M30 34V23M30 34l8 4" stroke="#e03c2a" stroke-width="3" stroke-linecap="round"/><path d="M30 18c0-4 2-6 6-7" stroke="#2fb35a" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    trash:()=>top('#d4d8df','#9aa1ad')+'<rect x="15" y="14" width="30" height="4" rx="2" fill="#fff"/><rect x="25" y="10" width="10" height="4" rx="2" fill="#fff"/><path d="M18 21h24l-2 27a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3z" fill="#fff" opacity=".9"/><path d="M26 26v18M30 26v18M34 26v18" stroke="#b9bec8" stroke-width="2" stroke-linecap="round"/>',
    trashfull:()=>top('#d4d8df','#9aa1ad')+'<path d="M20 20l6-7 8 4 5-6 4 9z" fill="#fff" stroke="#b9bec8"/><rect x="15" y="17" width="30" height="4" rx="2" fill="#fff"/><path d="M18 24h24l-2 24a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3z" fill="#fff" opacity=".9"/><path d="M26 28v16M30 28v16M34 28v16" stroke="#b9bec8" stroke-width="2" stroke-linecap="round"/>',
    about:()=>top('#4a4f63','#1d2030')+`<g transform="translate(12 12) scale(1.5)" color="#fff" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">${LOGO_MARK(24).replace(/^<svg[^>]*>|<\/svg>$/g,'')}</g><image href="logo.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice"/>`
  };
  const gl='g'+uid++;
  const gloss=`<defs><linearGradient id="${gl}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="60" height="60" rx="14" fill="url(#${gl})" pointer-events="none"/><rect x=".5" y=".5" width="59" height="59" rx="13.5" fill="none" stroke="#fff" stroke-opacity=".3" pointer-events="none"/>`;
  return `<svg class="app" viewBox="0 0 60 60" aria-hidden="true">${(B[id]||B.about)()}${gloss}</svg>`;
}
const folderSVG='<svg viewBox="0 0 64 52"><path d="M3 9a5 5 0 0 1 5-5h14l6 6h28a5 5 0 0 1 5 5v28a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" fill="#4fa6f2"/><path d="M3 18a5 5 0 0 1 5-5h48a5 5 0 0 1 5 5v24a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" fill="#7cc4ff"/></svg>';
const diskSVG='<svg viewBox="0 0 64 52"><rect x="4" y="12" width="56" height="30" rx="6" fill="#d7dae2"/><rect x="4" y="30" width="56" height="12" rx="6" fill="#aeb3bf"/><circle cx="50" cy="36" r="2.5" fill="#6bd16b"/></svg>';
const fileSVG=t=>`<svg viewBox="0 0 64 52"><path d="M16 2h22l12 12v34a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z" fill="#fff" stroke="#c9ccd3" stroke-width="1.5"/><path d="M38 2v12h12z" fill="#e3e6ec"/>${t==='img'?'<path d="M18 40l8-10 6 7 5-5 7 8z" fill="#5fc08a"/><circle cx="40" cy="26" r="3" fill="#ffc93a"/>':'<path d="M19 26h26M19 32h26M19 38h16" stroke="#c9ccd3" stroke-width="2.4" stroke-linecap="round"/>'}</svg>`;
const sideIco={Desktop:'<rect x="2" y="3" width="12" height="8" rx="1"/><path d="M5 14h6"/>',Documents:'<path d="M4 2h5l3 3v9H4z"/>',Downloads:'<path d="M8 2v9m-3-3 3 3 3-3M3 14h10"/>',Applications:'<path d="M8 2 14 5.5 8 9 2 5.5zM2 8.5 8 12l6-3.5"/>',Pictures:'<rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="6" cy="7" r="1"/><path d="m3 12 4-3 3 2 3-2"/>',Music:'<path d="M6 12V3l7-1.500v8"/><circle cx="4.500" cy="12" r="1.500"/><circle cx="11.500" cy="10" r="1.500"/>',disk:'<rect x="2" y="5" width="12" height="7" rx="2"/><circle cx="11" cy="8.500" r=".6"/>',trash:'<path d="M3 4h10M6 4V2.500h4V4M4.500 4l.5 9h6l.5-9"/>'};

const APPS={
  finder:{name:'Finder',w:740,h:470,multi:true,reuse:true,render:renderFinder},
  launchpad:{name:'Launchpad',special:()=>openLaunchpad()},
  browser:{name:'Przeglądarka',w:780,h:520,render:renderBrowser},
  workdocs:{name:'Work Docs',w:940,h:600,big:true,render:(b,w)=>renderWeb(b,w,'workdocs','https://workdocs.online')},
  mathdocs:{name:'Math Docs',w:940,h:600,big:true,render:(b,w)=>renderWeb(b,w,'mathdocs','https://math.workdocs.online')},
  wykresy:{name:'Wykresy',w:940,h:600,big:true,render:(b,w)=>renderWeb(b,w,'wykresy','https://wykresy.workdocs.online')},
  paybud:{name:'Pay Buddy',w:460,h:700,render:(b,w)=>renderWeb(b,w,'paybud','https://paybud.site')},
  photos:{name:'Zdjęcia',w:720,h:480,render:renderPhotos},
  music:{name:'Muzyka',w:700,h:470,render:renderMusic},
  notes:{name:'Notatki',w:660,h:430,render:renderNotes},
  reminders:{name:'Przypomnienia',w:600,h:440,render:renderReminders},
  calendar:{name:'Kalendarz',w:760,h:480,render:renderCalendar},
  appstore:{name:'App Store',w:820,h:540,render:renderAppStore},
  terminal:{name:'Terminal',w:640,h:400,multi:true,render:renderTerm},
  settings:{name:'Ustawienia systemowe',w:700,h:480,render:renderSettings},
  calc:{name:'Kalkulator',w:260,h:400,fixed:true,render:renderCalc},
  clock:{name:'Zegar',w:520,h:440,render:renderClock},
  textedit:{name:'Edytor tekstu',w:600,h:420,multi:true,render:renderTextEdit},
  activity:{name:'Monitor aktywności',w:600,h:420,render:renderActivity},
  preview:{name:'Podgląd',w:620,h:460,multi:true,render:renderPreview},
  about:{name:'O tym komputerze',w:380,h:330,fixed:true,nodock:true,render:renderAbout}
};
const BASE_APPS=['finder','launchpad','browser','photos','music','notes','reminders','calendar','appstore','terminal','settings','calc','clock','textedit','activity'];

/* ---------- otwieranie elementów systemu plików ---------- */
function openNode(p){
  const n=VFS.get(p); if(!n)return; const name=p.split('/').pop();
  if(p==='/'||n.t==='d')return openApp('finder',{path:p});
  if(n.k==='app')return openApp(n.app);
  if(n.k==='img'||['png','jpg','jpeg','gif','webp'].includes(extOf(name)))return openApp('preview',{file:p});
  if(n.k==='bin')return dialog({title:'Nie można otworzyć „'+name+'”',msg:'Ten typ pliku nie jest obsługiwany w tym systemie.',buttons:[{label:'OK',primary:true}]});
  openApp('textedit',{file:p});
}
let fileClip=null;
const imgHTML=n=>n.url?`<img src="${n.url}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`:photoSVG(n.seed||0);

/* ================= FINDER ================= */
function renderFinder(body,w,opts){
  let path=opts.path||HOME+'/Desktop', hist=[], fwd=[], view=store.get('fview','icon'), q='', sel=new Set();
  const side=el('div','side'), main=el('div','main'), bar=el('div','bar'), content=el('div','fcont'), st=el('div','status');
  content.style.cssText='flex:1;display:flex;flex-direction:column;min-height:0'; content.tabIndex=0;
  const back=el('button','','‹'), fw=el('button','','›'), title=el('span'), sp=el('span','sp');
  const vi=el('button','','▦'), vl=el('button','','☰'), search=el('input'); search.placeholder='Szukaj'; search.setAttribute('aria-label','Szukaj w folderze');
  const trashBtn=el('button','','Opróżnij kosz');
  back.setAttribute('aria-label','Wstecz'); fw.setAttribute('aria-label','Dalej'); vi.title='Jako ikony'; vl.title='Jako lista';
  bar.append(back,fw,title,sp,trashBtn,vi,vl,search); main.append(bar,content,st); body.append(side,main);
  const inTrash=()=>path===TRASH||path.startsWith(TRASH+'/');
  const base=p=>p==='/'?'':p.split('/').pop();
  const full=n=>(path==='/'?'':path)+'/'+n;
  function go(p,push=true){
    p=VFS.norm(p); const n=VFS.get(p); if(!n||n.t!=='d')return;
    if(push){hist.push(path);fwd=[]} path=p; sel.clear(); q=''; search.value=''; draw();
  }
  function entries(){
    let l=VFS.list(path); if(!inTrash())l=l.filter(([n])=>!n.startsWith('.'));
    if(q)l=l.filter(([n])=>n.toLowerCase().includes(q)); return l;
  }
  const iconFor=(n,node)=>node.t==='d'?folderSVG:node.k==='app'?icon(node.app):node.k==='img'?`<div class="ph">${imgHTML(node)}</div>`:fileSVG('doc');
  function moveInto(paths,dir){
    paths.forEach(p=>{if(dir===TRASH)return trashPath(p);try{VFS.mv(p,dir)}catch(e){notify('Nie można przenieść',e.message,'finder')}});
  }
  function itemMenu(name,node,e){
    const p=full(name);
    const items=[['Otwórz',()=>openNode(p)],'-',['Kopiuj',()=>{fileClip=p}],['Zmień nazwę…',()=>rename(name)],['Informacje',()=>info(name,node)],'-'];
    if(inTrash()){items.push(['Usuń natychmiast',()=>{sfx('trash');VFS.rm(p,true)}]);items.push(['Włóż z powrotem na Pulpit',()=>VFS.mv(p,HOME+'/Desktop')])}
    else items.push(['Przenieś do kosza',()=>trashSel(name)]);
    popMenu(items,e.clientX,e.clientY);
  }
  function trashSel(name){
    const names=sel.has(name)?[...sel]:[name];
    names.forEach(n=>trashPath(full(n)));
  }
  function rename(name){
    dialog({title:'Zmień nazwę',msg:'Podaj nową nazwę.',input:'Nazwa',value:name,buttons:[{label:'Anuluj',cancel:true},{label:'Zmień',primary:true,cb:v=>{
      v=(v||'').trim().replace(/\//g,'-'); if(!v||v===name)return;
      try{if(VFS.get(full(v)))throw new Error('Element o takiej nazwie już istnieje');VFS.mv(full(name),full(v))}catch(e){notify('Nie można zmienić nazwy',e.message,'finder')}
    }}]});
  }
  function info(name,node){
    const sz=VFS.size(node), kind=node.t==='d'?'Folder':node.k==='app'?'Aplikacja':node.k==='img'?'Obraz':'Dokument';
    dialog({title:name,msg:`Rodzaj: ${kind}\nRozmiar: ${fmtSize(sz)}\nZmodyfikowano: ${fmtDate(node.m)}\nŚcieżka: ${full(name)}`,ic:node.t==='d'?folderSVG:node.k==='app'?icon(node.app):fileSVG('doc'),buttons:[{label:'OK',primary:true}]});
  }
  function bgMenu(e){
    popMenu([['Nowy folder',()=>newItem(path,'dir')],['Nowy dokument tekstowy',()=>newItem(path,'file')],'-',['Wklej',()=>{try{VFS.cp(fileClip,path,true)}catch(er){notify('Nie można wkleić',er.message,'finder')}},'',{off:!fileClip}],'-',['Jako ikony',()=>setView('icon'),'',{chk:view==='icon'}],['Jako listę',()=>setView('list'),'',{chk:view==='list'}]],e.clientX,e.clientY);
  }
  function setView(v){view=v;store.set('fview',v);draw()}
  function bind(row,name,node){
    const p=full(name);
    row.onclick=e=>{e.stopPropagation();content.focus();if(e.ctrlKey||e.metaKey){sel.has(name)?sel.delete(name):sel.add(name)}else{sel.clear();sel.add(name)}paintSel()};
    row.ondblclick=()=>{if(node.t==='d'&&!inTrash())go(p);else if(node.t==='d')go(p);else openNode(p)};
    row.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();if(!sel.has(name)){sel.clear();sel.add(name);paintSel()}itemMenu(name,node,e)};
    row.draggable=true;
    row.ondragstart=e=>{const ps=(sel.has(name)?[...sel]:[name]).map(full);e.dataTransfer.setData('text/x-path',ps.join('\n'));e.dataTransfer.effectAllowed='move'};
    if(node.t==='d'){
      row.ondragover=e=>{if(e.dataTransfer.types.includes('text/x-path')){e.preventDefault();e.stopPropagation();row.classList.add('drop')}};
      row.ondragleave=()=>row.classList.remove('drop');
      row.ondrop=e=>{e.preventDefault();e.stopPropagation();row.classList.remove('drop');moveInto(e.dataTransfer.getData('text/x-path').split('\n').filter(Boolean),p)};
    }
    row.dataset.name=name;
  }
  function paintSel(){
    $$('[data-name]',content).forEach(r=>r.classList.toggle('sel',sel.has(r.dataset.name)));
    const t=entries().length; st.textContent=sel.size?`Wybrano ${sel.size} z ${t}`:t+(t===1?' element':' elementy');
  }
  function draw(){
    side.innerHTML='';
    const mk=(label,p,ico)=>{
      const s=el('div','sl'+(path===p?' on':''),`<svg viewBox="0 0 16 16">${ico}</svg><span></span>`); $('span',s).textContent=label; s.onclick=()=>go(p);
      s.ondragover=e=>{if(e.dataTransfer.types.includes('text/x-path')){e.preventDefault();s.classList.add('drop')}}; s.ondragleave=()=>s.classList.remove('drop');
      s.ondrop=e=>{e.preventDefault();s.classList.remove('drop');moveInto(e.dataTransfer.getData('text/x-path').split('\n').filter(Boolean),p)}; side.append(s);
    };
    side.append(el('h6','','Ulubione'));
    [['Desktop','Pulpit'],['Documents','Dokumenty'],['Downloads','Pobrane'],['Pictures','Zdjęcia'],['Music','Muzyka']].forEach(([k,l])=>mk(l,HOME+'/'+k,sideIco[k]));
    mk('Aplikacje','/Applications',sideIco.Applications);
    side.append(el('h6','','Lokalizacje')); mk('MGS HD','/',sideIco.disk); mk('Kosz',TRASH,sideIco.trash);
    title.textContent=dn(base(path)); w.title(dn(base(path)));
    back.disabled=!hist.length; fw.disabled=!fwd.length; trashBtn.hidden=!(path===TRASH); trashBtn.disabled=!trashFull();
    vi.classList.toggle('on',view==='icon'); vl.classList.toggle('on',view==='list');
    content.innerHTML=''; const l=entries();
    if(!l.length){content.append(el('div','empty',q?'Brak wyników':path===TRASH?'Kosz jest pusty':'Ten folder jest pusty'))}
    else if(view==='icon'){
      const g=el('div','grid'); l.forEach(([n,node])=>{const it=el('div','it',iconFor(n,node)+'<span></span>');$('span',it).textContent=dn(n);bind(it,n,node);g.append(it)}); content.append(g);
    }else{
      const lst=el('div','lst'); const t=el('table'); t.innerHTML='<thead><tr><th>Nazwa</th><th>Data modyfikacji</th><th>Rozmiar</th><th>Rodzaj</th></tr></thead>'; const tb=el('tbody');
      l.forEach(([n,node])=>{const r=el('tr','',`<td>${node.t==='d'?folderSVG:node.k==='app'?icon(node.app):fileSVG(node.k==='img'?'img':'doc')}<span></span></td><td>${fmtDate(node.m)}</td><td>${node.t==='d'?'—':fmtSize(VFS.size(node))}</td><td>${node.t==='d'?'Folder':node.k==='app'?'Aplikacja':node.k==='img'?'Obraz':'Dokument'}</td>`);$('span',r).textContent=dn(n);bind(r,n,node);tb.append(r)});
      t.append(tb); lst.append(t); content.append(lst);
    }
    content.oncontextmenu=e=>{e.preventDefault();bgMenu(e)};
    content.onclick=()=>{sel.clear();paintSel()};
    content.ondragover=e=>{if(e.dataTransfer.types.includes('text/x-path'))e.preventDefault()};
    content.ondrop=e=>{e.preventDefault();moveInto(e.dataTransfer.getData('text/x-path').split('\n').filter(Boolean),path)};
    paintSel();
  }
  content.onkeydown=e=>{
    if(e.key==='Enter'&&sel.size)openNode(full([...sel][0]));
    else if((e.key==='Delete'||(e.key==='Backspace'&&(e.ctrlKey||e.metaKey)))&&sel.size)trashSel([...sel][0]);
  };
  back.onclick=()=>{if(hist.length){fwd.push(path);go(hist.pop(),false)}};
  fw.onclick=()=>{if(fwd.length){hist.push(path);go(fwd.pop(),false)}};
  vi.onclick=()=>setView('icon'); vl.onclick=()=>setView('list');
  search.oninput=()=>{q=search.value.trim().toLowerCase();sel.clear();draw()};
  trashBtn.onclick=emptyTrash;
  w.on('fs',()=>{if(!VFS.get(path))path=HOME;draw()});
  w.onopen=o=>{if(o.path)go(o.path)};
  w.menu=[['Nowy folder',()=>newItem(path,'dir'),'⇧⌘N'],['Nowy dokument tekstowy',()=>newItem(path,'file')]];
  draw();
}

/* ================= EDYTOR TEKSTU ================= */
function renderTextEdit(body,w,opts){
  let file=opts.file||null, dirty=false;
  const main=el('div','main'), bar=el('div','bar'), ta=el('textarea','note mono'); ta.setAttribute('aria-label','Treść dokumentu'); ta.spellcheck=false;
  const bs=el('button','','Zapisz'), ba=el('button','','Zapisz jako…'), bm=el('button','','Aa'), lab=el('span'); lab.style.cssText='font-weight:400;color:var(--fg2)'; bm.title='Czcionka stałej szerokości';
  bar.append(bs,ba,el('span','sp'),lab,bm); main.append(bar,ta); body.append(main);
  if(file){const n=VFS.get(file);ta.value=n&&n.t==='f'?n.d||'':''}
  const upd=()=>{const nm=file?file.split('/').pop():'Bez tytułu';w.title(nm+(dirty?' — edytowany':''));lab.textContent=file?file.replace(HOME,'~'):'Nowy dokument'};
  function save(){
    if(!file)return saveAs();
    try{VFS.write(file,ta.value)}catch(e){notify('Nie można zapisać',e.message,'textedit');return}
    dirty=false; upd();
  }
  function saveAs(){
    dialog({title:'Zapisz jako',msg:'Ścieżka względem folderu domowego.',input:'Documents/nazwa.txt',value:file?file.replace(HOME+'/',''):'Documents/Bez tytułu.txt',buttons:[{label:'Anuluj',cancel:true},{label:'Zapisz',primary:true,cb:v=>{
      v=(v||'').trim(); if(!v)return false; const p=VFS.norm(v,HOME);
      try{VFS.write(p,ta.value);file=p;dirty=false;upd()}catch(e){notify('Nie można zapisać',e.message,'textedit');return false}
    }}]});
  }
  ta.oninput=()=>{dirty=true;upd()};
  ta.onkeydown=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save()}};
  bs.onclick=save; ba.onclick=saveAs; bm.onclick=()=>ta.classList.toggle('mono');
  w.cleanups.push(()=>{if(dirty&&file){try{VFS.write(file,ta.value)}catch(e){}}});
  w.menu=[['Zapisz',save,'⌘S'],['Zapisz jako…',saveAs]];
  upd(); setTimeout(()=>ta.focus(),60);
}

/* ================= PODGLĄD ================= */
function renderPreview(body,w,opts){
  let file=opts.file;
  const main=el('div','main'), bar=el('div','bar'), view=el('div');
  view.style.cssText='flex:1;display:grid;place-items:center;background:var(--field);overflow:hidden;padding:18px;min-height:0';
  const pv=el('button','','‹'), nx=el('button','','›'), lab=el('span','sp'); lab.style.cssText='text-align:center;font-weight:600';
  bar.append(pv,nx,lab); main.append(bar,view); body.append(main);
  const dir=()=>VFS.split(file)[0];
  const siblings=()=>VFS.list(dir()).filter(([n,x])=>x.t==='f'&&x.k==='img').map(([n])=>dir()+'/'+n);
  function show(){
    const n=VFS.get(file); if(!n){w.close();return}
    view.innerHTML=`<div style="width:min(100%,640px);aspect-ratio:4/3;max-height:100%;border-radius:6px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.35)">${imgHTML(n)}</div>`;
    lab.textContent=file.split('/').pop(); w.title(file.split('/').pop());
    const s=siblings(); pv.disabled=nx.disabled=s.length<2;
  }
  const step=d=>{const s=siblings(),i=s.indexOf(file);if(s.length)file=s[(i+d+s.length)%s.length];show()};
  pv.onclick=()=>step(-1); nx.onclick=()=>step(1);
  w.on('fs',()=>{if(!VFS.get(file))w.close();else show()});
  w.onopen=o=>{if(o.file){file=o.file;show()}};
  show();
}

/* ================= ZDJĘCIA ================= */
function renderPhotos(body,w){
  const side=el('div','side'), main=el('div','main'), bar=el('div','bar'), grid=el('div','grid'), box=el('div');
  side.innerHTML='<h6>Biblioteka</h6><div class="sl on"><svg viewBox="0 0 16 16">'+sideIco.Pictures+'</svg><span>Wszystkie zdjęcia</span></div>';
  bar.innerHTML='<b>Wszystkie zdjęcia</b>'; grid.style.gridTemplateColumns='repeat(auto-fill,minmax(120px,1fr))'; grid.style.gap='4px';
  box.style.cssText='position:absolute;inset:0;background:var(--win);display:none;flex-direction:column;z-index:3';
  main.append(bar,grid); body.append(side,main,box);
  const dir=HOME+'/Pictures'; let cur=null;
  const list=()=>VFS.list(dir).filter(([n,x])=>x.t==='f'&&x.k==='img');
  function draw(){
    grid.innerHTML=''; const l=list();
    if(!l.length)grid.append(el('div','empty','Brak zdjęć. Zapisz rysunek w Szkicowniku z App Store.'));
    l.forEach(([n,node])=>{const t=el('div','',imgHTML(node));t.style.cssText='aspect-ratio:1;overflow:hidden;border-radius:2px';t.onclick=()=>open(n);grid.append(t)});
    if(cur&&box.style.display==='flex')open(cur);
  }
  function open(n){
    const node=VFS.get(dir+'/'+n); if(!node){box.style.display='none';return} cur=n;
    box.style.display='flex'; box.innerHTML='';
    const l=list().map(x=>x[0]), i=l.indexOf(n);
    const top=el('div','bar','<button>‹ Biblioteka</button><b style="flex:1;text-align:center"></b><button>Usuń</button>'); $('b',top).textContent=n;
    const view=el('div'); view.style.cssText='flex:1;display:grid;place-items:center;padding:18px;background:#000;min-height:0;position:relative';
    view.innerHTML=`<div style="width:min(100%,720px);aspect-ratio:4/3;max-height:100%;overflow:hidden;border-radius:4px">${imgHTML(node)}</div>`;
    const pv=el('button','tbtn','‹'), nx=el('button','tbtn','›'); pv.style.cssText=nx.style.cssText='position:absolute;top:50%;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.2);color:#fff;font-size:18px';
    pv.style.left='10px'; nx.style.right='10px'; pv.onclick=()=>open(l[(i-1+l.length)%l.length]); nx.onclick=()=>open(l[(i+1)%l.length]); view.append(pv,nx);
    top.firstChild.onclick=()=>{box.style.display='none';cur=null}; top.lastChild.onclick=()=>{sfx('trash');VFS.trash(dir+'/'+n)};
    box.append(top,view);
  }
  w.on('fs',draw); draw();
}

/* ================= PRZEGLĄDARKA + Work Docs / Math Docs ================= */
function webFrame(url){
  const f=el('iframe'); f.src=url; f.style.cssText='position:relative;flex:1;width:100%;border:0;background:#fff;min-height:0';
  f.setAttribute('referrerpolicy','no-referrer'); f.setAttribute('allow','clipboard-write; fullscreen'); f.title=url; return f;
}
const SITE_APP={'workdocs.online':'workdocs','math.workdocs.online':'mathdocs','wykresy.workdocs.online':'wykresy','paybud.site':'paybud'};
const hostOf=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return u}};
const favHTML=host=>SITE_APP[host]&&LOGOS[SITE_APP[host]]?`<img src="${LOGOS[SITE_APP[host]]}" alt="">`:`<i>${esc((host[0]||'•').toUpperCase())}</i>`;

/* okno aplikacji internetowej (Work Docs, Math Docs, Wykresy, Pay Buddy) */
function renderWeb(body,w,id,url){
  /* wygląda jak zwykła aplikacja: sama zawartość, bez paska adresu i dopisków */
  const wrap=el('div','webapp',`<div class="wsplash"><img src="${LOGOS[id]}" alt=""><span></span></div>`);
  $('.wsplash span',wrap).textContent=APPS[id].name;
  let fr=webFrame(url); wrap.append(fr); body.append(wrap);
  const reload=()=>{const n=webFrame(url);fr.replaceWith(n);fr=n};
  w.menu=[['Odśwież',reload,'⌘R'],['Otwórz w przeglądarce',()=>openApp('browser',{url})]];
}

/* przeglądarka z kartami, zakładkami i historią */
function renderBrowser(body,w,opts){
  const main=el('div','main'); body.append(main);
  const tabsBar=el('div','btabs'), bar=el('div','bar'), marks=el('div','bmarks'), view=el('div');
  view.style.cssText='flex:1;display:flex;flex-direction:column;min-height:0;position:relative';
  const back=el('button','','‹'), fw=el('button','','›'), rl=el('button','','↻'), addr=el('input','field'), ext=el('a','tbtn','↗');
  back.setAttribute('aria-label','Wstecz'); fw.setAttribute('aria-label','Dalej'); rl.setAttribute('aria-label','Odśwież'); ext.title='Otwórz w nowej karcie przeglądarki'; ext.setAttribute('aria-label','Otwórz w nowej karcie przeglądarki');
  addr.style.cssText='flex:1;width:auto;text-align:center'; addr.placeholder='Szukaj lub wpisz adres'; addr.setAttribute('aria-label','Pasek adresu');
  ext.style.cssText='display:inline-grid;place-items:center;text-decoration:none;color:var(--fg);visibility:hidden'; ext.target='_blank'; ext.rel='noopener';
  bar.append(back,fw,rl,addr,ext); main.append(tabsBar,bar,marks,view);
  const BM=[['Work Docs','https://workdocs.online'],['Math Docs','https://math.workdocs.online'],['Wykresy','https://wykresy.workdocs.online'],['Pay Buddy','https://paybud.site'],['Wikipedia','https://pl.wikipedia.org'],['MDN','https://developer.mozilla.org'],['OpenStreetMap','https://www.openstreetmap.org']];
  BM.forEach(([n,u])=>{const b=el('button','',favHTML(hostOf(u))+'<span></span>');$('span',b).textContent=n;b.onclick=()=>nav(tab(),u);marks.append(b)});
  let tabs=[], cur=null, tid=0;
  const tab=()=>cur;
  function newTab(url){
    const t={id:++tid,url:null,hist:[null],hi:0,el:el('div'),title:'Nowa karta'}; t.el.style.cssText='flex:1;display:flex;flex-direction:column;min-height:0';
    tabs.push(t); select(t); if(url)nav(t,url); else start(t); return t;
  }
  function select(t){cur=t;view.replaceChildren(t.el);addr.value=t.url?t.url.replace(/^https?:\/\//,''):'';drawTabs();sync()}
  function sync(){
    const t=cur; if(!t)return; back.disabled=t.hi<=0; fw.disabled=t.hi>=t.hist.length-1; rl.disabled=!t.url;
    ext.style.visibility=t.url?'visible':'hidden'; if(t.url)ext.href=t.url; addr.value=t.url?t.url.replace(/^https?:\/\//,''):'';
    w.title((t.title||'Przeglądarka'));
  }
  function drawTabs(){
    tabsBar.innerHTML='';
    tabs.forEach(t=>{
      const host=t.url?hostOf(t.url):'', d=el('div','btab'+(t===cur?' on':''),(host?favHTML(host):'<i>+</i>')+'<span></span><button aria-label="Zamknij kartę">×</button>');
      $('span',d).textContent=t.title; d.onclick=()=>select(t);
      $('button',d).onclick=e=>{e.stopPropagation();closeTab(t,d)}; tabsBar.append(d);
    });
    const p=el('button','btnew','+'); p.setAttribute('aria-label','Nowa karta'); p.onclick=()=>newTab(); tabsBar.append(p);
  }
  function closeTab(t,d){
    d.classList.add('closing');
    setTimeout(()=>{
      const i=tabs.indexOf(t); tabs=tabs.filter(x=>x!==t);
      if(!tabs.length){w.close();return}
      if(cur===t)select(tabs[Math.max(0,i-1)]);else drawTabs();
    },170);
  }
  function start(t){
    t.url=null; t.title='Nowa karta'; t.el.innerHTML='';
    const s=el('div','browser-start'), d=new Date();
    s.innerHTML=`<div style="text-align:center"><div style="font-size:46px;font-weight:200">${pad(d.getHours())}:${pad(d.getMinutes())}</div><div style="color:var(--fg2)">${d.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long'})}</div></div><div class="favs"></div>`;
    const favs=$('.favs',s);
    BM.forEach(([n,u])=>{const a=el('div','fav lnk',`<span class="fi">${favHTML(hostOf(u))}</span><span></span>`);$('span:last-child',a).textContent=n;a.onclick=()=>nav(t,u);favs.append(a)});
    t.el.append(s); if(t===cur)sync(); drawTabs();
  }
  function page(t,url,searchQ){
    t.url=url; t.el.innerHTML=''; t.title=searchQ?'Szukaj: '+searchQ:hostOf(url);
    if(searchQ){
      const c=el('div','browser-start',`<div style="text-align:center;max-width:420px"><h3 style="margin:0 0 8px"></h3><p style="color:var(--fg2)">Wyszukiwarka nie pozwala na osadzenie wyników w oknie. Otwórz je w nowej karcie.</p><a class="btn p" style="display:inline-block;text-decoration:none" href="${esc(url)}" target="_blank" rel="noopener">Otwórz wyniki</a></div>`);
      $('h3',c).textContent='Wyszukaj „'+searchQ+'”'; t.el.append(c);
    }else{
      const n=el('div','status','Jeśli strona się nie wyświetla, jej serwer blokuje osadzanie. Użyj przycisku ↗ obok paska adresu.'); t.el.append(n,webFrame(url));
    }
    if(t===cur)sync(); drawTabs();
  }
  function nav(t,text,push=true){
    text=(text||'').trim(); if(!t)return; let u=null, q=null;
    if(text){
      if(/^https?:\/\//i.test(text))u=text; else if(/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(text))u='https://'+text; else{q=text;u='https://duckduckgo.com/?q='+encodeURIComponent(text)}
    }
    if(push){t.hist=t.hist.slice(0,t.hi+1);t.hist.push({u,q});t.hi=t.hist.length-1}
    if(!u)start(t);else page(t,u,q);
    sync();
  }
  function goHist(t,d){
    const i=t.hi+d; if(i<0||i>=t.hist.length)return; t.hi=i; const h=t.hist[i];
    if(!h)start(t);else page(t,h.u,h.q); sync();
  }
  addr.onkeydown=e=>{if(e.key==='Enter')nav(cur,addr.value)};
  back.onclick=()=>goHist(cur,-1); fw.onclick=()=>goHist(cur,1);
  rl.onclick=()=>{if(cur&&cur.url){const h=cur.hist[cur.hi];page(cur,h.u,h.q)}};
  w.menu=[['Nowa karta',()=>newTab(),'⌘T'],['Zamknij kartę',()=>{const d=$$('.btab',tabsBar)[tabs.indexOf(cur)];closeTab(cur,d)},'⌘W']];
  w.onopen=o=>{if(o.url)newTab(o.url)};
  newTab(opts&&opts.url);
}

/* ================= O TYM KOMPUTERZE ================= */
function renderAbout(body){
  const up=Math.max(1,Math.round(performance.now()/60000));
  const a=el('div','about',icon('about').replace('class="app"','style="width:84px;height:84px"')+`<h2>${SYS}</h2><p>Wersja 1.0</p><p style="margin-top:12px">Procesor: ${navigator.hardwareConcurrency||'?'} rdzeni</p><p>Pamięć: ${navigator.deviceMemory?navigator.deviceMemory+' GB':'nieznana'}</p><p>Ekran: ${innerWidth} × ${innerHeight}</p><p>Czas pracy: ${up} min</p><p>Aplikacje: ${BASE_APPS.length+S.installed.length}</p>`);
  body.append(a);
}
