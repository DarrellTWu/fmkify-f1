import { useState, useRef, useEffect, useCallback } from "react";

const DRIVERS = [
  { id:1,  name:"Lando Norris",      team:"McLaren",      num:4   },
  { id:2,  name:"Oscar Piastri",     team:"McLaren",      num:81  },
  { id:3,  name:"Charles Leclerc",   team:"Ferrari",      num:16  },
  { id:4,  name:"Lewis Hamilton",    team:"Ferrari",      num:44  },
  { id:5,  name:"Max Verstappen",    team:"Red Bull",     num:1   },
  { id:6,  name:"Isack Hadjar",      team:"Red Bull",     num:34  },
  { id:7,  name:"George Russell",    team:"Mercedes",     num:63  },
  { id:8,  name:"Kimi Antonelli",    team:"Mercedes",     num:12  },
  { id:9,  name:"Fernando Alonso",   team:"Aston Martin", num:14  },
  { id:10, name:"Lance Stroll",      team:"Aston Martin", num:18  },
  { id:11, name:"Pierre Gasly",      team:"Alpine",       num:10  },
  { id:12, name:"Franco Colapinto",  team:"Alpine",       num:43  },
  { id:13, name:"Alex Albon",        team:"Williams",     num:23  },
  { id:14, name:"Carlos Sainz",      team:"Williams",     num:55  },
  { id:15, name:"Liam Lawson",       team:"Racing Bulls", num:30  },
  { id:16, name:"Arvid Lindblad",    team:"Racing Bulls", num:87  },
  { id:17, name:"Esteban Ocon",      team:"Haas",         num:31  },
  { id:18, name:"Oliver Bearman",    team:"Haas",         num:38  },
  { id:19, name:"Nico Hülkenberg",   team:"Audi",         num:27  },
  { id:20, name:"Gabriel Bortoleto", team:"Audi",         num:5   },
  { id:21, name:"Valtteri Bottas",   team:"Cadillac",     num:77  },
  { id:22, name:"Sergio Pérez",      team:"Cadillac",     num:11  },
];

const TC = {
  "McLaren":"#FF8700","Ferrari":"#DC0000","Red Bull":"#1E41FF","Mercedes":"#27F4D2",
  "Aston Martin":"#229971","Alpine":"#FF87BC","Williams":"#1868DB","Racing Bulls":"#6692FF",
  "Haas":"#B6BABD","Audi":"#FF1E00","Cadillac":"#C0A050",
};

// To flip to self-hosted images later, change F1_CDN and update paths in DRIVER_PHOTOS.
const F1_CDN = "https://media.formula1.com/image/upload/c_fill,g_face,w_480,h_360,y_-30/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000000/common/f1/2026";
const DRIVER_PHOTOS = {
  1:`${F1_CDN}/mclaren/lannor01/2026mclarenlannor01right.webp`,
  2:`${F1_CDN}/mclaren/oscpia01/2026mclarenoscpia01right.webp`,
  3:`${F1_CDN}/ferrari/chalec01/2026ferrarichalec01right.webp`,
  4:`${F1_CDN}/ferrari/lewham01/2026ferrarilewham01right.webp`,
  5:`${F1_CDN}/redbullracing/maxver01/2026redbullracingmaxver01right.webp`,
  6:`${F1_CDN}/redbullracing/isahad01/2026redbullracingisahad01right.webp`,
  7:`${F1_CDN}/mercedes/georus01/2026mercedesgeorus01right.webp`,
  8:`${F1_CDN}/mercedes/andant01/2026mercedesandant01right.webp`,
  9:`${F1_CDN}/astonmartin/feralo01/2026astonmartinferalo01right.webp`,
  10:`${F1_CDN}/astonmartin/lanstr01/2026astonmartinlanstr01right.webp`,
  11:`${F1_CDN}/alpine/piegas01/2026alpinepiegas01right.webp`,
  12:`${F1_CDN}/alpine/fracol01/2026alpinefracol01right.webp`,
  13:`${F1_CDN}/williams/alealb01/2026williamsalealb01right.webp`,
  14:`${F1_CDN}/williams/carsai01/2026williamscarsai01right.webp`,
  15:`${F1_CDN}/racingbulls/lialaw01/2026racingbullslialaw01right.webp`,
  16:`${F1_CDN}/racingbulls/arvlin01/2026racingbullsarvlin01right.webp`,
  17:`${F1_CDN}/haasf1team/estoco01/2026haasf1teamestoco01right.webp`,
  18:`${F1_CDN}/haasf1team/olibea01/2026haasf1teamolibea01right.webp`,
  19:`${F1_CDN}/audi/nichul01/2026audinichul01right.webp`,
  20:`${F1_CDN}/audi/gabbor01/2026audigabbor01right.webp`,
  21:`${F1_CDN}/cadillac/valbot01/2026cadillacvalbot01right.webp`,
  22:`${F1_CDN}/cadillac/serper01/2026cadillacserper01right.webp`,
};

const HELMS = ["🏎️","🏁","⚡","🌟","💨","🏆","🎯","🚀","🦊","🔥","🌪️"];

// ── Storage ─────────────────────────────────────────────────────
// API_BASE: set to "/api/f1" for the /f1 subpath deployment,
// or to a full URL (e.g. "https://www.fmkify.com/api/f1") during local dev.
const API_BASE = "/api/f1";

function emptyTallies() {
  const t = {}; DRIVERS.forEach(d => { t[d.id] = {f:0,m:0,k:0}; });
  return { tallies:t, totalVotes:0 };
}

async function fetchToken() {
  try {
    const r = await fetch(`${API_BASE}/token`);
    if (!r.ok) return null;
    const data = await r.json();
    return data.token || null;
  } catch(e) { return null; }
}

async function loadGlobal() {
  try {
    const r = await fetch(`${API_BASE}/tallies`);
    if (!r.ok) return null;
    return await r.json();
  } catch(e) { return null; }
}

