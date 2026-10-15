
/* ================= MUZYKA (generowana na żywo przez WebAudio) ================= */
const TRACKS=[
  {name:'Poranek nad rzeką',artist:'MGS Sound',bpm:78,root:57,scale:[0,2,4,7,9],wave:'triangle',vol:.1,pat:[0,2,4,2,3,1,2,4,5,4,2,3,1,0,2,1],bass:[0,0,-2,-1],art:['#ffb56e','#ff6f9c']},
  {name:'Deszcz za oknem',artist:'MGS Sound',bpm:62,root:52,scale:[0,3,5,7,10],wave:'sine',vol:.12,pat:[0,null,2,null,4,null,3,null,2,null,1,null,0,null,null,null],bass:[0,-2,-3,-2],noise:true,art:['#6aa9ff','#3a4a9a']},
  {name:'Nocny pociąg',artist:'MGS Sound',bpm:96,root:50,scale:[0,2,3,5,7,8,10],wave:'sawtooth',vol:.045,pat:[0,0,2,0,4,0,2,0,3,3,5,3,4,2,1,0],bass:[0,0,-2,-3],art:['#6a3a8a','#1a1040']},
  {name:'Neon',artist:'MGS Sound',bpm:112,root:55,scale:[0,2,4,6,7,9,11],wave:'square',vol:.035,pat:[0,2,4,5,4,2,0,null,1,3,5,6,5,3,1,null],bass:[0,2,1,3],art:['#ff4fd8','#3b6bff']}
];
const Music={playing:false,cur:null,step:0,next:0,start:0,elapsed:0,timer:null,analyser:null};
const musicFreq=(deg,tr,oct=0)=>{const s=tr.scale,o=Math.floor(deg/s.length),i=((deg%s.length)+s.length)%s.length;return 440*Math.pow(2,(tr.root+s[i]+12*(o+oct)-69)/12)};
function musicSchedule(){
  if(!AC||!Music.playing)return; const tr=TRACKS[Music.cur], spb=60/tr.bpm/2;
  while(Music.next<AC.currentTime+.3){
    const i=Music.step, t=Music.next, d=tr.pat[i%tr.pat.length];
    if(d!==null)tone(musicFreq(d,tr),t,spb*1.9,tr.wave,tr.vol);
    if(i%8===0)tone(musicFreq(tr.bass[(i/8)%tr.bass.length|0],tr,-1),t,spb*7.5,'sine',.13);
    if(i%16===0)[0,2,4].forEach(k=>tone(musicFreq(k+tr.bass[(i/16)%tr.bass.length|0],tr,0),t,spb*15,'sine',.03));
    if(tr.noise&&i%2===0)noiseBurst(t,spb*.9,.03);
    Music.next+=spb; Music.step++;
  }
  if(musicPos()>=180)musicNext();
}
function musicPos(){return(Music.elapsed+(Music.playing?Date.now()-Music.start:0))/1000}
function musicPlay(i){
  if(!ac())return; Music.cur=i; Music.step=0; Music.elapsed=0; Music.start=Date.now(); Music.playing=true; Music.next=AC.currentTime+.06;
  if(!Music.analyser){Music.analyser=AC.createAnalyser();Music.analyser.fftSize=64;master.connect(Music.analyser)}
  clearInterval(Music.timer); Music.timer=setInterval(musicSchedule,100); emit('music');
}
function musicToggle(){
  if(Music.cur==null)return musicPlay(0);
  if(Music.playing){Music.elapsed+=Date.now()-Music.start;Music.playing=false;clearInterval(Music.timer)}
  else if(ac()){Music.start=Date.now();Music.playing=true;Music.next=AC.currentTime+.06;Music.timer=setInterval(musicSchedule,100)}
  emit('music');
}
const musicNext=()=>musicPlay(((Music.cur??-1)+1)%TRACKS.length);
const musicPrev=()=>musicPlay(((Music.cur??1)-1+TRACKS.length)%TRACKS.length);
function musicStop(){clearInterval(Music.timer);Music.playing=false;Music.cur=null;Music.elapsed=0;emit('music')}
function renderMusic(body,w){
  const main=el('div','musicb'), list=el('div'), cv=el('canvas'), np=el('div','bar');
  list.style.cssText='flex:1;overflow:auto;padding:8px'; cv.height=70; cv.width=640; cv.style.cssText='width:100%;height:70px;flex:none';
  np.style.cssText='gap:12px;border-top:1px solid var(--line);border-bottom:0;padding:10px 14px;font-weight:400';
  np.innerHTML='<div class="art" style="width:42px;height:42px;border-radius:7px;flex:none"></div><div style="min-width:0;flex:1"><b id="mt" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></b><small id="ma" style="color:var(--fg2)"></small></div><button id="mp" aria-label="Poprzedni">⏮</button><button id="mm" aria-label="Odtwórz/Pauza" style="min-width:42px">▶</button><button id="mn" aria-label="Następny">⏭</button><div class="prog" style="max-width:140px"><i></i></div><span id="mtm" style="font-variant-numeric:tabular-nums;color:var(--fg2);font-size:12px;min-width:34px"></span>';
  main.append(list,cv,np); body.append(main);
  TRACKS.forEach((tr,i)=>{
    const r=el('div','tr',`<div class="art" style="background:linear-gradient(135deg,${tr.art[0]},${tr.art[1]})"></div><div style="flex:1;min-width:0"><b></b><small></small></div><span style="color:var(--fg2)">3:00</span>`);
    $('b',r).textContent=tr.name; $('small',r).textContent=tr.artist; r.onclick=()=>musicPlay(i); r.ondblclick=()=>musicPlay(i); list.append(r);
  });
  $('#mp',np).onclick=musicPrev; $('#mn',np).onclick=musicNext; $('#mm',np).onclick=musicToggle;
  const g=cv.getContext('2d'); let raf;
  function upd(){
    $$('.tr',list).forEach((r,i)=>r.classList.toggle('on',i===Music.cur));
    const tr=Music.cur!=null?TRACKS[Music.cur]:null;
    $('#mt',np).textContent=tr?tr.name:'Nic nie jest odtwarzane'; $('#ma',np).textContent=tr?tr.artist:'Wybierz utwór z listy';
    $('.art',np).style.background=tr?`linear-gradient(135deg,${tr.art[0]},${tr.art[1]})`:'var(--strong)';
    $('#mm',np).textContent=Music.playing?'❚❚':'▶';
  }
  function frame(){
    const p=Math.min(1,musicPos()/180); $('.prog i',np).style.width=(p*100)+'%'; const s=Math.floor(musicPos()); $('#mtm',np).textContent=Math.floor(s/60)+':'+pad(s%60);
    g.clearRect(0,0,cv.width,cv.height); const n=32, bw=cv.width/n, data=new Uint8Array(32);
    if(Music.analyser&&Music.playing)Music.analyser.getByteFrequencyData(data);
    const col=getComputedStyle(root).getPropertyValue('--accent').trim()||'#0a84ff';
    for(let k=0;k<n;k++){const h=Math.max(3,(data[k]/255)*cv.height*.95);g.fillStyle=col;g.globalAlpha=.85;g.fillRect(k*bw+2,cv.height-h,bw-4,h)}
    raf=requestAnimationFrame(frame);
  }
  w.on('music',upd); w.cleanups.push(()=>cancelAnimationFrame(raf)); upd(); frame();
}

