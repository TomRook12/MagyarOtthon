import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ─── LESSON DATA ──────────────────────────────────────────────────────────
const BANDS=["A1","A2","B1","B2","C1"];
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
  { id:1, trackId:"bath-time", band:"A1", seq:1, rung:1,
    title:"Bath Time Objects", sub:"kád · víz · szappan · sampon",
    types:["match","phrase_list"],
    phrases:[
      {hu:"kád",       pr:"kád",          en:"bath"},
      {hu:"víz",       pr:"víz",          en:"water"},
      {hu:"szappan",   pr:"SOP-pon",      en:"soap"},
      {hu:"sampon",    pr:"SHOM-pon",     en:"shampoo"},
      {hu:"törölköző", pr:"TÖ-röl-kö-ző", en:"towel"},
      {hu:"kacsa",     pr:"KO-cho",       en:"duck"},
      {hu:"csap",      pr:"chop",         en:"tap"},
      {hu:"buborék",   pr:"BU-bo-rék",    en:"bubble"},
    ],
    tip:"Repeat the word as you point to each object at bath time." },

  { id:2, trackId:"bath-time", band:"A1", seq:2, rung:1,
    title:"Body Parts", sub:"haj · fej · fül · kéz",
    types:["match","phrase_list"],
    phrases:[
      {hu:"haj",  pr:"hoy",  en:"hair"},
      {hu:"fej",  pr:"fey",  en:"head"},
      {hu:"fül",  pr:"fül",  en:"ear"},
      {hu:"kéz",  pr:"kéz",  en:"hand"},
      {hu:"láb",  pr:"láb",  en:"foot"},
      {hu:"arc",  pr:"orts", en:"face"},
      {hu:"has",  pr:"hosh", en:"tummy"},
      {hu:"ujj",  pr:"uy",   en:"finger"},
    ],
    tip:"Point to each body part as you wash it. 'Hol a füled?' then touch the ear." },

  { id:3, trackId:"bath-time", band:"A1", seq:3, rung:1,
    title:"Single-Word Commands", sub:"Gyere! · Ülj! · Állj! · Csitt!",
    types:["match","phrase_list"],
    phrases:[
      {hu:"Gyere!", pr:"DYE-re", en:"Come!"},
      {hu:"Ülj!",   pr:"ewy",    en:"Sit!"},
      {hu:"Állj!",  pr:"áy",     en:"Stop!"},
      {hu:"Várj!",  pr:"váry",   en:"Wait!"},
      {hu:"Nézd!",  pr:"nézd",  en:"Look!"},
      {hu:"Csitt!", pr:"chitt",  en:"Shh!"},
    ],
    tip:"These are the natural shortened imperative forms parents use with young children. Use one every bath time." },

  { id:4, trackId:"bath-time", band:"A1", seq:4, rung:2,
    title:"The Little Word \"a\"", sub:"a kád · a víz · az arc",
    types:["match","phrase_list"],
    phrases:[
      {hu:"a kád",         pr:"o kád",              en:"the bath"},
      {hu:"a víz",         pr:"o víz",              en:"the water"},
      {hu:"a szappan",     pr:"o SOP-pon",          en:"the soap"},
      {hu:"a törölköző",   pr:"o TÖ-röl-kö-ző",     en:"the towel"},
      {hu:"az arc",        pr:"oz orts",            en:"the face"},
      {hu:"a kéz",         pr:"o kéz",              en:"the hand"},
      {hu:"a láb",         pr:"o láb",              en:"the foot"},
      {hu:"a haj",         pr:"o hoy",              en:"the hair"},
    ],
    tip:"The word 'a' means 'the' — it doesn't change the noun at all, it just sits in front of it. Before a vowel it becomes 'az', as in az arc." },

  { id:5, trackId:"bath-time", band:"A1", seq:5, rung:2,
    title:"Your Body", sub:"kezed · lábad · hajad",
    types:["match","phrase_list"],
    phrases:[
      {hu:"kezed",  pr:"KE-zed",  en:"your hand"},
      {hu:"lábad",  pr:"LÁ-bod",  en:"your foot"},
      {hu:"hajad",  pr:"HO-yod",  en:"your hair"},
      {hu:"arcod",  pr:"OR-tsod", en:"your face"},
      {hu:"fejed",  pr:"FE-yed",  en:"your head"},
      {hu:"füled",  pr:"FÜ-led",  en:"your ear"},
      {hu:"hasad",  pr:"HO-shod", en:"your tummy"},
      {hu:"ujjad",  pr:"UY-yod",  en:"your finger"},
    ],
    tip:"Notice the -d ending — it means 'your'. kéz becomes kezed the same way haj becomes hajad." },

  { id:6, trackId:"bath-time", band:"A1", seq:6, rung:3,
    title:"Warm and Cold", sub:"meleg víz · hideg láb",
    types:["match","phrase_list","fill_pool"],
    phrases:[
      {hu:"meleg víz", pr:"ME-leg víz", en:"warm water"},
      {hu:"hideg víz", pr:"HI-deg víz", en:"cold water"},
      {hu:"meleg kéz", pr:"ME-leg kéz", en:"warm hand"},
      {hu:"hideg láb", pr:"HI-deg láb", en:"cold foot"},
      {hu:"meleg kád", pr:"ME-leg kád", en:"warm bath"},
      {hu:"hideg arc", pr:"HI-deg orts", en:"cold face"},
    ],
    tip:"Meleg (warm) and hideg (cold) always come before the noun, just like in English." },

  { id:7, trackId:"bath-time", band:"A1", seq:7, rung:3,
    title:"Clean and Dirty", sub:"tiszta kéz · piszkos láb",
    types:["match","phrase_list","fill_pool"],
    phrases:[
      {hu:"tiszta kéz",  pr:"TIS-to kéz",   en:"clean hand"},
      {hu:"piszkos láb", pr:"PIS-kosh láb", en:"dirty foot"},
      {hu:"tiszta arc",  pr:"TIS-to orts",  en:"clean face"},
      {hu:"piszkos haj", pr:"PIS-kosh hoy", en:"dirty hair"},
      {hu:"tiszta víz",  pr:"TIS-to víz",   en:"clean water"},
      {hu:"a meleg víz", pr:"o ME-leg víz", en:"the warm water"},
    ],
    tip:"Tiszta (clean) and piszkos (dirty) — the last phrase shows meleg and a working together, just like lesson 4." },

  // ── A2 ──────────────────────────────────────────────────────────────────
  { id:8, trackId:"bath-time", band:"A2", seq:1, rung:3,
    title:"Into the Bath", sub:"a kádba · a vízbe · a kádból",
    types:["match","phrase_list","fill_pool"],
    phrases:[
      {hu:"a kádba",       pr:"o KÁD-bo",       en:"into the bath"},
      {hu:"a vízbe",       pr:"o VÍZ-be",       en:"into the water"},
      {hu:"a kádból",      pr:"o KÁD-ból",      en:"out of the bath"},
      {hu:"a csapból",     pr:"o CHOP-ból",     en:"out of the tap"},
      {hu:"meleg vízbe",   pr:"ME-leg VÍZ-be",  en:"into warm water"},
      {hu:"tiszta vízbe",  pr:"TIS-to VÍZ-be",  en:"into clean water"},
    ],
    tip:"-ba/-be means 'into'; -ból/-ből means 'out of'. Same words as before, now with direction added." },

  { id:9, trackId:"bath-time", band:"A2", seq:2, rung:4,
    title:"First Sentences", sub:"Gyere a kádba! · Ülj a kádba!",
    types:["match","fill_pool","sentence_builder","true_false"],
    phrases:[
      {hu:"Gyere a kádba!",        pr:"DYE-re o KÁD-bo",     en:"Come into the bath!"},
      {hu:"Ülj a kádba!",          pr:"ewy o KÁD-bo",        en:"Sit in the bath!"},
      {hu:"Nézd a vizet!",         pr:"nézd o VI-zet",      en:"Look at the water!"},
      {hu:"Állj a kádban!",        pr:"áy o KÁD-bon",        en:"Stand in the bath!"},
      {hu:"Gyere a meleg vízbe!",  pr:"DYE-re o ME-leg VÍZ-be", en:"Come into the warm water!"},
    ],
    tip:"Every word in these sentences is one you already know — this is your first real sentence in Hungarian." },

  { id:10, trackId:"bath-time", band:"A2", seq:3, rung:4,
    title:"Wash Yourself", sub:"Mosd meg a kezed!",
    types:["fill_pool","sentence_builder","true_false"],
    phrases:[
      {hu:"Mosd meg a kezed!",    pr:"mosd meg o KE-zed",   en:"Wash your hand!"},
      {hu:"Mosd meg az arcod!",   pr:"mosd meg oz OR-tsod", en:"Wash your face!"},
      {hu:"Mosd meg a hajad!",    pr:"mosd meg o HO-yod",   en:"Wash your hair!"},
      {hu:"Mosd meg a lábad!",    pr:"mosd meg o LÁ-bod",   en:"Wash your foot!"},
      {hu:"Mosd meg a hasad!",    pr:"mosd meg o HO-shod",  en:"Wash your tummy!"},
    ],
    tip:"Mosd meg means 'wash it' — meg always follows the verb in this pattern." },

  { id:11, trackId:"bath-time", band:"A2", seq:4, rung:4,
    title:"Drying Off", sub:"Töröld meg a kezed! · Hol a törölköző?",
    types:["fill_pool","sentence_builder","true_false"],
    phrases:[
      {hu:"Töröld meg a kezed!",   pr:"TÖ-röld meg o KE-zed",   en:"Dry your hand!"},
      {hu:"Töröld meg a hajad!",   pr:"TÖ-röld meg o HO-yod",   en:"Dry your hair!"},
      {hu:"Töröld meg az arcod!",  pr:"TÖ-röld meg oz OR-tsod", en:"Dry your face!"},
      {hu:"Töröld meg a lábad!",   pr:"TÖ-röld meg o LÁ-bod",   en:"Dry your foot!"},
      {hu:"Hol a törölköző?",      pr:"hol o TÖ-röl-kö-ző",     en:"Where's the towel?"},
    ],
    tip:"Töröld meg follows the same pattern as mosd meg. Hol means 'where'." },

  { id:12, trackId:"bath-time", band:"A2", seq:5, rung:4,
    title:"Soap and Shampoo", sub:"Hol a szappan? · Add a szappant!",
    types:["match","fill_pool","sentence_builder"],
    phrases:[
      {hu:"Hol a szappan?",                    pr:"hol o SOP-pon",              en:"Where's the soap?"},
      {hu:"Add a szappant!",                   pr:"odd o SOP-pont",             en:"Give me the soap!"},
      {hu:"Mosd meg a hajad samponnal!",       pr:"mosd meg o HO-yod SHOM-pon-nol", en:"Wash your hair with shampoo!"},
      {hu:"Nézd a buborékot!",                 pr:"nézd o BU-bo-ré-kot",       en:"Look at the bubble!"},
    ],
    tip:"Add means 'give' — a new little verb, still built from words you already know." },

  { id:13, trackId:"bath-time", band:"A2", seq:6, rung:4,
    title:"Temperature Questions", sub:"Hideg a víz? · Forró a víz!",
    types:["fill_pool","sentence_builder","true_false"],
    phrases:[
      {hu:"Hideg a víz?",          pr:"HI-deg o víz",     en:"Is the water cold?"},
      {hu:"Meleg a kezed?",        pr:"ME-leg o KE-zed",  en:"Is your hand warm?"},
      {hu:"Forró a víz!",          pr:"FOR-ró o víz",     en:"The water is hot!"},
      {hu:"Forró a törölköző?",    pr:"FOR-ró o TÖ-röl-kö-ző", en:"Is the towel hot?"},
      {hu:"Meleg a lábad?",        pr:"ME-leg o LÁ-bod",  en:"Is your foot warm?"},
      {hu:"Hideg a hajad?",        pr:"HI-deg o HO-yod",  en:"Is your hair cold?"},
      {hu:"Túl forró a kezed?",    pr:"túl FOR-ró o KE-zed", en:"Is your hand too hot?"},
    ],
    tip:"Forró means 'hot' — stronger than meleg (warm). Túl means 'too' (as in too much)." },

  { id:14, trackId:"bath-time", band:"A2", seq:7, rung:4,
    title:"Yes, No, Not Yet", sub:"Igen · Nem · Még nem · Kész",
    types:["match","fill_pool","true_false"],
    phrases:[
      {hu:"Kész a víz?",           pr:"kés o víz",         en:"Is the water ready?"},
      {hu:"Nem, még nem.",         pr:"nem még nem",       en:"No, not yet."},
      {hu:"Igen, kész a kád!",     pr:"I-gen kés o kád",   en:"Yes, the bath is ready!"},
      {hu:"Nem tiszta a szappan.", pr:"nem TIS-to o SOP-pon", en:"The soap isn't clean."},
      {hu:"Még piszkos a lábad.",  pr:"még PIS-kosh o LÁ-bod", en:"Your foot is still dirty."},
      {hu:"Nem hideg, forró!",     pr:"nem HI-deg FOR-ró", en:"Not cold, hot!"},
      {hu:"Igen, meleg a víz.",    pr:"I-gen ME-leg o víz", en:"Yes, the water's warm."},
      {hu:"Még nem kész a haj.",   pr:"még nem kés o hoy", en:"The hair isn't done yet."},
      {hu:"Igen, tiszta a kezed!", pr:"I-gen TIS-to o KE-zed", en:"Yes, your hand is clean!"},
    ],
    tip:"Nem = no/not, még = still/yet, igen = yes, kész = ready/done. Four small words you'll use constantly." },

  // ── B1 ──────────────────────────────────────────────────────────────────
  { id:15, trackId:"bath-time", band:"B1", seq:1, rung:4,
    title:"Simple Questions", sub:"Kész vagy? · Hol a kacsa?",
    types:["match","fill_pool","true_false"],
    phrases:[
      {hu:"Már kész vagy?",        pr:"már kés vody",     en:"Are you ready yet?"},
      {hu:"Hol a kacsa?",          pr:"hol o KO-cho",     en:"Where's the duck? (short form, no van)"},
      {hu:"Hol van a szappan?",    pr:"hol von o SOP-pon", en:"Where is the soap?"},
      {hu:"Hol van a törölköző?",  pr:"hol von o TÖ-röl-kö-ző", en:"Where is the towel?"},
      {hu:"Már tiszta vagy?",      pr:"már TIS-to vody",  en:"Are you clean yet?"},
      {hu:"Piszkos a kacsa?",      pr:"PIS-kosh o KO-cho", en:"Is the duck dirty?"},
      {hu:"Hol van a kacsa?",      pr:"hol von o KO-cho", en:"Where is the duck? (full form, with van)"},
      {hu:"Piszkos a kezed?",      pr:"PIS-kosh o KE-zed", en:"Is your hand dirty?"},
    ],
    tip:"Vagy means 'are' (talking to you); van means 'is'. In a hol question you can keep van or drop it — Hol van a kacsa? and Hol a kacsa? are both correct, and the short one is what you'll hear most at home." },

  { id:16, trackId:"bath-time", band:"B1", seq:2, rung:5,
    title:"The Accusative Case", sub:"fejedet · füledet · ujjadat",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"Mosd meg a fejedet!",  pr:"mosd meg o FE-ye-det",  en:"Wash your head!"},
      {hu:"Mosd meg a füledet!",  pr:"mosd meg o FÜ-le-det",  en:"Wash your ear!"},
      {hu:"Mosd meg az ujjadat!", pr:"mosd meg oz UY-yo-dot", en:"Wash your finger!"},
      {hu:"Nyisd ki a csapot!",   pr:"NYISH-d ki o CHO-pot",  en:"Turn on the tap!"},
      {hu:"Add ide a sampont!",   pr:"odd I-de o SHOM-pont",  en:"Give me the shampoo!"},
      {hu:"Töröld meg a füledet!", pr:"TÖ-röld meg o FÜ-le-det", en:"Dry your ear!"},
      {hu:"Fogd meg a kezét!",    pr:"fogd meg o KE-zét",     en:"Hold his/her hand!"},
    ],
    grammar:"Hungarian marks a direct object with the accusative suffix -t (with a linking vowel — -at/-et/-ot/-öt — chosen by vowel harmony). Words without a possessive, like csapot and sampont, take it directly. When the noun already carries a possessive suffix, the two can stack: fej → fejed (your head) → fejedet (your head, as the object).\n\nWith -m (my) and -d (your), that -t is optional. Mosd meg a kezed! and Mosd meg a kezedet! are both correct — the short form is what you will usually hear at home, which is why most lessons here use it. The longer form is a little more careful or emphatic.\n\nWith his/her (-a/-e/-ja/-je) it is not optional: the -t is required. That is why this lesson says Fogd meg a kezét! and never Fogd meg a keze!",
    tip:"Listen for the extra -et/-at at the end — that's the accusative doing its job." },

  { id:17, trackId:"bath-time", band:"B1", seq:3, rung:5,
    title:"Sequencing", sub:"Először · Aztán",
    types:["sentence_builder","fill_typed"],
    phrases:[
      {hu:"Először a hajat mossuk.",      pr:"E-lő-shör o HO-yot MOSH-shuk", en:"First we wash the hair."},
      {hu:"Aztán öblítsd le a füled!",    pr:"OZ-tán ÖB-lítsd le o FÜ-led",  en:"Then rinse your ear!"},
      {hu:"Aztán töröld meg a kezed!",    pr:"OZ-tán TÖ-röld meg o KE-zed",  en:"Then dry your hand!"},
      {hu:"Először öblítsd le a fejed!",  pr:"E-lő-shör ÖB-lítsd le o FE-yed", en:"First rinse your head!"},
      {hu:"Aztán nézd meg a buborékot!",  pr:"OZ-tán nézd meg o BU-bo-ré-kot", en:"Then look at the bubble!"},
      {hu:"Először gyere a kádba!",       pr:"E-lő-shör DYE-re o KÁD-bo",    en:"First come into the bath!"},
    ],
    tip:"Először = first, aztán = then. Use them to narrate the whole bath-time routine out loud." },

  { id:18, trackId:"bath-time", band:"B1", seq:4, rung:5,
    title:"Negation in Sentences", sub:"Ne állj fel! · Nem forró.",
    types:["fill_typed","true_false"],
    phrases:[
      {hu:"Ne állj fel a kádban!",   pr:"ne áy fel o KÁD-bon", en:"Don't stand up in the bath!"},
      {hu:"Ülj le, ne állj!",        pr:"ewy le ne áy",        en:"Sit down, don't stand!"},
      {hu:"Nem forró, ne félj!",     pr:"nem FOR-ró ne féy",   en:"It's not hot, don't be scared!"},
      {hu:"Ne félj, kész vagy!",     pr:"ne féy kés vody",     en:"Don't be scared, you're ready!"},
      {hu:"Ne öblítsd le még!",      pr:"ne ÖB-lítsd le még",  en:"Don't rinse it off yet!"},
      {hu:"Nem hideg a víz, ne félj!", pr:"nem HI-deg o víz ne féy", en:"The water's not cold, don't be scared!"},
    ],
    grammar:"Two different negation words. Ne + imperative = a prohibition: ne állj! = don't stand!. Nem + statement = a plain negative fact: nem forró = it isn't hot. They are not interchangeable — ne always precedes a command, nem always precedes a statement.",
    tip:"Ne félj! (don't be scared) is one of the most useful calming phrases you'll ever say to a child in the bath." },

  { id:19, trackId:"bath-time", band:"B1", seq:5, rung:5,
    title:"Past Tense", sub:"Megmostad · Megmostam",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"Megmostad már a kezed?",    pr:"MEG-mosh-tod már o KE-zed", en:"Have you washed your hand yet?"},
      {hu:"Én megmostam a hajad.",     pr:"én MEG-mosh-tom o HO-yod",  en:"I washed your hair."},
      {hu:"Már megtöröltem a kezed.",  pr:"már MEG-tö-röl-tem o KE-zed", en:"I already dried your hand."},
      {hu:"Már leöblítettem a hajad.", pr:"már LE-öb-lí-tet-tem o HO-yod", en:"I already rinsed your hair."},
      {hu:"Kész vagy, megmostad a füled?", pr:"kés vody MEG-mosh-tod o FÜ-led", en:"Are you ready, did you wash your ear?"},
      {hu:"Hol volt a kacsa?",         pr:"hol volt o KO-cho",         en:"Where was the duck?"},
    ],
    grammar:"Hungarian past tense adds -t or -tt to the verb stem, plus an ending that encodes who did it: mos → megmostad (you washed it), megmostam (I washed it). Töröl and öblít follow the same pattern: megtöröltem, leöblítettem. The igekötő prefixes (meg, le) you already know attach to the front of the whole past form. Van is irregular: its past is volt (was), as in Hol volt a kacsa?",
    tip:"Listen for -am/-tam (I) versus -ad/-tad (you) on the end of the verb." },

  { id:20, trackId:"bath-time", band:"B1", seq:6, rung:5,
    title:"Describing Behaviour", sub:"Ügyes vagy! · Ne fröcskölj!",
    types:["match","sentence_builder","fill_typed"],
    phrases:[
      {hu:"Már nagyon ügyes vagy!",     pr:"már NO-dyon Ü-dyesh vody",     en:"You're very clever already!"},
      {hu:"Ne fröcskölj a vízzel!",     pr:"ne FRÖCH-köy o VÍZ-zel",       en:"Don't splash the water!"},
      {hu:"Jól csináltad a hajad!",     pr:"yól CHI-nál-tod o HO-yod",     en:"You did your hair well!"},
      {hu:"Jól csináltad, tiszta vagy!", pr:"yól CHI-nál-tod TIS-to vody", en:"You did well, you're clean!"},
      {hu:"Ne fröcskölj, ülj le!",      pr:"ne FRÖCH-köy ewy le",          en:"Don't splash, sit down!"},
      {hu:"Már nem hideg a kád, meleg!", pr:"már nem HI-deg o kád ME-leg", en:"The bath's not cold anymore, it's warm!"},
    ],
    tip:"Ügyes vagy! (you're clever/good) works for any age. Jól csináltad! (you did it well) is specifically about something just finished." },

  // ── B2 ──────────────────────────────────────────────────────────────────
  { id:21, trackId:"bath-time", band:"B2", seq:1, rung:5,
    title:"Parent-to-Parent", sub:"Már kint van. · Még benn van.",
    types:["fill_typed","match"],
    phrases:[
      {hu:"Megmostad már a haját?",       pr:"MEG-mosh-tod már o HO-yát", en:"Have you washed her/his hair yet?"},
      {hu:"Még nem, mindjárt kész.",      pr:"még nem MIND-yárt kés",     en:"Not yet, almost done."},
      {hu:"A kádból már kijött, kint van.", pr:"o KÁD-ból már KI-yött kint von", en:"She/he's already out of the bath, she/he's outside."},
      {hu:"Még benn van a vízben.",       pr:"még ben von o VÍZ-ben",     en:"She/he's still in the water."},
      {hu:"Nem hideg a víz, jó meleg.",   pr:"nem HI-deg o víz yó ME-leg", en:"The water's not cold, it's nice and warm."},
      {hu:"Megmostad a haját, ügyes vagy!", pr:"MEG-mosh-tod o HO-yát Ü-dyesh vody", en:"You washed her/his hair, well done!"},
    ],
    tip:"Register shift — these are adult-to-adult sentences about the child. Már (already) and még (still/yet) are the key contrast pair." },

  { id:22, trackId:"bath-time", band:"B2", seq:2, rung:6,
    title:"Because and So", sub:"mert · ezért",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"Mosd meg a kezed, mert piszkos!",     pr:"mosd meg o KE-zed mert PIS-kosh", en:"Wash your hand, because it's dirty!"},
      {hu:"Ülj a kádba, mert kész a víz!",       pr:"ewy o KÁD-bo mert kés o víz",     en:"Sit in the bath, because the water's ready!"},
      {hu:"Öblítsd le a hajad, mert szappanos.", pr:"ÖB-lítsd le o HO-yod mert SOP-po-nosh", en:"Rinse your hair off, because it's soapy."},
      {hu:"Piszkos a kezed, ezért mosd meg!",    pr:"PIS-kosh o KE-zed E-zért mosd meg", en:"Your hand is dirty, so wash it!"},
      {hu:"Hideg a víz, ezért várj még!",        pr:"HI-deg o víz E-zért váry még",    en:"The water's cold, so wait a bit!"},
      {hu:"Kész vagy már, ezért gyere ki!",      pr:"kés vody már E-zért DYE-re ki",   en:"You're ready now, so come out!"},
    ],
    grammar:"Mert (because) explains a reason, and it follows the result: mosd meg, mert piszkos = wash it, because it's dirty. Ezért (so/therefore) works the other way around — it comes before the result and follows the reason: piszkos a kezed, ezért mosd meg = your hand is dirty, so wash it. Same logic, opposite order.",
    tip:"Mert answers 'why?'; ezért announces 'that's why'. Listen for which one comes first in the sentence." },

  { id:23, trackId:"bath-time", band:"B2", seq:3, rung:6,
    title:"If and When", sub:"ha · amikor",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"Ha kész vagy, gyere ki a kádból!",      pr:"ho kés vody DYE-re ki o KÁD-ból", en:"When you're ready, come out of the bath!"},
      {hu:"Ha piszkos a kezed, mosd meg!",         pr:"ho PIS-kosh o KE-zed mosd meg",   en:"If your hand is dirty, wash it!"},
      {hu:"Amikor kész vagy, mindjárt gyere ki!",  pr:"O-mi-kor kés vody MIND-yárt DYE-re ki", en:"When you're ready, come out right away!"},
      {hu:"Ha hideg a víz, ne ülj a kádba!",       pr:"ho HI-deg o víz ne ewy o KÁD-bo", en:"If the water's cold, don't sit in the bath!"},
      {hu:"Amikor megmostad a hajad, öblítsd le!", pr:"O-mi-kor MEG-mosh-tod o HO-yod ÖB-lítsd le", en:"When you've washed your hair, rinse it off!"},
      {hu:"Ha kész a víz, ülj a kádba!",           pr:"ho kés o víz ewy o KÁD-bo",       en:"If the water's ready, sit in the bath!"},
    ],
    grammar:"Ha (if/when) introduces a real condition — something that genuinely might or will happen: ha kész vagy = when/if you're ready. Amikor (when) introduces a moment in time rather than a condition: amikor kész vagy = at the moment you're ready. Both use the ordinary present tense here — no special conditional form is needed.",
    tip:"Ha and amikor overlap with English 'when', but ha always carries a hint of 'if' too." },

  { id:24, trackId:"bath-time", band:"B2", seq:4, rung:6,
    title:"Complex Instructions", sub:"Először… aztán… majd…",
    types:["sentence_builder","fill_typed"],
    phrases:[
      {hu:"Először mosd meg, aztán öblítsd le!",     pr:"E-lő-shör mosd meg OZ-tán ÖB-lítsd le", en:"First wash it, then rinse it off!"},
      {hu:"Ülj le, majd töröld meg magad!",          pr:"ewy le moyd TÖ-röld meg MO-god",       en:"Sit down, then dry yourself!"},
      {hu:"Gyere ki a kádból, majd öltözz fel!",     pr:"DYE-re ki o KÁD-ból moyd ÖL-tözz fel",   en:"Get out of the bath, then get dressed!"},
      {hu:"Állj fel, majd töröld meg a hajad!",      pr:"áy fel moyd TÖ-röld meg o HO-yod",      en:"Stand up, then dry your hair!"},
      {hu:"Mosd meg a hajad, utoljára öblítsd le!",  pr:"mosd meg o HO-yod U-tol-yá-ro ÖB-lítsd le", en:"Wash your hair, then finally rinse it off!"},
      {hu:"Ülj a kádba, aztán mosd meg a lábad!",    pr:"ewy o KÁD-bo OZ-tán mosd meg o LÁ-bod",  en:"Sit in the bath, then wash your foot!"},
      {hu:"Öblítsd le a kezed, aztán töröld meg!",   pr:"ÖB-lítsd le o KE-zed OZ-tán TÖ-röld meg", en:"Rinse your hand off, then dry it!"},
    ],
    tip:"Two instructions chained together with majd/aztán (then) — a natural way to give a whole routine in one breath." },

  { id:25, trackId:"bath-time", band:"B2", seq:5, rung:6,
    title:"Resistance & Negotiation", sub:"Tudom, hogy… de…",
    types:["fill_typed","match","sentence_builder"],
    phrases:[
      {hu:"Tudom, hogy nem akarod, de kell.",           pr:"TU-dom hody nem O-ko-rod de kel",       en:"I know you don't want to, but it has to be done."},
      {hu:"Tudom, hogy piszkos a kezed, de mosd meg!", pr:"TU-dom hody PIS-kosh o KE-zed de mosd meg", en:"I know your hand is dirty, but wash it!"},
      {hu:"De kell, mert piszkos a kezed.",             pr:"de kel mert PIS-kosh o KE-zed",          en:"But it has to be done, because your hand is dirty."},
      {hu:"Tudom, hogy hideg, de várj még!",            pr:"TU-dom hody HI-deg de váry még",        en:"I know it's cold, but wait a bit!"},
      {hu:"Nem akarod, de kész vagy már.",              pr:"nem O-ko-rod de kés vody már",          en:"You don't want to, but you're ready now."},
      {hu:"Tudom, hogy nem tiszta, de mindjárt kész.",  pr:"TU-dom hody nem TIS-to de MIND-yárt kés", en:"I know it's not clean, but it'll be done soon."},
      {hu:"Tudom, hogy nem akarod a szappant, de kell!", pr:"TU-dom hody nem O-ko-rod o SOP-pont de kel", en:"I know you don't want the soap, but you need it!"},
      {hu:"Tudom, hogy nem akarod, de gyere ide!",      pr:"TU-dom hody nem O-ko-rod de DYE-re I-de", en:"I know you don't want to, but come here!"},
    ],
    tip:"Tudom, hogy… (I know that…) softens a correction. De (but) holds the boundary firm right after it." },

  // ── C1 ──────────────────────────────────────────────────────────────────
  { id:26, trackId:"bath-time", band:"C1", seq:1, rung:6,
    title:"Diminutives & Affection", sub:"kacsám · kis kacsám · kezecske",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"Gyere már, kacsám, kész a víz!",        pr:"DYE-re már KO-chám kés o víz",     en:"Come on, my duck, the water's ready!"},
      {hu:"Nézd csak, milyen kicsi a kezecske!",   pr:"nézd chok MI-yen KI-chi o KE-zech-ke", en:"Look, what a tiny little hand!"},
      {hu:"Nagyon ügyes vagy, én kis kacsám!",     pr:"NO-dyon Ü-dyesh vody én kish KO-chám", en:"You're so clever, my little duck!"},
      {hu:"Már nagyon tiszta vagy, kis kacsám!",   pr:"már NO-dyon TIS-to vody kish KO-chám", en:"You're very clean now, little duck!"},
      {hu:"Gyere, kis kacsám, ülj a kádba!",       pr:"DYE-re kish KO-chám ewy o KÁD-bo",  en:"Come, little duck, sit in the bath!"},
      {hu:"Nézd, milyen ügyes a kis kacsám!",      pr:"nézd MI-yen Ü-dyesh o kish KO-chám", en:"Look how clever my little duck is!"},
      {hu:"Kis kacsám, öblítsd le a hajad!",       pr:"kish KO-chám ÖB-lítsd le o HO-yod", en:"Little duck, rinse your hair off!"},
      {hu:"Kis kacsám, töröld meg a lábad!",       pr:"kish KO-chám TÖ-röld meg o LÁ-bod", en:"Little duck, dry your foot!"},
      {hu:"Már nem vagy szappanos, kis kacsám!",   pr:"már nem vody SOP-po-nosh kish KO-chám", en:"You're not soapy anymore, little duck!"},
      {hu:"Kis kacsám, már kész a törölköződ!",    pr:"kish KO-chám már kés o TÖ-röl-kö-ződ", en:"Little duck, your towel's ready!"},
    ],
    tip:"Kacsám (my duck), kis kacsám (my little duck) and diminutives like kezecske (little hand) make Hungarian sound warm, not childish — native speakers use them freely." },

  { id:27, trackId:"bath-time", band:"C1", seq:2, rung:7,
    title:"Idiomatic Bath Time", sub:"Csupa víz vagy! · leszel",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"Csupa víz vagy megint, kacsám, de milyen tiszta leszel!", pr:"CHU-po víz vody ME-gint KO-chám de MI-yen TIS-to LE-sel", en:"You're soaking wet again, my duck, but how clean you'll be!"},
      {hu:"Tudom, hogy nem akarod, de ha megmosod a hajad, kész leszel!", pr:"TU-dom hody nem O-ko-rod de ho MEG-mo-shod o HO-yod kés LE-sel", en:"I know you don't want to, but once you wash your hair, you'll be done!"},
      {hu:"Amikor kész leszel, nagyon tiszta lesz a kezed!", pr:"O-mi-kor kés LE-sel NO-dyon TIS-to les o KE-zed", en:"When you're done, your hand will be very clean!"},
      {hu:"Ha jól megmosod magad, nagyon ügyes kacsa leszel!", pr:"ho yól MEG-mo-shod MO-god NO-dyon Ü-dyesh KO-cho LE-sel", en:"If you wash yourself well, you'll be a very clever duck!"},
      {hu:"Tudom, hogy kész vagy, de még nem tiszta a hajad!", pr:"TU-dom hody kés vody de még nem TIS-to o HO-yod", en:"I know you're ready, but your hair isn't clean yet!"},
      {hu:"Ha megmosod a hajad, majd a kezed, kész leszel!", pr:"ho MEG-mo-shod o HO-yod moyd o KE-zed kés LE-sel", en:"If you wash your hair, then your hand, you'll be done!"},
    ],
    tip:"Csupa víz vagy! (you're soaking wet!) is an everyday exclamation — leszel (you'll become/be) narrates forward into the near future." },

  { id:28, trackId:"bath-time", band:"C1", seq:3, rung:7,
    title:"Telling What Happened", sub:"Megmostam · Kész volt",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"Most megmostam a hajad, megtöröltem a kezed, és leöblítettem a lábad.", pr:"mosht MEG-mosh-tom o HO-yod MEG-tö-röl-tem o KE-zed és LE-öb-lí-tet-tem o LÁ-bod", en:"I just washed your hair, dried your hand, and rinsed your foot."},
      {hu:"Először kész volt a víz, aztán megmostad a kezed.", pr:"E-lő-shör kés volt o víz OZ-tán MEG-mosh-tod o KE-zed", en:"First the water was ready, then you washed your hand."},
      {hu:"Nagyon piszkos volt a lábad, ezért jól megmostam.", pr:"NO-dyon PIS-kosh volt o LÁ-bod E-zért yól MEG-mosh-tom", en:"Your foot was very dirty, so I washed it well."},
      {hu:"Utoljára leöblítettem a fejed, és minden kész volt.", pr:"U-tol-yá-ro LE-öb-lí-tet-tem o FE-yed és MIN-den kés volt", en:"Finally I rinsed your head, and everything was done."},
      {hu:"Tudom, hogy piszkos volt a hajad, de most tiszta.", pr:"TU-dom hody PIS-kosh volt o HO-yod de mosht TIS-to", en:"I know your hair was dirty, but it's clean now."},
      {hu:"Ha megmosod magad minden nap, mindig tiszta leszel.", pr:"ho MEG-mo-shod MO-god MIN-den nop MIN-dig TIS-to LE-sel", en:"If you wash yourself every day, you'll always be clean."},
    ],
    tip:"Volt (was) plus a past-tense verb together narrate a finished bath — most (now/just now) anchors it to today." },

  { id:29, trackId:"bath-time", band:"C1", seq:4, rung:7,
    title:"Storytelling", sub:"A kacsa, ami… · Amikor…",
    types:["fill_typed","sentence_builder"],
    phrases:[
      {hu:"A kacsa, ami a vízben úszik, a tiéd, kacsám.", pr:"o KO-cho O-mi o VÍZ-ben Ú-sik o TI-éd KO-chám", en:"The duck that's swimming in the water is yours, my duck."},
      {hu:"Amikor kész leszel, elmesélem, hogy milyen ügyes voltál.", pr:"O-mi-kor kés LE-sel EL-me-shé-lem hody MI-yen Ü-dyesh VOL-tál", en:"When you're done, I'll tell you how clever you were."},
      {hu:"Tudom, hogy kész vagy, de ha megmosod a hajad, kész leszel.", pr:"TU-dom hody kés vody de ho MEG-mo-shod o HO-yod kés LE-sel", en:"I know you're ready, but once you wash your hair, you'll really be done."},
      {hu:"A kacsa, ami a vízben úszik, mindig ügyes és tiszta.", pr:"o KO-cho O-mi o VÍZ-ben Ú-sik MIN-dig Ü-dyesh és TIS-to", en:"The duck that swims in the water is always clever and clean."},
    ],
    tip:"Ami (that/which) introduces a relative clause — it slots right after the noun it describes, set off by commas." },

  { id:30, trackId:"bath-time", band:"C1", seq:5, rung:7,
    title:"Capstone: Full Bath Time Scenario", sub:"All bands · All question types",
    types:["match","phrase_list","fill_typed","sentence_builder","true_false"],
    phrases:[
      {hu:"Gyere a kádba, mert kész a meleg víz!", pr:"DYE-re o KÁD-bo mert kés o ME-leg víz", en:"Come into the bath, because the warm water's ready!"},
      {hu:"Mosd meg a hajad, majd a kezed, aztán öblítsd le!", pr:"mosd meg o HO-yod moyd o KE-zed OZ-tán ÖB-lítsd le", en:"Wash your hair, then your hand, then rinse it off!"},
      {hu:"Ha kész vagy, gyere ki, és töröld meg magad!", pr:"ho kés vody DYE-re ki és TÖ-röld meg MO-god", en:"When you're ready, come out, and dry yourself!"},
      {hu:"Tudom, hogy nem akarod, de ha megmosod magad, nagyon ügyes leszel!", pr:"TU-dom hody nem O-ko-rod de ho MEG-mo-shod MO-god NO-dyon Ü-dyesh LE-sel", en:"I know you don't want to, but if you wash yourself, you'll be very clever!"},
      {hu:"Amikor kész leszel, kis kacsám, csupa víz leszel, de milyen tiszta!", pr:"O-mi-kor kés LE-sel kish KO-chám CHU-po víz LE-sel de MI-yen TIS-to", en:"When you're done, little duck, you'll be soaking wet, but how clean!"},
      {hu:"Nagyon ügyes voltál, kis kacsám, most már kész vagy!", pr:"NO-dyon Ü-dyesh VOL-tál kish KO-chám mosht már kés vody", en:"You were so clever, little duck, now you're finally ready!"},
      {hu:"Először megmostad a hajad, aztán a kezed, utoljára a lábad, és most kész vagy!", pr:"E-lő-shör MEG-mosh-tod o HO-yod OZ-tán o KE-zed U-tol-yá-ro o LÁ-bod és mosht kés vody", en:"First you washed your hair, then your hand, last your foot, and now you're ready!"},
    ],
    tip:"This capstone spans the whole Bath Time arc — A1 vocabulary carried all the way to C1 storytelling. Every word here is one you've met before." },
];

