
/* ================= APP STORE + 5 PRAWDZIWYCH APLIKACJI ================= */
const STORE=[
  {id:'workdocs',name:'Work Docs',cat:'Produktywność',dev:'Work Docs',rating:4.8,size:'2,1 MB',brew:'workdocs',url:'workdocs.online',desc:'Tablica do nauki, schematów i notatek. Rysuj, twórz diagramy, drukuj i pobieraj.',shot:['#FBF4EA','#ff8a3d']},
  {id:'mathdocs',name:'Math Docs',cat:'Edukacja',dev:'Work Docs',rating:4.7,size:'1,8 MB',brew:'mathdocs',url:'math.workdocs.online',desc:'Pracownia matematyczna: kalkulator graficzny, geometria dynamiczna i rozwiązywanie zadań krok po kroku z AI.',shot:['#EFFAFA','#34c3b9']},
  {id:'wykresy',name:'Wykresy',cat:'Grafika i dane',dev:'Work Docs',rating:4.6,size:'1,5 MB',brew:'wykresy',url:'wykresy.workdocs.online',desc:'Generator wykresów. Wpisz dane i stwórz wykres do raportu, pracy domowej albo prezentacji.',shot:['#43a0ff','#bf5af2']},
  {id:'paybud',name:'Pay Buddy',cat:'Finanse',dev:'Pay Buddy',rating:4.7,size:'1,2 MB',brew:'paybud',url:'paybud.site',desc:'Dzielenie rachunków i rozliczanie wspólnych wydatków w grupie. Wyjazdy, mieszkania, wydarzenia: kto komu jest winien, bez liczenia na kartce.',shot:['#1e3a5f','#3b82c4']},
  {id:'minesweeper',name:'Saper',cat:'Gry',dev:'MGS Games',rating:4.7,size:'1,2 MB',brew:'saper',desc:'Klasyczna gra logiczna. Odkrywaj pola, unikaj min i oznaczaj podejrzane miejsca flagami. Plansza 9×9, 10 min. Prawy przycisk myszy stawia flagę, a na ekranie dotykowym użyj przełącznika flagi.',shot:['#c9ced8','#7f8797']},
  {id:'g2048',name:'2048',cat:'Gry',dev:'MGS Games',rating:4.8,size:'0,9 MB',brew:'2048',desc:'Łącz kafelki o tych samych liczbach i dojdź do 2048. Steruj strzałkami albo przesuwaniem palca. Najlepszy wynik zapisuje się automatycznie.',shot:['#f6b44a','#e8892a']},
  {id:'snake',name:'Wąż',cat:'Gry',dev:'MGS Games',rating:4.5,size:'0,7 MB',brew:'snake',desc:'Zjadaj jabłka, rośnij i nie wpadnij na ścianę ani na własny ogon. Strzałki lub WASD, na dotyku przesuwanie palcem.',shot:['#7fe08a','#1e9b4a']},
  {id:'sketch',name:'Szkicownik',cat:'Kreatywność',dev:'MGS Studio',rating:4.6,size:'1,8 MB',brew:'szkicownik',desc:'Rysuj pędzlem w wielu kolorach, wymazuj i zapisuj prace. Gotowe rysunki trafiają do folderu Zdjęcia i pojawiają się w aplikacji Zdjęcia.',shot:['#fffdf4','#e8dfae']},
  {id:'pomodoro',name:'Pomodoro',cat:'Produktywność',dev:'MGS Studio',rating:4.4,size:'0,5 MB',brew:'pomodoro',desc:'Technika Pomodoro: 25 minut pracy, 5 minut przerwy. Aplikacja liczy cykle i wysyła powiadomienie, gdy czas minie.',shot:['#ff7a59','#e03c2a']}
];
function installApp(id){
  if(S.installed.includes(id))return;
  S.installed.push(id); saveS(); VFS.syncApps(); refreshDock(); emit('store');
  notify('Zainstalowano „'+APPS[id].name+'”','Aplikacja jest gotowa. Znajdziesz ją w Launchpadzie i w docku.',id);
}
function uninstallApp(id){
  winsOf(id).forEach(closeWin); S.installed=S.installed.filter(i=>i!==id); saveS(); VFS.syncApps(); refreshDock(); emit('store');
  notify('Usunięto „'+APPS[id].name+'”','Aplikacja została odinstalowana.','appstore');
}
function renderAppStore(body,w){
  const side=el('div','side'), box=el('div','store'); body.append(side,box);
  let tab='all', detail=null;
  const TABS=[['all','Odkrywaj'],...[...new Set(STORE.map(s=>s.cat))].map(c=>[c,c]),['inst','Zainstalowane']];
  const stars=r=>'★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r));
  function ring(p){return`<svg class="ring" viewBox="0 0 26 26"><circle cx="13" cy="13" r="10" fill="none" stroke="var(--strong)" stroke-width="3"/><circle cx="13" cy="13" r="10" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${62.8*p} 62.8" transform="rotate(-90 13 13)"/></svg>`}
  function button(s){
    const b=el('button','get'); const inst=S.installed.includes(s.id);
    if(dl[s.id]!=null){b.className='get ghost';b.innerHTML=ring(dl[s.id]);b.disabled=true}
    else if(inst){b.className='get ghost';b.textContent='Otwórz';b.onclick=e=>{e.stopPropagation();openApp(s.id)}}
    else{b.textContent='Pobierz';b.onclick=e=>{
      e.stopPropagation(); dl[s.id]=0; draw(); sfx('click'); refreshDock();
      const iv=setInterval(()=>{dl[s.id]+=.035+Math.random()*.05;if(dl[s.id]>=1){clearInterval(iv);delete dl[s.id];installApp(s.id);if(wins.has(w.wid))draw();return}dockProgress(s.id,dl[s.id]);if(wins.has(w.wid))draw()},150);
    }}
    return b;
  }
  function appRow(s){
    const r=el('div','sapp',icon(s.id)+'<div class="tx"><b></b><span></span><span class="stars"></span></div>');
    $('b',r).textContent=s.name; $$('span',r)[0].textContent=s.cat+' • '+s.dev; $('.stars',r).textContent=stars(s.rating)+' '+String(s.rating).replace('.',',');
    r.append(button(s)); r.onclick=()=>{detail=s;draw()}; return r;
  }
  function draw(){
    side.innerHTML='<h6>App Store</h6>';
    TABS.forEach(([k,l])=>{const s=el('div','sl'+(!detail&&tab===k?' on':''));s.textContent=l;s.onclick=()=>{tab=k;detail=null;draw()};side.append(s)});
    box.innerHTML='';
    if(detail){
      const s=detail, back=el('button','tbtn','‹ Wróć'); back.onclick=()=>{detail=null;draw()}; box.append(back);
      const h=el('div','sapp',icon(s.id).replace('<svg class="app"','<svg class="app" style="width:96px;height:96px"')+'<div class="tx"><b style="font-size:22px"></b><span></span><span class="stars"></span></div>'); h.style.borderBottom='0'; h.style.margin='14px 0';
      $('b',h).textContent=s.name; $$('span',h)[0].textContent=s.dev; $('.stars',h).textContent=stars(s.rating)+' '+String(s.rating).replace('.',','); h.append(button(s)); box.append(h);
      const meta=el('div','card'); meta.innerHTML=`<div class="row"><span>Kategoria</span><span>${esc(s.cat)}</span></div><div class="row"><span>Rozmiar</span><span>${esc(s.size)}</span></div>${s.url?`<div class="row"><span>Strona</span><a href="https://${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a></div>`:''}<div class="row"><span>Instalacja w Terminalu</span><code>brew install ${esc(s.brew)}</code></div>`; box.append(meta);
      const d=el('p'); d.style.cssText='line-height:1.5;margin:16px 0'; d.textContent=s.desc; box.append(d);
      const sh=el('div','shots'); [0,1,2].forEach(k=>{const x=el('div');x.style.background=`linear-gradient(${135+k*40}deg,${s.shot[0]},${s.shot[1]})`;x.style.display='grid';x.style.placeItems='center';x.innerHTML=icon(s.id).replace('<svg class="app"','<svg class="app" style="width:'+(60+k*10)+'px;height:'+(60+k*10)+'px;opacity:.9"');sh.append(x)}); box.append(sh);
      if(S.installed.includes(s.id)){const rm=el('button','btn','Odinstaluj');rm.onclick=()=>{uninstallApp(s.id);draw()};box.append(rm)}
      return;
    }
    if(tab==='all'){
      const f=STORE.find(s=>!S.installed.includes(s.id))||STORE[0];
      const hero=el('div','hero',`<small>Aplikacja dnia</small><h2></h2><span style="opacity:.9"></span>`); hero.style.background=`linear-gradient(135deg,${f.shot[1]},color-mix(in srgb,${f.shot[1]} 55%,#000))`;
      $('h2',hero).textContent=f.name; $('span',hero).textContent=f.desc.split('. ')[0]+'.'; hero.style.cursor='pointer'; hero.onclick=()=>{detail=f;draw()}; box.append(hero);
    }
    let list=STORE; if(tab==='inst')list=STORE.filter(s=>S.installed.includes(s.id)); else if(tab!=='all')list=STORE.filter(s=>s.cat===tab);
    const h=el('h3'); h.style.cssText='margin:0 0 4px;font-size:18px'; h.textContent=tab==='inst'?'Zainstalowane':tab==='all'?'Wszystkie aplikacje':tab; box.append(h);
    if(!list.length)box.append(el('div','empty','Nic tu jeszcze nie ma. Pobierz coś z zakładki Odkrywaj.'));
    list.forEach(s=>box.append(appRow(s)));
  }
  w.on('store',draw); draw();
}