/* ================= NOTATKI ================= */
function renderNotes(body){
  let notes=store.get('notes',null)||[
    {id:1,t:'Witaj w MGS Computer\n\nPrzeciągaj okna za pasek tytułu i zmieniaj ich rozmiar w prawym dolnym rogu.\nŻółty przycisk chowa okno do docka, zielony powiększa je.\nCtrl + Spacja otwiera Spotlight, F3 Mission Control, F4 Launchpad.\n\nTe notatki zapisują się w Twojej przeglądarce.'},
    {id:2,t:'Lista zakupów\n\nKawa\nMleko owsiane\nChleb na zakwasie\nCytryny'},
    {id:3,t:'Pomysły na weekend\n\nRower nad rzeką\nKino o 19:30'}];
  let cur=notes[0].id;
  const list=el('div','nlist'), ed=el('textarea','note'); ed.setAttribute('aria-label','Treść notatki'); body.append(list,ed);
  const save=()=>store.set('notes',notes);
  const lab=(l,x)=>{const[a,...r]=x.t.split('\n');l.children[0].textContent=a||'Nowa notatka';l.children[1].textContent=r.join(' ').trim()||'Brak dodatkowego tekstu'};
  function draw(){
    list.innerHTML=''; const n=el('div','nl new','＋ Nowa notatka'); n.onclick=()=>{const x={id:Date.now(),t:''};notes.unshift(x);cur=x.id;save();draw();ed.focus()}; list.append(n);
    notes.forEach(x=>{const d=el('div','nl'+(x.id===cur?' on':''),'<b></b><span></span>');lab(d,x);d.onclick=()=>{cur=x.id;draw()};d.oncontextmenu=e=>{e.preventDefault();popMenu([['Usuń notatkę',()=>{notes=notes.filter(y=>y!==x);if(!notes.length)notes=[{id:Date.now(),t:''}];cur=notes[0].id;save();draw()}]],e.clientX,e.clientY)};list.append(d)});
    ed.value=(notes.find(x=>x.id===cur)||{t:''}).t;
  }
  ed.oninput=()=>{const x=notes.find(x=>x.id===cur);if(x){x.t=ed.value;save();const on_=$('.nl.on',list);if(on_)lab(on_,x)}};
  draw();
}

