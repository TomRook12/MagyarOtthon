import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ─── LESSON DATA ──────────────────────────────────────────────────────────
const TRACKS = [
  { id:"bath-time",     title:"Bath Time",              emoji:"🛁", color:"#4A9ECC" },
  { id:"bed-time",      title:"Bed Time",               emoji:"🌙", color:"#7B61C1" },
  { id:"getting-ready", title:"Getting Ready",          emoji:"🌅", color:"#E8913A" },
  { id:"mealtimes",     title:"Mealtimes",              emoji:"🍽️", color:"#3A8F6E" },
  { id:"school-run",    title:"School Run",             emoji:"🎒", color:"#C1513A" },
  { id:"park",          title:"Going to the Park",      emoji:"🌳", color:"#5C9E4A" },
  { id:"homework",      title:"Homework & School Prep", emoji:"📚", color:"#8F6E3A" },
  { id:"playing",       title:"Playing",                emoji:"🧩", color:"#C13A8F" },
];

const LESSONS = [
  { id:1, trackId:"bath-time", band:"A1", seq:1,
    title:"Bath Time Objects", sub:"kád · víz · szappan · sampon",
    types:["match","phrase_list"],
    phrases:[
      {hu:"kád",       pr:"kád",          en:"bath"},
      {hu:"víz",       pr:"víz",          en:"water"},
      {hu:"szappan",   pr:"SOP-pon",      en:"soap"},
      {hu:"sampon",    pr:"SHOM-pon",     en:"shampoo"},
      {hu:"törölköző", pr:"tö-röl-kö-ző", en:"towel"},
      {hu:"kacsa",     pr:"KO-cho",       en:"duck"},
      {hu:"csap",      pr:"chop",         en:"tap"},
      {hu:"buborék",   pr:"BU-bo-rék",    en:"bubble"},
    ],
    tip:"Repeat the word as you point to each object at bath time." },

  { id:2, trackId:"bath-time", band:"A1", seq:2,
    title:"Body Parts", sub:"haj · fül · kéz · láb",
    types:["match","phrase_list"],
    phrases:[
      {hu:"haj",  pr:"hoy",  en:"hair"},
      {hu:"fül",  pr:"fül",  en:"ear"},
      {hu:"kéz",  pr:"kéz",  en:"hand"},
      {hu:"láb",  pr:"láb",  en:"foot"},
      {hu:"arc",  pr:"orts", en:"face"},
      {hu:"has",  pr:"hosh", en:"tummy"},
      {hu:"ujj",  pr:"uy",   en:"finger"},
      {hu:"hát",  pr:"hát",  en:"back"},
    ],
    tip:"Point to each body part as you wash it. 'Hol a füled?' then touch the ear." },

  { id:3, trackId:"bath-time", band:"A1", seq:3,
    title:"Single-Word Commands", sub:"Gyere! · Fel! · Ki! · Be!",
    types:["true_false","phrase_list"],
    phrases:[
      {hu:"Gyere!", pr:"DYE-re", en:"Come!"},
      {hu:"Állj!",  pr:"állj",   en:"Stop!"},
      {hu:"Fel!",   pr:"fel",    en:"Up!"},
      {hu:"Ki!",    pr:"ki",     en:"Out!"},
      {hu:"Be!",    pr:"be",     en:"In!"},
      {hu:"Csitt!", pr:"chitt",  en:"Shh!"},
    ],
    tip:"These are the natural shortened imperative forms parents use with young children. Use one every bath time." },

  { id:4, trackId:"bath-time", band:"A1", seq:4,
    title:"First Full Phrases", sub:"Gyere a kádba! · Kész vagyunk.",
    types:["sentence_builder","fill_pool"],
    phrases:[
      {hu:"Gyere a kádba!",    pr:"DYE-re o KÁD-bo",    en:"Come into the bath!"},
      {hu:"Jó meleg víz.",     pr:"yó ME-leg víz",       en:"Nice warm water."},
      {hu:"Kész vagyunk.",     pr:"kés VO-dyunk",        en:"We're done."},
      {hu:"Gyorsan, gyorsan!", pr:"DYOR-shon DYOR-shon", en:"Quick, quick!"},
      {hu:"Mindjárt kész.",    pr:"MIND-yárt kés",       en:"Nearly done."},
    ],
    tip:"Treat each phrase as a memorised chunk — do not try to break it apart yet." },
];