// ─── UTILITIES ─────────────────────────────────────────────────────────────
function getRecommendedNext(stats){
  const {lastActiveLessonId,lessonScores}=stats;
  const ref=lastActiveLessonId?LESSONS.find(l=>l.id===lastActiveLessonId):LESSONS[0];
  if(!ref)return null;
  const trackLessons=LESSONS.filter(l=>l.trackId===ref.trackId).sort((a,b)=>BANDS.indexOf(a.band)-BANDS.indexOf(b.band)||a.seq-b.seq);
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
  const bi=BANDS.indexOf(lesson.band);
  if(bi<=0)return null;
  const prevBandLessons=LESSONS.filter(l=>l.trackId===lesson.trackId&&l.band===BANDS[bi-1]);
  return prevBandLessons.sort((a,b)=>b.seq-a.seq)[0]||null;
}
function isUnlocked(lesson,lessonScores){
  const prev=getPrevLesson(lesson);
  return prev===null||!!lessonScores[String(prev.id)]?.passed;
}
function getBandLessons(trackId,band){
  return LESSONS.filter(l=>l.trackId===trackId&&l.band===band).sort((a,b)=>a.seq-b.seq);
}
function isLastLessonOfBand(lesson){
  const bl=getBandLessons(lesson.trackId,lesson.band);
  return bl.length>0&&bl[bl.length-1].id===lesson.id;
}
function getNextBand(lesson){
  for(let i=BANDS.indexOf(lesson.band)+1;i<BANDS.length;i++){
    if(getBandLessons(lesson.trackId,BANDS[i]).length>0)return BANDS[i];
  }
  return null;
}
// Band Review pool: the band's phrases, hardest (most `wrong`) first.
function getBandReviewItems(trackId,band,phraseScores,count=5){
  const seen=new Set(),uniq=[];
  for(const p of getBandLessons(trackId,band).flatMap(l=>l.phrases)){
    if(!seen.has(p.hu)){seen.add(p.hu);uniq.push(p);}
  }
  return uniq.sort((a,b)=>(phraseScores[b.hu]?.wrong||0)-(phraseScores[a.hu]?.wrong||0)).slice(0,count);
}
function getBandTypes(trackId,band){
  const s=new Set();
  getBandLessons(trackId,band).forEach(l=>l.types.forEach(t=>s.add(t)));
  return [...s];
}

