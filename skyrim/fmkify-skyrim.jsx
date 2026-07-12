import { useState, useRef, useEffect, useCallback } from "react";

// team = faction bucket used for card colors; tag = big fallback text shown
// when a portrait fails to load; sub = the display line on the card.
const CAST = [
  { id:1,  name:"Lydia",                team:"Whiterun",         tag:"NORD",    sub:"Housecarl of Whiterun" },
  { id:2,  name:"Aela the Huntress",    team:"Companions",       tag:"NORD",    sub:"The Companions · Huntress" },
  { id:3,  name:"Farkas",               team:"Companions",       tag:"NORD",    sub:"The Companions · The Sweet Twin" },
  { id:4,  name:"Serana",               team:"Volkihar",         tag:"VAMPIRE", sub:"Daughter of Coldharbour" },
  { id:5,  name:"Cicero",               team:"Dark Brotherhood", tag:"JESTER",  sub:"Keeper of the Night Mother" },
  { id:6,  name:"Astrid",               team:"Dark Brotherhood", tag:"NORD",    sub:"Mistress of the Sanctuary" },
  { id:7,  name:"Brynjolf",             team:"Thieves Guild",    tag:"NORD",    sub:"Thieves Guild · Recruiter" },
  { id:8,  name:"Maven Black-Briar",    team:"Riften",           tag:"NORD",    sub:"Black-Briar Meadery · Matriarch" },
  { id:9,  name:"Mjoll the Lioness",    team:"Riften",           tag:"NORD",    sub:"Riften's Do-Gooder" },
  { id:10, name:"Ulfric Stormcloak",    team:"Stormcloaks",      tag:"NORD",    sub:"Jarl of Windhelm" },
  { id:11, name:"Ralof",                team:"Stormcloaks",      tag:"NORD",    sub:"Stormcloak · Helgen Survivor" },
  { id:12, name:"General Tullius",      team:"Empire",           tag:"LEGION",  sub:"Imperial Legion · General" },
  { id:13, name:"Hadvar",               team:"Empire",           tag:"LEGION",  sub:"Imperial Legion · Helgen Survivor" },
  { id:14, name:"Elisif the Fair",      team:"Empire",           tag:"NORD",    sub:"Jarl of Solitude" },
  { id:15, name:"Balgruuf the Greater", team:"Whiterun",         tag:"JARL",    sub:"Jarl of Whiterun" },
  { id:16, name:"Nazeem",               team:"Whiterun",         tag:"SNOB",    sub:"Cloud District Regular" },
  { id:17, name:"Ysolda",               team:"Whiterun",         tag:"NORD",    sub:"Aspiring Merchant" },
  { id:18, name:"Heimskr",              team:"Whiterun",         tag:"TALOS",   sub:"Priest of Talos" },
  { id:19, name:"Belethor",             team:"Whiterun",         tag:"BRETON",  sub:"General Goods · Everything's For Sale" },
  { id:20, name:"Camilla Valerius",     team:"Riverwood",        tag:"IMPERIAL",sub:"The Riverwood Trader" },
  { id:21, name:"Faendal",              team:"Riverwood",        tag:"BOSMER",  sub:"Archer · Loves Camilla" },
  { id:22, name:"Sven",                 team:"Riverwood",        tag:"BARD",    sub:"Bard · Also Loves Camilla" },
  { id:23, name:"Delphine",             team:"Blades",           tag:"BLADE",   sub:"Innkeeper · Secretly a Blade" },
  { id:24, name:"Paarthurnax",          team:"Dov",              tag:"DOVAH",   sub:"Master of the Greybeards" },
  { id:25, name:"J'zargo",              team:"College",          tag:"KHAJIIT", sub:"College of Winterhold" },
  { id:26, name:"M'aiq the Liar",       team:"Wanderer",         tag:"KHAJIIT", sub:"Teller of Truths… Mostly" },
  // All sixteen Daedric Princes with a presence in Skyrim, ids 27-42.
  { id:27, name:"Sheogorath",           team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Madness" },
  { id:28, name:"Sanguine",             team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Debauchery" },
  { id:29, name:"Hermaeus Mora",        team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Knowledge" },
  { id:30, name:"Azura",                team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Dusk and Dawn" },
  { id:31, name:"Nocturnal",            team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Night · Lady Luck" },
  { id:32, name:"Meridia",              team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Life · Hates Undead" },
  { id:33, name:"Molag Bal",            team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Domination" },
  { id:34, name:"Mehrunes Dagon",       team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Destruction" },
  { id:35, name:"Boethiah",             team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Plots" },
  { id:36, name:"Clavicus Vile",        team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Bargains" },
  { id:37, name:"Hircine",              team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of the Hunt" },
  { id:38, name:"Malacath",             team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of the Ostracized" },
  { id:39, name:"Mephala",              team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Secrets · The Webspinner" },
  { id:40, name:"Namira",               team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Decay" },
  { id:41, name:"Peryite",              team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Pestilence" },
  { id:42, name:"Vaermina",             team:"Daedra",           tag:"DAEDRA",  sub:"Daedric Prince of Nightmares" },
];

// Faction colors — Whiterun gold, Stormcloak ice, Legion red, Brotherhood
// crimson, Guild sepia, arcane indigo for the College, webbed purple for
// the Daedra, slate for the dragons.
const TC = {
  "Whiterun":"#E8A33D",
  "Companions":"#D96C2C",
  "Stormcloaks":"#58C9E6",
  "Empire":"#E04F4F",
  "Dark Brotherhood":"#C13A5E",
  "Thieves Guild":"#A98E5C",
  "Riften":"#8FBF4D",
  "Riverwood":"#5DBB8D",
  "Blades":"#B0BEC5",
  "College":"#7E8EE0",
  "Dov":"#6E7F9E",
  "Daedra":"#B24BF3",
  "Volkihar":"#D6455D",
  "Wanderer":"#D9A066",
};

// Self-hosted portraits (skyrim/img/, ~600px JPG), served same-origin by
// Vercel. Sourced from the UESP wiki (game screenshots); self-hosted because
// wiki CDNs proved unreliable for hotlinking (see the bachelor game).
// Mostly square full-body shots, so the card CSS crops to 4:3 with faces
// kept in the top quarter (object-position:center 18%).
const IMG_BASE = "/skyrim/img";
const CAST_PHOTOS = {
  1:`${IMG_BASE}/lydia.jpg`,
  2:`${IMG_BASE}/aela.jpg`,
  3:`${IMG_BASE}/farkas.jpg`,
  4:`${IMG_BASE}/serana.jpg`,
  5:`${IMG_BASE}/cicero.jpg`,
  6:`${IMG_BASE}/astrid.jpg`,
  7:`${IMG_BASE}/brynjolf.jpg`,
  8:`${IMG_BASE}/maven-black-briar.jpg`,
  9:`${IMG_BASE}/mjoll.jpg`,
  10:`${IMG_BASE}/ulfric.jpg`,
  11:`${IMG_BASE}/ralof.jpg`,
  12:`${IMG_BASE}/tullius.jpg`,
  13:`${IMG_BASE}/hadvar.jpg`,
  14:`${IMG_BASE}/elisif.jpg`,
  15:`${IMG_BASE}/balgruuf.jpg`,
  16:`${IMG_BASE}/nazeem.jpg`,
  17:`${IMG_BASE}/ysolda.jpg`,
  18:`${IMG_BASE}/heimskr.jpg`,
  19:`${IMG_BASE}/belethor.jpg`,
  20:`${IMG_BASE}/camilla.jpg`,
  21:`${IMG_BASE}/faendal.jpg`,
  22:`${IMG_BASE}/sven.jpg`,
  23:`${IMG_BASE}/delphine.jpg`,
  24:`${IMG_BASE}/paarthurnax.jpg`,
  25:`${IMG_BASE}/jzargo.jpg`,
  26:`${IMG_BASE}/maiq.jpg`,
  27:`${IMG_BASE}/sheogorath.jpg`,
  28:`${IMG_BASE}/sanguine.jpg`,
  29:`${IMG_BASE}/hermaeus-mora.jpg`,
  30:`${IMG_BASE}/azura.jpg`,
  31:`${IMG_BASE}/nocturnal.jpg`,
  32:`${IMG_BASE}/meridia.jpg`,
  33:`${IMG_BASE}/molag-bal.jpg`,
  34:`${IMG_BASE}/mehrunes-dagon.jpg`,
  35:`${IMG_BASE}/boethiah.jpg`,
  36:`${IMG_BASE}/clavicus-vile.jpg`,
  37:`${IMG_BASE}/hircine.jpg`,
  38:`${IMG_BASE}/malacath.jpg`,
  39:`${IMG_BASE}/mephala.jpg`,
  40:`${IMG_BASE}/namira.jpg`,
  41:`${IMG_BASE}/peryite.jpg`,
  42:`${IMG_BASE}/vaermina.jpg`,
};

const RUNES = ["⚔️","🐉","🛡️","🔥","🏹","🧀","🍺","🌌","📜","🗡️","🪓"];

// ── Vote quips ─────────────────────────────────────────────────
const QUIPS = {
  1:  { f:"She is sworn to carry your burdens. All of them.",        m:"Someone to carry your 47 cheese wheels forever",           k:"She died as she lived: blocking a doorway" },
  2:  { f:"The beast blood runs hot",                                m:"Every night is a full moon now",                           k:"Hircine's Hunt just lost its best hunter" },
  3:  { f:"Big arms, bigger heart, zero thoughts",                   m:"Some people learn by reading. He learned husbandry.",      k:"Vilkas will avenge him" },
  4:  { f:"Just don't let her bite. Or do.",                         m:"Til death do you part — hers already happened",            k:"She's 4,000 years old and THIS is how it ends?" },
  5:  { f:"Cicero giggles the WHOLE time",                           m:"The Night Mother watches from the honeymoon coffin",       k:"He dies laughing. Literally." },
  6:  { f:"What happens in the abandoned shack stays there",         m:"The marriage contract is signed in blood. Standard.",      k:"The Brotherhood has rules about this. She wrote them." },
  7:  { f:"Sorry lass, he's got important things to do — after this",m:"He'll steal your heart, then the ring, then the ring again",k:"Never should have come here" },
  8:  { f:"You'll sign something first",                             m:"Marrying into the Black-Briar fortune. Bold. Terrifying.", k:"You'll be dead by morning. She knows people." },
  9:  { f:"The Lioness of Riften earns her name",                    m:"The only honest soul in Riften is now yours",              k:"Aerin will write a strongly worded letter" },
  10: { f:"The Thu'um isn't the only thing he's famous for",         m:"You're the Jarl's consort now. The war is your problem too.",k:"The True High King, dead in a sidequest" },
  11: { f:"You picked his side of the cart at Helgen too",           m:"Gerdur approves. The whole village approves.",             k:"He survived a dragon for this?" },
  12: { f:"This is NOT a military operation, soldier",               m:"You'll be saluted at your own wedding",                    k:"He never liked Skyrim anyway" },
  13: { f:"He'll blush all the way back to Riverwood",               m:"His uncle Alvor forges the rings himself",                 k:"Should've followed him into the keep" },
  14: { f:"The Jarl requests your absolute discretion",              m:"Basically High Queen consort. Torygg who?",                k:"Solitude mourns. Again." },
  15: { f:"Dragonsreach has guest chambers, you know",               m:"You married the only competent Jarl in Skyrim",            k:"Whiterun falls. Nazeem inherits the city." },
  16: { f:"You DO get to the Cloud District after all",              m:"You'll hear about the Cloud District every morning. Forever.",k:"The entire city volunteers to help" },
  17: { f:"She'll trade you a mammoth tusk for it",                  m:"Temple of Mara — you may remember it from your hangover",  k:"The Khajiit caravans lose their best customer" },
  18: { f:"He does not stop preaching. Not even now.",               m:"You, him, and Talos. It's a throuple.",                    k:"Finally, silence in the Wind District" },
  19: { f:"Everything's for sale, my friend. Everything.",           m:"He'd sell you in a second — lovingly",                     k:"The store's yours now. He'd respect the hustle." },
  20: { f:"Faendal and Sven both wrote poems about this",            m:"You beat an archer AND a bard. Savor it.",                 k:"Riverwood's entire dating pool, gone" },
  21: { f:"He'll teach you archery after. Free of charge.",          m:"That letter he wrote Camilla? Rewritten for you.",         k:"Sven wins by default. Awful." },
  22: { f:"He'll write a ballad about it. It won't be good.",        m:"Free lute serenades forever. FOREVER.",                    k:"His mother is very old, you know. And now this." },
  23: { f:"It's classified. Like everything else about her.",        m:"Married to a Blade — every dinner is a debrief",           k:"Paarthurnax votes yes" },
  24: { f:"Forbidden. Ancient. Scaly. You chose this.",              m:"He hoards wisdom, not gold. Great listener.",              k:"The Blades finally get their wish. Monsters." },
  25: { f:"J'zargo does not disappoint. J'zargo says so himself.",   m:"J'zargo will be the best husband. J'zargo is best at everything.",k:"J'zargo's flame cloak scrolls finally backfire" },
  26: { f:"M'aiq has heard this is fun. M'aiq heard correctly.",     m:"M'aiq will be faithful. M'aiq is also a liar.",            k:"M'aiq was never here. Neither were you." },
  27: { f:"CHEESE FOR EVERYONE! And… other things.",                 m:"Honeymoon in the Shivering Isles. One of you returns different.",k:"You can't kill madness. He'll be back Tuesday." },
  28: { f:"A night to remember. You won't remember it.",             m:"The Prince of Debauchery, domesticated. Sure.",            k:"Every tavern in Tamriel dims its candles" },
  29: { f:"THAT'S the forbidden knowledge?!",                        m:"He knows everything about you. Marriage changes nothing.", k:"He read this ending already. Twice." },
  30: { f:"The Queen of Dawn and Dusk pencils you in twice a day",   m:"Aranea foresaw this wedding decades ago. No pressure.",    k:"Your soul fits neatly inside her Star" },
  31: { f:"The Night Mistress keeps this one off the books",         m:"You're a Nightingale now — nobody read the fine print",    k:"Your luck just ran out. All of it. Forever." },
  32: { f:"A NEW HAND TOUCHES THE BEACON",                           m:"Married to the beacon. She WILL officiate. LOUDLY.",       k:"You've been launched into the stratosphere for less" },
  33: { f:"HR has been notified. Coldharbour has no HR.",            m:"You get a summer home in Coldharbour. It's the bad place.",k:"The Prince of Domination, dominated" },
  34: { f:"Four arms. FOUR.",                                        m:"He's destroyed marriages before. Usually with lava.",      k:"He respawns. Ask the Champion of Cyrodiil." },
  35: { f:"Prove your worth in single combat first",                 m:"Till betrayal do you part — so, Tuesday",                  k:"She asked her last champion to do exactly this" },
  36: { f:"Be VERY careful how you phrase this wish",                m:"Read the contract. Then read it again. Then run.",         k:"Barbas inherits everything" },
  37: { f:"The Hunt takes many forms",                               m:"Date nights are full moons only",                          k:"You just became the most hunted being in Tamriel" },
  38: { f:"The Code of Malacath permits this. Probably.",            m:"Honorary Orc. The stronghold throws a feast.",             k:"Every stronghold in Skyrim declares blood feud" },
  39: { f:"The Webspinner has been weaving this for centuries",      m:"She knows every secret you have. Say 'I do.'",             k:"The Ebony Blade whispers its disappointment" },
  40: { f:"The Lady of Decay is flattered. Everyone else is concerned.",m:"Don't ask about the reception menu",                    k:"Her Markarth coven insists on hosting the funeral dinner" },
  41: { f:"You'll need to inhale the fumes first",                   m:"In sickness and in sickness",                              k:"The Taskmaster adds you to a very long list" },
  42: { f:"You will dream about this forever. Her call.",            m:"Every night, the same dream. Her dream.",                  k:"You have to fall asleep sometime, Dovahkiin" },
};

// ── Storage ─────────────────────────────────────────────────────
// API_BASE: set to "/api/skyrim" for the /skyrim subpath deployment,
// or to a full URL (e.g. "https://www.fmkify.com/api/skyrim") during local dev.
const API_BASE = "/api/skyrim";

function emptyTallies() {
  const t = {}; CAST.forEach(p => { t[p.id] = {f:0,m:0,k:0}; });
  return { tallies:t, totalVotes:0 };
}

async function fetchToken(retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(`${API_BASE}/token`);
      if (r.ok) {
        const data = await r.json();
        return data.token || null;
      }
      // Rate limited — wait and retry
      if (r.status === 429 && i < retries) {
        await new Promise(res => setTimeout(res, 3000 * (i + 1)));
        continue;
      }
      return null;
    } catch(e) { return null; }
  }
  return null;
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
  // Fisher-Yates shuffle — guarantees uniform distribution across the cast
  const arr = [...CAST];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3);
}

function spawnConfetti() {
  const c = ["#58C9E6","#9BE8FF","#E8A33D","#ffffff","#7E8EE0","#B24BF3","#F2D16B"];
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
@keyframes fmk-glow{0%,100%{box-shadow:0 4px 20px rgba(88,201,230,.35)}50%{box-shadow:0 4px 35px rgba(88,201,230,.55)}}
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

// ── Cast Card ───────────────────────────────────────────────────
function CastCard({star:p,choice,onAssign,dealDelay,dealing,pulseId,rejectedId,dropHover,onDragOver,onDragLeave,cardRefs,isMobile,activeBadge}) {
  const tc = TC[p.team]||"#58C9E6";
  const [imgOk,setImgOk] = useState(false);
  const [imgErr,setImgErr] = useState(false);
  let cls = "fmk-card";
  if (dealing) cls+=" dealing"; if (choice) cls+=" sel-"+choice;
  if (pulseId===p.id) cls+=" pulse"; if (rejectedId===p.id) cls+=" rejected"; if (dropHover===p.id) cls+=" drop-hover";
  if (activeBadge&&!choice) cls+=" targetable";
  const stampE = choice==='f'?'🔥':choice==='m'?'💍':choice==='k'?'💀':'';
  const stampL = choice==='f'?'F':choice==='m'?'M':choice==='k'?'K':'';
  const style = {};
  if (dealing) { style["--deal-delay"]=dealDelay+"s"; style["--rot"]=(dealDelay===0?'-4':dealDelay<.2?'2':'-3')+"deg"; }
  if (activeBadge&&!choice) style.cursor='pointer';

  const handleCardClick = (e) => {
    // If a badge is active and this card doesn't have a choice yet, assign it
    if (activeBadge && !choice) { onAssign(p.id, activeBadge); return; }
    // If a badge is active and this card already has a choice, reassign (swap)
    if (activeBadge) { onAssign(p.id, activeBadge); return; }
  };

  return (
    <div className={cls} style={style} ref={el=>{if(cardRefs)cardRefs.current[p.id]=el;}}
      onClick={handleCardClick}
      onDragOver={e=>{e.preventDefault();onDragOver?.(p.id);}} onDragLeave={()=>onDragLeave?.()}
      onDrop={e=>{e.preventDefault();const c=e.dataTransfer.getData("text/plain");if(c)onAssign(p.id,c);onDragLeave?.();}}>
      <div className={"fmk-stamp"+(choice?" show "+choice+"-stamp":"")}>
        <span>{stampE}</span><span className="stamp-txt">{stampL}</span>
      </div>
      {choice==='m' && <div className="fmk-shimmer"/>}
      <div className="fmk-banner">
        <div className="team-bg" style={{background:`linear-gradient(160deg,${tc} 0%,${tc}44 100%)`}}/>
        {CAST_PHOTOS[p.id]&&!imgErr && <img src={CAST_PHOTOS[p.id]} alt={p.name} loading="lazy" className="player-photo" onLoad={()=>setImgOk(true)} onError={()=>setImgErr(true)} style={{opacity:imgOk?1:0}}/>}
        <div className="fmk-num" style={{opacity:imgOk&&!imgErr?0:1}}>{p.tag}</div>
        {!isMobile && <div className="helm-emoji" style={{opacity:imgOk&&!imgErr?0:1}}>{RUNES[p.id%RUNES.length]}</div>}
      </div>
      <div className="fmk-info">
        <div className="info-text">
          <div className="player-name">{p.name}</div>
          {!isMobile && <div className="team-name" style={{color:tc}}><span className="team-dot" style={{background:tc}}/>{p.sub}</div>}
        </div>
        <div className="fmk-btns">
          {[{c:'f',e:'🔥',l:'F'},{c:'m',e:'💍',l:'M'},{c:'k',e:'💀',l:'K'}].map(b=>(
            <button key={b.c} className={`fmk-btn ${b.c}-btn${choice===b.c?' active':''}`} onClick={()=>onAssign(p.id,b.c)}>
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
  const [voteQuips,setVoteQuips]=useState(null); // [{name,choice,emoji,quip},...] shown in confetti overlay
  const milestoneShownRef=useRef(false); // ensures milestone only fires once per session
  const busyRef=useRef(false); const cardRefs=useRef({}); const ghostRef=useRef(null);
  const confTimerRef=useRef(null);
  const isMobile=useIsMobile();

  const dismissConf=useCallback(()=>{
    if(!showConf)return;
    if(confTimerRef.current){clearTimeout(confTimerRef.current);confTimerRef.current=null;}
    setShowConf(false);setVoteQuips(null);setTrio(randomTrio());setSels({});busyRef.current=false;
  },[showConf]);

  useEffect(()=>{setDealing(true);const t=setTimeout(()=>setDealing(false),700);return()=>clearTimeout(t);},[trio]);
  useEffect(()=>{ghostRef.current=ghostDrag;},[ghostDrag]);

  const allDone=useCallback(()=>{const v=trio.map(p=>sels[p.id]).filter(Boolean);return v.includes('f')&&v.includes('m')&&v.includes('k');},[trio,sels]);

  const assign=useCallback((pid,ch)=>{
    if(busyRef.current)return;
    setSels(prev=>{const next={};let old=null;
      Object.keys(prev).forEach(id=>{const n=parseInt(id);if(prev[id]===ch&&n!==pid){old=n;}else if(n!==pid){next[id]=prev[id];}});
      next[pid]=ch;if(old){setRejectedId(old);setTimeout(()=>setRejectedId(null),450);}return next;});
    setPulseId(pid);setTimeout(()=>setPulseId(null),400);
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
    // Build quips from current selections before clearing
    const quips = Object.entries(sels).map(([id,ch])=>{
      const p = trio.find(pl=>pl.id===parseInt(id));
      const q = QUIPS[p.id]?.[ch] || "";
      const emoji = ch==='f'?'🔥':ch==='m'?'💍':'💀';
      return { name:p.name, choice:ch, emoji, quip:q };
    });
    setVoteQuips(quips);
    const nextRound = round + 1;
    if (nextRound === 11 && !milestoneShownRef.current) {
      milestoneShownRef.current = true;
      setShowMilestone(true);
      spawnConfetti();
      setRound(nextRound);
      busyRef.current = false;
    } else {
      setShowConf(true); spawnConfetti(); setRound(nextRound);
      const confTimer = setTimeout(()=>{setShowConf(false);setVoteQuips(null);setTrio(randomTrio());setSels({});busyRef.current=false;confTimerRef.current=null;},4000);
      confTimerRef.current = confTimer;
    }
  },[allDone,sels,onVote,round]);

  const shuffle=()=>{if(!busyRef.current){setTrio(randomTrio());setSels({});setActiveBadge(null);}};
  const clearAll=()=>{setSels({});setActiveBadge(null);};
  // First word of the name for the mobile slot bar ("Aela", "Maven", "M'aiq") —
  // skipping the "General" honorific so Tullius shows as Tullius.
  const nameForChoice=(c)=>{const p=trio.find(pl=>sels[pl.id]===c);if(!p)return null;const w=p.name.split(' ');return w[0]==='General'?w[1]:w[0];};
  const done=allDone();
  const usedChoices={}; Object.values(sels).forEach(c=>{usedChoices[c]=true;});

  const onTouchStart=useCallback((ch,e)=>{e.preventDefault();const t=e.touches[0];setGhostDrag({choice:ch,x:t.clientX,y:t.clientY});},[]);
  const onTouchMove=useCallback((e)=>{const g=ghostRef.current;if(!g)return;e.preventDefault();const t=e.touches[0];setGhostDrag({choice:g.choice,x:t.clientX,y:t.clientY});let hov=null;trio.forEach(p=>{const el=cardRefs.current[p.id];if(el){const r=el.getBoundingClientRect();if(t.clientX>=r.left&&t.clientX<=r.right&&t.clientY>=r.top&&t.clientY<=r.bottom)hov=p.id;}});setDropHover(hov);},[trio]);
  const onTouchEnd=useCallback(()=>{const g=ghostRef.current;if(!g)return;if(dropHover)assign(dropHover,g.choice);setGhostDrag(null);setDropHover(null);},[dropHover,assign]);

  return (<>
    <div className="fmk-app">
      <div className="fmk-topbar">
        <div className="fmk-logo" onClick={()=>{window.location.href="/";}} style={{cursor:'pointer'}} title="FMKify home">🐉 <span className="accent">FMKify</span></div>
        <div className="round-pill">Round {round}</div>
        <button className="btn-icon" onClick={onShowRankings}><span>📊</span><span className="btn-label">Rankings</span></button>
      </div>
      <div className="fmk-instruct">
        <div style={{fontSize:'1rem',fontWeight:700,color:'rgba(255,255,255,.65)',marginBottom:'.1rem'}}>Skyrim Edition</div>
        <div style={{fontSize:'.78rem',color:'rgba(255,255,255,.3)',marginBottom:'.3rem',fontStyle:'italic'}}>42 souls of Tamriel. 3 at a time. May the Divines forgive you.</div>
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
        {trio.map((p,i)=><CastCard key={p.id} star={p} choice={sels[p.id]||null} onAssign={assign} dealDelay={i*.1} dealing={dealing} pulseId={pulseId} rejectedId={rejectedId} dropHover={dropHover} onDragOver={id=>setDropHover(id)} onDragLeave={()=>setDropHover(null)} cardRefs={cardRefs} isMobile={isMobile} activeBadge={activeBadge}/>)}
      </div>

      <div className="fmk-action-row">
        <button className="action-sm" onClick={clearAll}>↩️ Clear</button>
        <button className="action-sm" onClick={shuffle}>🔀 Shuffle</button>
      </div>

      {done&&!isMobile && <div className="fmk-submit-bar"><button className="btn-submit" onClick={submit}>✨ Submit Vote ✨</button></div>}

      {!isMobile && <Footer/>}

      {showConf && voteQuips && <div className="fmk-confetti-overlay" style={{pointerEvents:'auto',cursor:'pointer'}} onClick={dismissConf}><div className="confetti-card" style={{maxWidth:'360px'}}>
        <div className="big-emoji">🎉</div><div className="conf-msg">Vote Recorded!</div>
        <div className="quip-list">
          {voteQuips.map((q,i)=><div key={i} className={`quip-row quip-${q.choice}`}>
            <span className="quip-emoji">{q.emoji}</span>
            <div className="quip-body">
              <span className="quip-name">{q.name}</span>
              <span className="quip-text">{q.quip}</span>
            </div>
          </div>)}
        </div>
        <div className="round-text">Tap anywhere to continue</div>
      </div></div>}

      {slowdown && <div className="fmk-confetti-overlay" style={{pointerEvents:'auto'}}>
        <div className="confetti-card" style={{maxWidth:'340px'}}>
          <div className="big-emoji">🍺</div>
          <div className="conf-msg" style={{fontSize:'1.3rem'}}>{slowdown}</div>
          <button className="btn-back" style={{marginTop:'1rem'}} onClick={()=>window.location.reload()}>🔄 Refresh & Resume</button>
        </div>
      </div>}

      {showMilestone && <div className="fmk-confetti-overlay" style={{pointerEvents:'auto'}}>
        <div className="confetti-card" style={{maxWidth:'360px'}}>
          <div className="big-emoji">🐉</div>
          <div className="conf-msg">10 rounds deep!</div>
          <div className="round-text" style={{marginBottom:'1rem'}}>Your legend grows, Dovahkiin. Want to see how your picks compare?</div>
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
  { key:"husband",     emoji:"💎", label:"Marriage Material", sub:"An amulet of Mara at all times.",        formula:"Highest 💍 to 🔥 ratio" },
  { key:"loved",       emoji:"😍", label:"Most Loved",       sub:"Whether it's a fling or forever, they're wanted.", formula:"Highest 🔥+💍 %" },
  { key:"polarizing",  emoji:"😈", label:"Most Polarizing",  sub:"Nobody in Tamriel can agree on this one.", formula:"Most even 🔥 💍 💀 split" },
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

  const rankings=CAST.map(p=>{
    const t=tallies[p.id]||{f:0,m:0,k:0};
    const row={star:p,f:t.f,m:t.m,k:t.k};
    row.score=computeScore(row,sortBy,usePercent);
    return row;
  }).sort((a,b)=>b.score-a.score);

  const medal=i=>i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`;

  return (
    <div className="fmk-rankings-shell">
      <div className="fmk-topbar">
        <div className="fmk-logo"><span onClick={()=>{window.location.href="/";}} style={{cursor:'pointer'}} title="FMKify home">🏆 <span className="accent">FMKify</span></span><span onClick={onBack} style={{cursor:'pointer'}} title="Back to game"> Skyrim Rankings</span></div><div/>
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
        {total>0?rankings.map((st,i)=>{const tc=TC[st.star.team]||"#888";return(
          <div key={st.star.id} className={`rank-card${i<3?' top':''}`}>
            <div className="rank-pos">{medal(i)}</div>
            <div className="r-stripe" style={{background:tc}}/>
            <div className="r-info"><div className="r-name">{st.star.name}</div><div className="r-team">{st.star.sub}</div></div>
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
        :<div className="empty-msg"><div className="big">🐉</div><div>No votes yet — go play!</div></div>}
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
      <div className="footer-row">
        <a href="/bachelor/" className="footer-cta">🌹 Also live: FMKify Bachelor →</a>
        <span className="footer-sep">·</span>
        <a href="/nba/" className="footer-cta">🏀 FMKify NBA →</a>
        <span className="footer-sep">·</span>
        <a href="/f1/" className="footer-cta">🏎️ FMKify F1 →</a>
      </div>
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
    const path = target === "rankings" ? "/skyrim/rankings/" : "/skyrim/";
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
            <div style={{textAlign:'center'}}><div style={{fontSize:'3rem',animation:'fmk-bob 1.5s ease-in-out infinite'}}>🐉</div>
            <div style={{fontSize:'1.2rem',fontWeight:700,color:'rgba(255,255,255,.6)',marginTop:'1rem'}}>Loading FMKify...</div></div></div>
        : view==="game"
          ? <GameView onShowRankings={()=>navigateTo("rankings")} globalData={globalData} onVote={handleVote}/>
          : <RankingsView onBack={()=>navigateTo("game")} globalData={globalData}/>}
    </div>
    <style>{CSS}</style>
  </>);
}

const CSS = `
html,body{margin:0;padding:0;min-height:100%;background:linear-gradient(155deg,#0a0e14 0%,#111a26 25%,#152233 50%,#0b111a 100%)}
:root{--frost:#58C9E6;--gold:#E8A33D;--mist:#9BE8FF;--f-color:#ff1744;--f-bg:linear-gradient(135deg,#ff5252,#ff1744);--f-glow:rgba(255,23,68,.45);--m-color:#2979ff;--m-bg:linear-gradient(135deg,#448aff,#2979ff);--m-glow:rgba(41,121,255,.45);--k-color:#aa00ff;--k-bg:linear-gradient(135deg,#e040fb,#aa00ff);--k-glow:rgba(170,0,255,.45);--radius:1.5rem;--radius-sm:1rem}
.fmk-blob{position:fixed;border-radius:50%;pointer-events:none;z-index:0;filter:blur(80px)}
.fmk-blob-1{width:500px;height:500px;background:radial-gradient(circle,rgba(88,201,230,.18),transparent 70%);top:-15%;right:-10%;animation:fmk-drift 18s ease-in-out infinite alternate}
.fmk-blob-2{width:400px;height:400px;background:radial-gradient(circle,rgba(232,163,61,.13),transparent 70%);bottom:-10%;left:-8%;animation:fmk-drift 14s ease-in-out infinite alternate-reverse}
.fmk-root{position:relative;z-index:1;min-height:100%;font-family:'Fredoka','Segoe UI',system-ui,sans-serif;color:#e0e0e0;-webkit-tap-highlight-color:transparent;background:linear-gradient(155deg,#0a0e14 0%,#111a26 25%,#152233 50%,#0b111a 100%)}
.fmk-app{display:flex;flex-direction:column;height:100vh;max-width:1100px;margin:0 auto;overflow:hidden}
.fmk-topbar{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.25rem;flex-shrink:0}
.fmk-logo{font-size:1.4rem;font-weight:700;color:#fff;letter-spacing:-.5px}
.fmk-logo .accent{background:linear-gradient(135deg,var(--frost),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.round-pill{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:2rem;padding:.3rem .85rem;font-size:.8rem;font-weight:600;color:rgba(255,255,255,.6)}
.btn-icon{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:2rem;height:38px;padding:0 .85rem;display:flex;align-items:center;justify-content:center;gap:.35rem;font-size:.82rem;font-weight:600;cursor:pointer;transition:background .2s,transform .2s;color:rgba(255,255,255,.7);font-family:inherit}
.btn-icon:hover{background:rgba(255,255,255,.15);transform:scale(1.04)}
.btn-icon .btn-label{letter-spacing:.02em}
.fmk-instruct{text-align:center;padding:.1rem 1.25rem .4rem;font-size:.85rem;color:rgba(255,255,255,.4);flex-shrink:0}
.fmk-cards-grid{flex:1;display:flex;gap:1rem;padding:0.25rem 1.5rem;justify-content:center;align-items:center;min-height:0}
.fmk-card{flex:1;max-width:320px;border-radius:var(--radius);overflow:hidden;background:#141d2b;border:2px solid rgba(255,255,255,.07);box-shadow:0 8px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;position:relative;transition:transform .4s cubic-bezier(.4,0,.2,1),box-shadow .4s,border-color .4s,filter .4s;will-change:transform}
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
.fmk-shimmer{position:absolute;inset:0;z-index:5;pointer-events:none;border-radius:var(--radius);background:linear-gradient(120deg,transparent 30%,rgba(88,201,230,.06) 50%,transparent 70%);animation:fmk-shimmer 2s ease-in-out infinite}
.fmk-banner{display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;aspect-ratio:4/3}
.fmk-banner .team-bg{position:absolute;inset:0;opacity:.85}
.fmk-banner .fmk-num{position:absolute;font-size:clamp(1.8rem,5vw,3rem);letter-spacing:.1em;font-weight:700;color:rgba(255,255,255,.22);line-height:1;transition:opacity .4s;z-index:1}
.fmk-banner .player-photo{position:relative;z-index:2;width:100%;height:100%;object-fit:cover;object-position:center 18%;display:block;transition:opacity .5s}
.fmk-banner .helm-emoji{position:absolute;font-size:clamp(2.5rem,7vw,3.5rem);bottom:10%;right:8%;filter:drop-shadow(0 4px 12px rgba(0,0,0,.3));transition:opacity .4s;z-index:3}
.fmk-info{padding:.7rem 1.2rem .6rem;background:linear-gradient(to top,rgba(10,16,25,.98) 55%,rgba(10,16,25,.82))}
.player-name{font-size:clamp(1.2rem,3.5vw,1.5rem);font-weight:700;color:#fff;line-height:1.15;margin-bottom:.1rem}
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
.fmk-sticky{position:fixed;bottom:0;left:0;right:0;z-index:50;background:rgba(10,14,20,.75);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid rgba(255,255,255,.08);padding:.5rem 1rem;padding-bottom:calc(.5rem + env(safe-area-inset-bottom,0px));display:none;touch-action:manipulation}
.sticky-slots{display:flex;justify-content:center;gap:.8rem;margin-bottom:.4rem}
.sticky-slot{display:flex;align-items:center;gap:.3rem;font-size:.8rem;font-weight:600;color:rgba(255,255,255,.4);padding:.25rem .6rem;background:rgba(255,255,255,.04);border-radius:.6rem;border:1px solid rgba(255,255,255,.06);min-width:80px;transition:all .3s}
.sticky-slot.filled{color:#fff;border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.08)}
.sticky-slot .slot-name{animation:fmk-slotpop .3s cubic-bezier(.17,.67,.35,1.5)}
.sticky-submit{font-family:inherit;font-size:1rem;font-weight:700;padding:.7rem;border:none;border-radius:3rem;cursor:pointer;background:linear-gradient(135deg,#58C9E6,#E8A33D);color:#0b111a;box-shadow:0 4px 20px rgba(88,201,230,.35);width:100%;transition:transform .2s,opacity .3s;opacity:0;pointer-events:none;transform:translateY(10px);touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.sticky-submit.ready{opacity:1;pointer-events:auto;transform:translateY(0);animation:fmk-wiggle .5s ease .2s}
.sticky-submit:active{transform:scale(.96)}
.sticky-submit.pulse-glow{animation:fmk-glow 1.5s ease-in-out infinite}
.fmk-submit-bar{padding:.6rem 1.25rem 1.25rem;flex-shrink:0;display:flex;justify-content:center}
.btn-submit{font-family:inherit;font-size:1.15rem;font-weight:700;padding:.9rem 2.5rem;border:none;border-radius:3rem;cursor:pointer;background:linear-gradient(135deg,#58C9E6,#E8A33D);color:#0b111a;box-shadow:0 6px 30px rgba(88,201,230,.35);transition:transform .2s;width:100%;max-width:400px;animation:fmk-wiggle .5s ease .15s,fmk-glow 1.5s ease-in-out .7s infinite}
.btn-submit:hover{transform:scale(1.04)}.btn-submit:active{transform:scale(.97)}
.fmk-action-row{display:flex;justify-content:center;gap:1rem;padding:.3rem 0 .5rem;flex-shrink:0}
.action-sm{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);border-radius:2rem;padding:.4rem 1rem;font-family:inherit;font-size:.82rem;font-weight:600;color:rgba(255,255,255,.5);cursor:pointer;transition:background .2s,transform .2s;display:flex;align-items:center;gap:.3rem}
.action-sm:hover{background:rgba(255,255,255,.1);transform:scale(1.05)}.action-sm:active{transform:scale(.95)}
.fmk-confetti-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:100;pointer-events:none;background:rgba(0,0,0,.35);animation:fmk-fade .3s}
.confetti-card{background:rgba(17,26,38,.95);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);border-radius:var(--radius);padding:2rem 2.5rem;box-shadow:0 12px 60px rgba(0,0,0,.4);text-align:center;animation:fmk-pop .3s cubic-bezier(.17,.67,.35,1.5)}
.quip-list{display:flex;flex-direction:column;gap:.5rem;margin:.75rem 0;text-align:left}
.quip-row{display:flex;align-items:flex-start;gap:.5rem;padding:.5rem .65rem;border-radius:.75rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);animation:fmk-pop .3s cubic-bezier(.17,.67,.35,1.5) backwards}
.quip-row:nth-child(1){animation-delay:.1s}.quip-row:nth-child(2){animation-delay:.25s}.quip-row:nth-child(3){animation-delay:.4s}
.quip-row.quip-f{border-left:3px solid var(--f-color)}.quip-row.quip-m{border-left:3px solid var(--m-color)}.quip-row.quip-k{border-left:3px solid var(--k-color)}
.quip-emoji{font-size:1.1rem;flex-shrink:0;margin-top:.05rem}
.quip-body{display:flex;flex-direction:column;gap:.1rem;min-width:0}
.quip-name{font-size:.75rem;font-weight:700;color:rgba(255,255,255,.45)}
.quip-text{font-size:.85rem;font-weight:600;color:rgba(255,255,255,.85);line-height:1.3}
.big-emoji{font-size:3.5rem;margin-bottom:.5rem}
.conf-msg{font-size:1.8rem;font-weight:700;background:linear-gradient(135deg,var(--frost),var(--mist),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.round-text{margin-top:.4rem;font-size:.85rem;color:rgba(255,255,255,.35);font-weight:600}
.fmk-rankings-shell{display:flex;flex-direction:column;height:100%;max-width:600px;margin:0 auto;overflow:hidden}
.rankings-scroll{flex:1;overflow-y:auto;padding:0 1rem 2rem;-webkit-overflow-scrolling:touch}
.rankings-scroll::-webkit-scrollbar{width:4px}.rankings-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}
.rank-header{text-align:center;padding:.75rem 0}
.rank-stat{font-size:2rem;font-weight:700;background:linear-gradient(135deg,var(--frost),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
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
.super-pill.active{border-color:rgba(88,201,230,.5);color:#fff;background:rgba(88,201,230,.15);box-shadow:0 0 12px rgba(88,201,230,.2)}
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
.ratio-pip{font-size:1.15rem;font-weight:700;color:#fff;background:rgba(88,201,230,.25);box-shadow:0 0 12px rgba(88,201,230,.2);padding:.35rem .75rem}
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
.footer-cta{font-size:.72rem;color:rgba(88,201,230,.5);text-decoration:none;transition:color .2s}
.footer-cta:hover{color:rgba(88,201,230,.8)}
@media(max-width:768px){
  .fmk-app{max-width:100%;height:auto;min-height:100%;overflow:visible}.fmk-badge-bar{display:none!important}
  .fmk-cards-grid{flex-direction:column;gap:.6rem;padding:.3rem 1rem;justify-content:flex-start;align-items:stretch;flex:none}
  .fmk-card{flex:0 0 auto;flex-direction:column;max-width:100%;border-radius:var(--radius-sm);min-height:0}
  .fmk-card .fmk-banner{width:100%;min-height:unset;aspect-ratio:4/3}
  .fmk-card .fmk-banner .player-photo{width:100%;height:100%;object-fit:cover;object-position:center 18%}
  .fmk-card .fmk-banner .fmk-num{font-size:1.6rem}
  .fmk-card .fmk-banner .helm-emoji{display:none}
  .fmk-card .fmk-info{padding:.6rem .8rem .5rem;display:flex;align-items:center;gap:.5rem;background:linear-gradient(to top,rgba(10,16,25,.98) 55%,rgba(10,16,25,.82))}
  .fmk-card .player-name{font-size:1.1rem;flex:1}.fmk-card .team-name{display:none}
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
@media(min-width:900px){.fmk-cards-grid{padding:0.5rem 2rem;gap:1.2rem}}
`;
