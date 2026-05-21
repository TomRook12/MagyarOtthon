import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ─── LESSON DATA ──────────────────────────────────────────────────────────
const BAND_LABELS={"A1":"A1 — Foundation","A2":"A2 — Developing","B1":"B1 — Building","B2":"B2 — Expanding","C1":"C1 — Mastery"};
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

  // ── A2 ──────────────────────────────────────────────────────────────────
  { id:5, trackId:"bath-time", band:"A2", seq:1,
    title:"Imperative Mood", sub:"Mosd meg! · Töröld meg! · Öblítsd le!",
    types:["fill_pool","sentence_builder"],
    phrases:[
      {hu:"Mosd meg a kezed!",     pr:"mosd meg o KE-zed",       en:"Wash your hands!"},
      {hu:"Töröld meg az arcod!",  pr:"TÖ-röld meg oz OR-tsod",  en:"Wipe your face!"},
      {hu:"Öblítsd le!",           pr:"ÖB-lítsd le",             en:"Rinse it off!"},
      {hu:"Dörzsöld meg!",         pr:"DÖR-zhöld meg",           en:"Scrub it!"},
    ],
    tip:"Notice that meg and le always follow the verb — the pattern is the lesson, no rule needed yet." },

  { id:6, trackId:"bath-time", band:"A2", seq:2,
    title:"Temperature & Sensation", sub:"Hideg? · Túl forró! · Fáj?",
    types:["true_false","match"],
    phrases:[
      {hu:"Hideg a víz?",   pr:"HI-deg o víz",    en:"Is the water cold?"},
      {hu:"Túl forró!",     pr:"túl FOR-ró",       en:"Too hot!"},
      {hu:"Jó meleg?",      pr:"yó ME-leg",        en:"Is it nice and warm?"},
      {hu:"Fáj?",           pr:"fáy",              en:"Does it hurt?"},
      {hu:"Vigyázz, forró!", pr:"VI-dyáz FOR-ró",  en:"Careful, it's hot!"},
    ],
    tip:"Fáj? is one of the most useful parent-to-child questions in Hungarian — just one word." },

  { id:7, trackId:"bath-time", band:"A2", seq:3,
    title:"Sequencing Bath Time", sub:"Először · aztán · majd · utoljára",
    types:["sentence_builder","fill_pool"],
    phrases:[
      {hu:"Először a hajat.",   pr:"E-lő-shör o HO-yot",    en:"First the hair."},
      {hu:"Aztán a füleket.",   pr:"OZ-tán o FÜ-le-ket",    en:"Then the ears."},
      {hu:"Most a lábakat.",    pr:"mosht o LÁ-bo-kot",      en:"Now the feet."},
      {hu:"Majd kijövünk.",     pr:"moyd KI-yö-vünk",        en:"Then we get out."},
      {hu:"Utoljára a hát.",    pr:"U-tol-yá-ro o hát",      en:"Last, the back."},
    ],
    tip:"Először, aztán, majd, utoljára — use these sequencing words to narrate the whole routine out loud." },

  { id:8, trackId:"bath-time", band:"A2", seq:4,
    title:"Questions to the Child", sub:"Megmostad? · Kész vagy? · Fázol?",
    types:["match","phrase_list","true_false"],
    phrases:[
      {hu:"Megmostad a füledet?", pr:"meg-MOSH-tod o FÜ-le-det", en:"Did you wash your ears?"},
      {hu:"Jó volt?",             pr:"yó volt",                   en:"Was it good?"},
      {hu:"Kész vagy?",           pr:"kés vody",                  en:"Are you done?"},
      {hu:"Hideg?",               pr:"HI-deg",                    en:"Cold?"},
      {hu:"Fázol?",               pr:"FÁ-zol",                    en:"Are you cold?"},
    ],
    tip:"Fázol? asks if the child feels cold; Hideg? asks if something (the water) is cold." },

  // ── B1 ──────────────────────────────────────────────────────────────────
  { id:9, trackId:"bath-time", band:"B1", seq:1,
    title:"Imperative Mood (Explicit)", sub:"Mosd meg! · Jöjj be! · Gyere ki!",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"Mosd meg!",    pr:"mosd meg",    en:"Wash it!"},
      {hu:"Töröld meg!",  pr:"TÖ-röld meg", en:"Wipe it!"},
      {hu:"Öblítsd le!",  pr:"ÖB-lítsd le", en:"Rinse it off!"},
      {hu:"Jöjj be!",     pr:"yöy be",      en:"Come in!"},
      {hu:"Gyere ki!",    pr:"DYE-re ki",   en:"Come out!"},
    ],
    grammar:"The imperative pairs a verb stem with a directional prefix (igekötő: meg, le, be, ki). In the imperative, the prefix splits off and follows the verb. The ending changes by vowel harmony: back-vowel verbs like mos and töröl take -d; jöjj is irregular. You already know these phrases — now you know why they work.",
    tip:"Once you hear the verb + igekötő rhythm, you will spot it in every instruction you give." },

  { id:10, trackId:"bath-time", band:"B1", seq:2,
    title:"The Accusative Case", sub:"hajadat · füledet · kezét",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"Mosd meg a hajadat!",          pr:"mosd meg o HO-yo-dot",       en:"Wash your hair!"},
      {hu:"Ne felejtsd el a füledet!",    pr:"ne FE-leytsd el o FÜ-le-det", en:"Don't forget your ears!"},
      {hu:"Fogd meg a kezét!",            pr:"fogd meg o KE-zét",           en:"Hold his/her hand!"},
    ],
    grammar:"Hungarian marks the direct object with an accusative suffix (-t/-at/-et/-ot/-öt; vowel harmony chooses which). When the noun also has a possessive suffix (-d = your), they stack: haj → haja-d → haja-d-at. Fül → füle-d → füle-d-et. This is the same pattern that created hajat and füleket in Lesson 2.3.",
    tip:"Look for the double suffix: possessive first, then accusative. Stem + -d + -at/et is the core pattern." },

  { id:11, trackId:"bath-time", band:"B1", seq:3,
    title:"Negation", sub:"Ne csobbanj! · Ne sírj! · Nem túl forró.",
    types:["fill_typed","true_false"],
    phrases:[
      {hu:"Ne csobbanj!",          pr:"ne CHOB-bony",      en:"Don't splash!"},
      {hu:"Ne sírj!",              pr:"ne shírj",           en:"Don't cry!"},
      {hu:"Nem túl forró.",        pr:"nem túl FOR-ró",     en:"It's not too hot."},
      {hu:"Ne félj!",              pr:"ne féy",             en:"Don't be scared!"},
      {hu:"Ne igyál a vízből!",    pr:"ne I-dyál o VÍZ-böl", en:"Don't drink the water!"},
    ],
    grammar:"Two negation words: ne + imperative = prohibition (ne sírj! = don't cry!); nem + statement = factual negation (nem forró = it is not hot). Ne always precedes an imperative verb; nem precedes a declarative one. They are not interchangeable.",
    tip:"Ne félj! and Ne sírj! are among the most common calming phrases at bath time." },

  { id:12, trackId:"bath-time", band:"B1", seq:4,
    title:"Describing the Child's Behaviour", sub:"Nagyon ügyes! · Jól csináltad! · Miért sírsz?",
    types:["match","sentence_builder","fill_typed"],
    phrases:[
      {hu:"Nagyon ügyes vagy!",        pr:"NO-dyon Ü-dyesh vody",    en:"You're very clever!"},
      {hu:"Miért sírsz?",              pr:"MI-ért shírsh",            en:"Why are you crying?"},
      {hu:"Mindjárt kész leszünk.",    pr:"MIND-yárt kés LE-sünk",   en:"We'll be done in a moment."},
      {hu:"Jól csináltad!",            pr:"yól CHI-nál-tod",          en:"Well done!"},
      {hu:"Nem kell félni.",           pr:"nem kel FÉL-ni",           en:"There's nothing to be scared of."},
    ],
    tip:"Nagyon ügyes vagy! works for any age — use it freely. Jól csináltad! is specifically past tense: you did well." },

  { id:13, trackId:"bath-time", band:"B1", seq:5,
    title:"Past Tense in Bath Time", sub:"Megmostuk · Bejött · Kijött",
    types:["sentence_builder","fill_typed"],
    phrases:[
      {hu:"Megmostuk a haját.",    pr:"meg-MOSH-tuk o HO-yát",   en:"We washed her/his hair."},
      {hu:"Bejött a vízbe.",       pr:"BE-yött o VÍZ-be",         en:"She/he came into the water."},
      {hu:"Kijött a kádból.",      pr:"KI-yött o KÁD-ból",        en:"She/he got out of the bath."},
      {hu:"Megmostad a kezed?",    pr:"meg-MOSH-tod o KE-zed",    en:"Did you wash your hands?"},
      {hu:"Nem akart bejönni.",    pr:"nem O-kort BE-yön-ni",      en:"She/he didn't want to get in."},
    ],
    grammar:"Hungarian past tense adds -t or -tt to the verb stem (mos → mosott, jön → jött). The ending then encodes subject: -uk = we (definite), -ad = you informal definite, -t = she/he. The igekötő prefixes (meg, be, ki) you already know attach to the whole past form.",
    tip:"Jött and bejött come from the same verb (jön = to come). The prefix be/ki gives the direction." },

  // ── B2 ──────────────────────────────────────────────────────────────────
  { id:14, trackId:"bath-time", band:"B2", seq:1,
    title:"Parent-to-Parent Phrases", sub:"Megmostad a haját? · Már kint van.",
    types:["fill_typed","match"],
    phrases:[
      {hu:"Megmostad a haját?",             pr:"meg-MOSH-tod o HO-yát",         en:"Did you wash her/his hair?"},
      {hu:"Nem akar bejönni.",              pr:"nem O-kor BE-yön-ni",            en:"She/he doesn't want to get in."},
      {hu:"Hideg a víz, melegítsük fel?",   pr:"HI-deg o víz, ME-le-gít-shük fel", en:"The water's cold, shall we warm it up?"},
      {hu:"Már kint van.",                  pr:"már kint von",                   en:"She/he's already out."},
      {hu:"Még benn van a kádban.",         pr:"még ben von o KÁD-bon",          en:"She/he's still in the bath."},
    ],
    tip:"Register shift — these are adult-to-adult sentences about the child. Már (already) and még (still/yet) are a key pair to contrast." },

  { id:15, trackId:"bath-time", band:"B2", seq:2,
    title:"Conditional Sentences", sub:"Ha kész vagy · Ha hideg lenne",
    types:["sentence_builder","fill_typed"],
    phrases:[
      {hu:"Ha kész vagy, kijöhetsz.",       pr:"ho kés vody, KI-yö-hets",           en:"When you're done, you can get out."},
      {hu:"Ha nem mosod meg, maradunk.",    pr:"ho nem MO-shod meg, MO-ro-dunk",    en:"If you don't wash it, we stay."},
      {hu:"Ha hideg lenne, szólj.",         pr:"ho HI-deg LEN-ne, sóy",             en:"If it's cold, say so."},
      {hu:"Ha befejezted, kijöhetsz.",      pr:"ho BE-fe-yez-ted, KI-yö-hets",      en:"Once you've finished, you can get out."},
    ],
    grammar:"Ha introduces a conditional clause (if/when). Real conditionals use the indicative: ha kész vagy = when you're done. Hypothetical conditionals use -na/-ne/-ná/-né on the verb: ha hideg lenne = if it were cold. The main clause often uses the potential suffix -hat/-het: kijöhetsz = you can/are allowed to come out.",
    tip:"Ha kész vagy, kijöhetsz makes getting out a reward, not a command — a useful negotiating frame." },

  { id:16, trackId:"bath-time", band:"B2", seq:3,
    title:"Complex Instructions", sub:"Azért kell · Hadd csináljam · Addig nem",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"Azért kell megmosni, mert csúnya lesz.",           pr:"O-zért kel meg-MOSH-ni, mert CHÚ-nyo les",            en:"We need to wash it or it'll get dirty."},
      {hu:"Hadd csináljam én.",                               pr:"hod CHI-nál-yom én",                                   en:"Let me do it."},
      {hu:"Mindjárt befejezzük, csak még a lábad.",           pr:"MIND-yárt BE-fe-yez-zük, chok még o LÁ-bod",          en:"We're almost done, just your feet."},
      {hu:"Addig nem jöhetsz ki, amíg meg nem mostad.",       pr:"OD-dig nem YÖ-hets ki, O-míg meg nem MOSH-tod",       en:"You can't come out until you've washed it."},
    ],
    tip:"Hadd csináljam én uses the optative — a softer way to say 'let me'. Addig…amíg is the until-construction: not before you have done X." },

  { id:17, trackId:"bath-time", band:"B2", seq:4,
    title:"Resistance & Negotiation", sub:"Még egy kicsit! · Rendben, de aztán ki.",
    types:["match","fill_typed","phrase_list"],
    phrases:[
      {hu:"Még egy kicsit!",              pr:"még edy KI-chit",         en:"Just a little longer!"},
      {hu:"Nem akarok!",                  pr:"nem O-ko-rok",             en:"I don't want to!"},
      {hu:"Fáj!",                         pr:"fáy",                      en:"It hurts!"},
      {hu:"Rendben, de aztán ki.",        pr:"REND-ben de OZ-tán ki",    en:"Okay, but then out."},
      {hu:"Tudom, de kell.",              pr:"TU-dom de kel",             en:"I know, but it has to be done."},
      {hu:"Nem fáj, csak vicces.",        pr:"nem fáy, chok VIT-sesh",   en:"It doesn't hurt, it's just funny."},
      {hu:"Még öt perc, aztán kijövünk.", pr:"még öt perts, OZ-tán KI-yö-vünk", en:"Five more minutes, then we get out."},
    ],
    tip:"Learn the first three phrases for recognition (child says them), the last four for production (your responses). Tudom, de kell is calm authority in three words." },

  // ── C1 ──────────────────────────────────────────────────────────────────
  { id:18, trackId:"bath-time", band:"C1", seq:1,
    title:"Diminutives & Affectionate Language", sub:"hajacska · kicsim · Drágám",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"hajacska",              pr:"HO-yoch-ko",              en:"little hair"},
      {hu:"fülecske",              pr:"FÜ-lech-ke",              en:"little ear"},
      {hu:"lábacska",              pr:"LÁ-boch-ko",              en:"little foot"},
      {hu:"kezecske",              pr:"KE-zech-ke",              en:"little hand"},
      {hu:"hasacska",              pr:"HO-shoch-ko",             en:"little tummy"},
      {hu:"Gyerünk, kicsim!",      pr:"DYE-rünk KI-chim",        en:"Come on, my little one!"},
      {hu:"Szépecskén megmosjuk.", pr:"SÉ-pech-kén meg-MOSH-yuk", en:"We'll wash it up nicely."},
      {hu:"Drágám, gyere már!",    pr:"DRÁ-gám DYE-re már",      en:"Darling, come on now!"},
    ],
    grammar:"Hungarian uses diminutive suffixes to show affection: -ka/-ke or the more emphatic -cska/-cske (vowel harmony decides). These are not childish — native speakers use them freely. Drágám = my dear (drága + possessive -m). Kicsim = my little one (kicsi + -m). In szépecskén the diminutive even embeds inside an adverb.",
    tip:"Use diminutives freely — they make your Hungarian sound warmer and more natural." },

  { id:19, trackId:"bath-time", band:"C1", seq:2,
    title:"Idiomatic Bath Time", sub:"Csupa víz vagy! · mint a patyolat",
    types:["true_false","phrase_list","match"],
    phrases:[
      {hu:"Csupa víz vagy!",                           pr:"CHU-po víz vody",                              en:"You're soaking wet!"},
      {hu:"Olyan tiszta leszel, mint a patyolat.",     pr:"O-lyon TIS-to LE-sel, mint o PO-tyo-lot",     en:"You'll be spotless."},
      {hu:"Úgy nézel ki, mint egy kiskacsa!",          pr:"údy NÉ-zel ki, mint edy KISH-ko-cho",         en:"You look like a little duck!"},
      {hu:"Elfogyott a meleg víz.",                    pr:"el-FO-dyott o ME-leg víz",                    en:"The hot water's run out."},
      {hu:"Majd megiszod a fürdővizet!",               pr:"moyd ME-gi-sod o FÜR-dö-vi-zet",              en:"You'll end up drinking the bathwater!"},
    ],
    tip:"Csupa víz vagy is extremely common. Mint a patyolat is a fixed simile — patyolat means white linen and always appears in this expression." },

  { id:20, trackId:"bath-time", band:"C1", seq:3,
    title:"Storytelling & Extended Speech", sub:"ami · Először…végül · Mi lenne, ha…",
    types:["sentence_builder","fill_typed"],
    phrases:[
      {hu:"A kacsa, ami a vízben úszik, a tiéd.",                          pr:"o KO-cho, O-mi o VÍZ-ben Ú-sik, o TI-éd",                             en:"The duck that swims in the water is yours."},
      {hu:"Először megmosdunk, azután megtörölközünk, végül kijövünk.",    pr:"E-lő-shör meg-MOSH-dunk, O-zu-tán meg-TÖ-röl-kö-zünk, VÉ-gül KI-yö-vünk", en:"First we wash, then we dry off, finally we get out."},
      {hu:"Mi lenne, ha nem akarna kijönni a kádból?",                     pr:"mi LEN-ne, ho nem O-kor-no KI-yön-ni o KÁD-ból",                      en:"What would happen if she/he didn't want to get out of the bath?"},
      {hu:"Mesélj nekem a buborékokról!",                                   pr:"ME-shély NE-kem o BU-bo-ré-kok-ról",                                   en:"Tell me about the bubbles!"},
      {hu:"Olyan volt, mintha egy kis hal lenne a vízben.",                 pr:"O-lyon volt, MINT-ho edy kish hol LEN-ne o VÍZ-ben",                   en:"It was as if she/he were a little fish in the water."},
    ],
    tip:"Ami = who/that/which for things. Relative clauses slot between the noun and the rest of the sentence, set off by commas." },

  { id:21, trackId:"bath-time", band:"C1", seq:4,
    title:"Capstone: Full Bath Time Scenario", sub:"All bands · All question types",
    types:["match","phrase_list","fill_typed","sentence_builder","true_false"],
    phrases:[
      {hu:"Gyere a kádba, a víz jó meleg!",                    pr:"DYE-re o KÁD-bo, o víz yó ME-leg",                 en:"Come into the bath, the water's nice and warm!"},
      {hu:"Mosd meg a hajadat, majd a füledet!",               pr:"mosd meg o HO-yo-dot, moyd o FÜ-le-det",           en:"Wash your hair, then your ears!"},
      {hu:"Ha kész vagy, kijöhetsz és megtörölközünk.",        pr:"ho kés vody, KI-yö-hets és meg-TÖ-röl-kö-zünk",   en:"When you're done, you can get out and we'll dry off."},
      {hu:"Nagyon ügyes voltál ma!",                           pr:"NO-dyon Ü-dyesh vol-tál mo",                       en:"You were very good today!"},
      {hu:"Csupa víz vagy, de milyen tiszta leszel!",          pr:"CHU-po víz vody, de MI-yen TIS-to LE-sel",         en:"You're soaking wet, but how clean you'll be!"},
    ],
    tip:"This capstone spans the full Bath Time arc — A1 vocabulary through C1 idiom. All question types are used." },
];

