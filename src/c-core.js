/* ================= RDZEŃ: narzędzia, ustawienia, kursory, dźwięk, system plików ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k,d){try{const v=localStorage.getItem('mw_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('mw_'+k,JSON.stringify(v))}catch(e){}}};
const root=document.documentElement, MB=28;
const small=()=>innerWidth<600;
let uid=0;
const bus=new EventTarget();
const emit=(n,d)=>bus.dispatchEvent(new CustomEvent(n,{detail:d}));
const on=(n,f)=>{const h=e=>f(e.detail);bus.addEventListener(n,h);return()=>bus.removeEventListener(n,h)};
const pad=n=>String(n).padStart(2,'0');
const fmtSize=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(1).replace('.',',')+' KB':(b/1048576).toFixed(1).replace('.',',')+' MB';
const fmtDate=t=>new Date(t).toLocaleString('pl-PL',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});

/* ---------- logo systemu (własny znak, podmień SVG poniżej na swój) ---------- */
const LOGO_MARK=(s=14)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/><circle cx="19.2" cy="4.8" r="1.6" fill="currentColor" stroke="none"/></svg>`;
/* Miejsce na logo: jeśli obok pliku HTML leży logo.png, jest pokazywane zamiast wbudowanego znaku. */
const LOGO=(s=14)=>`<span class="lgo" style="width:${s}px;height:${s}px">${LOGO_MARK(s).replace(/width="\d+" height="\d+"/,'width="100%" height="100%"')}<img src="logo.png" alt="" onload="this.parentNode.classList.add('has')" onerror="this.remove()"></span>`;

/* ---------- ustawienia ---------- */
const DEF={theme:null,wall:'1',accent:'#0a84ff',dockSize:58,autoFs:true,magnify:true,dockHide:false,volume:60,brightness:100,sounds:true,user:'Gość',avatar:'#7d8794',dnd:false,wifi:true,bt:true,installed:[]};
const S=Object.assign({},DEF,store.get('settings',{}));
const saveS=()=>store.set('settings',S);
const isDark=()=>root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
function autoWall(){
  const h=new Date().getHours()+new Date().getMinutes()/60;
  const pal=h<5?['#0b1030','#2b2a6b','#6b4a9a']:h<8?['#ffb88a','#ff7a8a','#4a4ab8']:h<17?['#7fd1ff','#3a8bd8','#1a3d8a']:h<20?['#ffb56e','#ff6f9c','#5a5ad8']:['#16205a','#3b2f86','#7a4a9a'];
  return `radial-gradient(1100px 700px at 15% 8%,${pal[0]} 0,transparent 60%),radial-gradient(1000px 800px at 88% 18%,${pal[1]} 0,transparent 55%),radial-gradient(1300px 900px at 50% 115%,${pal[2]} 0,transparent 62%),linear-gradient(160deg,${pal[1]},#10153a)`;
}
function applySettings(){
  if(S.theme)root.dataset.theme=S.theme;else delete root.dataset.theme;
  if(S.wall==='auto'){delete root.dataset.wall;root.style.setProperty('--wall',autoWall())}
  else{root.dataset.wall=S.wall;root.style.removeProperty('--wall')}
  root.style.setProperty('--accent',S.accent);
  $('#dimmer').style.opacity=((100-S.brightness)/70)*.6;
  if(master)master.gain.value=S.volume/100;
  const d=$('#dock'); if(d)d.classList.toggle('hide',S.dockHide&&!dockPeek);
}
let dockPeek=false;
function setTheme(t){S.theme=t;saveS();applySettings();buildMenubar&&buildMenubar();emit('theme')}
function toggleTheme(){setTheme(isDark()?'light':'dark')}

/* ---------- kursory w stylu macOS ---------- */
const cur=(w,h,body)=>`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`)}")`;
root.style.setProperty('--c-arrow',cur(20,28,`<path d="M4 2.5v18.6l4.4-4.1 3 7.1 3.1-1.3-3-7H17.8z" fill="#000" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>`));
root.style.setProperty('--c-hand',cur(24,26,`<path d="M9.3 3.6c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8v6.6l1.5-.5c.9-.3 1.8.1 2 1l.2.8 1.200-.3c.9-.2 1.700.3 1.900 1.100l.4 1.800c.4 2 .1 3.900-.8 5.300l-1.200 2H9.900l-4.500-6.200c-.5-.8-.3-1.600.4-2 .6-.4 1.400-.2 1.900.4l1.600 1.800z" fill="#fff" stroke="#000" stroke-width="1.3" stroke-linejoin="round"/>`));
root.style.setProperty('--c-ibeam',cur(14,22,`<path d="M4 3h6M4 19h6M7 3v16" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M4 3h6M4 19h6M7 3v16" stroke="#000" stroke-width="1.6" stroke-linecap="round"/>`));