/* ================= PRZYPOMNIENIA ================= */
function renderReminders(body,w){
  let D=store.get('rem',null)||{lists:[{id:'a',name:'Przypomnienia',color:'#0a84ff'},{id:'b',name:'Zakupy',color:'#ff9f0a'},{id:'c',name:'Praca',color:'#30d158'}],items:[{id:1,list:'a',text:'Zadzwonić do mamy',done:false},{id:2,list:'b',text:'Kawa i mleko owsiane',done:false},{id:3,list:'c',text:'Wysłać raport',done:true}]};
  let cur='a'; const side=el('div','side'), main=el('div','main'), ttl=el('h2'), box=el('div'), add=el('input','field');
  ttl.style.cssText='margin:0;padding:16px 18px 6px;font-size:24px'; box.style.cssText='flex:1;overflow:auto;padding:0 18px'; add.placeholder='Nowe przypomnienie (Enter)'; add.style.cssText='margin:10px 18px 14px;padding:7px 10px'; add.setAttribute('aria-label','Nowe przypomnienie');
  main.append(ttl,box,add); body.append(side,main); const save=()=>store.set('rem',D);
  function draw(){
    side.innerHTML='<h6>Moje listy</h6>';
    D.lists.forEach(l=>{const c=D.items.filter(i=>i.list===l.id&&!i.done).length;const s=el('div','sl'+(l.id===cur?' on':''),`<i style="width:12px;height:12px;border-radius:50%;background:${l.color};flex:none"></i><span style="flex:1"></span><small style="color:var(--fg2)">${c}</small>`);$('span',s).textContent=l.name;s.onclick=()=>{cur=l.id;draw()};side.append(s)});
    const nb=el('div','sl','<span style="color:var(--accent)">＋ Nowa lista</span>'); nb.onclick=()=>dialog({title:'Nowa lista',input:'Nazwa',buttons:[{label:'Anuluj',cancel:true},{label:'Dodaj',primary:true,cb:v=>{v=(v||'').trim();if(!v)return false;const id='l'+Date.now();D.lists.push({id,name:v,color:['#bf5af2','#ff375f','#5ac8fa','#ffd60a'][D.lists.length%4]});cur=id;save();draw()}}]}); side.append(nb);
    const l=D.lists.find(x=>x.id===cur); ttl.textContent=l.name; ttl.style.color=l.color; box.innerHTML='';
    const items=D.items.filter(i=>i.list===cur);
    if(!items.length)box.append(el('div','empty','Brak przypomnień'));
    items.forEach(i=>{const r=el('div','rem'+(i.done?' done':''),'<i></i><span style="flex:1"></span><button class="tbtn" aria-label="Usuń">×</button>');$('span',r).textContent=i.text;$('i',r).style.borderColor=i.done?'':l.color;if(i.done)$('i',r).style.background=l.color;$('i',r).onclick=()=>{i.done=!i.done;sfx('click');save();draw()};$('button',r).onclick=()=>{D.items=D.items.filter(x=>x!==i);save();draw()};box.append(r)});
  }
  add.onkeydown=e=>{if(e.key==='Enter'&&add.value.trim()){D.items.push({id:Date.now(),list:cur,text:add.value.trim(),done:false});add.value='';save();draw()}};
  draw();
}