// ─── UTILITIES ─────────────────────────────────────────────────────────────
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function normalize(s,accentSensitive=false){
  const clean=s.replace(/[!?.,:;'"¡¿…]/g,"").toLowerCase().trim();
  if(accentSensitive)return clean;
  return clean.normalize("NFD").replace(/[̀-ͯ]/g,"");
}
function getPrevLesson(lesson){
  const sameBand=LESSONS.filter(l=>l.trackId===lesson.trackId&&l.band===lesson.band);
  if(lesson.seq>1)return sameBand.find(l=>l.seq===lesson.seq-1)||null;
  const bands=["A1","A2","B1","B2","C1"];
  const bi=bands.indexOf(lesson.band);
  if(bi<=0)return null;
  const prevBandLessons=LESSONS.filter(l=>l.trackId===lesson.trackId&&l.band===bands[bi-1]);
  return prevBandLessons.sort((a,b)=>b.seq-a.seq)[0]||null;
}
function isUnlocked(lesson,lessonScores){
  const prev=getPrevLesson(lesson);
  return prev===null||!!lessonScores[String(prev.id)]?.passed;
}

// ─── STATS HOOK ───────────────────────────────────────────────────────────
const STORAGE_KEY="magyar-otthon-stats-v2";
function loadStats(){
  try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)return JSON.parse(raw);}catch(e){}
  return{lastActiveLessonId:null,lessonScores:{},phraseScores:{}};
}
function saveStats(s){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s));}catch(e){}}

function useStats(){
  const [stats,setStats]=useState(()=>loadStats());
  useEffect(()=>{saveStats(stats);},[stats]);

  const recordPhrase=useCallback((hu,correct)=>{
    const today=new Date().toISOString().slice(0,10);
    setStats(s=>{
      const prev=s.phraseScores[hu]||{right:0,wrong:0,lastSeen:today,lastCorrect:today};
      return{...s,phraseScores:{...s.phraseScores,[hu]:{
        right:prev.right+(correct?1:0),wrong:prev.wrong+(correct?0:1),
        lastSeen:today,lastCorrect:correct?today:prev.lastCorrect,
      }}};
    });
  },[]);

  const recordLesson=useCallback((id,score,total)=>{
    setStats(s=>{
      const prev=s.lessonScores[String(id)]||{best:0,attempts:0,passed:false,grammarSeen:false};
      const pct=Math.round(score/total*100);
      return{...s,lessonScores:{...s.lessonScores,[String(id)]:{
        ...prev,best:Math.max(prev.best,pct),attempts:prev.attempts+1,passed:prev.passed||pct>=80,
      }}};
    });
  },[]);

  const markGrammarSeen=useCallback((id)=>{
    setStats(s=>{
      const prev=s.lessonScores[String(id)]||{best:0,attempts:0,passed:false,grammarSeen:false};
      return{...s,lessonScores:{...s.lessonScores,[String(id)]:{...prev,grammarSeen:true}}};
    });
  },[]);

  const setLastActiveLesson=useCallback((id)=>{setStats(s=>({...s,lastActiveLessonId:id}));},[]);

  const getWeakItems=useCallback((phrases)=>{
    return phrases.filter(p=>{const sc=stats.phraseScores[p.hu];return sc&&sc.wrong>0&&sc.wrong>=sc.right;});
  },[stats]);

  return{stats,recordPhrase,recordLesson,markGrammarSeen,setLastActiveLesson,getWeakItems};
}