// Returns { data, error } — data is the updated tallies on success,
// error is the parsed error response body on 4xx/5xx.
async function recordVote(vote, token) {
  try {
    const r = await fetch(`${API_BASE}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ f: vote.f, m: vote.m, k: vote.k, token }),
    });
    const body = await r.json();
    if (r.ok) return { data: body, error: null };
    return { data: null, error: body };
  } catch(e) { return { data: null, error: null }; }
}

function randomTrio() {
  // Fisher-Yates shuffle — guarantees uniform distribution across all drivers
  const arr = [...DRIVERS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3);
}

function spawnConfetti() {
  const c = ["#DB7093","#E8A0BF","#FFB696","#ff6b9d","#ffa06b","#aa00ff","#ff1744"];
  for (let i=0;i<50;i++) {
    const el = document.createElement("div");
    Object.assign(el.style, {position:"fixed",borderRadius:"2px",pointerEvents:"none",zIndex:"999",left:Math.random()*100+"vw",top:"-10px",background:c[Math.floor(Math.random()*c.length)],width:(5+Math.random()*8)+"px",height:(5+Math.random()*8)+"px"});
    el.style.animation = `fmk-fall ${.8+Math.random()}s ease-in ${Math.random()*.25}s forwards`;
    document.body.appendChild(el); setTimeout(() => el.remove(), 2200);
  }
}

// ── Keyframes ───────────────────────────────────────────────────
const KF_ID = "fmkify-kf";
if (typeof document !== "undefined" && !document.getElementById(KF_ID)) {
  const s = document.createElement("style"); s.id = KF_ID;
  s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
@keyframes fmk-fall{0%{opacity:1;transform:translateY(0) rotate(0) scale(1)}100%{opacity:0;transform:translateY(100vh) rotate(720deg) scale(.5)}}
@keyframes fmk-deal{0%{opacity:0;transform:translateY(60px) rotate(var(--rot,3deg))}100%{opacity:1;transform:translateY(0) rotate(0)}}
@keyframes fmk-pulse{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
@keyframes fmk-shake{0%,100%{transform:translateX(0) rotate(0)}20%{transform:translateX(-6px) rotate(-2deg)}40%{transform:translateX(5px) rotate(1.5deg)}60%{transform:translateX(-3px) rotate(-1deg)}80%{transform:translateX(2px) rotate(.5deg)}}
@keyframes fmk-shimmer{0%,100%{opacity:0}50%{opacity:1}}
@keyframes fmk-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes fmk-wiggle{0%,100%{transform:rotate(0)}20%{transform:rotate(-2deg)}40%{transform:rotate(2deg)}60%{transform:rotate(-1deg)}80%{transform:rotate(1deg)}}
@keyframes fmk-glow{0%,100%{box-shadow:0 4px 20px rgba(219,112,147,.35)}50%{box-shadow:0 4px 35px rgba(219,112,147,.55)}}
@keyframes fmk-pop{0%{transform:scale(.3);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes fmk-fade{0%{opacity:0}100%{opacity:1}}
@keyframes fmk-drift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(30px,-20px) scale(1.15)}}
@keyframes fmk-slotpop{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}`;
  document.head.appendChild(s);
}

function useIsMobile() {
  const [m,setM] = useState(() => typeof window!=="undefined" && window.innerWidth<=768);
  useEffect(() => { const h=()=>setM(window.innerWidth<=768); window.addEventListener("resize",h); return ()=>window.removeEventListener("resize",h); },[]);
  return m;
}

// ── Driver Card ─────────────────────────────────────────────────
function DriverCard({driver:d,choice,onAssign,dealDelay,dealing,pulseId,rejectedId,dropHover,onDragOver,onDragLeave,cardRefs,isMobile,activeBadge}) {
  const tc = TC[d.team]||"#FF6B9D";
  const [imgOk,setImgOk] = useState(false);
  const [imgErr,setImgErr] = useState(false);
  let cls = "fmk-card";
  if (dealing) cls+=" dealing"; if (choice) cls+=" sel-"+choice;
  if (pulseId===d.id) cls+=" pulse"; if (rejectedId===d.id) cls+=" rejected"; if (dropHover===d.id) cls+=" drop-hover";
  if (activeBadge&&!choice) cls+=" targetable";
  const stampE = choice==='f'?'🔥':choice==='m'?'💍':choice==='k'?'💀':'';
  const stampL = choice==='f'?'F':choice==='m'?'M':choice==='k'?'K':'';
  const style = {};
  if (dealing) { style["--deal-delay"]=dealDelay+"s"; style["--rot"]=(dealDelay===0?'-4':dealDelay<.2?'2':'-3')+"deg"; }
  if (activeBadge&&!choice) style.cursor='pointer';

  const handleCardClick = (e) => {
    // If a badge is active and this card doesn't have a choice yet, assign it
    if (activeBadge && !choice) { onAssign(d.id, activeBadge); return; }
    // If a badge is active and this card already has a choice, reassign (swap)
    if (activeBadge) { onAssign(d.id, activeBadge); return; }
  };

  return (
    <div className={cls} style={style} ref={el=>{if(cardRefs)cardRefs.current[d.id]=el;}}
      onClick={handleCardClick}
      onDragOver={e=>{e.preventDefault();onDragOver?.(d.id);}} onDragLeave={()=>onDragLeave?.()}
      onDrop={e=>{e.preventDefault();const c=e.dataTransfer.getData("text/plain");if(c)onAssign(d.id,c);onDragLeave?.();}}>
      <div className={"fmk-stamp"+(choice?" show "+choice+"-stamp":"")}>
        <span>{stampE}</span><span className="stamp-txt">{stampL}</span>
      </div>
      {choice==='m' && <div className="fmk-shimmer"/>}
      <div className="fmk-banner">
        <div className="team-bg" style={{background:`linear-gradient(160deg,${tc} 0%,${tc}44 100%)`}}/>
        {DRIVER_PHOTOS[d.id]&&!imgErr && <img src={DRIVER_PHOTOS[d.id]} alt={d.name} loading="lazy" className="driver-photo" onLoad={()=>setImgOk(true)} onError={()=>setImgErr(true)} style={{opacity:imgOk?1:0}}/>}
        <div className="fmk-num" style={{opacity:imgOk&&!imgErr?0:1}}>#{d.num}</div>
        {!isMobile && <div className="helm-emoji" style={{opacity:imgOk&&!imgErr?.25:1}}>{HELMS[d.id%HELMS.length]}</div>}
      </div>
      <div className="fmk-info">
        <div className="info-text">
          <div className="driver-name">{d.name}</div>
          {!isMobile && <div className="team-name" style={{color:tc}}><span className="team-dot" style={{background:tc}}/>{d.team}</div>}
        </div>
        <div className="fmk-btns">
          {[{c:'f',e:'🔥',l:'F'},{c:'m',e:'💍',l:'M'},{c:'k',e:'💀',l:'K'}].map(b=>(
            <button key={b.c} className={`fmk-btn ${b.c}-btn${choice===b.c?' active':''}`} onClick={()=>onAssign(d.id,b.c)}>
              <span className="btn-emoji">{b.e}</span><span className="btn-lbl">{b.l}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Game View ───────────────────────────────────────────────────
function GameView({onShowRankings,globalData,onVote}) {
  const [trio,setTrio]=useState(()=>randomTrio());
  const [sels,setSels]=useState({});
  const [showConf,setShowConf]=useState(false);
  const [round,setRound]=useState(1);
  const [dealing,setDealing]=useState(true);
  const [pulseId,setPulseId]=useState(null);
  const [rejectedId,setRejectedId]=useState(null);
  const [dropHover,setDropHover]=useState(null);
  const [ghostDrag,setGhostDrag]=useState(null);
  const [slowdown,setSlowdown]=useState(null); // friendly message from 429 budget_exceeded
  const [activeBadge,setActiveBadge]=useState(null); // tap-to-assign: which badge is "held"
  const [showMilestone,setShowMilestone]=useState(false); // one-time prompt at 10 rounds
  const milestoneShownRef=useRef(false); // ensures milestone only fires once per session
  const busyRef=useRef(false); const cardRefs=useRef({}); const ghostRef=useRef(null);
  const isMobile=useIsMobile();

  useEffect(()=>{setDealing(true);const t=setTimeout(()=>setDealing(false),700);return()=>clearTimeout(t);},[trio]);
  useEffect(()=>{ghostRef.current=ghostDrag;},[ghostDrag]);

  const allDone=useCallback(()=>{const v=trio.map(d=>sels[d.id]).filter(Boolean);return v.includes('f')&&v.includes('m')&&v.includes('k');},[trio,sels]);

  const assign=useCallback((did,ch)=>{
    if(busyRef.current)return;
    setSels(prev=>{const next={};let old=null;
      Object.keys(prev).forEach(id=>{const n=parseInt(id);if(prev[id]===ch&&n!==did){old=n;}else if(n!==did){next[id]=prev[id];}});
      next[did]=ch;if(old){setRejectedId(old);setTimeout(()=>setRejectedId(null),450);}return next;});
    setPulseId(did);setTimeout(()=>setPulseId(null),400);
    setActiveBadge(null);
  },[]);

  const unassign=useCallback((ch)=>{setSels(prev=>{const n={};Object.keys(prev).forEach(id=>{if(prev[id]!==ch)n[id]=prev[id];});return n;});},[]);

  const submit=useCallback(async()=>{
    if(!allDone()||busyRef.current)return; busyRef.current=true;
    // Safety: auto-unlock after 5s in case anything gets stuck
    const safetyTimer = setTimeout(()=>{busyRef.current=false;},5000);
    const vote={}; Object.keys(sels).forEach(id=>{vote[sels[id]]=parseInt(id);});
    const result = await onVote(vote);

    if (result?.error) {
      const err = result.error;
      if (err.error === "budget_exceeded") {
        // Show friendly slowdown overlay — user can resume by refreshing
        setSlowdown(err.message || "You've been playing for a while! Take a quick break and come back in a few minutes.");
        busyRef.current = false;
        return;
      }
      if (err.error === "cooldown") {
        // Silently wait 1 s then retry once
        await new Promise(r => setTimeout(r, 1100));
        const retry = await onVote(vote);
        if (retry?.error) { busyRef.current = false; return; }
      }
      if (err.error === "invalid_token" || err.error === "internal") {
        // Graceful degradation: silently fail, unlock for next attempt
        busyRef.current = false; return;
      }
    }

    // Success path — celebrate
    clearTimeout(safetyTimer);
    const nextRound = round + 1;
    if (nextRound === 11 && !milestoneShownRef.current) {
      // Milestone: show rankings prompt once after 10th vote
      milestoneShownRef.current = true;
      setShowMilestone(true);
      spawnConfetti();
      setRound(nextRound);
      busyRef.current = false;
    } else {
      setShowConf(true); spawnConfetti();
      setTimeout(()=>{setShowConf(false);setTrio(randomTrio());setSels({});setRound(nextRound);busyRef.current=false;},1200);
    }
  },[allDone,sels,onVote,round]);

  const shuffle=()=>{if(!busyRef.current){setTrio(randomTrio());setSels({});setActiveBadge(null);}};
  const clearAll=()=>{setSels({});setActiveBadge(null);};
  const nameForChoice=(c)=>{const d=trio.find(dr=>sels[dr.id]===c);return d?d.name.split(' ').pop():null;};
  const done=allDone();
  const usedChoices={}; Object.values(sels).forEach(c=>{usedChoices[c]=true;});

  const onTouchStart=useCallback((ch,e)=>{e.preventDefault();const t=e.touches[0];setGhostDrag({choice:ch,x:t.clientX,y:t.clientY});},[]);
  const onTouchMove=useCallback((e)=>{const g=ghostRef.current;if(!g)return;e.preventDefault();const t=e.touches[0];setGhostDrag({choice:g.choice,x:t.clientX,y:t.clientY});let hov=null;trio.forEach(d=>{const el=cardRefs.current[d.id];if(el){const r=el.getBoundingClientRect();if(t.clientX>=r.left&&t.clientX<=r.right&&t.clientY>=r.top&&t.clientY<=r.bottom)hov=d.id;}});setDropHover(hov);},[trio]);
  const onTouchEnd=useCallback(()=>{const g=ghostRef.current;if(!g)return;if(dropHover)assign(dropHover,g.choice);setGhostDrag(null);setDropHover(null);},[dropHover,assign]);

  return (<>
    <div className="fmk-app">
      <div className="fmk-topbar">
        <div className="fmk-logo">🏎️ <span className="accent">FMKify</span></div>
        <div className="round-pill">Round {round}</div>
        <button className="btn-icon" onClick={onShowRankings}><span>📊</span><span className="btn-label">Rankings</span></button>
      </div>
      <div className="fmk-instruct">
        <div style={{fontSize:'1rem',fontWeight:700,color:'rgba(255,255,255,.65)',marginBottom:'.1rem'}}>2026 Grid Edition</div>
        <div style={{fontSize:'.78rem',color:'rgba(255,255,255,.3)',marginBottom:'.3rem',fontStyle:'italic'}}>22 drivers. 3 at a time. No wrong answers. Some questionable ones.</div>
        Drag or tap <b style={{color:'#ff1744'}}>F🔥</b>{' '}<b style={{color:'#2979ff'}}>M💍</b>{' '}<b style={{color:'#aa00ff'}}>K💀</b> … you know the rules.
      </div>

      {!isMobile && <div className="fmk-badge-bar">
        {[{c:'f',e:'🔥',l:'F',dl:0},{c:'m',e:'💍',l:'M',dl:1},{c:'k',e:'💀',l:'K',dl:2}].map(b=>{
          const isUsed=!!usedChoices[b.c];
          const isPicked=activeBadge===b.c;
          return <div key={b.c} className={`drag-badge ${b.c}-badge${isUsed?' used':''}${isPicked?' picked':''}`} style={{animationDelay:isUsed?undefined:b.dl+'s'}}
            draggable={!isUsed&&!isPicked} onClick={()=>{if(isUsed){unassign(b.c);}else{setActiveBadge(prev=>prev===b.c?null:b.c);}}}
            onDragStart={e=>{if(isUsed||isPicked){e.preventDefault();return;}e.dataTransfer.setData("text/plain",b.c);e.dataTransfer.effectAllowed="move";}}
            onTouchStart={e=>{if(!isUsed)onTouchStart(b.c,e);}} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <span>{b.e}</span><span className="badge-label">{b.l}</span>
          </div>;
        })}
      </div>}

      <div className="fmk-cards-grid">
        {trio.map((d,i)=><DriverCard key={d.id} driver={d} choice={sels[d.id]||null} onAssign={assign} dealDelay={i*.1} dealing={dealing} pulseId={pulseId} rejectedId={rejectedId} dropHover={dropHover} onDragOver={id=>setDropHover(id)} onDragLeave={()=>setDropHover(null)} cardRefs={cardRefs} isMobile={isMobile} activeBadge={activeBadge}/>)}
      </div>

      <div className="fmk-action-row">
        <button className="action-sm" onClick={clearAll}>↩️ Clear</button>
        <button className="action-sm" onClick={shuffle}>🔀 Shuffle</button>
      </div>

      {done&&!isMobile && <div className="fmk-submit-bar"><button className="btn-submit" onClick={submit}>✨ Submit Vote ✨</button></div>}

      {!isMobile && <Footer/>}

      {showConf && <div className="fmk-confetti-overlay"><div className="confetti-card">
        <div className="big-emoji">🎉</div><div className="conf-msg">Vote Recorded!</div><div className="round-text">Next round loading...</div>
      </div></div>}

      {slowdown && <div className="fmk-confetti-overlay" style={{pointerEvents:'auto'}}>
        <div className="confetti-card" style={{maxWidth:'340px'}}>
          <div className="big-emoji">☕</div>
          <div className="conf-msg" style={{fontSize:'1.3rem'}}>{slowdown}</div>
          <button className="btn-back" style={{marginTop:'1rem'}} onClick={()=>window.location.reload()}>🔄 Refresh & Resume</button>
        </div>
      </div>}

      {showMilestone && <div className="fmk-confetti-overlay" style={{pointerEvents:'auto'}}>
        <div className="confetti-card" style={{maxWidth:'360px'}}>
          <div className="big-emoji">🔥</div>
          <div className="conf-msg">10 rounds deep!</div>
          <div className="round-text" style={{marginBottom:'1rem'}}>You're officially invested. Want to see how your picks compare?</div>
          <button className="btn-submit" style={{width:'100%',marginBottom:'.5rem'}} onClick={()=>{setShowMilestone(false);onShowRankings();}}>📊 Check the Rankings</button>
          <button className="btn-back" onClick={()=>{setShowMilestone(false);setTrio(randomTrio());setSels({});busyRef.current=false;}}>Keep Playing</button>
        </div>
      </div>}

      {ghostDrag && <div className={`ghost-badge ${ghostDrag.choice}-ghost`} style={{left:ghostDrag.x+'px',top:ghostDrag.y+'px'}}>
        {ghostDrag.choice==='f'?'🔥':ghostDrag.choice==='m'?'💍':'💀'}
      </div>}
    </div>

    {isMobile && <div className="fmk-sticky">
      <div className="sticky-slots">
        {[{c:'f',e:'🔥',l:'F'},{c:'m',e:'💍',l:'M'},{c:'k',e:'💀',l:'K'}].map(s=>{
          const name=nameForChoice(s.c);
          return <div key={s.c} className={`sticky-slot${name?' filled':''}`} onClick={()=>{if(name)unassign(s.c);}} style={{cursor:name?'pointer':'default'}}>
            <span>{s.e}</span><span style={{fontWeight:700,fontSize:'.75rem'}}>{s.l}</span><span>= </span>
            {name?<span className="slot-name" key={name}>{name}</span>:<span style={{opacity:.4}}>?</span>}
          </div>;
        })}
      </div>
      <button className={`sticky-submit${done?' ready pulse-glow':''}`} onClick={submit}>✨ Submit Vote ✨</button>
    </div>}
  </>);
}

// ── Superlatives config ─────────────────────────────────────────
const SUPERLATIVES = [
  { key:"fboy",        emoji:"🔥", label:"Biggest F-Boy",    sub:"All heat, no commitment.",               formula:"Highest 🔥 to 💍 ratio" },
  { key:"husband",     emoji:"💎", label:"Husband Material",  sub:"More rings than flings.",                formula:"Highest 💍 to 🔥 ratio" },
  { key:"loved",       emoji:"😍", label:"Most Loved",       sub:"Whether it's a fling or forever, they're wanted.", formula:"Highest 🔥+💍 %" },
  { key:"polarizing",  emoji:"😈", label:"Most Polarizing",  sub:"Nobody can agree on this one.",          formula:"Most even 🔥 💍 💀 split" },
];

function computeScore(d, key, usePercent) {
  const total = d.f + d.m + d.k;
  if (total === 0) return 0;
  if (key === "f") return usePercent ? d.f / total : d.f;
  if (key === "m") return usePercent ? d.m / total : d.m;
  if (key === "k") return usePercent ? d.k / total : d.k;
  switch(key) {
    case "fboy":       return d.m > 0 ? d.f / d.m : d.f;
    case "husband":    return d.f > 0 ? d.m / d.f : d.m;
    case "loved":      return (d.f + d.m) / total;
    case "polarizing": { const max = Math.max(d.f, d.m, d.k); return 1 - (max / total); }
    default: return 0;
  }
}

function formatRatio(score, key) {
  if (key === "loved" || key === "polarizing") return Math.round(score * 100) + "%";
  return score.toFixed(2);
}

// ── Rankings View ───────────────────────────────────────────────
function RankingsView({onBack,globalData}) {
  const [sortBy,setSortBy]=useState("f");
  const [usePercent,setUsePercent]=useState(false);
  const tallies=globalData?.tallies||{}; const total=globalData?.totalVotes||0;
  const isSuperlative=SUPERLATIVES.some(s=>s.key===sortBy);
  const activeSuperlative=SUPERLATIVES.find(s=>s.key===sortBy);

  const rankings=DRIVERS.map(d=>{
    const t=tallies[d.id]||{f:0,m:0,k:0};
    const row={driver:d,f:t.f,m:t.m,k:t.k};
    row.score=computeScore(row,sortBy,usePercent);
    return row;
  }).sort((a,b)=>b.score-a.score);

  const medal=i=>i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`;

  return (
    <div className="fmk-rankings-shell">
      <div className="fmk-topbar">
        <div className="fmk-logo">🏆 <span className="accent">FMKify</span> Rankings</div><div/>
        <button className="btn-icon" onClick={onBack}><span>←</span><span className="btn-label">Back</span></button>
      </div>
      <div className="rank-header"><div className="rank-stat">{total.toLocaleString()}</div><div className="rank-stat-label">community votes</div></div>

      {/* Core F/M/K pills */}
      <div className="sort-pills">
        {[{c:'f',e:'🔥',l:'F'},{c:'m',e:'💍',l:'M'},{c:'k',e:'💀',l:'K'}].map(p=>
          <button key={p.c} className={`pill${sortBy===p.c?` active-${p.c}`:''}`} onClick={()=>setSortBy(p.c)}>{p.e} {p.l}</button>
        )}
      </div>

      {/* Superlative pills */}
      <div className="super-section">
        <div className="super-label">Superlatives</div>
        <div className="super-pills">
          {SUPERLATIVES.map(s=>
            <button key={s.key} className={`super-pill${sortBy===s.key?' active':''}`} onClick={()=>setSortBy(s.key)}>
              <span className="sp-emoji">{s.emoji}</span><span className="sp-label">{s.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* Active superlative description */}
      {activeSuperlative && <div className="mode-desc">
        <span className="mode-emoji">{activeSuperlative.emoji}</span>
        <span className="mode-title">{activeSuperlative.label}</span>
        <span className="mode-sub">{activeSuperlative.sub}</span>
        <span className="mode-formula">{activeSuperlative.formula}</span>
      </div>}

      {/* # / % toggle — only for core F/M/K */}
      {!isSuperlative && <div className="toggle-row">
        <div className="pct-toggle">
          <button className={`toggle-btn${!usePercent?' active':''}`} onClick={()=>setUsePercent(false)}># Count</button>
          <button className={`toggle-btn${usePercent?' active':''}`} onClick={()=>setUsePercent(true)}>% of Total</button>
        </div>
      </div>}

      <div className="rankings-scroll">
        {total>0?rankings.map((st,i)=>{const tc=TC[st.driver.team]||"#888";return(
          <div key={st.driver.id} className={`rank-card${i<3?' top':''}`}>
            <div className="rank-pos">{medal(i)}</div>
            <div className="r-stripe" style={{background:tc}}/>
            <div className="r-info"><div className="r-name">{st.driver.name}</div><div className="r-team">{st.driver.team}</div></div>
            {isSuperlative ? (
              <div className="rank-stats">
                <span className="stat-pip ratio-pip">{formatRatio(st.score,sortBy)}</span>
                <div className="raw-counts">
                  <span className="mini-stat fc">🔥{st.f}</span>
                  <span className="mini-stat mc">💍{st.m}</span>
                  <span className="mini-stat kc">💀{st.k}</span>
                </div>
              </div>
            ) : (
              <div className="rank-stats">
                {[{c:'f',v:st.f},{c:'m',v:st.m},{c:'k',v:st.k}].map(s=>{
                  const dTotal=st.f+st.m+st.k;
                  const display=usePercent&&dTotal>0?Math.round((s.v/dTotal)*100)+"%":s.v;
                  return <span key={s.c} className={`stat-pip ${s.c}c${sortBy===s.c?' hl':''}`}>{s.c==='f'?'🔥':s.c==='m'?'💍':'💀'}{display}</span>;
                })}
              </div>
            )}
          </div>);})
        :<div className="empty-msg"><div className="big">🏁</div><div>No votes yet — go play!</div></div>}
      </div>
      <Footer/>
      <div className="back-bar"><button className="btn-back" onClick={onBack}>← Back to Game</button></div>
    </div>
  );
}

// ── Footer ──────────────────────────────────────────────────────
function Footer() {
  return (
    <div className="fmk-footer">
      <div className="footer-row">
        <a href="/" className="footer-link">FMKify</a>
        <span className="footer-sep">·</span>
        <a href="mailto:admin@fmkify.com" className="footer-link">admin@fmkify.com</a>
      </div>
      <a href="/" className="footer-cta">🗳️ Want NBA, WWE, or Love Island next? Vote on the homepage →</a>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────────
function getInitialView() {
  if (typeof window === "undefined") return "game";
  const p = window.location.pathname.replace(/\/+$/, "");
  return p.endsWith("/rankings") ? "rankings" : "game";
}

export default function App() {
  const [view,setView]=useState(getInitialView);
  const [globalData,setGlobalData]=useState(null);
  const [loading,setLoading]=useState(true);
  const tokenRef=useRef(null);
  const lastFetchRef=useRef(0);

  // Sync browser back/forward buttons with view state
  useEffect(()=>{
    const onPop = () => {
      const p = window.location.pathname.replace(/\/+$/, "");
      setView(p.endsWith("/rankings") ? "rankings" : "game");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  },[]);

  const navigateTo = useCallback((target) => {
    const path = target === "rankings" ? "/f1/rankings/" : "/f1/";
    window.history.pushState(null, "", path);
    setView(target);
  },[]);

  useEffect(()=>{(async()=>{
    // Only fetch tallies on mount — token is lazy-fetched on first vote
    const d = await loadGlobal();
    setGlobalData(d || emptyTallies());
    lastFetchRef.current = Date.now();
    setLoading(false);
  })();},[]);

  // Re-fetch tallies when switching to rankings, but skip if data is fresh (<30s)
  useEffect(()=>{
    if (view==="rankings" && Date.now() - lastFetchRef.current > 30000) {
      loadGlobal().then(d=>{if(d){setGlobalData(d);lastFetchRef.current=Date.now();}});
    }
  },[view]);

  const handleVote=useCallback(async(vote)=>{
    // Lazy-fetch token on first vote — saves 2-3 Redis commands for non-voters
    if (!tokenRef.current) {
      tokenRef.current = await fetchToken();
    }
    const result = await recordVote(vote, tokenRef.current);
    if (result.data) { setGlobalData(result.data); lastFetchRef.current = Date.now(); }
    // Clear cached token on auth failure so next attempt fetches a fresh one
    if (result.error?.error === "invalid_token") tokenRef.current = null;
    // Return the full result so GameView submit can handle errors
    return result;
  },[]);

  return (<>
    <div className="fmk-blob fmk-blob-1"/><div className="fmk-blob fmk-blob-2"/>
    <div className="fmk-root">
      {loading
        ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontFamily:"'Fredoka',sans-serif"}}>
            <div style={{textAlign:'center'}}><div style={{fontSize:'3rem',animation:'fmk-bob 1.5s ease-in-out infinite'}}>🏎️</div>
            <div style={{fontSize:'1.2rem',fontWeight:700,color:'rgba(255,255,255,.6)',marginTop:'1rem'}}>Loading FMKify...</div></div></div>
        : view==="game"
          ? <GameView onShowRankings={()=>navigateTo("rankings")} globalData={globalData} onVote={handleVote}/>
          : <RankingsView onBack={()=>navigateTo("game")} globalData={globalData}/>}
    </div>
    <style>{CSS}</style>
  </>);
}

const CSS = `
html,body{margin:0;padding:0;min-height:100%;background:linear-gradient(155deg,#160a14 0%,#261222 25%,#2e1628 50%,#180c16 100%)}
:root{--pink:#DB7093;--orange:#E8A0BF;--yellow:#FFB696;--f-color:#ff1744;--f-bg:linear-gradient(135deg,#ff5252,#ff1744);--f-glow:rgba(255,23,68,.45);--m-color:#2979ff;--m-bg:linear-gradient(135deg,#448aff,#2979ff);--m-glow:rgba(41,121,255,.45);--k-color:#aa00ff;--k-bg:linear-gradient(135deg,#e040fb,#aa00ff);--k-glow:rgba(170,0,255,.45);--radius:1.5rem;--radius-sm:1rem}
.fmk-blob{position:fixed;border-radius:50%;pointer-events:none;z-index:0;filter:blur(80px)}
.fmk-blob-1{width:500px;height:500px;background:radial-gradient(circle,rgba(219,112,147,.25),transparent 70%);top:-15%;right:-10%;animation:fmk-drift 18s ease-in-out infinite alternate}
.fmk-blob-2{width:400px;height:400px;background:radial-gradient(circle,rgba(255,182,150,.15),transparent 70%);bottom:-10%;left:-8%;animation:fmk-drift 14s ease-in-out infinite alternate-reverse}
.fmk-root{position:relative;z-index:1;min-height:100%;font-family:'Fredoka','Segoe UI',system-ui,sans-serif;color:#e0e0e0;-webkit-tap-highlight-color:transparent;background:linear-gradient(155deg,#160a14 0%,#261222 25%,#2e1628 50%,#180c16 100%)}
.fmk-app{display:flex;flex-direction:column;height:100vh;max-width:1100px;margin:0 auto;overflow:hidden}
.fmk-topbar{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.25rem;flex-shrink:0}
.fmk-logo{font-size:1.4rem;font-weight:700;color:#fff;letter-spacing:-.5px}
.fmk-logo .accent{background:linear-gradient(135deg,var(--pink),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.round-pill{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:2rem;padding:.3rem .85rem;font-size:.8rem;font-weight:600;color:rgba(255,255,255,.6)}
.btn-icon{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:2rem;height:38px;padding:0 .85rem;display:flex;align-items:center;justify-content:center;gap:.35rem;font-size:.82rem;font-weight:600;cursor:pointer;transition:background .2s,transform .2s;color:rgba(255,255,255,.7);font-family:inherit}
.btn-icon:hover{background:rgba(255,255,255,.15);transform:scale(1.04)}
.btn-icon .btn-label{letter-spacing:.02em}
.fmk-instruct{text-align:center;padding:.1rem 1.25rem .4rem;font-size:.85rem;color:rgba(255,255,255,.4);flex-shrink:0}
.fmk-cards-grid{flex:1;display:flex;gap:1rem;padding:0.25rem 1.5rem;justify-content:center;align-items:center;min-height:0}
.fmk-card{flex:1;max-width:320px;border-radius:var(--radius);overflow:hidden;background:#251520;border:2px solid rgba(255,255,255,.07);box-shadow:0 8px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;position:relative;transition:transform .4s cubic-bezier(.4,0,.2,1),box-shadow .4s,border-color .4s,filter .4s;will-change:transform}
.fmk-card.dealing{opacity:0;transform:translateY(60px) rotate(var(--rot,3deg));animation:fmk-deal .55s cubic-bezier(.34,1.56,.64,1) forwards;animation-delay:var(--deal-delay,0s)}
.fmk-card.sel-f{border-color:var(--f-color);box-shadow:0 0 40px var(--f-glow),0 8px 40px rgba(0,0,0,.3);transform:rotate(-1.5deg) scale(1.02)}
.fmk-card.sel-m{border-color:var(--m-color);box-shadow:0 0 40px var(--m-glow),0 8px 40px rgba(0,0,0,.3)}
.fmk-card.sel-k{border-color:var(--k-color);box-shadow:0 0 40px var(--k-glow),0 8px 40px rgba(0,0,0,.3);filter:saturate(.4) brightness(.85);transform:rotate(2deg) scale(.97)}
.fmk-card.pulse{animation:fmk-pulse .35s ease}
.fmk-card.rejected{animation:fmk-shake .4s ease}
.fmk-card.drop-hover{border-color:rgba(255,255,255,.6)!important;box-shadow:0 0 40px rgba(255,255,255,.2),0 8px 40px rgba(0,0,0,.3)!important;transform:scale(1.03)}
.fmk-stamp{position:absolute;top:35%;left:50%;transform:translate(-50%,-50%) rotate(-15deg) scale(0);z-index:10;pointer-events:none;opacity:0;transition:transform .35s cubic-bezier(.17,.67,.35,1.5),opacity .3s;font-size:3.5rem;font-weight:700;text-shadow:0 4px 30px rgba(0,0,0,.6);display:flex;align-items:center;gap:.3rem;padding:.3rem 1rem;border-radius:1rem;border:4px solid}
.fmk-stamp.show{transform:translate(-50%,-50%) rotate(-15deg) scale(1);opacity:.75}
.fmk-stamp.f-stamp{color:var(--f-color);border-color:var(--f-color);background:rgba(255,23,68,.12)}
.fmk-stamp.m-stamp{color:var(--m-color);border-color:var(--m-color);background:rgba(41,121,255,.12)}
.fmk-stamp.k-stamp{color:var(--k-color);border-color:var(--k-color);background:rgba(170,0,255,.12)}
.stamp-txt{font-size:2.2rem}
.fmk-shimmer{position:absolute;inset:0;z-index:5;pointer-events:none;border-radius:var(--radius);background:linear-gradient(120deg,transparent 30%,rgba(219,112,147,.06) 50%,transparent 70%);animation:fmk-shimmer 2s ease-in-out infinite}
.fmk-banner{display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.fmk-banner .team-bg{position:absolute;inset:0;opacity:.85}
.fmk-banner .fmk-num{position:absolute;font-size:clamp(4rem,12vw,7rem);font-weight:700;color:rgba(255,255,255,.18);line-height:1;transition:opacity .4s;z-index:1}
.fmk-banner .driver-photo{position:relative;z-index:2;width:100%;display:block;transition:opacity .5s;filter:drop-shadow(0 6px 20px rgba(0,0,0,.5))}
.fmk-banner .helm-emoji{position:absolute;font-size:clamp(2.5rem,7vw,3.5rem);bottom:10%;right:8%;filter:drop-shadow(0 4px 12px rgba(0,0,0,.3));transition:opacity .4s;z-index:3}
.fmk-info{padding:.7rem 1.2rem .6rem;background:linear-gradient(to top,rgba(25,12,22,.98) 55%,rgba(25,12,22,.82))}
.driver-name{font-size:clamp(1.2rem,3.5vw,1.5rem);font-weight:700;color:#fff;line-height:1.15;margin-bottom:.1rem}
.team-name{font-size:.8rem;font-weight:600;display:flex;align-items:center;gap:.4rem;margin-bottom:.6rem}
.team-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.fmk-btns{display:flex;gap:.5rem;justify-content:center;padding:.1rem 0 .3rem}
.fmk-btn{height:48px;padding:0 .7rem;border-radius:2rem;border:2.5px solid;background:rgba(255,255,255,.04);cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;gap:.2rem;transition:transform .2s,box-shadow .2s,background .2s;font-family:inherit}
.fmk-btn .btn-emoji{font-size:1.1rem}
.fmk-btn .btn-lbl{font-size:.75rem;font-weight:700;font-family:inherit;color:rgba(255,255,255,.7)}
.fmk-btn:active{transform:scale(.88)!important}
.f-btn{border-color:var(--f-color)}.f-btn:hover{box-shadow:0 0 20px var(--f-glow);background:rgba(255,23,68,.1);transform:scale(1.1)}.f-btn.active{background:var(--f-bg);box-shadow:0 0 28px var(--f-glow)}
.m-btn{border-color:var(--m-color)}.m-btn:hover{box-shadow:0 0 20px var(--m-glow);background:rgba(41,121,255,.1);transform:scale(1.1)}.m-btn.active{background:var(--m-bg);box-shadow:0 0 28px var(--m-glow)}
.k-btn{border-color:var(--k-color)}.k-btn:hover{box-shadow:0 0 20px var(--k-glow);background:rgba(170,0,255,.1);transform:scale(1.1)}.k-btn.active{background:var(--k-bg);box-shadow:0 0 28px var(--k-glow)}
.fmk-badge-bar{display:flex;justify-content:center;gap:1rem;padding:.5rem 0;flex-shrink:0}
.drag-badge{display:flex;align-items:center;gap:.45rem;padding:.4rem .9rem .4rem .55rem;border-radius:2rem;border:2.5px solid;background:rgba(255,255,255,.06);cursor:grab;font-size:1.2rem;font-weight:700;transition:transform .25s,box-shadow .25s,opacity .35s,filter .35s;animation:fmk-bob 3s ease-in-out infinite;user-select:none}
.badge-label{font-size:.82rem;font-weight:700;letter-spacing:.03em}
.drag-badge:active{cursor:grabbing}
.f-badge{border-color:var(--f-color);color:var(--f-color)}.f-badge .badge-label{color:var(--f-color)}
.m-badge{border-color:var(--m-color);color:var(--m-color)}.m-badge .badge-label{color:var(--m-color)}
.k-badge{border-color:var(--k-color);color:var(--k-color)}.k-badge .badge-label{color:var(--k-color)}
.drag-badge:hover{transform:scale(1.1)}
.drag-badge.used{opacity:.25;filter:grayscale(.8);cursor:pointer;pointer-events:auto!important;animation:none;transform:scale(.92)}
.drag-badge.used:hover{opacity:.5;filter:grayscale(.4);transform:scale(1)}
.drag-badge.picked{animation:fmk-pulse .6s ease-in-out infinite;cursor:pointer;transform:scale(1.15)}
.f-badge.picked{box-shadow:0 0 24px var(--f-glow);background:rgba(255,23,68,.15)}
.m-badge.picked{box-shadow:0 0 24px var(--m-glow);background:rgba(41,121,255,.15)}
.k-badge.picked{box-shadow:0 0 24px var(--k-glow);background:rgba(170,0,255,.15)}
.fmk-card.targetable{border-color:rgba(255,255,255,.25);animation:fmk-pulse 1.5s ease-in-out infinite}
.ghost-badge{position:fixed;width:54px;height:54px;border-radius:50%;font-size:1.5rem;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:200;opacity:.85;transform:translate(-50%,-50%) scale(1.2);border:3px solid}
.f-ghost{border-color:var(--f-color);background:rgba(255,23,68,.25)}
.m-ghost{border-color:var(--m-color);background:rgba(41,121,255,.25)}
.k-ghost{border-color:var(--k-color);background:rgba(170,0,255,.25)}
.fmk-sticky{position:fixed;bottom:0;left:0;right:0;z-index:50;background:rgba(22,10,20,.75);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid rgba(255,255,255,.08);padding:.5rem 1rem;padding-bottom:calc(.5rem + env(safe-area-inset-bottom,0px));display:none;touch-action:manipulation}
.sticky-slots{display:flex;justify-content:center;gap:.8rem;margin-bottom:.4rem}
.sticky-slot{display:flex;align-items:center;gap:.3rem;font-size:.8rem;font-weight:600;color:rgba(255,255,255,.4);padding:.25rem .6rem;background:rgba(255,255,255,.04);border-radius:.6rem;border:1px solid rgba(255,255,255,.06);min-width:80px;transition:all .3s}
.sticky-slot.filled{color:#fff;border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.08)}
.sticky-slot .slot-name{animation:fmk-slotpop .3s cubic-bezier(.17,.67,.35,1.5)}
.sticky-submit{font-family:inherit;font-size:1rem;font-weight:700;padding:.7rem;border:none;border-radius:3rem;cursor:pointer;background:linear-gradient(135deg,#DB7093,#E8A0BF);color:#fff;box-shadow:0 4px 20px rgba(219,112,147,.35);width:100%;transition:transform .2s,opacity .3s;opacity:0;pointer-events:none;transform:translateY(10px);touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.sticky-submit.ready{opacity:1;pointer-events:auto;transform:translateY(0);animation:fmk-wiggle .5s ease .2s}
.sticky-submit:active{transform:scale(.96)}
.sticky-submit.pulse-glow{animation:fmk-glow 1.5s ease-in-out infinite}
.fmk-submit-bar{padding:.6rem 1.25rem 1.25rem;flex-shrink:0;display:flex;justify-content:center}
.btn-submit{font-family:inherit;font-size:1.15rem;font-weight:700;padding:.9rem 2.5rem;border:none;border-radius:3rem;cursor:pointer;background:linear-gradient(135deg,#DB7093,#E8A0BF);color:#fff;box-shadow:0 6px 30px rgba(219,112,147,.35);transition:transform .2s;width:100%;max-width:400px;animation:fmk-wiggle .5s ease .15s,fmk-glow 1.5s ease-in-out .7s infinite}
.btn-submit:hover{transform:scale(1.04)}.btn-submit:active{transform:scale(.97)}
.fmk-action-row{display:flex;justify-content:center;gap:1rem;padding:.3rem 0 .5rem;flex-shrink:0}
.action-sm{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);border-radius:2rem;padding:.4rem 1rem;font-family:inherit;font-size:.82rem;font-weight:600;color:rgba(255,255,255,.5);cursor:pointer;transition:background .2s,transform .2s;display:flex;align-items:center;gap:.3rem}
.action-sm:hover{background:rgba(255,255,255,.1);transform:scale(1.05)}.action-sm:active{transform:scale(.95)}
.fmk-confetti-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:100;pointer-events:none;background:rgba(0,0,0,.35);animation:fmk-fade .3s}
.confetti-card{background:rgba(37,21,32,.95);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);border-radius:var(--radius);padding:2rem 2.5rem;box-shadow:0 12px 60px rgba(0,0,0,.4);text-align:center;animation:fmk-pop .3s cubic-bezier(.17,.67,.35,1.5)}
.big-emoji{font-size:3.5rem;margin-bottom:.5rem}
.conf-msg{font-size:1.8rem;font-weight:700;background:linear-gradient(135deg,var(--pink),var(--orange),var(--yellow));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.round-text{margin-top:.4rem;font-size:.85rem;color:rgba(255,255,255,.35);font-weight:600}
.fmk-rankings-shell{display:flex;flex-direction:column;height:100%;max-width:600px;margin:0 auto;overflow:hidden}
.rankings-scroll{flex:1;overflow-y:auto;padding:0 1rem 2rem;-webkit-overflow-scrolling:touch}
.rankings-scroll::-webkit-scrollbar{width:4px}.rankings-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}
.rank-header{text-align:center;padding:.75rem 0}
.rank-stat{font-size:2rem;font-weight:700;background:linear-gradient(135deg,var(--pink),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.rank-stat-label{font-size:.8rem;color:rgba(255,255,255,.35);font-weight:600}
.sort-pills{display:flex;justify-content:center;gap:.5rem;padding:.5rem 0 .75rem;flex-shrink:0}
.pill{font-family:inherit;font-size:.85rem;font-weight:700;padding:.45rem 1.1rem;border:1.5px solid rgba(255,255,255,.1);border-radius:2rem;cursor:pointer;background:transparent;color:rgba(255,255,255,.45);transition:all .2s}
.pill:hover{border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.6)}
.pill.active-f{background:var(--f-bg);border-color:var(--f-color);color:#fff}
.pill.active-m{background:var(--m-bg);border-color:var(--m-color);color:#fff}
.pill.active-k{background:var(--k-bg);border-color:var(--k-color);color:#fff}
.rank-card{display:flex;align-items:center;gap:.75rem;padding:.75rem .85rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:var(--radius-sm);margin-bottom:.45rem;transition:background .2s}
.rank-card.top{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1)}
.rank-pos{font-size:1.25rem;font-weight:700;width:2rem;text-align:center;flex-shrink:0}
.r-info{flex:1;min-width:0}
.r-name{font-weight:700;font-size:.9rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.r-team{font-size:.7rem;color:rgba(255,255,255,.3);font-weight:600}
.r-stripe{width:4px;border-radius:2px;align-self:stretch;flex-shrink:0}
.rank-stats{display:flex;gap:.35rem;flex-shrink:0}
.stat-pip{font-size:1rem;font-weight:700;padding:.35rem .7rem;border-radius:.4rem;background:rgba(255,255,255,.05);transition:all .2s}
.stat-pip.fc{color:#ff9eae}.stat-pip.mc{color:#9ec4ff}.stat-pip.kc{color:#d9a8ff}
.stat-pip.hl{font-size:1.1rem}
.stat-pip.hl.fc{color:#fff;background:rgba(255,23,68,.35);box-shadow:0 0 14px rgba(255,23,68,.3)}
.stat-pip.hl.mc{color:#fff;background:rgba(41,121,255,.35);box-shadow:0 0 14px rgba(41,121,255,.3)}
.stat-pip.hl.kc{color:#fff;background:rgba(170,0,255,.35);box-shadow:0 0 14px rgba(170,0,255,.3)}
.super-section{padding:.25rem 0;flex-shrink:0}
.super-label{text-align:center;font-size:.75rem;font-weight:700;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.4rem;margin-top:.25rem}
.super-pills{display:flex;flex-wrap:wrap;justify-content:center;gap:.4rem;padding:0 .5rem .5rem}
.super-pill{font-family:inherit;font-size:.78rem;font-weight:600;padding:.35rem .75rem;border:1.5px solid rgba(255,255,255,.08);border-radius:2rem;cursor:pointer;background:rgba(255,255,255,.03);color:rgba(255,255,255,.4);transition:all .2s;display:flex;align-items:center;gap:.3rem}
.super-pill:hover{border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.6);background:rgba(255,255,255,.06)}
.super-pill.active{border-color:rgba(219,112,147,.5);color:#fff;background:rgba(219,112,147,.15);box-shadow:0 0 12px rgba(219,112,147,.2)}
.sp-emoji{font-size:.9rem}.sp-label{white-space:nowrap}
.mode-desc{text-align:center;padding:.4rem 1rem .6rem;display:flex;flex-direction:column;align-items:center;gap:.15rem;flex-shrink:0}
.mode-emoji{font-size:1.4rem}.mode-title{font-size:1rem;font-weight:700;color:#fff}
.mode-sub{font-size:.8rem;font-weight:600;color:rgba(255,255,255,.35);font-style:italic}
.mode-formula{font-size:.72rem;font-weight:600;color:rgba(255,255,255,.25);margin-top:.15rem;padding:.2rem .7rem;border-radius:1rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
.toggle-row{display:flex;justify-content:center;padding:.25rem 0 .6rem;flex-shrink:0}
.pct-toggle{display:flex;border:1.5px solid rgba(255,255,255,.1);border-radius:.6rem;overflow:hidden}
.toggle-btn{font-family:inherit;font-size:.82rem;font-weight:700;padding:.4rem 1.2rem;border:none;cursor:pointer;background:transparent;color:rgba(255,255,255,.35);transition:all .2s}
.toggle-btn:first-child{border-right:1px solid rgba(255,255,255,.08)}
.toggle-btn:hover{color:rgba(255,255,255,.6)}
.toggle-btn.active{background:rgba(255,255,255,.1);color:#fff}
.ratio-pip{font-size:1.15rem;font-weight:700;color:#fff;background:rgba(219,112,147,.25);box-shadow:0 0 12px rgba(219,112,147,.2);padding:.35rem .75rem}
.raw-counts{display:flex;flex-direction:column;gap:.1rem}
.mini-stat{font-size:.65rem;font-weight:700;line-height:1.1}
.mini-stat.fc{color:#ff9eae}.mini-stat.mc{color:#9ec4ff}.mini-stat.kc{color:#d9a8ff}
.empty-msg{text-align:center;padding:3rem 1rem;color:rgba(255,255,255,.25);font-weight:600}
.empty-msg .big{font-size:3rem;margin-bottom:.75rem}
.back-bar{padding:.5rem 1rem 1.25rem;flex-shrink:0}
.btn-back{font-family:inherit;width:100%;font-size:1rem;font-weight:700;padding:.8rem;border:1.5px solid rgba(255,255,255,.1);border-radius:3rem;cursor:pointer;background:rgba(255,255,255,.05);color:#fff;transition:background .2s,transform .2s}
.btn-back:hover{background:rgba(255,255,255,.1)}
.fmk-footer{text-align:center;padding:.6rem 1rem;font-size:.75rem;color:rgba(255,255,255,.2);font-weight:600;flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:.3rem}
.footer-row{display:flex;align-items:center;gap:.4rem}
.footer-link{color:rgba(255,255,255,.25);text-decoration:none;transition:color .2s}
.footer-link:hover{color:rgba(255,255,255,.5)}
.footer-sep{color:rgba(255,255,255,.12)}
.footer-cta{font-size:.72rem;color:rgba(219,112,147,.5);text-decoration:none;transition:color .2s}
.footer-cta:hover{color:rgba(219,112,147,.8)}
@media(max-width:768px){
  .fmk-app{max-width:100%;height:auto;min-height:100%;overflow:visible}.fmk-badge-bar{display:none!important}
  .fmk-cards-grid{flex-direction:column;gap:.6rem;padding:.3rem 1rem;justify-content:flex-start;align-items:stretch;flex:none}
  .fmk-card{flex:0 0 auto;flex-direction:column;max-width:100%;border-radius:var(--radius-sm);min-height:0}
  .fmk-card .fmk-banner{width:100%;min-height:unset;aspect-ratio:4/3}
  .fmk-card .fmk-banner .driver-photo{width:100%;height:100%;object-fit:cover;object-position:center top}
  .fmk-card .fmk-banner .fmk-num{font-size:3rem}
  .fmk-card .fmk-banner .helm-emoji{display:none}
  .fmk-card .fmk-info{padding:.6rem .8rem .5rem;display:flex;align-items:center;gap:.5rem;background:linear-gradient(to top,rgba(25,12,22,.98) 55%,rgba(25,12,22,.82))}
  .fmk-card .driver-name{font-size:1.1rem;flex:1}.fmk-card .team-name{display:none}
  .fmk-btns{flex-direction:row;gap:.4rem;padding:0;flex-shrink:0}
  .fmk-btn{height:42px;padding:0 .7rem;font-size:1.05rem}.fmk-btn .btn-lbl{font-size:.72rem}
  .fmk-stamp{font-size:2.5rem;top:40%}.stamp-txt{font-size:1.5rem}
  .fmk-sticky{display:block}.fmk-submit-bar{display:none}
  .fmk-action-row{padding-bottom:90px}
  .fmk-instruct{font-size:.78rem;padding:.05rem 1rem .25rem}
  .rank-card{padding:.65rem .7rem}
  .super-pills{gap:.3rem}.super-pill{font-size:.72rem;padding:.3rem .6rem}
  .back-bar{padding-bottom:calc(.75rem + env(safe-area-inset-bottom,0px))}
}
@media(min-width:769px){.fmk-sticky{display:none!important}}
@media(min-width:900px){.fmk-cards-grid{padding:0.5rem 2rem;gap:1.2rem}.fmk-banner{min-height:160px}}
`;