/* ================= ZEGAR ================= */
function renderClock(body,w){
  const main=el('div','main'), bar=el('div','bar'), view=el('div'); view.style.cssText='flex:1;overflow:auto;padding:14px 20px';
  const tabs=el('div','tabs'); let tab='world';
  [['world','Świat'],['stop','Stoper'],['timer','Minutnik']].forEach(([k,l])=>{const b=el('button','',l);b.onclick=()=>{tab=k;draw()};b.dataset.k=k;tabs.append(b)});
  bar.append(tabs); main.append(bar,view); body.append(main);
  const cities=[['Warszawa','Europe/Warsaw'],['Londyn','Europe/London'],['Nowy Jork','America/New_York'],['Los Angeles','America/Los_Angeles'],['Dubaj','Asia/Dubai'],['Tokio','Asia/Tokyo'],['Sydney','Australia/Sydney']];
  let sw={run:false,t0:0,acc:0,laps:[]}, tm={run:false,end:0,left:300000};
  const fmt=ms=>{const c=Math.floor(ms/10)%100,s=Math.floor(ms/1000)%60,m=Math.floor(ms/60000);return pad(m)+':'+pad(s)+'.'+pad(c)};
  function analog(){
    const d=new Date(), h=(d.getHours()%12+d.getMinutes()/60)*30, m=(d.getMinutes()+d.getSeconds()/60)*6, s=d.getSeconds()*6;
    let ticks=''; for(let k=0;k<12;k++)ticks+=`<line x1="60" y1="8" x2="60" y2="${k%3?13:17}" stroke="var(--fg2)" stroke-width="2" transform="rotate(${k*30} 60 60)"/>`;
    return `<svg viewBox="0 0 120 120" width="150" height="150" style="display:block;margin:0 auto 12px"><circle cx="60" cy="60" r="57" fill="var(--field)" stroke="var(--line)"/>${ticks}<line x1="60" y1="60" x2="60" y2="32" stroke="var(--fg)" stroke-width="4" stroke-linecap="round" transform="rotate(${h} 60 60)"/><line x1="60" y1="60" x2="60" y2="20" stroke="var(--fg)" stroke-width="3" stroke-linecap="round" transform="rotate(${m} 60 60)"/><line x1="60" y1="66" x2="60" y2="14" stroke="var(--orange)" stroke-width="1.5" transform="rotate(${s} 60 60)"/><circle cx="60" cy="60" r="3" fill="var(--orange)"/></svg>`;
  }
  function draw(){
    $$('.tabs button',bar).forEach(b=>b.classList.toggle('on',b.dataset.k===tab));
    if(tab==='world'){
      view.innerHTML=analog()+cities.map(([n,z])=>`<div class="row"><div><b>${n}</b><small>${new Date().toLocaleDateString('pl-PL',{timeZone:z,weekday:'long'})}</small></div><span style="font-size:26px;font-weight:300;font-variant-numeric:tabular-nums">${new Date().toLocaleTimeString('pl-PL',{timeZone:z,hour:'2-digit',minute:'2-digit'})}</span></div>`).join('');
    }else if(tab==='stop'){
      view.innerHTML=`<div class="bigt" id="swt"></div><div style="display:flex;gap:12px;justify-content:center"><button class="btn" id="swl">Okrążenie</button><button class="btn p" id="sws"></button></div><div id="swlaps" style="margin-top:16px"></div>`;
      $('#sws',view).onclick=()=>{if(sw.run){sw.acc+=Date.now()-sw.t0;sw.run=false}else{sw.t0=Date.now();sw.run=true}draw()};
      $('#swl',view).onclick=()=>{if(sw.run){sw.laps.unshift(sw.acc+Date.now()-sw.t0)}else{sw={run:false,t0:0,acc:0,laps:[]}}draw()};
    }else{
      view.innerHTML=`<div class="bigt" id="tmt"></div><div style="display:flex;gap:8px;justify-content:center;align-items:center;margin-bottom:12px"><input class="field" id="tmm" type="number" min="0" max="999" value="${Math.floor(tm.left/60000)}" style="width:70px;text-align:center" aria-label="Minuty"> min <input class="field" id="tms" type="number" min="0" max="59" value="${Math.floor(tm.left/1000)%60}" style="width:70px;text-align:center" aria-label="Sekundy"> s</div><div style="display:flex;gap:12px;justify-content:center"><button class="btn" id="tmr">Resetuj</button><button class="btn p" id="tmg"></button></div>`;
      $('#tmg',view).onclick=()=>{if(tm.run){tm.left=tm.end-Date.now();tm.run=false}else{if(tm.left<=0||!tm.touched){tm.left=(+$('#tmm',view).value*60+ +$('#tms',view).value)*1000}tm.touched=true;tm.end=Date.now()+tm.left;tm.run=true}draw()};
      $('#tmr',view).onclick=()=>{tm={run:false,end:0,left:(+$('#tmm',view).value*60+ +$('#tms',view).value)*1000,touched:false};draw()};
    }
    tickv();
  }
  function tickv(){
    if(tab==='stop'){const t=$('#swt',view);if(!t)return;t.textContent=fmt(sw.acc+(sw.run?Date.now()-sw.t0:0));$('#sws',view).textContent=sw.run?'Stop':'Start';$('#swl',view).textContent=sw.run?'Okrążenie':'Resetuj';$('#swlaps',view).innerHTML=sw.laps.map((l,i)=>`<div class="row"><span>Okrążenie ${sw.laps.length-i}</span><span style="font-variant-numeric:tabular-nums">${fmt(l)}</span></div>`).join('')}
    if(tab==='timer'){const t=$('#tmt',view);if(!t)return;let left=tm.run?tm.end-Date.now():tm.left;if(tm.run&&left<=0){tm.run=false;tm.left=0;left=0;sfx('notify');notify('Minutnik','Czas minął.','clock');draw();return}t.textContent=pad(Math.floor(left/60000))+':'+pad(Math.floor(left/1000)%60);$('#tmg',view).textContent=tm.run?'Pauza':'Start'}
    if(tab==='world'&&view.firstChild&&view.firstChild.tagName==='svg'){view.firstChild.outerHTML=analog()}
  }
  const iv=setInterval(()=>{if(tab==='world'&&new Date().getSeconds()===0)draw();else tickv()},tab==='stop'?40:250); const iv2=setInterval(tickv,50);
  w.cleanups.push(()=>{clearInterval(iv);clearInterval(iv2)}); draw();
}