/* ---------- Saper ---------- */
function renderMines(body,w){
  const R=9,C=9,M=10; let cells,over,won,first,flagsN,flagMode=false,secs,tm;
  const main=el('div','main'), bar=el('div','bar'), grid=el('div','mine-g'); grid.style.cssText=`grid-template-columns:repeat(${C},28px);margin:10px auto;width:max-content`;
  const mc=el('b'), face=el('button','','Nowa gra'), tt=el('b'), fm=el('button','','Flaga: wył.');
  bar.append(mc,el('span','sp'),face,el('span','sp'),tt); const bar2=el('div','bar'); bar2.append(fm); main.append(bar,grid,bar2); body.append(main);
  const COL=['','#0a84ff','#28a745','#ff3b30','#5e35b1','#a52a2a','#00897b','#000','#777'];
  const nb=(r,c)=>{const o=[];for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if((a||b)&&r+a>=0&&r+a<R&&c+b>=0&&c+b<C)o.push([r+a,c+b])}return o};
  function reset(){cells=Array.from({length:R},()=>Array.from({length:C},()=>({m:false,o:false,f:false,n:0})));over=won=false;first=true;flagsN=0;secs=0;clearInterval(tm);draw()}
  function place(sr,sc){let k=0;while(k<M){const r=Math.random()*R|0,c=Math.random()*C|0;if(cells[r][c].m||(Math.abs(r-sr)<=1&&Math.abs(c-sc)<=1))continue;cells[r][c].m=true;k++}
    for(let r=0;r<R;r++)for(let c=0;c<C;c++)cells[r][c].n=nb(r,c).filter(([a,b])=>cells[a][b].m).length;
    tm=setInterval(()=>{secs++;tt.textContent=pad(Math.floor(secs/60))+':'+pad(secs%60)},1000)}
  function flood(r,c){const q=[[r,c]];while(q.length){const[a,b]=q.pop(),x=cells[a][b];if(x.o||x.f)continue;x.o=true;if(x.n===0)nb(a,b).forEach(p=>q.push(p))}}
  function dig(r,c){
    if(over||won)return; const x=cells[r][c]; if(x.f||x.o)return;
    if(first){place(r,c);first=false}
    if(x.m){over=true;clearInterval(tm);cells.forEach(row=>row.forEach(y=>{if(y.m)y.o=true}));sfx('error');draw();return}
    flood(r,c);
    if(cells.every(row=>row.every(y=>y.m||y.o))){won=true;clearInterval(tm);sfx('notify')}
    draw();
  }
  function flag(r,c){if(over||won||cells[r][c].o)return;const x=cells[r][c];x.f=!x.f;flagsN+=x.f?1:-1;draw()}
  function draw(){
    grid.innerHTML=''; mc.textContent='Miny: '+(M-flagsN); tt.textContent=pad(Math.floor(secs/60))+':'+pad(secs%60); fm.textContent=flagMode?'Flaga: wł.':'Flaga: wył.'; fm.classList.toggle('on',flagMode);
    cells.forEach((row,r)=>row.forEach((x,c)=>{
      const d=el('div','mcell'+(x.o?' o':'')); if(x.o){if(x.m){d.textContent='✱';d.style.color='#ff3b30'}else if(x.n){d.textContent=x.n;d.style.color=COL[x.n]}}else if(x.f){d.textContent='⚑';d.style.color='#ff9f0a'}
      d.onclick=()=>flagMode?flag(r,c):dig(r,c); d.oncontextmenu=e=>{e.preventDefault();flag(r,c)}; grid.append(d);
    }));
    $('.msg',body)&&$('.msg',body).remove();
    if(over||won){const m=el('div','msg',`<div>${won?'Wygrana!':'Koniec gry'}</div>`);const b=el('button','btn p','Zagraj ponownie');b.onclick=reset;m.append(b);body.append(m)}
  }
  face.onclick=reset; fm.onclick=()=>{flagMode=!flagMode;draw()}; w.cleanups.push(()=>clearInterval(tm)); reset();
}