/* ---------- dźwięk (WebAudio, generowany na żywo) ---------- */
let AC=null, master=null;
function ac(){
  try{
    if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=S.volume/100;master.connect(AC.destination)}
    if(AC.state==='suspended')AC.resume();
    return AC;
  }catch(e){return null}
}
function tone(f,t,d,type='sine',v=.2,f2){
  const o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g); g.connect(master); o.start(t); o.stop(t+d+.05);
}
function noiseBurst(t,d,v){
  const n=AC.sampleRate*d|0, b=AC.createBuffer(1,n,AC.sampleRate), x=b.getChannelData(0);
  for(let i=0;i<n;i++)x[i]=(Math.random()*2-1)*(1-i/n);
  const s=AC.createBufferSource(), g=AC.createGain(); s.buffer=b; g.gain.value=v; s.connect(g); g.connect(master); s.start(t);
}
const SFX={
  click:t=>tone(1400,t,.035,'square',.03),
  pop:t=>tone(500,t,.12,'sine',.16,900),
  trash:t=>noiseBurst(t,.3,.28),
  notify:t=>{tone(880,t,.25,'sine',.18);tone(1318,t+.12,.4,'sine',.16)},
  error:t=>tone(170,t,.25,'sawtooth',.14,110),
  chime:t=>[196,261.6,329.6,392,523.3].forEach((f,i)=>tone(f,t,2.6,'sine',.13-i*.01)),
  down:t=>[523.3,392,329.6,261.6].forEach((f,i)=>tone(f,t+i*.2,1.1,'sine',.11)),
  shot:t=>{noiseBurst(t,.08,.25);tone(2000,t,.1,'square',.04)}
};
function sfx(n){if(!S.sounds||!S.volume)return;if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;if(!ac())return;try{SFX[n](AC.currentTime)}catch(e){}}