/* ================= MONITOR AKTYWNOŚCI ================= */
function renderActivity(body,w){
  const main=el('div','main'), bar=el('div','bar'), box=el('div'), st=el('div','status'); let sel=null;
  box.style.cssText='flex:1;overflow:auto'; const kill=el('button','','Wymuś zakończenie'); bar.append(el('b','','Procesy'),el('span','sp'),kill); main.append(bar,box,st); body.append(main);
  function draw(){
    const rows=[...wins.values()].map(o=>({o,name:APPS[o.id].name,pid:200+o.wid*7,nodes:$$('*',o.el).length}));
    box.innerHTML='<table class="ptable"><thead><tr><th>Nazwa procesu</th><th>PID</th><th>Węzły DOM</th><th>Pamięć (szac.)</th><th>Stan</th></tr></thead><tbody></tbody></table>';
    const tb=$('tbody',box); rows.forEach(r=>{const tr=el('tr',r.o.wid===sel?'sel':'',`<td></td><td>${r.pid}</td><td>${r.nodes}</td><td>${fmtSize(r.nodes*620)}</td><td>${r.o.min?'Zminimalizowany':'Aktywny'}</td>`);tr.firstChild.textContent=r.name;tr.onclick=()=>{sel=r.o.wid;draw()};tb.append(tr)});
    const mem=performance.memory?fmtSize(performance.memory.usedJSHeapSize):'niedostępna';
    st.textContent=`Procesy: ${rows.length}   Sterta JS: ${mem}   Rdzenie: ${navigator.hardwareConcurrency||'?'}   Czas pracy: ${Math.round(performance.now()/60000)} min`;
  }
  kill.onclick=()=>{const o=wins.get(sel);if(o)closeWin(o);sel=null;draw()};
  const iv=setInterval(draw,1500); w.cleanups.push(()=>clearInterval(iv)); draw();
}