// ─── STATS HOOK ───────────────────────────────────────────────────────────
const STORAGE_KEY="magyar-otthon-stats-v3";
const DEFAULT_SETTINGS={autoPlayAudio:true};
function defaultStats(){return{lastActiveLessonId:null,lessonScores:{},phraseScores:{},settings:{...DEFAULT_SETTINGS}};}
function loadStats(){
  const base=defaultStats();
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    // Merge over defaults so objects saved before `settings` existed still load.
    if(raw){const p=JSON.parse(raw);return{...base,...p,settings:{...DEFAULT_SETTINGS,...(p.settings||{})}};}
  }catch(e){}
  return base;
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

  // Remedial pass — flips `passed` without touching `best` or `attempts`.
  const markLessonPassed=useCallback((id)=>{
    setStats(s=>{
      const prev=s.lessonScores[String(id)]||{best:0,attempts:0,passed:false,grammarSeen:false};
      return{...s,lessonScores:{...s.lessonScores,[String(id)]:{...prev,passed:true}}};
    });
  },[]);

  const setLastActiveLesson=useCallback((id)=>{setStats(s=>({...s,lastActiveLessonId:id}));},[]);

  const setSetting=useCallback((key,value)=>{setStats(s=>({...s,settings:{...s.settings,[key]:value}}));},[]);

  const getWeakItems=useCallback((phrases)=>{
    return phrases.filter(p=>{const sc=stats.phraseScores[p.hu];return sc&&sc.wrong>0&&sc.wrong>=sc.right;});
  },[stats]);

  return{stats,recordPhrase,recordLesson,markGrammarSeen,markLessonPassed,setLastActiveLesson,setSetting,getWeakItems};
}