/* ---------- 2048 ---------- */
function render2048(body,w){
  let g,score,best=store.get('b2048',0),over=false;
  const main=el('div','main'), bar=el('div','bar'), board=el('div'), sc=el('b'), bs=el('b'), nw=el('button','','Nowa gra');
  board.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:10px;margin:12px auto;width:min(340px,calc(100% - 24px));background:var(--field);border-radius:10px;touch-action:none;position:relative';
  bar.append(sc,el('span','sp'),bs,nw); main.append(bar,board); body.append(main);
  const COL={2:['#eee4da','#776e65'],4:['#ede0c8','#776e65'],8:['#f2b179','#fff'],16:['#f59563','#fff'],32:['#f67c5f','#fff'],64:['#f65e3b','#fff'],128:['#edcf72','#fff'],256:['#edcc61','#fff'],512:['#edc850','#fff'],1024:['#edc53f','#fff'],2048:['#edc22e','#fff']};
  const addT=()=>{const e=[];g.forEach((r,i)=>r.forEach((v,j)=>{if(!v)e.push([i,j])}));if(e.length){const[i,j]=e[Math.random()*e.length|0];g[i][j]=Math.random()<.9?2:4}};
  function reset(){g=Array.from({length:4},()=>[0,0,0,0]);score=0;over=false;addT();addT();draw()}
  const slide=row=>{const a=row.filter(Boolean),o=[];for(let i=0;i<a.length;i++){if(a[i]===a[i+1]){o.push(a[i]*2);score+=a[i]*2;i++}else o.push(a[i])}while(o.length<4)o.push(0);return o};
  const T=m=>m[0].map((_,i)=>m.map(r=>r[i]));
  function move(d){
    if(over)return; const before=JSON.stringify(g); let m=g.map(r=>r.slice());
    if(d==='u'||d==='d')m=T(m); if(d==='r'||d==='d')m=m.map(r=>r.reverse());
    m=m.map(slide);
    if(d==='r'||d==='d')m=m.map(r=>r.reverse()); if(d==='u'||d==='d')m=T(m);
    if(JSON.stringify(m)===before)return; g=m; addT();
    if(score>best){best=score;store.set('b2048',best)}
    const can=g.some((r,i)=>r.some((v,j)=>!v||(g[i][j+1]===v)||(g[i+1]&&g[i+1][j]===v))); if(!can){over=true;sfx('error')}
    draw();
  }
  function draw(){
    sc.textContent='Wynik: '+score; bs.textContent='Rekord: '+best; board.innerHTML='';
    g.forEach(r=>r.forEach(v=>{const c=COL[v]||['#3c3a32','#fff'];const t=el('div','tile',v||'');t.style.cssText=`aspect-ratio:1;background:${v?c[0]:'var(--strong)'};color:${c[1]};font-size:${v>=1024?22:v>=128?26:30}px`;board.append(t)}));
    if(over){const m=el('div','msg','<div>Koniec gry</div>');m.style.borderRadius='10px';const b=el('button','btn p','Zagraj ponownie');b.onclick=reset;m.append(b);board.append(m)}
  }
  const keyh=e=>{if(!w.el.classList.contains('front')||$('.dlg'))return;const k={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r'}[e.key];if(k){e.preventDefault();move(k)}};
  addEventListener('keydown',keyh); w.cleanups.push(()=>removeEventListener('keydown',keyh));
  let sx,sy; board.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY});
  board.addEventListener('pointerup',e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u'))});
  nw.onclick=reset; reset();
}

/* ---------- Wąż ---------- */
function renderSnake(body,w){
  const N=18,Z=20; let sn,dir,nd,food,score,best=store.get('bsnake',0),state='ready',tm;
  const main=el('div','main'), bar=el('div','bar'), cv=el('canvas'), sc=el('b'), bs=el('b');
  cv.width=cv.height=N*Z; cv.style.cssText='width:min(360px,calc(100% - 20px));aspect-ratio:1;margin:12px auto;border-radius:8px;touch-action:none;display:block;flex:none'; bar.append(sc,el('span','sp'),bs); main.append(bar,cv); body.append(main);
  const g=cv.getContext('2d');
  function reset(){sn=[[9,9],[8,9],[7,9]];dir=nd=[1,0];score=0;spawn();state='ready';draw();clearInterval(tm)}
  function spawn(){do{food=[Math.random()*N|0,Math.random()*N|0]}while(sn.some(s=>s[0]===food[0]&&s[1]===food[1]))}
  function start(){if(state==='run')return;state='run';clearInterval(tm);tm=setInterval(step,115)}
  function step(){
    dir=nd; const h=[sn[0][0]+dir[0],sn[0][1]+dir[1]];
    if(h[0]<0||h[1]<0||h[0]>=N||h[1]>=N||sn.some(s=>s[0]===h[0]&&s[1]===h[1])){state='over';clearInterval(tm);if(score>best){best=score;store.set('bsnake',best)}sfx('error');draw();return}
    sn.unshift(h); if(h[0]===food[0]&&h[1]===food[1]){score++;sfx('click');spawn()}else sn.pop(); draw();
  }
  function draw(){
    sc.textContent='Wynik: '+score; bs.textContent='Rekord: '+best;
    g.fillStyle='#16271c'; g.fillRect(0,0,cv.width,cv.height);
    g.fillStyle='rgba(255,255,255,.04)'; for(let i=0;i<N;i++)for(let j=0;j<N;j++)if((i+j)%2)g.fillRect(i*Z,j*Z,Z,Z);
    g.fillStyle='#ff5f57'; g.beginPath(); g.arc(food[0]*Z+Z/2,food[1]*Z+Z/2,Z/2-3,0,7); g.fill();
    sn.forEach((s,i)=>{g.fillStyle=i?'#7fe08a':'#c8ffd0';g.beginPath();g.roundRect(s[0]*Z+1,s[1]*Z+1,Z-2,Z-2,5);g.fill()});
    if(state!=='run'){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,cv.width,cv.height);g.fillStyle='#fff';g.textAlign='center';g.font='700 22px system-ui,sans-serif';g.fillText(state==='over'?'Koniec gry':'Wąż',cv.width/2,cv.height/2-8);g.font='14px system-ui,sans-serif';g.fillText(state==='over'?'Naciśnij strzałkę, aby zagrać ponownie':'Naciśnij strzałkę, aby zacząć',cv.width/2,cv.height/2+16)}
  }
  const turn=d=>{if(state==='over')reset();if(d[0]+dir[0]===0&&d[1]+dir[1]===0)return;nd=d;start()};
  const keyh=e=>{if(!w.el.classList.contains('front')||$('.dlg'))return;const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]}[e.key];if(m){e.preventDefault();turn(m)}};
  addEventListener('keydown',keyh); w.cleanups.push(()=>{removeEventListener('keydown',keyh);clearInterval(tm)});
  let sx,sy; cv.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY});
  cv.addEventListener('pointerup',e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;turn(Math.abs(dx)>Math.abs(dy)?[dx>0?1:-1,0]:[0,dy>0?1:-1])});
  reset();
}