/* ================= KALENDARZ ================= */
function renderCalendar(body){
  const ev=store.get('cal',{}); let d=new Date(); d.setDate(1); let selD=new Date();
  const key=x=>x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate());
  const m=el('div','cal-m'), sd=el('div','cal-s'); const wrap=el('div','cal'); wrap.append(m,sd); body.append(wrap);
  function draw(){
    const now=new Date(), y=d.getFullYear(), mo=d.getMonth(), first=(new Date(y,mo,1).getDay()+6)%7, days=new Date(y,mo+1,0).getDate(), prev=new Date(y,mo,0).getDate();
    m.innerHTML='<div class="cal-h"><h2></h2><button aria-label="Poprzedni miesiąc">‹</button><button>Dziś</button><button aria-label="Następny miesiąc">›</button></div><div class="cal-g"></div>';
    $('h2',m).textContent=d.toLocaleDateString('pl-PL',{month:'long',year:'numeric'});
    const g=$('.cal-g',m); ['pon','wt','śr','czw','pt','sob','niedz'].forEach(x=>g.append(el('div','wd',x)));
    for(let i=0;i<42;i++){
      const n=i-first+1, o=n<1||n>days, v=n<1?prev+n:n>days?n-days:n, dt=new Date(y,mo+(n<1?-1:n>days?1:0),v);
      const c=el('div',(o?'o ':'')+(key(dt)===key(now)?'t ':'')+(key(dt)===key(selD)?'s':''),'<span>'+v+'</span>');
      (ev[key(dt)]||[]).slice(0,2).forEach(t=>{const q=el('i');q.textContent=t;c.append(q)});
      c.onclick=()=>{selD=dt;draw()}; g.append(c);
    }
    const b=$$('.cal-h button',m); b[0].onclick=()=>{d.setMonth(mo-1);draw()}; b[1].onclick=()=>{d=new Date();d.setDate(1);selD=new Date();draw()}; b[2].onclick=()=>{d.setMonth(mo+1);draw()};
    const k=key(selD); sd.innerHTML=`<div style="font-weight:700;font-size:15px;text-transform:capitalize"></div><div style="color:var(--fg2);margin-bottom:10px"></div><div id="evl"></div><button class="btn p" style="margin-top:10px;width:100%">Dodaj wydarzenie</button>`;
    sd.children[0].textContent=selD.toLocaleDateString('pl-PL',{weekday:'long'}); sd.children[1].textContent=selD.toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'});
    const l=$('#evl',sd); (ev[k]||[]).forEach((t,idx)=>{const r=el('div','nrow','<span style="flex:1;color:var(--fg)"></span><button class="tbtn" aria-label="Usuń">×</button>');$('span',r).textContent=t;$('button',r).onclick=()=>{ev[k].splice(idx,1);store.set('cal',ev);draw()};l.append(r)});
    if(!(ev[k]||[]).length)l.append(el('div','',"<span style='color:var(--fg2)'>Brak wydarzeń</span>"));
    $('button',sd).onclick=()=>dialog({title:'Nowe wydarzenie',msg:selD.toLocaleDateString('pl-PL',{day:'numeric',month:'long'}),input:'Nazwa wydarzenia',buttons:[{label:'Anuluj',cancel:true},{label:'Dodaj',primary:true,cb:v=>{v=(v||'').trim();if(!v)return false;(ev[k]=ev[k]||[]).push(v);store.set('cal',ev);draw()}}]});
  }
  draw();
}