// ─── UTILITIES ─────────────────────────────────────────────────────────────
function getRecommendedNext(stats){
  const {lastActiveLessonId,lessonScores}=stats;
  const ref=lastActiveLessonId?LESSONS.find(l=>l.id===lastActiveLessonId):LESSONS[0];
  if(!ref)return null;
  const bands=["A1","A2","B1","B2","C1"];
  const trackLessons=LESSONS.filter(l=>l.trackId===ref.trackId).sort((a,b)=>bands.indexOf(a.band)-bands.indexOf(b.band)||a.seq-b.seq);
  return trackLessons.find(l=>!lessonScores[String(l.id)]?.passed&&isUnlocked(l,lessonScores))||null;
}
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
  const [missed,setMissed]=useState([]);

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

  const advance=(correct)=>{if(q.phrase)statsApi.recordPhrase(q.phrase.hu,correct);if(correct)setScore(s=>s+1);else if(q.phrase)setMissed(m=>m.some(p=>p.hu===q.phrase.hu)?m:[...m,q.phrase]);};
  const goNext=()=>{
    if(qi<total-1){setQi(i=>i+1);setAns(null);setTyped("");setMs({sel:null,matched:[],wrong:null});setPlaced([]);}
    else{statsApi.recordLesson(lesson.id,score+(ans==="match_done"||ans==="sb_correct"?0:0),total);setAns("done");}
  };

  if(ans==="done"){
    const pct=Math.round(score/total*100);
    const passed=pct>=80;
    return <div style={{padding:"40px 20px 80px"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:52}}>{passed?"🎉":pct>=60?"👏":"💪"}</div>
        <div style={{fontSize:30,fontWeight:900,color:C.text,marginTop:10}}>{score}/{total}</div>
        <div style={{fontSize:22,fontWeight:800,color:passed?C.green:pct>=60?C.amber:C.red,marginTop:4}}>{pct}%</div>
        <div style={{fontSize:15,color:C.sub,marginTop:4}}>{passed?"Passed — next lesson unlocked!":pct>=60?"Almost there!":"Keep going!"}</div>
      </div>
      {missed.length>0&&<div style={{marginTop:28}}>
        <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:0.5,textTransform:"uppercase",marginBottom:10}}>Missed</div>
        {missed.map(p=><div key={p.hu} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700,color:C.text}}>{p.hu}</div>
            <div style={{fontSize:11,color:C.dim,fontStyle:"italic"}}>{p.pr}</div>
          </div>
          <div style={{fontSize:13,color:C.sub}}>{p.en}</div>
        </div>)}
      </div>}
      <div style={{display:"flex",gap:10,marginTop:24}}>
        <button onClick={onFinish} style={{flex:1,padding:"13px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer"}}>Back to lessons</button>
        <button onClick={()=>{setQi(0);setScore(0);setAns(null);setTyped("");setPlaced([]);setMs({sel:null,matched:[],wrong:null});setMissed([]);}}
          style={{flex:1,padding:"13px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer"}}>Retry</button>
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