// ─── QUESTION GENERATORS ──────────────────────────────────────────────────
function genTF(p,all){
  const t=Math.random()>0.5;
  const shown=t?p.en:shuffle(all.filter(x=>x.en!==p.en))[0]?.en||p.en;
  return{type:"true_false",prompt:p.hu,promptPr:p.pr,shown,answer:t,phrase:p};
}
function genFill(p,all){
  const words=p.hu.replace(/[!?.,:;]/g,"").split(" ");
  if(words.length<2)return null;
  const gi=Math.floor(Math.random()*words.length);
  const answer=words[gi];
  const distractors=shuffle(all.flatMap(x=>x.hu.replace(/[!?.,:;]/g,"").split(" ")).filter(x=>x&&x!==answer)).slice(0,3);
  const options=shuffle([answer,...distractors.slice(0,3)]);
  return{type:"fill_pool",prompt:p.en,display:p.hu.replace(answer,"____"),answer,fullHu:p.hu,pr:p.pr,options,phrase:p};
}
function genMatch(phrases){
  const s=shuffle(phrases).slice(0,4);
  return{type:"match",pairs:s.map(p=>({hu:p.hu,en:p.en})),phrase:s[0]};
}
function genReconstruct(p){
  const words=p.hu.split(" ");
  if(words.length<3||words.length>7)return null;
  const tiles=[];
  for(const w of words){const m=w.match(/^(.*?)([.,!?…]+)$/);if(m&&m[1]){tiles.push(m[1]);tiles.push(m[2]);}else tiles.push(w);}
  if(tiles.length<3)return null;
  return{type:"sentence_builder",en:p.en,tiles:shuffle([...tiles]),correctTiles:tiles,phrase:p};
}
function genPhraseList(p,all){
  const distractors=shuffle(all.filter(x=>x.hu!==p.hu)).slice(0,3).map(x=>x.hu);
  return{type:"phrase_list",prompt:p.hu,promptPr:p.pr,answer:p.hu,options:shuffle([p.hu,...distractors]),phrase:p};
}
function genTyped(p){
  return{type:"fill_typed",prompt:p.en,answer:p.hu,pr:p.pr,phrase:p};
}