/* ================= KALKULATOR ================= */
function renderCalc(body){
  const wrap=el('div','calc'), scr_=el('div','scr','0'), keys=el('div','keys'); wrap.append(scr_,keys); body.append(wrap);
  let cur_='0',prev=null,op=null,fresh=false;
  const layout=[['AC','fn'],['±','fn'],['%','fn'],['÷','op'],'7','8','9',['×','op'],'4','5','6',['−','op'],'1','2','3',['+','op'],['0','z'],',',['=','op']];
  const fmt=s=>{if(s==='Błąd')return s;const[i,d]=s.split('.');return(+i).toLocaleString('pl-PL')+(d!=null?','+d:'')};
  const show=()=>{const t=fmt(cur_);scr_.textContent=t;scr_.style.fontSize=t.length>9?'28px':t.length>6?'36px':'44px'};
  const calc=()=>{const a=prev,b=parseFloat(cur_);const r=op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:b===0?NaN:a/b;return isFinite(r)?String(+r.toPrecision(12)):'Błąd'};
  const btns={};
  layout.forEach(k=>{
    const[t,c]=Array.isArray(k)?k:[k,''], b=el('button',c,t); btns[t]=b; keys.append(b);
    b.onclick=()=>{
      if(/\d/.test(t)){cur_=(fresh||cur_==='0')?t:(cur_.length<12?cur_+t:cur_);fresh=false}
      else if(t===','){if(fresh){cur_='0';fresh=false}if(!cur_.includes('.'))cur_+='.'}
      else if(t==='AC'){cur_='0';prev=null;op=null;fresh=false}
      else if(t==='±'){cur_=String(-parseFloat(cur_)||0)}
      else if(t==='%'){cur_=String(+(parseFloat(cur_)/100).toPrecision(12))}
      else if(t==='='){if(op&&prev!=null){cur_=calc();op=null;prev=null;fresh=true}}
      else{if(op&&!fresh&&prev!=null)cur_=calc();prev=parseFloat(cur_);op=t;fresh=true}
      Object.entries(btns).forEach(([k2,x])=>x.classList.toggle('on',k2===op&&fresh));
      btns.AC.textContent=cur_==='0'&&!op?'AC':'C'; show();
    };
  });
  show();
}