/* ---------- system plików (wspólny dla Findera, Terminala i edytora) ---------- */
const HOME='/Users/gosc', TRASH=HOME+'/.Trash';
const PHOTO_NAMES=['Zachód słońca','Góry o świcie','Morze','Las','Miasto nocą','Pola'];
const SYS='MGS Computer';
const WELCOME='Witaj w MGS Computer!\n\nTo jest działający pulpit w przeglądarce.\n- Finder, Terminal i Edytor tekstu korzystają z tych samych plików.\n- Spróbuj w Terminalu: ls, cd Documents, cat "Lista zakupów.txt", mkdir nowy.\n- W App Store pobierzesz 5 aplikacji, które potem działają naprawdę.\n- Menu z logo po lewej: uśpienie, restart, wyłączenie.\n- Ctrl+Spacja: Spotlight, F3: Mission Control, F4: Launchpad.\n';
const VFS=(()=>{
  const now=Date.now;
  const D=(c={})=>({t:'d',c,m:now()}), F=(d='',x)=>Object.assign({t:'f',d,m:now()},x||{});
  const err=m=>{throw new Error(m)};
  function seed(){
    const pics={}; PHOTO_NAMES.forEach((n,i)=>pics[n+'.jpg']=F('',{k:'img',seed:i}));
    return D({
      Applications:D({}),
      Users:D({gosc:D({
        Desktop:D({'Witaj.txt':F(WELCOME),'Plan weekendu.md':F('# Plan weekendu\n\n- rower nad rzeką\n- kino o 19:30\n')}),
        Documents:D({'Lista zakupów.txt':F('kawa\nmleko owsiane\nchleb na zakwasie\ncytryny\n'),'CV.txt':F('Imię Nazwisko\nProgramista i projektant\n'),Projekty:D({'README.md':F('# Projekt\n\nOpis projektu.\n'),'index.html':F('<!doctype html>\n<h1>Cześć!</h1>\n')})}),
        Downloads:D({'instalator.dmg':F('(plik binarny)',{k:'bin'}),'faktura-10.pdf':F('(plik PDF)',{k:'bin'})}),
        Pictures:D(pics),
        Music:D({'Playlista.txt':F('Poranek nad rzeką\nDeszcz za oknem\nNocny pociąg\nNeon\n')}),
        '.Trash':D({}),
        '.zshrc':F('# konfiguracja zsh\nexport EDITOR=nano\n')
      })}),
      tmp:D({}), bin:D({}), etc:D({hosts:F('127.0.0.1\tlocalhost\n'),motd:F('Witaj w MGS Computer.\n')}),
      usr:D({bin:D({}),local:D({})}), var:D({log:D({'system.log':F('')})})
    });
  }
  let fs=store.get('fs3',null); if(!fs||fs.t!=='d')fs=seed();
  function norm(p,cwd='/'){
    if(!p)p=cwd; if(p==='~'||p.startsWith('~/'))p=HOME+p.slice(1);
    if(!p.startsWith('/'))p=cwd+'/'+p;
    const out=[]; for(const s of p.split('/')){if(!s||s==='.')continue; if(s==='..')out.pop();else out.push(s)}
    return '/'+out.join('/');
  }
  function get(p){let n=fs;for(const s of norm(p).split('/').filter(Boolean)){if(n.t!=='d'||!(s in n.c))return null;n=n.c[s]}return n}
  function split(p){p=norm(p);const i=p.lastIndexOf('/');return[p.slice(0,i)||'/',p.slice(i+1)]}
  function list(p){const n=get(p);if(!n||n.t!=='d')err('Not a directory');return Object.keys(n.c).sort((a,b)=>a.localeCompare(b,'pl',{sensitivity:'base'})).map(k=>[k,n.c[k]])}
  let timer; function dirty(){clearTimeout(timer);timer=setTimeout(()=>store.set('fs3',fs),400);emit('fs')}
  function mkdir(p,parents){
    p=norm(p); if(get(p)){if(parents)return;err('File exists')}
    const[d,n]=split(p); let pd=get(d);
    if(!pd){if(!parents)err('No such file or directory');mkdir(d,true);pd=get(d)}
    if(pd.t!=='d')err('Not a directory'); pd.c[n]=D({}); dirty();
  }
  function write(p,data,append,x){
    p=norm(p); const[d,n]=split(p); const pd=get(d);
    if(!pd)err('No such file or directory'); if(pd.t!=='d')err('Not a directory');
    const f=pd.c[n]; if(f&&f.t==='d')err('Is a directory');
    if(f){f.d=append?(f.d||'')+data:data;f.m=now();if(x)Object.assign(f,x)}else pd.c[n]=F(data,x);
    dirty();
  }
  function rm(p,rec){
    p=norm(p); const n=get(p); if(!n)err('No such file or directory'); if(n.t==='d'&&!rec)err('is a directory');
    if(p==='/')err('refusing to remove /');
    const[d,nm]=split(p); delete get(d).c[nm]; dirty();
  }
  const clone=n=>JSON.parse(JSON.stringify(n));
  function cp(a,b,rec){
    a=norm(a); b=norm(b); const n=get(a); if(!n)err('No such file or directory');
    if(n.t==='d'&&!rec)err('is a directory (not copied)');
    if(b===a||b.startsWith(a+'/'))err('cannot copy a directory into itself');
    const t=get(b); if(t&&t.t==='d')b=norm(b+'/'+split(a)[1]);
    const[d,nm]=split(b); const pd=get(d); if(!pd||pd.t!=='d')err('No such file or directory');
    const c=clone(n); c.m=now(); pd.c[nm]=c; dirty();
  }
  function mv(a,b){
    a=norm(a); b=norm(b); const t=get(b);
    if(b===a)return; if(b.startsWith(a+'/'))err('cannot move a directory into itself');
    const dest=t&&t.t==='d'?norm(b+'/'+split(a)[1]):b;
    if(dest===a)return; cp(a,b,true); rm(a,true);
  }
  function trash(p){
    p=norm(p); if(p.startsWith(TRASH+'/'))return rm(p,true);
    const nm=split(p)[1]; let dest=TRASH+'/'+nm, i=1; while(get(dest))dest=TRASH+'/'+nm+' '+(++i);
    mv(p,dest);
  }
  const size=n=>n.t==='f'?(n.d||'').length+(n.url?(n.url.length*.75|0):0):Object.values(n.c).reduce((s,x)=>s+size(x),0);
  function walk(p,fn){const n=get(p);fn(norm(p),n);if(n&&n.t==='d')for(const[k]of list(p))walk(norm(p)+'/'+k,fn)}
  function syncApps(){
    const a=get('/Applications'); a.c={};
    const ids=[...BASE_APPS,...S.installed.filter(i=>APPS[i])];
    ids.forEach(id=>{a.c[APPS[id].name+'.app']=F('',{k:'app',app:id})});
    dirty();
  }
  function reset(){fs=seed();syncApps();dirty()}
  return{norm,get,split,list,mkdir,write,rm,cp,mv,trash,size,walk,syncApps,reset,emptyTrash(){get(TRASH).c={};dirty()}};
})();
const dn=n=>({Desktop:'Pulpit',Documents:'Dokumenty',Downloads:'Pobrane',Pictures:'Zdjęcia',Music:'Muzyka','.Trash':'Kosz',Applications:'Aplikacje',gosc:S.user,'':'MGS HD'})[n]||n;
const extOf=n=>(n.match(/\.([^.]+)$/)||[])[1]?.toLowerCase()||'';