// ─── SCREENS ──────────────────────────────────────────────────────────────
function GrammarCard({lesson,track,onDismiss,onBack}){
  return <div style={{padding:"16px 16px 80px"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,paddingBottom:12,borderBottom:`1px solid ${C.border}`}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer",padding:"4px 6px"}}>←</button>
      <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text}}>Grammar Note</div>
      <span style={{fontSize:12,color:track.color,fontWeight:700,background:`${track.color}18`,padding:"3px 9px",borderRadius:8}}>{lesson.band}</span>
    </div>
    <div style={{background:C.card,border:`1px solid ${track.color}30`,borderRadius:14,padding:"18px 16px",marginBottom:24}}>
      <div style={{fontSize:15,color:C.text,lineHeight:1.65}}>{lesson.grammar}</div>
    </div>
    <button onClick={onDismiss} style={{width:"100%",padding:"14px",borderRadius:14,background:track.color,border:"none",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>Got it →</button>
  </div>;
}

function HomeScreen({statsApi,onOpenTrack,onOpenLesson}){
  const {stats}=statsApi;
  const rec=getRecommendedNext(stats);
  const recTrack=rec?TRACKS.find(t=>t.id===rec.trackId):null;
  const trackHasContent=t=>LESSONS.some(l=>l.trackId===t.id);
  const trackPassed=t=>LESSONS.filter(l=>l.trackId===t.id).filter(l=>stats.lessonScores[String(l.id)]?.passed).length;
  const trackTotal=t=>LESSONS.filter(l=>l.trackId===t.id).length;

  return <div>
    <div style={{padding:"18px 16px 14px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5}}>Magyar Otthon</div>
      <div style={{fontSize:12,color:C.sub,marginTop:2}}>Tanulj minden nap</div>
    </div>
    <div style={{padding:"12px 16px 80px"}}>
      {rec&&recTrack&&<div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>Recommended Next</div>
        <div onClick={()=>onOpenLesson(rec)} style={{background:`${recTrack.color}12`,border:`1px solid ${recTrack.color}40`,borderRadius:12,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:28,lineHeight:1}}>{recTrack.emoji}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:800,color:recTrack.color}}>{recTrack.title}</div>
            <div style={{fontSize:15,fontWeight:700,color:C.text,marginTop:1}}>{rec.title}</div>
            <div style={{fontSize:11,color:C.sub,marginTop:1}}>{rec.band} · {rec.sub}</div>
          </div>
          <span style={{color:recTrack.color,fontSize:18}}>›</span>
        </div>
      </div>}
      {!rec&&stats.lastActiveLessonId&&<div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>Recommended Next</div>
        <div style={{background:`${C.green}12`,border:`1px solid ${C.green}40`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:28,lineHeight:1}}>🎉</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700,color:C.green}}>Track Complete!</div>
            <div style={{fontSize:11,color:C.sub,marginTop:1}}>All lessons passed</div>
          </div>
        </div>
      </div>}
      <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>Tracks</div>
      {TRACKS.map(t=>{
        const hasContent=trackHasContent(t);
        const passed=hasContent?trackPassed(t):0;
        const total=hasContent?trackTotal(t):0;
        const allDone=hasContent&&passed===total&&total>0;
        return <div key={t.id} onClick={()=>{if(hasContent)onOpenTrack(t);}}
          style={{background:C.card,border:`1px solid ${allDone?C.green:C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:hasContent?"pointer":"default",display:"flex",alignItems:"center",gap:14,opacity:hasContent?1:0.45}}>
          <div style={{fontSize:26,lineHeight:1,width:36,textAlign:"center",flexShrink:0}}>{t.emoji}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700,color:hasContent?C.text:C.sub}}>{t.title}</div>
            {hasContent&&<div style={{marginTop:5}}>
              <div style={{height:4,borderRadius:2,background:C.border,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${total>0?passed/total*100:0}%`,background:allDone?C.green:t.color,borderRadius:2,transition:"width 0.3s"}}/>
              </div>
              <div style={{fontSize:10,color:C.sub,marginTop:3}}>{passed}/{total} passed</div>
            </div>}
            {!hasContent&&<div style={{fontSize:11,color:C.dim,marginTop:2}}>Coming soon</div>}
          </div>
          <span style={{fontSize:15,color:C.dim}}>{hasContent?(allDone?"✓":"›"):"🔒"}</span>
        </div>;
      })}
    </div>
  </div>;
}