/* ---------- Szkicownik ---------- */
function renderSketch(body,w){
  const main=el('div','cvs'), pal=el('div','pal'), cv=el('canvas'); cv.width=640; cv.height=390; cv.style.cssText='flex:none;width:100%;height:auto;background:#fff;touch-action:none;display:block';
  const g=cv.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,640,390); g.lineCap=g.lineJoin='round';
  let col='#1d1d1f', size=5, erase=false;
  const COLS=['#1d1d1f','#ff3b30','#ff9f0a','#ffd60a','#30d158','#0a84ff','#bf5af2','#ff6bd0','#8e5a2b','#ffffff'];
  const dots=COLS.map(c=>{const i=el('i',c===col?'on':'');i.style.background=c;i.style.border='2px solid var(--line)';i.onclick=()=>{col=c;erase=false;mark()};pal.append(i);return i});
  const sz=el('input'); sz.type='range'; sz.min=1; sz.max=40; sz.value=size; sz.style.width='90px'; sz.setAttribute('aria-label','Rozmiar pędzla'); sz.oninput=()=>size=+sz.value;
  const er=el('button','tbtn','Gumka'), cl=el('button','tbtn','Wyczyść'), sv=el('button','btn p','Zapisz w Zdjęciach');
  pal.append(sz,er,cl,sv); main.append(pal,cv); body.append(main);
  function mark(){dots.forEach((d,i)=>d.classList.toggle('on',!erase&&COLS[i]===col));er.classList.toggle('on',erase);er.style.background=erase?'var(--strong)':''}
  const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]};
  let draw_=false,last_;
  cv.addEventListener('pointerdown',e=>{draw_=true;cv.setPointerCapture(e.pointerId);last_=pos(e);g.strokeStyle=erase?'#fff':col;g.lineWidth=size;g.beginPath();g.moveTo(...last_);g.lineTo(last_[0]+.01,last_[1]);g.stroke()});
  cv.addEventListener('pointermove',e=>{if(!draw_)return;const p=pos(e);g.strokeStyle=erase?'#fff':col;g.lineWidth=size;g.beginPath();g.moveTo(...last_);g.lineTo(...p);g.stroke();last_=p});
  const up=()=>draw_=false; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
  er.onclick=()=>{erase=!erase;mark()}; cl.onclick=()=>{g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height)};
  sv.onclick=()=>{
    let n=1; while(VFS.get(HOME+'/Pictures/Szkic '+n+'.png'))n++;
    try{VFS.write(HOME+'/Pictures/Szkic '+n+'.png','',false,{k:'img',url:cv.toDataURL('image/png')});sfx('shot');notify('Zapisano rysunek','Szkic '+n+'.png jest w folderze Zdjęcia.','photos')}catch(e){notify('Nie można zapisać',e.message,'sketch')}
  };
  mark();
}