/* ================= USTAWIENIA SYSTEMOWE ================= */
function renderSettings(body,w,opts){
  const side=el('div','side'), set=el('div','set'); body.append(side,set);
  let pane=opts.pane||'general';
  const PANES=[['general','Ogólne'],['look','Wygląd'],['wall','Tapeta'],['dock','Dock i pasek menu'],['disp','Ekran i dźwięk'],['user','Użytkownik']];
  const sw=(on_,cb)=>{const b=el('button','sw'+(on_?' on':''));b.setAttribute('role','switch');b.setAttribute('aria-checked',!!on_);b.onclick=()=>{on_=!on_;b.classList.toggle('on',on_);b.setAttribute('aria-checked',on_);cb(on_)};return b};
  const row=(label,ctl,sub)=>{const r=el('div','row','<div><span></span><small></small></div>');$('span',r).textContent=label;$('small',r).textContent=sub||'';if(!sub)$('small',r).remove();r.append(ctl);return r};
  const card=(...rows)=>{const c=el('div','card');c.append(...rows);return c};
  const rng=(min,max,val,cb)=>{const i=el('input');i.type='range';i.min=min;i.max=max;i.value=val;i.style.width='160px';i.oninput=()=>cb(+i.value);return i};
  const WALLS={1:'linear-gradient(160deg,#ffb56e,#ff6f9c 45%,#5a5ad8)',2:'linear-gradient(160deg,#7cf0e0,#3a8bd8 50%,#12306b)',3:'linear-gradient(160deg,#e4f8a8,#2fc87a 50%,#0a4a52)',4:'linear-gradient(160deg,#6a6f80,#17181e)',5:'linear-gradient(160deg,#ffe29a,#ff8fa3 45%,#7a5cff)',auto:'linear-gradient(90deg,#16205a,#ff7a8a 35%,#7fd1ff 60%,#ffb56e 80%,#16205a)'};
  function draw(){
    side.innerHTML=''; PANES.forEach(([k,l])=>{const s=el('div','sl'+(pane===k?' on':''));s.textContent=l;s.onclick=()=>{pane=k;draw()};side.append(s)});
    set.innerHTML=''; const h=el('h2'); h.textContent=PANES.find(p=>p[0]===pane)[1]; set.append(h);
    if(pane==='general'){
      set.append(card(row('System',el('span','','' + SYS+' 1.0')),row('Użytkownik',el('span','',esc(S.user))),row('Zainstalowane aplikacje',el('span','',String(BASE_APPS.length+S.installed.length)))));
      const rb=el('button','btn','Przywróć ustawienia fabryczne…'); rb.onclick=()=>dialog({title:'Przywrócić ustawienia fabryczne?',msg:'Usunie wszystkie pliki, notatki, ustawienia i pobrane aplikacje z tej przeglądarki. Nie da się tego cofnąć.',buttons:[{label:'Anuluj',cancel:true},{label:'Przywróć',primary:true,cb:()=>{try{Object.keys(localStorage).filter(k=>k.startsWith('mw_')).forEach(k=>localStorage.removeItem(k))}catch(e){}location.reload()}}]});
      set.append(rb);
    }
    if(pane==='look'){
      const accs=el('div','accs'); accs.style.padding='0'; ['#0a84ff','#bf5af2','#ff375f','#ff9f0a','#30d158','#64d2ff'].forEach(c=>{const b=el('button',S.accent===c?'on':'');b.style.background=c;b.setAttribute('aria-label','Akcent '+c);b.onclick=()=>{S.accent=c;saveS();applySettings();draw()};accs.append(b)});
      set.append(card(row('Tryb ciemny',sw(isDark(),()=>{toggleTheme();draw()})),row('Kolor akcentu',accs),row('Powiadomienia: nie przeszkadzać',sw(S.dnd,v=>{S.dnd=v;saveS()}))));
    }
    if(pane==='wall'){
      const g=el('div','walls'); Object.keys(WALLS).forEach(k=>{const b=el('button',S.wall===k?'on':'');b.style.background=WALLS[k];b.setAttribute('aria-label','Tapeta '+k);b.title=k==='auto'?'Dynamiczna (pora dnia)':'Tapeta '+k;b.onclick=()=>{S.wall=k;saveS();applySettings();draw()};g.append(b)});
      set.append(card(g)); const p=el('p'); p.style.cssText='color:var(--fg2);margin:0'; p.textContent='Ostatnia tapeta zmienia kolory w zależności od pory dnia.'; set.append(p);
    }
    if(pane==='dock'){
      set.append(card(row('Rozmiar docka',rng(36,84,S.dockSize,v=>{S.dockSize=v;saveS();refreshDock()})),row('Powiększanie po najechaniu',sw(S.magnify,v=>{S.magnify=v;saveS()})),row('Automatycznie ukryj i pokaż dock',sw(S.dockHide,v=>{S.dockHide=v;saveS();applySettings()}),'Najedź na dolną krawędź ekranu, aby go pokazać')));
    }
    if(pane==='disp'){
      set.append(card(row('Jasność',rng(30,100,S.brightness,v=>{S.brightness=v;saveS();applySettings()})),row('Głośność',rng(0,100,S.volume,v=>{S.volume=v;saveS();applySettings()})),row('Dźwięki systemowe',sw(S.sounds,v=>{S.sounds=v;saveS()})),row('Pełny ekran po zalogowaniu',sw(S.autoFs,v=>{S.autoFs=v;saveS()}),'Przeglądarka może poprosić o zgodę'),row('Pełny ekran teraz',(()=>{const b=el('button','btn','Włącz lub wyłącz');b.onclick=toggleFullscreen;return b})())));
    }
    if(pane==='user'){
      const inp=el('input','field'); inp.value=S.user; inp.style.width='170px'; inp.maxLength=20; inp.setAttribute('aria-label','Nazwa użytkownika'); inp.onchange=()=>{S.user=inp.value.trim()||'Gość';saveS();buildMenubar();emit('fs')};
      const cols=el('div','accs'); cols.style.padding='0'; ['#7d8794','#0a84ff','#bf5af2','#ff375f','#ff9f0a','#30d158'].forEach(c=>{const b=el('button',S.avatar===c?'on':'');b.style.background=c;b.setAttribute('aria-label','Awatar '+c);b.onclick=()=>{S.avatar=c;saveS();draw()};cols.append(b)});
      set.append(card(row('Nazwa',inp),row('Kolor awatara',cols)));
    }
  }
  w.onopen=o=>{if(o.pane){pane=o.pane;draw()}};
  draw();
}