function TrackDetail({track,statsApi,onOpenLesson,onBack}){
  const {stats}=statsApi;
  const bands=["A1","A2","B1","B2","C1"];
  const lessons=LESSONS.filter(l=>l.trackId===track.id).sort((a,b)=>bands.indexOf(a.band)-bands.indexOf(b.band)||a.seq-b.seq);
  const passed=lessons.filter(l=>stats.lessonScores[String(l.id)]?.passed).length;
  const total=lessons.length;
  const presentBands=[...new Set(lessons.map(l=>l.band))];

  return <div>
    <div style={{padding:"14px 16px 12px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer",padding:"4px 6px"}}>←</button>
        <div style={{fontSize:20}}>{track.emoji}</div>
        <div style={{flex:1,fontSize:17,fontWeight:800,color:C.text}}>{track.title}</div>
        <span style={{fontSize:12,color:track.color,fontWeight:700}}>{passed}/{total}</span>
      </div>
      <div style={{height:5,borderRadius:3,background:C.border,overflow:"hidden",marginLeft:46}}>
        <div style={{height:"100%",width:`${total>0?passed/total*100:0}%`,background:track.color,borderRadius:3,transition:"width 0.3s"}}/>
      </div>
    </div>
    <div style={{padding:"8px 16px 80px"}}>
      {presentBands.map(band=>{
        const bandLessons=lessons.filter(l=>l.band===band);
        return <div key={band} style={{marginBottom:4}}>
          <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:0.5,textTransform:"uppercase",padding:"12px 0 6px"}}>{BAND_LABELS[band]}</div>
          {bandLessons.map(l=>{
            const sc=stats.lessonScores[String(l.id)];
            const unlocked=isUnlocked(l,stats.lessonScores);
            return <div key={l.id} onClick={()=>{if(unlocked)onOpenLesson(l);}}
              style={{background:C.card,border:`1px solid ${sc?.passed?`${track.color}40`:C.border}`,borderRadius:10,padding:"11px 14px",marginBottom:6,cursor:unlocked?"pointer":"default",display:"flex",alignItems:"center",gap:10,opacity:unlocked?1:0.45}}>
              <div style={{width:36,height:36,borderRadius:8,background:`${track.color}18`,color:track.color,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,flexShrink:0,lineHeight:1.2}}>
                <span>{l.band}</span><span>{l.seq}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.text}}>{l.title}</div>
                {l.sub&&<div style={{fontSize:11,color:C.sub,marginTop:1}}>{l.sub}</div>}
              </div>
              {sc&&<span style={{fontSize:11,fontWeight:700,color:sc.passed?C.green:sc.best>=60?C.amber:C.red}}>{sc.best}%</span>}
              <span style={{fontSize:15,color:C.dim}}>{unlocked?"›":"🔒"}</span>
            </div>;
          })}
        </div>;
      })}
    </div>
  </div>;
}

