
/* ================= TERMINAL: prawdziwa powłoka na wspólnym systemie plików ================= */
const ANSI_COL={30:'#4a4a4f',31:'#ff6b6b',32:'#6fe28b',33:'#f5d76e',34:'#6aa9ff',35:'#d38bff',36:'#6fdde8',37:'#e5e5e7',90:'#8e8e93',91:'#ff8a80',92:'#9af5b0',93:'#ffe58f',94:'#8fbfff',95:'#e5acff',96:'#9aeaf2'};
function ansiHTML(s){
  let st={}, out='', last=0; const re=/\x1b\[([\d;]*)m/g; let m;
  const seg=t=>{if(!t)return;const css=(st.c?'color:'+st.c+';':'')+(st.b?'font-weight:700;':'')+(st.d?'opacity:.6;':'')+(st.u?'text-decoration:underline;':'')+(st.r?'background:var(--term-fg);color:var(--term-bg);':'');out+=css?`<span style="${css}">${esc(t)}</span>`:esc(t)};
  while((m=re.exec(s))){
    seg(s.slice(last,m.index)); last=re.lastIndex;
    (m[1]||'0').split(';').forEach(c=>{c=+c;if(c===0)st={};else if(c===1)st.b=1;else if(c===2)st.d=1;else if(c===4)st.u=1;else if(c===7)st.r=1;else if(ANSI_COL[c])st.c=ANSI_COL[c]});
  }
  seg(s.slice(last)); return out;
}
const stripAnsi=s=>String(s).replace(/\x1b\[[\d;]*m/g,'');
const CL=(c,s)=>`\x1b[${c}m${s}\x1b[0m`;
const HELPS={
  ls:'ls [-alh1R] [ścieżka…]  wyświetla zawartość katalogu',cd:'cd [katalog]  zmienia katalog ("cd -" wraca, "cd" idzie do ~)',pwd:'pwd  wypisuje bieżący katalog',
  mkdir:'mkdir [-p] nazwa…  tworzy katalogi',rmdir:'rmdir nazwa…  usuwa puste katalogi',touch:'touch plik…  tworzy puste pliki',cat:'cat [plik…]  wypisuje zawartość plików',
  echo:'echo [-n] tekst…  wypisuje tekst (obsługuje > i >>)',printf:'printf format [argumenty…]  formatowane wyjście',rm:'rm [-rf] ścieżka…  usuwa pliki',cp:'cp [-r] źródło cel  kopiuje',mv:'mv źródło cel  przenosi lub zmienia nazwę',
  head:'head [-n N] [plik]  pierwsze linie',tail:'tail [-n N] [plik]  ostatnie linie',wc:'wc [-lwc] [plik…]  liczy linie, słowa, bajty',grep:'grep [-invcrF] wzorzec [plik…]  szuka wzorca',
  find:'find [ścieżka] [-name wzorzec] [-type f|d]  szuka plików',sort:'sort [-rnu]  sortuje linie',uniq:'uniq [-c]  usuwa sąsiednie duplikaty',rev:'rev  odwraca każdą linię',tee:'tee plik  zapisuje wejście do pliku i przepuszcza dalej',
  date:'date  bieżąca data',cal:'cal  kalendarz bieżącego miesiąca',whoami:'whoami  nazwa użytkownika',hostname:'hostname  nazwa komputera',uname:'uname [-a]  informacje o systemie',uptime:'uptime  czas działania',
  ps:'ps  lista procesów (okien)',top:'top  zrzut procesów',kill:'kill PID…  zamyka proces',killall:'killall nazwa  zamyka aplikację',df:'df [-h]  miejsce na dysku',du:'du [-sh] ścieżka  rozmiar',
  history:'history  historia poleceń',clear:'clear  czyści ekran (Ctrl+L)',exit:'exit  zamyka okno Terminala',open:'open [-a Aplikacja] [ścieżka]  otwiera plik, folder lub aplikację',
  which:'which polecenie',export:'export ZMIENNA=wartość',env:'env  wypisuje zmienne środowiskowe',sleep:'sleep sekundy',seq:'seq [od] do',basename:'basename ścieżka',dirname:'dirname ścieżka',
  expr:'expr liczba operator liczba',bc:'bc wyrażenie  kalkulator',cowsay:'cowsay tekst',fortune:'fortune  losowa sentencja',neofetch:'neofetch  informacje o systemie',say:'say tekst  czyta na głos',
  brew:'brew install|uninstall|list|search|info nazwa  menedżer aplikacji z App Store',sudo:'sudo polecenie',shutdown:'shutdown [-r] now  wyłącza lub restartuje komputer',reboot:'reboot  uruchamia ponownie',
  nano:'nano plik  otwiera Edytor tekstu',tree:'tree [ścieżka]  drzewo katalogów',stat:'stat plik  informacje o pliku',file:'file plik  rodzaj pliku',pbcopy:'pbcopy  kopiuje wejście do schowka',pbpaste:'pbpaste  wkleja ze schowka',sw_vers:'sw_vers  wersja systemu',
  curl:'curl url  (brak dostępu do sieci w tym środowisku)',ping:'ping host  (brak dostępu do sieci w tym środowisku)',help:'help  lista poleceń',man:'man polecenie  krótki opis'
};
const FORTUNES=['Najlepszy kod to ten, którego nie trzeba pisać.','Co dziś zepsujesz, jutro naprawisz, a pojutrze opiszesz w dokumentacji.','Cierpliwość jest kompilatorem sukcesu.','Prostota jest szczytem wyrafinowania.','Pierwszy krok to uruchomić. Drugi to uruchomić ponownie.','Kto pyta, ten ls-uje.'];

function renderTerm(body,w){
  const t=el('div','term'); body.append(t);
  let cwd=HOME, oldpwd=HOME, last=0, hist=store.get('thist',[]), hi=hist.length, busy=false, abort=false, pbuf=store.get('pbuf','');
  const env={HOME,USER:'gosc',LOGNAME:'gosc',SHELL:'/bin/zsh',PATH:'/usr/local/bin:/usr/bin:/bin',LANG:'pl_PL.UTF-8',TERM:'xterm-256color',EDITOR:'nano',HOSTNAME:'mgs',PWD:HOME};
  const line=el('div','ln','<span class="pr"></span><input aria-label="Polecenie" autocomplete="off" autocapitalize="off" spellcheck="false">'), inp=$('input',line), pr=$('.pr',line);
  const short=p=>p===HOME?'~':p.startsWith(HOME+'/')?'~'+p.slice(HOME.length):p;
  const setPrompt=()=>{pr.textContent=`gosc@mgs ${short(cwd)} % `;w.title(`gosc — zsh — ${short(cwd)}`);env.PWD=cwd};
  const abs=p=>VFS.norm(p,cwd);
  const out=(s,cls)=>{
    if(s==null||s==='')return; if(s.endsWith('\n'))s=s.slice(0,-1);
    const d=el('div',cls||'',ansiHTML(s)||'&nbsp;'); if(cls==='e')d.style.color='#ff8a80'; t.insertBefore(d,line);
  };
  const R=(o='',e='',c=0)=>({o,e,c});
  const eGet=k=>k==='?'?String(last):env[k]!=null?env[k]:'';
  const day=d=>d.toLocaleDateString('en-US',{weekday:'short'}), mon=d=>d.toLocaleDateString('en-US',{month:'short'});

  /* tokenizacja: cudzysłowy, zmienne, ~, operatory |, >, >>, ;, &&, || */
  function tokenize(s){
    const o=[]; let cur='', has=false, q=false;
    const push=()=>{if(has)o.push({t:'w',v:cur,q});cur='';has=false;q=false};
    const vr=/^\$(\{(\w+)\}|(\w+|\?))/;
    for(let i=0;i<s.length;i++){
      const c=s[i];
      if(c==="'"){q=true;has=true;i++;while(i<s.length&&s[i]!=="'")cur+=s[i++]}
      else if(c==='"'){
        q=true;has=true;i++;
        while(i<s.length&&s[i]!=='"'){
          if(s[i]==='\\'&&i+1<s.length&&'"$\\`'.includes(s[i+1])){cur+=s[i+1];i+=2;continue}
          if(s[i]==='$'){const m=vr.exec(s.slice(i));if(m){cur+=eGet(m[2]||m[3]);i+=m[0].length;continue}}
          cur+=s[i++];
        }
      }
      else if(c==='\\'){i++;if(i<s.length){cur+=s[i];has=true;q=true}}
      else if(c==='$'){const m=vr.exec(s.slice(i));if(m){cur+=eGet(m[2]||m[3]);has=true;i+=m[0].length-1}else{cur+=c;has=true}}
      else if(c==='~'&&!has&&(i+1>=s.length||/[\s/]/.test(s[i+1]))){cur+=HOME;has=true}
      else if(/\s/.test(c))push();
      else if(c==='|'||c===';'||c==='>'||c==='&'){
        push(); let op=c;
        if(c==='>'&&s[i+1]==='>'){op='>>';i++}else if(c==='&'&&s[i+1]==='&'){op='&&';i++}else if(c==='|'&&s[i+1]==='|'){op='||';i++}
        o.push({t:'op',v:op});
      }
      else if(c==='#'&&!has)break;
      else{cur+=c;has=true}
    }
    push(); return o;
  }
  function glob(tk){
    if(tk.q||!/[*?]/.test(tk.v))return[tk.v];
    const i=tk.v.lastIndexOf('/'), dir=i>=0?tk.v.slice(0,i+1):'', pat=tk.v.slice(i+1);
    const re=new RegExp('^'+pat.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$');
    try{const m=VFS.list(abs(dir||'.')).map(x=>x[0]).filter(n=>re.test(n)&&(pat.startsWith('.')||!n.startsWith('.')));return m.length?m.map(n=>dir+n):[tk.v]}catch(e){return[tk.v]}
  }

  const readIn=(a,inp_,cmd)=>{ // czyta pliki lub stdin
    if(!a.length)return inp_!=null?{ok:inp_}:{ok:''};
    let s='',err='';
    for(const f of a){const n=VFS.get(abs(f));if(!n)err+=`${cmd}: ${f}: No such file or directory\n`;else if(n.t==='d')err+=`${cmd}: ${f}: Is a directory\n`;else s+=n.d||''}
    return{ok:s,err};
  };
  const flags=a=>{const f=new Set(),r=[];let end=false;for(const s of a){if(!end&&s==='--'){end=true;continue}if(!end&&/^-[A-Za-z]+$/.test(s))[...s.slice(1)].forEach(c=>f.add(c));else r.push(s)}return{f,r}};
  const lsLong=(name,n,x)=>{
    const d=new Date(n.m), when=mon(d)+' '+String(d.getDate()).padStart(2)+' '+pad(d.getHours())+':'+pad(d.getMinutes());
    const col=n.t==='d'?CL('1;34',name):n.k==='app'?CL(32,name):name;
    return `${n.t==='d'?'drwxr-xr-x':n.k==='app'?'-rwxr-xr-x':'-rw-r--r--'}  1 gosc  staff  ${String(VFS.size(n)).padStart(7)} ${when} ${x.tty?col:name}`;
  };
  function lsDir(p,disp,f,x,head){
    let l=VFS.list(p); if(!f.has('a'))l=l.filter(([k])=>!k.startsWith('.'));
    let o=head?disp+':\n':'';
    if(f.has('l'))o+=l.map(([k,n])=>lsLong(k,n,x)).join('\n')+(l.length?'\n':'');
    else o+=l.map(([k,n])=>x.tty?(n.t==='d'?CL('1;34',k):n.k==='app'?CL(32,k):k):k).join(f.has('1')?'\n':'  ')+(l.length?'\n':'');
    if(f.has('R'))l.forEach(([k,n])=>{if(n.t==='d')o+='\n'+lsDir(p+'/'+k,disp+'/'+k,f,x,true)});
    return o;
  }
  const treeOf=(p,pre,x)=>{let o='';const l=VFS.list(p).filter(([k])=>!k.startsWith('.'));l.forEach(([k,n],i)=>{const end=i===l.length-1;o+=pre+(end?'└── ':'├── ')+(n.t==='d'?CL('1;34',k):k)+'\n';if(n.t==='d')o+=treeOf(p+'/'+k,pre+(end?'    ':'│   '),x)});return o};
  const procs=()=>[...wins.values()].map(o=>({pid:200+o.wid*7,name:APPS[o.id].name,mem:Math.round($$('*',o.el).length*0.62)}));
  const evalMath=e=>{e=e.replace(/\^/g,'**');if(!/^[\d\s+\-*/().%e*]+$/.test(e))throw new Error('syntax error');const v=Function('"use strict";return('+e+')')();if(!isFinite(v))throw new Error('divide by zero');return String(+v.toPrecision(14))};
  const BREW=Object.fromEntries(STORE.map(s=>[s.brew,s.id]));
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  const CMDS={
    ls:(a,i,x)=>{const{f,r}=flags(a),tg=r.length?r:['.'];let o='',e='',c=0;tg.forEach((tgt,k)=>{const p=abs(tgt),n=VFS.get(p);if(!n){e+=`ls: ${tgt}: No such file or directory\n`;c=1;return}if(n.t==='f'){o+=(f.has('l')?lsLong(tgt,n,x):tgt)+'\n';return}if(k)o+='\n';o+=lsDir(p,tgt,f,x,tg.length>1)});return R(o,e,c)},
    cd:a=>{let tg=a[0];if(tg==='-')tg=oldpwd;if(!tg)tg=HOME;const p=abs(tg),n=VFS.get(p);if(!n)return R('',`cd: no such file or directory: ${a[0]}\n`,1);if(n.t!=='d')return R('',`cd: not a directory: ${a[0]}\n`,1);oldpwd=cwd;cwd=p;setPrompt();return R()},
    pwd:()=>R(cwd+'\n'),
    mkdir:a=>{const{f,r}=flags(a);if(!r.length)return R('','usage: mkdir [-p] directory ...\n',1);let e='';r.forEach(d=>{try{VFS.mkdir(abs(d),f.has('p'))}catch(er){e+=`mkdir: ${d}: ${er.message}\n`}});return R('',e,e?1:0)},
    rmdir:a=>{let e='';a.forEach(d=>{const n=VFS.get(abs(d));if(!n)e+=`rmdir: ${d}: No such file or directory\n`;else if(n.t!=='d')e+=`rmdir: ${d}: Not a directory\n`;else if(Object.keys(n.c).length)e+=`rmdir: ${d}: Directory not empty\n`;else VFS.rm(abs(d),true)});return R('',e,e?1:0)},
    touch:a=>{let e='';a.forEach(f=>{try{const p=abs(f),n=VFS.get(p);if(n){n.m=Date.now();VFS.write(p,n.d||'')}else VFS.write(p,'')}catch(er){e+=`touch: ${f}: ${er.message}\n`}});return R('',e,e?1:0)},
    cat:(a,i)=>{const{ok,err}=readIn(a,i,'cat');return R(ok,err||'',err?1:0)},
    echo:a=>{let nl=true;if(a[0]==='-n'){nl=false;a=a.slice(1)}return R(a.join(' ')+(nl?'\n':''))},
    printf:a=>{if(!a.length)return R('','usage: printf format [arguments]\n',1);let k=1;const s=a[0].replace(/\\n/g,'\n').replace(/\\t/g,'\t').replace(/%[sd]/g,()=>a[k++]??'');return R(s)},
    rm:a=>{const{f,r}=flags(a);let e='';r.forEach(p=>{const n=VFS.get(abs(p));if(!n){if(!f.has('f'))e+=`rm: ${p}: No such file or directory\n`;return}try{VFS.rm(abs(p),f.has('r')||f.has('R'))}catch(er){e+=`rm: ${p}: ${er.message}\n`}});return R('',e,e?1:0)},
    cp:a=>{const{f,r}=flags(a);if(r.length<2)return R('','usage: cp [-r] source target\n',1);try{r.slice(0,-1).forEach(s=>VFS.cp(abs(s),abs(r[r.length-1]),f.has('r')||f.has('R')));return R()}catch(er){return R('',`cp: ${er.message}\n`,1)}},
    mv:a=>{const{r}=flags(a);if(r.length<2)return R('','usage: mv source target\n',1);try{r.slice(0,-1).forEach(s=>VFS.mv(abs(s),abs(r[r.length-1])));return R()}catch(er){return R('',`mv: ${er.message}\n`,1)}},
    head:(a,i)=>{let n=10,fl=[];for(let k=0;k<a.length;k++){if(a[k]==='-n')n=+a[++k];else if(/^-\d+$/.test(a[k]))n=-a[k];else fl.push(a[k])}const{ok,err}=readIn(fl,i,'head');return R(ok.split('\n').slice(0,n).join('\n')+'\n',err||'',err?1:0)},
    tail:(a,i)=>{let n=10,fl=[];for(let k=0;k<a.length;k++){if(a[k]==='-n')n=+a[++k];else if(/^-\d+$/.test(a[k]))n=-a[k];else fl.push(a[k])}const{ok,err}=readIn(fl,i,'tail');const l=ok.replace(/\n$/,'').split('\n');return R(l.slice(-n).join('\n')+'\n',err||'',err?1:0)},
    wc:(a,i)=>{const{f,r}=flags(a);const{ok,err}=readIn(r,i,'wc');const L=ok?ok.split('\n').length-(ok.endsWith('\n')?1:0):0,W=(ok.match(/\S+/g)||[]).length,C=new Blob([ok]).size;const all=!f.size;const p=[];if(all||f.has('l'))p.push(String(L).padStart(8));if(all||f.has('w'))p.push(String(W).padStart(8));if(all||f.has('c'))p.push(String(C).padStart(8));return R(p.join('')+(r.length===1?' '+r[0]:'')+'\n',err||'',err?1:0)},
    grep:(a,i,x)=>{
      const{f,r}=flags(a); if(!r.length)return R('','usage: grep [-invcrF] pattern [file ...]\n',1);
      let re; try{re=new RegExp(f.has('F')?r[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&'):r[0],f.has('i')?'i':'')}catch(e){return R('',`grep: invalid regex\n`,2)}
      const files=r.slice(1); let o='',e='',cnt=0;
      const scan=(txt,label)=>{txt.split('\n').forEach((ln,k,arr)=>{if(k===arr.length-1&&ln==='')return;if(re.test(ln)!==f.has('v')){cnt++;if(!f.has('c'))o+=(label?label+':':'')+(f.has('n')?(k+1)+':':'')+ln+'\n'}})};
      if(!files.length)scan(i||'',''); else files.forEach(fl=>{const p=abs(fl),n=VFS.get(p);if(!n){e+=`grep: ${fl}: No such file or directory\n`;return}
        if(n.t==='d'){if(f.has('r')||f.has('R'))VFS.walk(p,(q,nd)=>{if(nd&&nd.t==='f')scan(nd.d||'',q.replace(cwd+'/',''))});else e+=`grep: ${fl}: Is a directory\n`}
        else scan(n.d||'',files.length>1?fl:'')});
      if(f.has('c'))o=cnt+'\n'; return R(o,e,cnt?0:1);
    },
    find:a=>{let start='.',name=null,type=null;for(let k=0;k<a.length;k++){if(a[k]==='-name')name=a[++k];else if(a[k]==='-type')type=a[++k];else if(!a[k].startsWith('-'))start=a[k]}
      const p=abs(start);if(!VFS.get(p))return R('',`find: ${start}: No such file or directory\n`,1);
      const re=name?new RegExp('^'+name.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$'):null;let o='';
      VFS.walk(p,(q,n)=>{if(!n)return;if(type==='f'&&n.t!=='f')return;if(type==='d'&&n.t!=='d')return;if(re&&!re.test(q.split('/').pop()))return;o+=(start==='.'?'.'+(q===cwd?'':q.slice(cwd.length)):start+q.slice(p.length))+'\n'});return R(o)},
    sort:(a,i)=>{const{f,r}=flags(a);const{ok,err}=readIn(r,i,'sort');let l=ok.replace(/\n$/,'').split('\n');l.sort(f.has('n')?(x,y)=>parseFloat(x)-parseFloat(y):(x,y)=>x.localeCompare(y));if(f.has('r'))l.reverse();if(f.has('u'))l=l.filter((x,k)=>l.indexOf(x)===k);return R(l.join('\n')+'\n',err||'',err?1:0)},
    uniq:(a,i)=>{const{f,r}=flags(a);const{ok}=readIn(r,i,'uniq');const l=ok.replace(/\n$/,'').split('\n'),o=[];l.forEach(x=>{const p=o[o.length-1];if(p&&p[0]===x)p[1]++;else o.push([x,1])});return R(o.map(p=>(f.has('c')?String(p[1]).padStart(4)+' ':'')+p[0]).join('\n')+'\n')},
    rev:(a,i)=>R((i||'').replace(/\n$/,'').split('\n').map(s=>[...s].reverse().join('')).join('\n')+'\n'),
    tee:(a,i)=>{try{a.filter(s=>!s.startsWith('-')).forEach(f=>VFS.write(abs(f),stripAnsi(i||'')));return R(i||'')}catch(e){return R(i||'',`tee: ${e.message}\n`,1)}},
    date:()=>{const d=new Date();return R(`${day(d)} ${mon(d)} ${String(d.getDate()).padStart(2)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getFullYear()}\n`)},
    cal:()=>{const d=new Date(),y=d.getFullYear(),m=d.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate();const title=d.toLocaleDateString('en-US',{month:'long',year:'numeric'});let o=' '.repeat(Math.max(0,Math.floor((20-title.length)/2)))+title+'\nMo Tu We Th Fr Sa Su\n'+'   '.repeat(first);for(let k=1;k<=n;k++){const s=String(k).padStart(2);o+=(k===d.getDate()?CL(7,s):s)+((first+k)%7===0?'\n':' ')}return R(o+'\n')},
    whoami:()=>R('gosc\n'), hostname:()=>R('mgs.local\n'),
    uname:a=>R(a.includes('-a')?`MGS ${SYS.replace(' ','-')} 1.0 ${navigator.platform||'web'} ${navigator.userAgent.includes('Mobile')?'mobile':'x86_64'}\n`:'MGS\n'),
    uptime:()=>{const s=Math.floor(performance.now()/1000),d=new Date();return R(` ${pad(d.getHours())}:${pad(d.getMinutes())}  up ${Math.floor(s/60)} min, 1 user, load averages: 0.${(s%90)+10} 0.${(s%60)+20} 0.${(s%30)+30}\n`)},
    ps:()=>R('  PID TTY           TIME CMD\n'+`${String(100+w.wid).padStart(5)} ttys000    0:00.01 -zsh\n`+procs().map(p=>`${String(p.pid).padStart(5)} ??         0:00.${pad(p.mem%100)} ${p.name}`).join('\n')+'\n'),
    top:()=>R(`Processes: ${procs().length+1} total\nLoad Avg: 0.52, 0.48, 0.41\nCPU usage: ${(3+Math.random()*6).toFixed(1)}% user, ${(1+Math.random()*3).toFixed(1)}% sys\n\n  PID COMMAND            MEM\n`+procs().map(p=>`${String(p.pid).padStart(5)} ${p.name.padEnd(18)} ${p.mem}K`).join('\n')+'\n'),
    kill:a=>{let e='';a.filter(s=>!s.startsWith('-')).forEach(s=>{const o=[...wins.values()].find(x=>200+x.wid*7===+s);if(o)closeWin(o);else e+=`kill: kill ${s} failed: no such process\n`});return R('',e,e?1:0)},
    killall:a=>{const q=(a.filter(s=>!s.startsWith('-'))[0]||'').toLowerCase();const t=[...wins.values()].filter(o=>APPS[o.id].name.toLowerCase()===q||o.id===q);if(!t.length)return R('',`No matching processes belonging to you were found\n`,1);t.forEach(closeWin);return R()},
    df:a=>{const u=VFS.size(VFS.get('/')),h=a.includes('-h');return R(`Filesystem      Size    Used   Avail Capacity  Mounted on\n/dev/disk1s1    ${h?'256Gi':'268435456'}   ${h?fmtSize(u).replace(' ','')+'':u}   ${h?'255Gi':'268000000'}     1%    /\n`)},
    du:a=>{const{f,r}=flags(a);let o='';(r.length?r:['.']).forEach(p=>{const n=VFS.get(abs(p));o+=n?`${f.has('h')?fmtSize(VFS.size(n)).replace(' ',''):VFS.size(n)}\t${p}\n`:`du: ${p}: No such file or directory\n`});return R(o)},
    history:()=>R(hist.map((h,k)=>`${String(k+1).padStart(5)}  ${h}`).join('\n')+'\n'),
    clear:()=>{[...t.children].forEach(c=>{if(c!==line)c.remove()});return R()},
    exit:()=>{setTimeout(()=>w.close(),50);return R()},
    open:a=>{
      const{r}=flags(a); if(a.includes('-a')){const nm=(a[a.indexOf('-a')+1]||'').replace(/\.app$/,'').toLowerCase();const id=Object.keys(APPS).find(k=>APPS[k].name.toLowerCase()===nm||k===nm);if(!id)return R('',`Unable to find application named '${nm}'\n`,1);openApp(id);return R()}
      if(!r.length)return R('','usage: open [-a application] file ...\n',1);
      for(const t_ of r){if(/^https?:\/\//.test(t_))return R(`Strony zewnętrzne otwórz w Przeglądarce: ${t_}\n`);const p=abs(t_);if(!VFS.get(p))return R('',`The file ${p} does not exist.\n`,1);openNode(p)}return R();
    },
    which:a=>R(a.map(c=>CMDS[c]?`/usr/bin/${c}`:`${c} not found`).join('\n')+'\n'),
    export:a=>{a.forEach(s=>{const m=/^(\w+)=(.*)$/.exec(s);if(m)env[m[1]]=m[2]});return R()},
    env:()=>R(Object.entries(env).map(([k,v])=>`${k}=${v}`).join('\n')+'\n'),
    printenv:a=>R(a.length?(env[a[0]]!=null?env[a[0]]+'\n':''):Object.entries(env).map(([k,v])=>`${k}=${v}`).join('\n')+'\n'),
    sleep:async a=>{await sleep(Math.min(3000,(+a[0]||0)*1000));return R()},
    seq:a=>{const n=a.map(Number);const s=n.length>1?n[0]:1,e=n.length>1?n[1]:n[0];if(isNaN(s)||isNaN(e))return R('','usage: seq [first] last\n',1);let o='';for(let k=s;k<=e&&k-s<5000;k++)o+=k+'\n';return R(o)},
    basename:a=>R((a[0]||'').replace(/\/+$/,'').split('/').pop()+'\n'), dirname:a=>R((VFS.split(a[0]||'.')[0]||'/')+'\n'),
    expr:a=>{try{return R(evalMath(a.join(' '))+'\n')}catch(e){return R('','expr: syntax error\n',2)}},
    bc:(a,i)=>{try{return R((a.length?a.join(' '):(i||'')).split('\n').filter(Boolean).map(evalMath).join('\n')+'\n')}catch(e){return R('',`(standard_in) 1: ${e.message}\n`,1)}},
    cowsay:a=>{const m=a.join(' ')||'Muu!';const b='-'.repeat(m.length+2);return R(` ${'_'.repeat(m.length+2)}\n< ${m} >\n ${b}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||\n`)},
    fortune:()=>R(FORTUNES[Math.floor(Math.random()*FORTUNES.length)]+'\n'),
    neofetch:()=>{
      const L=['      .-"""-.      ','    .\'  ___  \'.    ','   /  .\'   \'.  \\   ','  |  |   o   |  |  ','   \\  \'.___.\'  /   ','    \'.       .\'    ','      \'-...-\'      '];
      const I=[CL('1;36','gosc@mgs'),'--------',`${CL('1;36','System')}: ${SYS} 1.0`,`${CL('1;36','Host')}: ${navigator.platform||'przeglądarka'}`,`${CL('1;36','Czas pracy')}: ${Math.max(1,Math.round(performance.now()/60000))} min`,`${CL('1;36','Aplikacje')}: ${BASE_APPS.length+S.installed.length}`,`${CL('1;36','Rozdzielczość')}: ${innerWidth}x${innerHeight}`,`${CL('1;36','Motyw')}: ${isDark()?'ciemny':'jasny'}`,`${CL('1;36','Rdzenie')}: ${navigator.hardwareConcurrency||'?'}`];
      return R(L.map((l,k)=>CL(36,l.padEnd(21))+'  '+(I[k]||'')).join('\n')+'\n'+I.slice(7).map(s=>' '.repeat(23)+s).join('\n')+'\n');
    },
    say:a=>{try{const u=new SpeechSynthesisUtterance(a.join(' '));u.lang='pl-PL';speechSynthesis.speak(u);return R()}catch(e){return R('','say: speech not available\n',1)}},
    brew:async a=>{
      const sub=a[0], nm=(a[1]||'').toLowerCase(), id=BREW[nm];
      if(sub==='list')return R(S.installed.length?S.installed.map(i=>Object.keys(BREW).find(k=>BREW[k]===i)||i).join('\n')+'\n':'');
      if(sub==='search'){const l=Object.keys(BREW).filter(k=>k.includes(nm));return R(l.length?'==> Casks\n'+l.join('\n')+'\n':'No formulae or casks found for "'+nm+'".\n')}
      if(sub==='info'){if(!id)return R('',`Error: No available formula or cask with the name "${nm}".\n`,1);const s=STORE.find(x=>x.id===id);return R(`==> ${nm}: ${s.name}\n${s.desc}\n${S.installed.includes(id)?'Installed':'Not installed'}\n`)}
      if(sub==='install'){
        if(!id)return R('',`Error: No available formula or cask with the name "${nm}".\n`,1);
        if(S.installed.includes(id))return R('',`Warning: ${nm} is already installed.\n`);
        out('==> Fetching '+nm,'d'); await sleep(500); out('######################################################################## 100.0%','d'); await sleep(400);
        out('==> Installing '+nm); await sleep(500); installApp(id); return R(`🍺  ${nm} was successfully installed!\n`.replace('🍺  ',''));
      }
      if(sub==='uninstall'||sub==='remove'){if(!id||!S.installed.includes(id))return R('',`Error: No such keg: ${nm}\n`,1);uninstallApp(id);return R(`==> Uninstalling ${nm}... done\n`)}
      return R('Example usage:\n  brew search [TEXT]\n  brew info [FORMULA]\n  brew install FORMULA\n  brew uninstall FORMULA\n  brew list\n');
    },
    shutdown:a=>{const rb=a.includes('-r');out(rb?'Restarting NOW!':'Shutdown NOW!','d');setTimeout(()=>doPower(rb?'restart':'shutdown'),900);return R()},
    reboot:()=>{out('Restarting NOW!','d');setTimeout(()=>doPower('restart'),900);return R()},
    halt:()=>CMDS.shutdown([]),
    nano:a=>{const f=a.filter(s=>!s.startsWith('-'))[0];if(f){const p=abs(f);const n=VFS.get(p);if(n&&n.t==='d')return R('',`${f}: Is a directory\n`,1);if(!n){try{VFS.write(p,'')}catch(e){return R('',`${f}: ${e.message}\n`,1)}}openApp('textedit',{file:p})}else openApp('textedit',{new:true});return R()},
    tree:a=>{const p=abs(a[0]||'.');if(!VFS.get(p)||VFS.get(p).t!=='d')return R('',`${a[0]||'.'} [error opening dir]\n`,1);return R((a[0]||'.')+'\n'+treeOf(p,'')+'\n')},
    stat:a=>{const n=VFS.get(abs(a[0]||''));if(!n)return R('',`stat: ${a[0]||''}: No such file or directory\n`,1);return R(`  File: ${a[0]}\n  Size: ${VFS.size(n)}\tType: ${n.t==='d'?'directory':'regular file'}\nModify: ${new Date(n.m).toString()}\n`)},
    file:a=>R(a.map(f=>{const n=VFS.get(abs(f));return n?`${f}: ${n.t==='d'?'directory':n.k==='img'?'image':n.k==='app'?'application':n.k==='bin'?'data':'ASCII text'}`:`${f}: cannot open (No such file or directory)`}).join('\n')+'\n'),
    pbcopy:(a,i)=>{pbuf=stripAnsi(i||'');store.set('pbuf',pbuf);try{navigator.clipboard.writeText(pbuf).catch(()=>{})}catch(e){}return R()},
    pbpaste:()=>R(pbuf),
    sw_vers:()=>R(`ProductName:\t${SYS}\nProductVersion:\t1.0\nBuildVersion:\tWEB1\n`),
    chmod:()=>R(), true:()=>R(), false:()=>R('','',1),
    help:()=>R('Dostępne polecenia:\n'+Object.keys(CMDS).sort().join('  ')+'\n\nUżyj "man polecenie", aby zobaczyć opis. Tab uzupełnia nazwy. Strzałki ↑↓ przeglądają historię.\n'),
    man:a=>{if(!a[0])return R('','What manual page do you want?\n',1);return HELPS[a[0]]?R(`${CL(1,a[0].toUpperCase())}(1)\n\n    ${HELPS[a[0]]}\n`):R('',`No manual entry for ${a[0]}\n`,1)}
  };
  ['curl','wget','ping','ssh','telnet','nslookup','traceroute'].forEach(n=>CMDS[n]=()=>R('',`${n}: network access is not available in this sandboxed environment\n`,1));
  CMDS.vi=CMDS.vim=CMDS.code=CMDS.edit=CMDS.nano; CMDS.ll=a=>CMDS.ls(['-l',...a],null,{tty:true}); CMDS.logout=CMDS.exit;

  async function exec(args,input,x){
    let name=args[0];
    if(!name)return R();
    if(name==='sudo'){args=args.slice(1);name=args[0];if(!name)return R('','usage: sudo command\n',1)}
    if(/^\w+=/.test(name)&&args.length===1){const m=/^(\w+)=(.*)$/.exec(name);env[m[1]]=m[2];return R()}
    const f=CMDS[name];
    if(!f)return R('',`zsh: command not found: ${name}\n`,127);
    try{return await f(args.slice(1),input,x)||R()}catch(e){return R('',`${name}: ${e.message}\n`,1)}
  }
  async function run(text){
    const toks=tokenize(text), segs=[]; let cur=[], before=';';
    for(const tk of toks){if(tk.t==='op'&&(tk.v===';'||tk.v==='&&'||tk.v==='||'||tk.v==='&')){segs.push({toks:cur,before});cur=[];before=tk.v==='&'?';':tk.v}else cur.push(tk)}
    segs.push({toks:cur,before});
    for(const s of segs){
      if(!s.toks.length)continue;
      if(s.before==='&&'&&last!==0)continue; if(s.before==='||'&&last===0)continue;
      const cmds=[[]]; s.toks.forEach(tk=>{if(tk.t==='op'&&tk.v==='|')cmds.push([]);else cmds[cmds.length-1].push(tk)});
      let data=null, code=0, redir=null;
      for(let ci=0;ci<cmds.length&&!abort;ci++){
        const toksC=cmds[ci], args=[]; let rd=null;
        for(let k=0;k<toksC.length;k++){
          const tk=toksC[k];
          if(tk.t==='op'&&(tk.v==='>'||tk.v==='>>')){const nx=toksC[k+1];if(nx){rd={file:nx.v,append:tk.v==='>>'};k++}}
          else if(tk.t==='w')glob(tk).forEach(v=>args.push(v));
        }
        const lastC=ci===cmds.length-1;
        const r=await exec(args,data,{tty:lastC&&!rd});
        if(r.e)out(r.e,'e'); data=r.o; code=r.c; if(lastC)redir=rd;
      }
      if(redir){try{VFS.write(abs(redir.file),stripAnsi(data||''),redir.append)}catch(e){out(`zsh: ${e.message}: ${redir.file}\n`,'e');code=1}}
      else if(data)out(data);
      last=code;
    }
  }

  function complete(){
    const pos=inp.selectionStart, before=inp.value.slice(0,pos), m=/(\S*)$/.exec(before), word=m[1];
    const first=!/\s/.test(before.replace(/^\s+/,'').slice(0,before.replace(/^\s+/,'').length))||!before.trim().includes(' ');
    let cands=[], dirPart='', pref=word;
    if(first&&!word.includes('/'))cands=Object.keys(CMDS).filter(c=>c.startsWith(word)).sort();
    else{
      const i=word.lastIndexOf('/'); dirPart=i>=0?word.slice(0,i+1):''; pref=word.slice(i+1);
      try{cands=VFS.list(abs(dirPart||'.')).filter(([n])=>n.startsWith(pref)&&(pref.startsWith('.')||!n.startsWith('.'))).map(([n,nd])=>n+(nd.t==='d'?'/':''))}catch(e){return}
    }
    if(!cands.length)return;
    const esc_=s=>s.replace(/ /g,'\\ ');
    let common=cands[0]; cands.forEach(c=>{while(!c.startsWith(common))common=common.slice(0,-1)});
    const rep=(s,sp)=>{const nv=inp.value.slice(0,pos-word.length)+dirPart+esc_(s)+(sp?' ':'')+inp.value.slice(pos);inp.value=nv;const c=(pos-word.length+dirPart.length+esc_(s).length+(sp?1:0));inp.setSelectionRange(c,c)};
    if(cands.length===1)rep(cands[0],!cands[0].endsWith('/'));
    else if(common.length>pref.length)rep(common,false);
    else out(cands.map(c=>c.endsWith('/')?CL('1;34',c):c).join('  '));
  }

  inp.onkeydown=async e=>{
    if(busy){if(e.ctrlKey&&e.key==='c'){abort=true;e.preventDefault()}return}
    if(e.key==='Enter'){
      const v=inp.value; out(pr.textContent+v); inp.value='';
      if(v.trim()){hist.push(v);if(hist.length>200)hist.shift();store.set('thist',hist)} hi=hist.length;
      busy=true; abort=false; line.style.display='none';
      try{await run(v)}catch(er){out('zsh: '+er.message,'e')}
      busy=false; line.style.display='flex'; setPrompt(); inp.focus(); t.scrollTop=t.scrollHeight;
    }else if(e.key==='ArrowUp'){if(hi>0)inp.value=hist[--hi];e.preventDefault();setTimeout(()=>inp.setSelectionRange(inp.value.length,inp.value.length))}
    else if(e.key==='ArrowDown'){inp.value=hi<hist.length-1?hist[++hi]:(hi=hist.length,'');e.preventDefault()}
    else if(e.key==='Tab'){e.preventDefault();complete()}
    else if(e.ctrlKey&&e.key==='l'){e.preventDefault();CMDS.clear()}
    else if(e.ctrlKey&&e.key==='c'){e.preventDefault();out(pr.textContent+inp.value+'^C');inp.value=''}
    else if(e.ctrlKey&&e.key==='u'){e.preventDefault();inp.value=''}
  };
  t.onclick=()=>{if(!getSelection().toString())inp.focus()};
  t.append(line);
  out('Ostatnie logowanie: '+new Date().toLocaleString('pl-PL')+' na ttys000','d');
  out('Wpisz help, aby zobaczyć polecenia. Spróbuj: ls, cd Documents, cat "Lista zakupów.txt", neofetch','d');
  setPrompt(); setTimeout(()=>inp.focus(),60);
}