function generateQuestions(lesson,weakItems,huVoiceAvail,count=15){
  const all=lesson.phrases;
  let types=[...lesson.types];
  const earlyBand=lesson.band==="A1"||lesson.band==="A2";

  // TTS fallback
  if(huVoiceAvail===false){
    types=types.filter(t=>t!=="true_false");
    if(!types.includes("phrase_list"))types.push("phrase_list");
  }
  // Band-aware fill routing (defensive — authoring should match, but enforce here)
  if(earlyBand)types=types.map(t=>t==="fill_typed"?"fill_pool":t);

  let pool=[...all];
  if(weakItems.length>0)pool=[...pool,...weakItems,...weakItems];

  let matchUsed=false;
  const gen=(type,p)=>{
    if(type==="match"){if(matchUsed||all.length<4)return null;matchUsed=true;return genMatch(all);}
    if(type==="phrase_list")return genPhraseList(p,all);
    if(type==="fill_pool")return genFill(p,all);
    if(type==="fill_typed")return genTyped(p);
    if(type==="sentence_builder")return genReconstruct(p);
    if(type==="true_false")return genTF(p,all);
    return null;
  };

  const qs=[];
  for(const type of types){
    if(qs.length>=count)break;
    const p=pool[Math.floor(Math.random()*pool.length)];
    const q=gen(type,p);
    if(q)qs.push(q);
  }
  let attempts=0;
  while(qs.length<count&&attempts<200){
    attempts++;
    const type=types[Math.floor(Math.random()*types.length)];
    const p=pool[Math.floor(Math.random()*pool.length)];
    const q=gen(type,p);
    if(q)qs.push(q);
  }
  return shuffle(qs).slice(0,count);
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const C={bg:"#0F1117",card:"#161822",border:"#1E2030",text:"#E8E6E1",sub:"#7A7B8A",dim:"#555668",green:"#3A8F6E",red:"#D94A4A",amber:"#E8913A"};

// ─── SPEECH UTILITY ──────────────────────────────────────────────────────
function speakHu(text,band="A1"){
  if(!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang="hu-HU";
  const early=band==="A1"||band==="A2";
  u.rate=early?0.85:1.0;
  if(early){const vs=window.speechSynthesis.getVoices();const f=vs.find(v=>v.lang.startsWith("hu")&&/female|woman|nő/i.test(v.name));if(f)u.voice=f;}
  window.speechSynthesis.speak(u);
}
function SpeakBtn({text,band="A1",color,size=18}){
  return <button onClick={e=>{e.stopPropagation();speakHu(text,band);}} title="Hear pronunciation"
    style={{background:"none",border:"none",cursor:"pointer",fontSize:size,padding:"2px 4px",color:color||C.sub,lineHeight:1,flexShrink:0}}>🔊</button>;
}
function useHuVoiceAvailable(){
  const [avail,setAvail]=useState(null);
  useEffect(()=>{
    if(!window.speechSynthesis){setAvail(false);return;}
    const check=()=>{const vs=window.speechSynthesis.getVoices();if(!vs.length)return;setAvail(vs.some(v=>v.lang.startsWith("hu")));};
    check();window.speechSynthesis.addEventListener("voiceschanged",check);
    return()=>window.speechSynthesis.removeEventListener("voiceschanged",check);
  },[]);
  return avail;
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────
function Header({title,sub,onBack,right}){
  return <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`}}>
    {onBack&&<button onClick={onBack} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer",padding:"4px 6px"}}>←</button>}
    <div style={{flex:1}}>
      <div style={{fontSize:16,fontWeight:700,color:C.text}}>{title}</div>
      {sub&&<div style={{fontSize:12,color:C.sub}}>{sub}</div>}
    </div>
    {right}
  </div>;
}
function ProgressBar({pct,color}){
  return <div style={{width:"100%",height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
    <div style={{width:`${Math.min(100,pct)}%`,height:"100%",background:color,borderRadius:2,transition:"width 0.4s"}}/>
  </div>;
}

// ─── QUIZ ENGINE ──────────────────────────────────────────────────────────
function QuizEngine({lesson,track,onFinish,statsApi,huVoiceAvail}){
  const weakItems=statsApi.getWeakItems(lesson.phrases);
  const [qs]=useState(()=>generateQuestions(lesson,weakItems,huVoiceAvail,15));
  const [qi,setQi]=useState(0);
  const [score,setScore]=useState(0);
  const [ans,setAns]=useState(null);
  const [typed,setTyped]=useState("");
  const [ms,setMs]=useState({sel:null,matched:[],wrong:null});
  const [placed,setPlaced]=useState([]);

  const q=qs[qi];
  const total=qs.length;
  const color=track.color;
  const accentSensitive=!["A1","A2"].includes(lesson.band);

  useEffect(()=>{statsApi.setLastActiveLesson(lesson.id);},[]);
  useEffect(()=>{
    if(q.type==="true_false"||q.type==="phrase_list")speakHu(q.prompt,lesson.band);
  },[qi]);
  useEffect(()=>{if(ans!==null&&q.type==="fill_typed")speakHu(q.answer,lesson.band);},[ans]);

  const matchItems=useMemo(()=>{
    if(q.type!=="match")return[];
    return[...shuffle(q.pairs.map(p=>({text:p.hu,lang:"hu",key:p.hu}))),...shuffle(q.pairs.map(p=>({text:p.en,lang:"en",key:p.hu})))];
  },[qi]);

  const advance=(correct)=>{if(q.phrase)statsApi.recordPhrase(q.phrase.hu,correct);if(correct)setScore(s=>s+1);};
  const goNext=()=>{
    if(qi<total-1){setQi(i=>i+1);setAns(null);setTyped("");setMs({sel:null,matched:[],wrong:null});setPlaced([]);}
    else{statsApi.recordLesson(lesson.id,score+(ans==="match_done"||ans==="sb_correct"?0:0),total);setAns("done");}
  };

  if(ans==="done"){
    const pct=Math.round(score/total*100);
    const passed=pct>=80;
    return <div style={{padding:"40px 20px",textAlign:"center"}}>
      <div style={{fontSize:52}}>{passed?"🎉":pct>=60?"👏":"💪"}</div>
      <div style={{fontSize:30,fontWeight:900,color:C.text,marginTop:10}}>{score}/{total}</div>
      <div style={{fontSize:22,fontWeight:800,color:passed?C.green:pct>=60?C.amber:C.red,marginTop:4}}>{pct}%</div>
      <div style={{fontSize:15,color:C.sub,marginTop:4}}>{passed?"Passed — next lesson unlocked!":pct>=60?"Almost there!":"Keep going!"}</div>
      <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"center"}}>
        <button onClick={onFinish} style={{padding:"12px 24px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer"}}>Back to lessons</button>
        <button onClick={()=>{setQi(0);setScore(0);setAns(null);setTyped("");setPlaced([]);setMs({sel:null,matched:[],wrong:null});}}
          style={{padding:"12px 24px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer"}}>Retry</button>
      </div>
    </div>;
  }

  const label={true_false:"True or false?",phrase_list:"What did you hear?",fill_pool:"Fill the gap",fill_typed:"Type in Hungarian",match:"Match pairs",sentence_builder:"Put in order"}[q.type]||"";

  const mcBtn=(opt,i,isAns,isSel)=>{
    let st=null;if(ans!==null){if(isAns)st="correct";else if(isSel)st="wrong";}
    return <button key={i} disabled={ans!==null} onClick={()=>{setAns(opt);advance(isAns);}}
      style={{width:"100%",padding:"13px 15px",borderRadius:12,border:`2px solid ${st==="correct"?C.green:st==="wrong"?C.red:C.border}`,background:st==="correct"?`${C.green}12`:st==="wrong"?`${C.red}12`:C.card,color:st==="correct"?"#5FD4A0":st==="wrong"?"#FF8888":C.text,fontSize:15,fontWeight:600,cursor:ans?"default":"pointer",marginBottom:6,textAlign:"left"}}>{opt}</button>;
  };

  const typeCheck=()=>{
    const c=normalize(typed,accentSensitive)===normalize(q.answer,accentSensitive);
    setAns(c?"correct":"wrong");advance(c);
  };

  return <div style={{padding:"14px 16px 80px"}}>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.sub,marginBottom:5}}>
      <span>{qi+1}/{total}</span>
      <span style={{background:`${color}18`,color,padding:"2px 8px",borderRadius:8,fontWeight:700,fontSize:11}}>{label}</span>
    </div>
    <ProgressBar pct={(qi/total)*100} color={color}/>
    <div style={{marginTop:18}}>

    {q.type==="phrase_list"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center",marginBottom:10}}>What did you hear?</div>
      <div style={{textAlign:"center",marginBottom:16}}>
        <SpeakBtn text={q.prompt} band={lesson.band} color={color} size={28}/>
        <div style={{fontSize:11,color:C.dim,marginTop:4,fontStyle:"italic"}}>{q.promptPr}</div>
      </div>
      {q.options.map((o,i)=>mcBtn(o,i,o===q.answer,o===ans))}
    </div>}

    {q.type==="true_false"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center",marginBottom:6}}>Does this Hungarian:</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        <div style={{fontSize:19,fontWeight:800,color:C.text}}>{q.prompt}</div>
        <SpeakBtn text={q.prompt} band={lesson.band} color={color}/>
      </div>
      <div style={{fontSize:12,color:C.dim,textAlign:"center",fontStyle:"italic",marginBottom:6}}>{q.promptPr}</div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center",marginBottom:3}}>mean:</div>
      <div style={{fontSize:17,fontWeight:700,color:"#9A9BAA",textAlign:"center",marginBottom:16}}>"{q.shown}"</div>
      <div style={{display:"flex",gap:8}}>
        {[true,false].map(v=>{let st=null;if(ans!==null){if(v===q.answer)st="correct";else if(v===ans)st="wrong";}
          return <button key={String(v)} disabled={ans!==null} onClick={()=>{setAns(v);advance(v===q.answer);}}
            style={{flex:1,padding:"14px",borderRadius:14,border:`2px solid ${st==="correct"?C.green:st==="wrong"?C.red:C.border}`,background:st==="correct"?`${C.green}12`:st==="wrong"?`${C.red}12`:C.card,color:st==="correct"?"#5FD4A0":st==="wrong"?"#FF8888":C.text,fontSize:17,fontWeight:800,cursor:ans?"default":"pointer"}}>{v?"True ✓":"False ✗"}</button>;})}
      </div>
    </div>}

    {q.type==="fill_pool"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center"}}>Fill the missing word:</div>
      <div style={{fontSize:12,color:C.dim,textAlign:"center",margin:"6px 0"}}>{q.prompt}</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,margin:"10px 0 18px"}}>
        <div style={{fontSize:19,fontWeight:800,color:C.text}}>{q.display}</div>
        <SpeakBtn text={q.phrase.hu} band={lesson.band} color={color}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:10}}>
        {q.options.map((opt,i)=>{let st=null;if(ans!==null){if(opt===q.answer)st="correct";else if(opt===ans)st="wrong";}
          return <button key={i} disabled={ans!==null} onClick={()=>{setAns(opt);advance(opt===q.answer);}}
            style={{padding:"10px 16px",borderRadius:12,border:`2px solid ${st==="correct"?C.green:st==="wrong"?C.red:C.border}`,background:st==="correct"?`${C.green}12`:st==="wrong"?`${C.red}12`:C.card,color:st==="correct"?"#5FD4A0":st==="wrong"?"#FF8888":C.text,fontSize:15,fontWeight:700,cursor:ans?"default":"pointer"}}>{opt}</button>;})}
      </div>
      {ans!==null&&<div style={{textAlign:"center",fontSize:13,fontWeight:600,color:ans===q.answer?"#5FD4A0":"#FF8888"}}>{ans===q.answer?`✓ ${q.fullHu}`:`✗ ${q.answer} — ${q.fullHu}`}</div>}
    </div>}

    {q.type==="fill_typed"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center"}}>Type in Hungarian:</div>
      <div style={{fontSize:21,fontWeight:800,color:C.text,textAlign:"center",margin:"10px 0 18px"}}>{q.prompt}</div>
      <input value={typed} onChange={e=>setTyped(e.target.value)} disabled={ans!==null} placeholder="Type here..."
        style={{width:"100%",padding:"13px 15px",borderRadius:12,border:`2px solid ${ans===null?C.border:ans==="correct"?C.green:C.red}`,background:C.card,color:C.text,fontSize:16,fontWeight:600,outline:"none",boxSizing:"border-box"}}
        onKeyDown={e=>{if(e.key==="Enter"&&!ans&&typed.trim())typeCheck();}}/>
      {!ans&&typed.trim()&&<button onClick={typeCheck} style={{width:"100%",padding:"12px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer",marginTop:8}}>Check</button>}
      {ans!==null&&<div style={{textAlign:"center",marginTop:10,fontSize:13,fontWeight:600,color:ans==="correct"?"#5FD4A0":"#FF8888"}}>{ans==="correct"?`✓ ${q.answer}`:`✗ ${q.answer}`}{q.pr&&` — ${q.pr}`}</div>}
    </div>}

    {q.type==="match"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center",marginBottom:14}}>Match Hungarian ↔ English</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {matchItems.map((item,i)=>{
          const matched=ms.matched.includes(item.key+item.lang);const sel=ms.sel&&ms.sel.text===item.text;const wr=ms.wrong===item.text;
          return <button key={i} disabled={matched} onClick={()=>{
            if(item.lang==="hu")speakHu(item.text,lesson.band);
            if(matched)return;if(!ms.sel){setMs({...ms,sel:item,wrong:null});return;}
            if(ms.sel.lang===item.lang){setMs({...ms,sel:item,wrong:null});return;}
            const pair=q.pairs.find(p=>(p.hu===ms.sel.text&&p.en===item.text)||(p.en===ms.sel.text&&p.hu===item.text));
            if(pair){const nm=[...ms.matched,pair.hu+"hu",pair.hu+"en"];setMs({sel:null,matched:nm,wrong:null});
              if(nm.length===q.pairs.length*2){q.pairs.forEach(p=>statsApi.recordPhrase(p.hu,true));setScore(s=>s+1);setAns("match_done");}}
            else{setMs({...ms,sel:null,wrong:item.text});setTimeout(()=>setMs(m=>({...m,wrong:null})),600);}
          }} style={{padding:"12px 8px",borderRadius:11,border:`2px solid ${matched?C.green:sel?color:wr?C.red:C.border}`,background:matched?`${C.green}10`:sel?`${color}10`:wr?`${C.red}10`:C.card,color:matched?"#5FD4A0":C.text,fontSize:13,fontWeight:600,cursor:matched?"default":"pointer",opacity:matched?0.4:1,textAlign:"center"}}>{item.text}</button>;
        })}
      </div>
    </div>}

    {q.type==="sentence_builder"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center"}}>Put the words in order:</div>
      <div style={{fontSize:15,fontWeight:700,color:C.text,textAlign:"center",margin:"8px 0 14px"}}>{q.en}</div>
      <div style={{minHeight:44,padding:"8px",borderRadius:11,border:`2px solid ${ans!==null?(ans==="sb_correct"?C.green:C.red):color+"60"}`,background:C.card,display:"flex",flexWrap:"wrap",gap:6,marginBottom:10,alignItems:"center"}}>
        {placed.length===0?<span style={{fontSize:12,color:C.dim,padding:"2px 4px"}}>tap tiles below to build the sentence</span>:
          placed.map((ti,pos)=><button key={pos} disabled={ans!==null} onClick={()=>setPlaced(p=>p.filter((_,j)=>j!==pos))}
            style={{padding:"6px 10px",borderRadius:8,border:`1.5px solid ${color}60`,background:`${color}15`,color:C.text,fontSize:14,fontWeight:700,cursor:ans?"default":"pointer"}}>{q.tiles[ti]}</button>)}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
        {q.tiles.map((tile,ti)=>placed.includes(ti)?null:
          <button key={ti} disabled={ans!==null} onClick={()=>setPlaced(p=>[...p,ti])}
            style={{padding:"6px 10px",borderRadius:8,border:`1.5px solid ${C.border}`,background:C.card,color:C.text,fontSize:14,fontWeight:700,cursor:ans?"default":"pointer"}}>{tile}</button>)}
      </div>
      {ans===null&&placed.length===q.tiles.length&&<button onClick={()=>{
        const correct=JSON.stringify(placed.map(i=>q.tiles[i]))===JSON.stringify(q.correctTiles);
        advance(correct);setAns(correct?"sb_correct":"sb_wrong");speakHu(q.phrase.hu,lesson.band);
      }} style={{width:"100%",padding:"12px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer"}}>Check</button>}
      {ans!==null&&<div style={{textAlign:"center",fontSize:13,fontWeight:600,color:ans==="sb_correct"?"#5FD4A0":"#FF8888",marginBottom:6}}>{ans==="sb_correct"?"✓ Correct!":"✗ "+q.correctTiles.join(" ")}</div>}
    </div>}

    </div>
    {ans!==null&&ans!=="done"&&<button onClick={goNext}
      style={{width:"100%",padding:"14px",borderRadius:14,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:15,fontWeight:700,cursor:"pointer",marginTop:16}}>{qi<total-1?"Next →":"Finish"}</button>}
  </div>;
}

// ─── APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("home");
  const [lessonId,setLessonId]=useState(null);
  const statsApi=useStats();
  const huVoiceAvail=useHuVoiceAvailable();

  const lesson=lessonId?LESSONS.find(l=>l.id===lessonId):null;
  const track=lesson?TRACKS.find(t=>t.id===lesson.trackId):null;

  return <div style={{fontFamily:"'Nunito',sans-serif",background:C.bg,color:C.text,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>

    {screen==="home"&&<div>
      <div style={{padding:"18px 16px 12px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5}}>Magyar Otthon</div>
        <div style={{fontSize:12,color:C.sub,marginTop:2}}>Bath Time · A1</div>
      </div>
      <div style={{padding:"12px 16px 80px"}}>
        {LESSONS.map(l=>{
          const t=TRACKS.find(t=>t.id===l.trackId);
          const sc=statsApi.stats.lessonScores[String(l.id)];
          const unlocked=isUnlocked(l,statsApi.stats.lessonScores);
          return <div key={l.id} onClick={()=>{if(unlocked){setLessonId(l.id);setScreen("quiz");}}}
            style={{background:C.card,border:`1px solid ${unlocked?C.border:C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:unlocked?"pointer":"default",display:"flex",alignItems:"center",gap:10,opacity:unlocked?1:0.45}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${t.color}20`,color:t.color,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0,lineHeight:1.2}}>
              <span>{l.band}</span><span>{l.seq}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>{l.title}</div>
              <div style={{fontSize:11,color:C.sub,marginTop:1}}>{l.sub}</div>
            </div>
            {sc&&<span style={{fontSize:11,fontWeight:700,color:sc.passed?C.green:sc.best>=60?C.amber:C.red}}>{sc.best}%</span>}
            <span style={{color:C.dim,fontSize:15}}>{unlocked?"›":"🔒"}</span>
          </div>;
        })}
      </div>
    </div>}

    {screen==="quiz"&&lesson&&track&&<div>
      <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`}}>
        <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer",padding:"4px 6px"}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:700,color:C.text}}>{lesson.title}</div>
          <div style={{fontSize:12,color:C.sub}}>{track.emoji} {track.title} · {lesson.band}</div>
        </div>
        <span style={{fontSize:12,color:track.color,fontWeight:700,background:`${track.color}18`,padding:"3px 9px",borderRadius:8}}>{lesson.band} {lesson.seq}</span>
      </div>
      {lesson.tip&&<div style={{margin:"10px 16px 0",padding:"10px 12px",borderRadius:10,background:`${track.color}10`,border:`1px solid ${track.color}22`,fontSize:12,color:"#C8C7D0",lineHeight:1.5}}>
        <span style={{fontWeight:800,color:track.color}}>Tip: </span>{lesson.tip}
      </div>}
      <QuizEngine lesson={lesson} track={track} onFinish={()=>setScreen("home")} statsApi={statsApi} huVoiceAvail={huVoiceAvail}/>
    </div>}
  </div>;
}