/* ---------- Pomodoro ---------- */
function renderPomodoro(body,w){
  let mode='work', left=1500, run=false, end=0, done=store.get('pomo',0);
  const main=el('div','about'), tabs=el('div','tabs'), svg=el('div'), btns=el('div'), cnt=el('p');
  const mk=(k,l)=>{const b=el('button','',l);b.onclick=()=>{mode=k;left=k==='work'?1500:300;run=false;draw()};b.dataset.k=k;tabs.append(b)}; mk('work','Praca'); mk('break','Przerwa');
  btns.style.cssText='display:flex;gap:10px'; const go=el('button','btn p','Start'), rs=el('button','btn','Reset'); btns.append(go,rs);
  main.append(tabs,svg,btns,cnt); body.append(main);
  const total=()=>mode==='work'?1500:300;
  function draw(){
    $$('.tabs button',tabs.parentNode).forEach(b=>b.classList.toggle('on',b.dataset.k===mode));
    const p=left/total(), m=Math.floor(left/60), s=left%60;
    svg.innerHTML=`<svg viewBox="0 0 160 160" width="180" height="180"><circle cx="80" cy="80" r="70" fill="none" stroke="var(--strong)" stroke-width="10"/><circle cx="80" cy="80" r="70" fill="none" stroke="${mode==='work'?'#ff5f57':'#30d158'}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${439.8*p} 439.8" transform="rotate(-90 80 80)"/><text x="80" y="92" text-anchor="middle" font-size="34" font-weight="300" fill="var(--fg)" font-family="var(--font)">${pad(m)}:${pad(s)}</text></svg>`;
    go.textContent=run?'Pauza':'Start'; cnt.textContent='Ukończone cykle: '+done;
  }
  go.onclick=()=>{if(run){left=Math.max(0,Math.round((end-Date.now())/1000));run=false}else{end=Date.now()+left*1000;run=true}draw()};
  rs.onclick=()=>{run=false;left=total();draw()};
  const iv=setInterval(()=>{
    if(!run)return; const l=Math.max(0,Math.round((end-Date.now())/1000));
    if(l<=0){run=false;sfx('notify');if(mode==='work'){done++;store.set('pomo',done);notify('Pomodoro','Czas na przerwę!','pomodoro');mode='break'}else{notify('Pomodoro','Wracamy do pracy.','pomodoro');mode='work'}left=total();draw()}
    else{left=l;draw()}
  },500);
  w.cleanups.push(()=>clearInterval(iv)); draw();
}

Object.assign(APPS,{
  minesweeper:{name:'Saper',w:316,h:440,fixed:true,render:renderMines},
  g2048:{name:'2048',w:400,h:480,render:render2048},
  snake:{name:'Wąż',w:420,h:500,render:renderSnake},
  sketch:{name:'Szkicownik',w:640,h:500,fixed:true,render:renderSketch},
  pomodoro:{name:'Pomodoro',w:340,h:420,fixed:true,render:renderPomodoro}
});