/* ---------- zdjęcia przykładowe (wektorowe) ---------- */
function photoSVG(i){
  const g='p'+(uid++);
  const lg=(stops)=>`<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">${stops.map((s,k)=>`<stop offset="${s[0]}" stop-color="${s[1]}"/>`).join('')}</linearGradient></defs><rect width="400" height="300" fill="url(#${g})"/>`;
  const sc=[
    lg([[0,'#25205a'],[.45,'#b04a8a'],[.75,'#ff8a5c'],[1,'#ffd58a']])+'<circle cx="270" cy="190" r="38" fill="#fff3c4" opacity=".95"/><path d="M0 235l60-34 50 20 70-44 60 38 60-26 100 42v69H0z" fill="#2a1a4a"/>',
    lg([[0,'#9ec9ff'],[.6,'#ffd9b5'],[1,'#fff0d8']])+'<path d="M0 220l70-90 50 60 60-110 80 130 50-50 90 90v50H0z" fill="#6d7fa8"/><path d="M0 250l90-70 60 40 80-60 70 60 100-30v110H0z" fill="#3f4f78"/><path d="M0 280l120-40 90 20 190-30v70H0z" fill="#26324f"/>',
    lg([[0,'#7ec8ff'],[.52,'#d6f0ff'],[.521,'#1d79c4'],[1,'#0b3d78']])+'<circle cx="300" cy="90" r="26" fill="#fff6c9"/><g stroke="#fff" stroke-width="2" opacity=".5"><path d="M30 190h70M140 205h120M60 225h90M220 240h140M120 262h100"/></g>',
    lg([[0,'#bde7a5'],[1,'#3d8f52']])+'<g fill="#1f5c33">'+[20,70,120,170,230,285,340].map((x,k)=>`<path d="M${x} ${250-k%3*10}l30-120 30 120z"/>`).join('')+'</g><g fill="#2f7a46">'+[45,150,260,360].map((x,k)=>`<path d="M${x} 290l36-150 36 150z"/>`).join('')+'</g>',
    lg([[0,'#080a24'],[.7,'#2a2468'],[1,'#6a3a8a']])+'<circle cx="320" cy="60" r="20" fill="#fff8d8"/><g fill="#14102e">'+[[10,150,40],[55,110,50],[110,170,36],[150,90,46],[200,140,50],[255,120,40],[300,170,46],[350,130,50]].map(b=>`<rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${300-b[1]}"/>`).join('')+'</g><g fill="#ffd45a">'+Array.from({length:46},(_,k)=>`<rect x="${14+(k*37)%360}" y="${130+(k*53)%150}" width="5" height="7" opacity="${.45+(k%4)*.15}"/>`).join('')+'</g>',
    lg([[0,'#8ed0ff'],[.55,'#e8f6ff'],[1,'#fff']])+'<path d="M0 210c80-40 140-30 200 0s140 30 200-10v100H0z" fill="#9bd36a"/><path d="M0 250c90-30 150-20 210 5s130 20 190-5v50H0z" fill="#e8c84a"/><path d="M0 280c100-20 200-10 400-20v40H0z" fill="#6fae45"/>'
  ];
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${sc[i%sc.length]}</svg>`;
}