// ─── APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("home");
  const [trackId,setTrackId]=useState(null);
  const [lessonId,setLessonId]=useState(null);
  const statsApi=useStats();
  const huVoiceAvail=useHuVoiceAvailable();

  const lesson=lessonId?LESSONS.find(l=>l.id===lessonId):null;
  const activeTrack=trackId?TRACKS.find(t=>t.id===trackId):null;
  const quizTrack=lesson?TRACKS.find(t=>t.id===lesson.trackId):null;
  const needsGrammarCard=!!(lesson?.grammar&&!statsApi.stats.lessonScores[String(lesson.id)]?.grammarSeen);

  function openTrack(t){setTrackId(t.id);setScreen("track");}
  function openLesson(l){setLessonId(l.id);setScreen("quiz");}
  function backToTrack(){setScreen("track");}
  function backToHome(){setScreen("home");}

  return <div style={{fontFamily:"'Nunito',sans-serif",background:C.bg,color:C.text,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>

    {screen==="home"&&<HomeScreen statsApi={statsApi} onOpenTrack={openTrack} onOpenLesson={openLesson}/>}
    {screen==="track"&&activeTrack&&<TrackDetail track={activeTrack} statsApi={statsApi} onOpenLesson={openLesson} onBack={backToHome}/>}
    {screen==="quiz"&&lesson&&quizTrack&&(needsGrammarCard
      ?<GrammarCard lesson={lesson} track={quizTrack} onDismiss={()=>statsApi.markGrammarSeen(lesson.id)} onBack={backToTrack}/>
      :<div>
        <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`}}>
          <button onClick={backToTrack} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer",padding:"4px 6px"}}>←</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text}}>{lesson.title}</div>
            <div style={{fontSize:12,color:C.sub}}>{quizTrack.emoji} {quizTrack.title} · {lesson.band}</div>
          </div>
          <span style={{fontSize:12,color:quizTrack.color,fontWeight:700,background:`${quizTrack.color}18`,padding:"3px 9px",borderRadius:8}}>{lesson.band} {lesson.seq}</span>
        </div>
        {lesson.tip&&<div style={{margin:"10px 16px 0",padding:"10px 12px",borderRadius:10,background:`${quizTrack.color}10`,border:`1px solid ${quizTrack.color}22`,fontSize:12,color:C.text,lineHeight:1.5}}>
          <span style={{fontWeight:800,color:quizTrack.color}}>Tip: </span>{lesson.tip}
        </div>}
        <QuizEngine lesson={lesson} track={quizTrack} onFinish={backToTrack} statsApi={statsApi} huVoiceAvail={huVoiceAvail}/>
      </div>
    )}
  </div>;
}