// ─── QUESTION GENERATORS ──────────────────────────────────────────────────
function genTF(p,all){
  const others=all.filter(x=>x.en!==p.en);
  // No alternative translation to show → the only honest question is a true one.
  const t=others.length===0||Math.random()>0.5;
  const shown=t?p.en:shuffle(others)[0].en;
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

function generateQuestions(lesson,weakItems,huVoiceAvail,count=15,distractorPool=null){
  const all=lesson.phrases;
  // Questions come from `all`; wrong-answer options come from `dis`, which stays wide
  // even when `all` is a narrow Remedial or Band Review pool.
  const dis=distractorPool&&distractorPool.length>=4?distractorPool:all;
  let types=[...lesson.types];
  const earlyRung=lesson.rung<=4;

  // TTS fallback
  if(huVoiceAvail===false){
    types=types.filter(t=>t!=="true_false");
    if(!types.includes("phrase_list"))types.push("phrase_list");
  }
  // Rung-aware fill routing (defensive — authoring should match, but enforce here)
  if(earlyRung)types=types.map(t=>t==="fill_typed"?"fill_pool":t);

  let pool=[...all];
  if(weakItems.length>0)pool=[...pool,...weakItems,...weakItems];

  let matchUsed=false;
  const gen=(type,p)=>{
    if(type==="match"){if(matchUsed||all.length<4)return null;matchUsed=true;return genMatch(all);}
    if(type==="phrase_list")return genPhraseList(p,dis);
    if(type==="fill_pool")return genFill(p,dis);
    if(type==="fill_typed")return genTyped(p);
    if(type==="sentence_builder")return genReconstruct(p);
    if(type==="true_false")return genTF(p,dis);
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
  // Safety net: genPhraseList and genTyped never decline, so a lesson can always
  // produce questions even if every one of its declared types refused this pool.
  if(qs.length===0){
    const fallback=earlyRung?(x)=>genPhraseList(x,dis):genTyped;
    for(const x of pool.slice(0,count))qs.push(fallback(x));
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
// mode: "lesson" (15q, scored) | "remedial" (8q, pass flips parent lesson) | "review" (5q, advisory)
function QuizEngine({lesson,track,onFinish,statsApi,huVoiceAvail,mode="lesson",pool=null,onRemedial,onBandReview}){
  const count=mode==="remedial"?8:mode==="review"?5:15;
  const srcLesson=pool?{...lesson,phrases:pool}:lesson;
  // Remedial and Review pools are already weak by construction — no extra boosting.
  const weakItems=mode==="lesson"?statsApi.getWeakItems(lesson.phrases):[];
  const [qs]=useState(()=>generateQuestions(srcLesson,weakItems,huVoiceAvail,count,lesson.phrases));
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

  const autoPlay=statsApi.stats.settings.autoPlayAudio;

  useEffect(()=>{if(mode!=="review")statsApi.setLastActiveLesson(lesson.id);},[]);
  useEffect(()=>{
    if(autoPlay&&(q.type==="true_false"||q.type==="phrase_list"))speakHu(q.prompt,lesson.band);
  },[qi]);
  useEffect(()=>{if(autoPlay&&ans!==null&&q.type==="fill_typed")speakHu(q.answer,lesson.band);},[ans]);

  const matchItems=useMemo(()=>{
    if(q.type!=="match")return[];
    return[...shuffle(q.pairs.map(p=>({text:p.hu,lang:"hu",key:p.hu}))),...shuffle(q.pairs.map(p=>({text:p.en,lang:"en",key:p.hu})))];
  },[qi]);

  const advance=(correct)=>{if(q.phrase)statsApi.recordPhrase(q.phrase.hu,correct);if(correct)setScore(s=>s+1);else if(q.phrase)setMissed(m=>m.some(p=>p.hu===q.phrase.hu)?m:[...m,q.phrase]);};
  const goNext=()=>{
    if(qi<total-1){setQi(i=>i+1);setAns(null);setTyped("");setMs({sel:null,matched:[],wrong:null});setPlaced([]);}
    else{
      if(mode==="lesson")statsApi.recordLesson(lesson.id,score,total);
      else if(mode==="remedial"&&Math.round(score/total*100)>=80)statsApi.markLessonPassed(lesson.id);
      setAns("done");
    }
  };

  if(ans==="done"){
    const pct=Math.round(score/total*100);
    const passed=pct>=80;
    const review=mode==="review";
    const offerBandReview=mode==="lesson"&&passed&&isLastLessonOfBand(lesson)&&getNextBand(lesson);
    const offerRemedial=(mode==="lesson"||mode==="remedial")&&!passed&&missed.length>0;
    const headline=review
      ?"Review complete"
      :passed?(mode==="remedial"?"Remedial passed — lesson unlocked!":"Passed — next lesson unlocked!")
      :pct>=60?"Almost there!":"Keep going!";
    return <div style={{padding:"40px 20px 80px"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:52}}>{review?"🔁":passed?"🎉":pct>=60?"👏":"💪"}</div>
        <div style={{fontSize:30,fontWeight:900,color:C.text,marginTop:10}}>{score}/{total}</div>
        <div style={{fontSize:22,fontWeight:800,color:review?C.sub:passed?C.green:pct>=60?C.amber:C.red,marginTop:4}}>{pct}%</div>
        <div style={{fontSize:15,color:C.sub,marginTop:4}}>{headline}</div>
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
      {offerRemedial&&<button onClick={()=>onRemedial&&onRemedial(missed)}
        style={{width:"100%",padding:"14px",borderRadius:14,background:color,border:"none",color:C.text,fontSize:15,fontWeight:800,cursor:"pointer",marginTop:24}}>
        {mode==="remedial"?"Try the Remedial again":"Try the Remedial"} · 8 questions
      </button>}
      {offerBandReview&&<button onClick={()=>onBandReview&&onBandReview(lesson)}
        style={{width:"100%",padding:"14px",borderRadius:14,background:color,border:"none",color:C.text,fontSize:15,fontWeight:800,cursor:"pointer",marginTop:24}}>
        Review {lesson.band} before moving on →
      </button>}
      <div style={{display:"flex",gap:10,marginTop:offerRemedial||offerBandReview?10:24}}>
        <button onClick={onFinish} style={{flex:1,padding:"13px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer"}}>Back to lessons</button>
        {mode==="lesson"&&<button onClick={()=>{setQi(0);setScore(0);setAns(null);setTyped("");setPlaced([]);setMs({sel:null,matched:[],wrong:null});setMissed([]);}}
          style={{flex:1,padding:"13px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer"}}>Retry</button>}
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

function BandReview({trackId,band,statsApi,huVoiceAvail,onDone}){
  const track=TRACKS.find(t=>t.id===trackId);
  // Frozen at mount — the pool must not reshuffle as answers update phraseScores.
  const items=useMemo(()=>getBandReviewItems(trackId,band,statsApi.stats.phraseScores,5),[]);
  const types=useMemo(()=>getBandTypes(trackId,band),[]);
  const passedCount=getBandLessons(trackId,band).filter(l=>statsApi.stats.lessonScores[String(l.id)]?.passed).length;

  if(!track)return null;
  if(items.length===0)return <div style={{padding:"40px 20px"}}>
    <div style={{fontSize:15,color:C.sub,textAlign:"center",marginBottom:20}}>Nothing to review in {band} yet.</div>
    <button onClick={onDone} style={{width:"100%",padding:"13px",borderRadius:12,background:C.card,border:`1px solid ${C.border}`,color:C.text,fontSize:14,fontWeight:700,cursor:"pointer"}}>Back to lessons</button>
  </div>;
  const synthetic={id:null,trackId,band,seq:0,title:`${band} Review`,types,phrases:items};

  return <div>
    <div style={{padding:"14px 16px 12px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`}}>
      <div style={{fontSize:20}}>{track.emoji}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text}}>{band} Review</div>
        <div style={{fontSize:12,color:C.sub}}>{BAND_LABELS[band]} · {passedCount} lessons passed</div>
      </div>
      <button onClick={onDone} style={{background:"none",border:"none",color:C.sub,fontSize:13,fontWeight:700,cursor:"pointer",padding:"4px 6px"}}>Skip for now</button>
    </div>
    <div style={{margin:"10px 16px 0",padding:"10px 12px",borderRadius:10,background:`${track.color}10`,border:`1px solid ${track.color}22`,fontSize:12,color:C.text,lineHeight:1.5}}>
      Five quick questions on the trickiest phrases from {band}. Just practice — your score here doesn't affect anything.
    </div>
    <QuizEngine lesson={synthetic} track={track} onFinish={onDone} statsApi={statsApi} huVoiceAvail={huVoiceAvail} mode="review"/>
  </div>;
}

function SettingsScreen({statsApi,huVoiceAvail,onBack}){
  const {stats,setSetting}=statsApi;
  const on=stats.settings.autoPlayAudio;
  return <div>
    <Header title="Settings" onBack={onBack}/>
    <div style={{padding:"14px 16px 80px"}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,color:C.text}}>Auto-play audio</div>
          <div style={{fontSize:12,color:C.sub,marginTop:2,lineHeight:1.45}}>Speak Hungarian automatically when a question appears. The 🔊 button always works either way.</div>
        </div>
        <button onClick={()=>setSetting("autoPlayAudio",!on)} role="switch" aria-checked={on} aria-label="Auto-play audio"
          style={{width:48,height:28,borderRadius:14,border:"none",background:on?C.green:C.border,cursor:"pointer",padding:2,flexShrink:0,transition:"background 0.2s"}}>
          <div style={{width:24,height:24,borderRadius:12,background:C.text,transform:`translateX(${on?20:0}px)`,transition:"transform 0.2s"}}/>
        </button>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginTop:8}}>
        <div style={{fontSize:15,fontWeight:700,color:C.text}}>Hungarian voice</div>
        <div style={{fontSize:12,color:huVoiceAvail===false?C.amber:C.sub,marginTop:2,lineHeight:1.45}}>
          {huVoiceAvail===null?"Checking…":huVoiceAvail?"Available on this device.":"Not available on this device — listening questions are replaced with written ones."}
        </div>
      </div>
    </div>
  </div>;
}

function HomeScreen({statsApi,onOpenTrack,onOpenLesson,onOpenSettings}){
  const {stats}=statsApi;
  const rec=getRecommendedNext(stats);
  const recTrack=rec?TRACKS.find(t=>t.id===rec.trackId):null;
  const trackHasContent=t=>LESSONS.some(l=>l.trackId===t.id);
  const trackPassed=t=>LESSONS.filter(l=>l.trackId===t.id).filter(l=>stats.lessonScores[String(l.id)]?.passed).length;
  const trackTotal=t=>LESSONS.filter(l=>l.trackId===t.id).length;

  return <div>
    <div style={{padding:"18px 16px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1}}>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5}}>Magyar Otthon</div>
        <div style={{fontSize:12,color:C.sub,marginTop:2}}>Tanulj minden nap</div>
      </div>
      <button onClick={onOpenSettings} title="Settings" aria-label="Settings"
        style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer",padding:"4px 6px",flexShrink:0}}>⚙️</button>
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
  // Remedial state is deliberately ephemeral — never persisted, so a reload
  // returns to the parent lesson rather than resuming a half-finished Remedial.
  const [remedialPhrases,setRemedialPhrases]=useState(null);
  const [reviewBand,setReviewBand]=useState(null);
  const [runId,setRunId]=useState(0);   // remounts QuizEngine so questions regenerate
  const statsApi=useStats();
  const huVoiceAvail=useHuVoiceAvailable();

  const lesson=lessonId?LESSONS.find(l=>l.id===lessonId):null;
  const activeTrack=trackId?TRACKS.find(t=>t.id===trackId):null;
  const quizTrack=lesson?TRACKS.find(t=>t.id===lesson.trackId):null;
  const needsGrammarCard=!!(lesson?.grammar&&!statsApi.stats.lessonScores[String(lesson.id)]?.grammarSeen);

  function openTrack(t){setTrackId(t.id);setScreen("track");}
  function openLesson(l){
    setLessonId(l.id);setTrackId(l.trackId);setRemedialPhrases(null);
    setRunId(r=>r+1);setScreen("quiz");
  }
  function startRemedial(missed){setRemedialPhrases(missed);setRunId(r=>r+1);}
  function startBandReview(l){setReviewBand({trackId:l.trackId,band:l.band});setScreen("bandreview");}
  function backToTrack(){setRemedialPhrases(null);setReviewBand(null);setScreen("track");}
  function backToHome(){setScreen("home");}

  return <div style={{fontFamily:"'Nunito',sans-serif",background:C.bg,color:C.text,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>

    {screen==="home"&&<HomeScreen statsApi={statsApi} onOpenTrack={openTrack} onOpenLesson={openLesson} onOpenSettings={()=>setScreen("settings")}/>}
    {screen==="settings"&&<SettingsScreen statsApi={statsApi} huVoiceAvail={huVoiceAvail} onBack={backToHome}/>}
    {screen==="track"&&activeTrack&&<TrackDetail track={activeTrack} statsApi={statsApi} onOpenLesson={openLesson} onBack={backToHome}/>}
    {screen==="bandreview"&&reviewBand&&<BandReview trackId={reviewBand.trackId} band={reviewBand.band} statsApi={statsApi} huVoiceAvail={huVoiceAvail} onDone={backToTrack}/>}
    {screen==="quiz"&&lesson&&quizTrack&&(needsGrammarCard
      ?<GrammarCard lesson={lesson} track={quizTrack} onDismiss={()=>statsApi.markGrammarSeen(lesson.id)} onBack={backToTrack}/>
      :<div>
        <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`}}>
          <button onClick={backToTrack} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer",padding:"4px 6px"}}>←</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text}}>{lesson.title}</div>
            <div style={{fontSize:12,color:C.sub}}>{quizTrack.emoji} {quizTrack.title} · {lesson.band}</div>
          </div>
          <span style={{fontSize:12,color:quizTrack.color,fontWeight:700,background:`${quizTrack.color}18`,padding:"3px 9px",borderRadius:8}}>{remedialPhrases?"Remedial":`${lesson.band} ${lesson.seq}`}</span>
        </div>
        {remedialPhrases
          ?<div style={{margin:"10px 16px 0",padding:"10px 12px",borderRadius:10,background:`${quizTrack.color}10`,border:`1px solid ${quizTrack.color}22`,fontSize:12,color:C.text,lineHeight:1.5}}>
            <span style={{fontWeight:800,color:quizTrack.color}}>Remedial: </span>
            just the {remedialPhrases.length} {remedialPhrases.length===1?"phrase":"phrases"} you missed. Score 80% to unlock the next lesson.
          </div>
          :lesson.tip&&<div style={{margin:"10px 16px 0",padding:"10px 12px",borderRadius:10,background:`${quizTrack.color}10`,border:`1px solid ${quizTrack.color}22`,fontSize:12,color:C.text,lineHeight:1.5}}>
            <span style={{fontWeight:800,color:quizTrack.color}}>Tip: </span>{lesson.tip}
          </div>}
        <QuizEngine key={runId} lesson={lesson} track={quizTrack} onFinish={backToTrack}
          statsApi={statsApi} huVoiceAvail={huVoiceAvail}
          mode={remedialPhrases?"remedial":"lesson"} pool={remedialPhrases}
          onRemedial={startRemedial} onBandReview={startBandReview}/>
      </div>
    )}
  </div>;
}
