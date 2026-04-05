import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ─── LESSON DATA ──────────────────────────────────────────────────────────
const PHASES = [
  { id: 1, emoji: "🌅", title: "Morning", color: "#E8913A" },
  { id: 2, emoji: "🚶", title: "Going Out", color: "#4A90D9" },
  { id: 3, emoji: "🧩", title: "Playing", color: "#7B61C1" },
  { id: 4, emoji: "🍽️", title: "Food", color: "#D94A4A" },
  { id: 5, emoji: "📖", title: "Reading", color: "#3A8F6E" },
  { id: 6, emoji: "🛁", title: "Bath & Bed", color: "#5B7FC1" },
  { id: 7, emoji: "💬", title: "End of Day", color: "#C17B3A" },
  { id: 8, emoji: "🧰", title: "Toolkit", color: "#8B8B8B" },
  { id: 9, emoji: "🧱", title: "Grammar Spine", color: "#3AA8A8" },
];

// Time-of-day relevance tags for the focus engine
const TIME_TAGS = {
  morning: [1,2,3,4,5,6,40], // Phase 1 (morning routines) + Phase 1 wife + rooms
  midday: [7,8,9,10,11,12,13,14,21,22,23,24,25,42], // Going out + food + bikes
  afternoon: [15,16,17,18,19,20,26,27,28,29,41,42,43,44], // Playing + reading + locations + bikes + drawing + counting
  evening: [30,31,32,33,34,35], // Bath, bed, end of day
};
// Weekend = more playing, outings, reading; Weekday = school run, routines
const WEEKEND_BOOST = [9,10,12,15,16,17,19,20,26,27,28,42,43,44]; // playground, library, playing, reading, bikes, drawing, counting
const WEEKDAY_BOOST = [1,2,3,4,5,7,8,11,13,23]; // morning routine, school, car, mealtimes

const LESSONS = [
  { id:1, phase:1, title:"Waking Up", sub:"Good morning · Breakfast", aud:"kids",
    phrases:[
      {hu:"Jó reggelt!",pr:"Yó reg-gelt",en:"Good morning!"},
      {hu:"Ébredj fel!",pr:"Éb-redy fel",en:"Wake up!"},
      {hu:"Hogy aludtál?",pr:"Hody o-lud-tál",en:"How did you sleep?"},
      {hu:"Jól aludtam.",pr:"Yól o-lud-tom",en:"I slept well."},
      {hu:"Álmodtál valamit?",pr:"Ál-mod-tál vo-lo-mit",en:"Did you dream?"},
      {hu:"Kelj fel!",pr:"Kely fel",en:"Get up!"},
      {hu:"Gyere reggelizni!",pr:"Dye-reh reg-ge-liz-ni",en:"Come have breakfast!"},
      {hu:"Mit szeretnél reggelire?",pr:"Mit se-ret-nél reg-ge-li-re",en:"What do you want for breakfast?"},
      {hu:"Kész a reggeli!",pr:"Kés o reg-ge-li",en:"Breakfast is ready!"},
    ], tip:"Start every morning with 'Jó reggelt!' and 'Hogy aludtál?'", pat:"-tál = past tense 'you did'"},
  { id:2, phase:1, title:"Teeth & Hands", sub:"Brushing · Washing · Toilet", aud:"kids",
    phrases:[
      {hu:"Moss fogat!",pr:"Mosh fo-got",en:"Brush your teeth!"},
      {hu:"Nyisd ki a szád!",pr:"Nyishd ki o sád",en:"Open your mouth!"},
      {hu:"Köpd ki!",pr:"Köpd ki",en:"Spit it out!"},
      {hu:"Moss kezet!",pr:"Mosh ke-zet",en:"Wash your hands!"},
      {hu:"Szappannal!",pr:"Sop-pon-nol",en:"With soap!"},
      {hu:"Töröld meg!",pr:"Tö-röld meg",en:"Dry them!"},
      {hu:"Kell pisilni?",pr:"Kell pi-shil-ni",en:"Need a wee?"},
      {hu:"Húzd le!",pr:"Húzd leh",en:"Flush it!"},
      {hu:"Ügyes vagy!",pr:"Ü-dyesh vody",en:"Well done!"},
    ], tip:"'Moss kezet! Szappannal!' after every toilet visit."},
  { id:3, phase:1, title:"Clothes", sub:"Naming items · Getting dressed", aud:"kids",
    phrases:[
      {hu:"Mit vegyél fel?",pr:"Mit ve-dyél fel",en:"What should you put on?"},
      {hu:"Vedd fel a nadrágot!",pr:"Vedd fel o nod-rá-got",en:"Put on the trousers!"},
      {hu:"Vedd fel a zoknit!",pr:"Vedd fel o zok-nit",en:"Put on the socks!"},
      {hu:"Vedd fel a pólót!",pr:"Vedd fel o pó-lót",en:"Put on the t-shirt!"},
      {hu:"Vedd fel a cipőt!",pr:"Vedd fel o chi-pőt",en:"Put on the shoes!"},
      {hu:"Vedd fel a kabátot!",pr:"Vedd fel o ko-bá-tot",en:"Put on your coat!"},
      {hu:"Kész vagy!",pr:"Kész vody",en:"You're ready!"},
    ], tip:"Hand each item and name it.", pat:"-t ending = direct object"},
  { id:4, phase:1, title:"Wrong Way Round", sub:"Inside out · Other arm", aud:"kids",
    phrases:[
      {hu:"Fordítsd meg!",pr:"For-díchd meg",en:"Turn it around!"},
      {hu:"Fordítva van.",pr:"For-dít-vo von",en:"It's wrong way round."},
      {hu:"Visszájára van.",pr:"Vis-sá-yá-ro von",en:"It's inside out."},
      {hu:"A másik lábad.",pr:"O má-shik lá-bod",en:"The other leg."},
      {hu:"Húzd fel!",pr:"Húzd fel",en:"Pull it up!"},
      {hu:"Így van!",pr:"Í-dy von",en:"That's right!"},
      {hu:"Majdnem!",pr:"Mayd-nem",en:"Nearly!"},
    ], tip:"Use the phrase every time something goes on wrong."},
  { id:5, phase:1, title:"Weather & Choosing", sub:"Hot · Cold · Raining", aud:"kids",
    phrases:[
      {hu:"Hideg van ma.",pr:"Hi-deg von mo",en:"It's cold today."},
      {hu:"Meleg van ma.",pr:"Me-leg von mo",en:"It's warm today."},
      {hu:"Esik az eső.",pr:"E-shik oz e-shő",en:"It's raining."},
      {hu:"Melyiket vegyük fel?",pr:"Me-yyi-ket ve-dyük fel",en:"Which one shall we put on?"},
      {hu:"Ezt akarom.",pr:"Ezt o-ko-rom",en:"I want this one."},
      {hu:"Rendben, vedd fel!",pr:"Rend-ben, vedd fel",en:"Okay, put it on!"},
    ], tip:"'Hideg van ma' or 'Meleg van ma' every morning."},
  { id:6, phase:1, title:"Planning the Day", sub:"What's the plan · Deciding", aud:"wife",
    phrases:[
      {hu:"Mi a terv?",pr:"Mi o terv",en:"What's the plan?"},
      {hu:"Mi a terv mára?",pr:"Mi o terv má-ro",en:"What's the plan for today?"},
      {hu:"Mit csináljunk?",pr:"Mit chi-nály-yunk",en:"What should we do?"},
      {hu:"Van valami terved?",pr:"Von vo-lo-mi ter-ved",en:"Any plans?"},
      {hu:"Nekem mindegy.",pr:"Ne-kem mind-egy",en:"I don't mind."},
      {hu:"Jó ötlet!",pr:"Yó öt-let",en:"Good idea!"},
      {hu:"Megbeszéltük.",pr:"Meg-be-shél-tük",en:"That's settled."},
    ], tip:"Use 'Mi a terv mára?' every morning."},
  { id:7, phase:2, title:"Going Somewhere", sub:"Let's go · Crossing roads", aud:"kids",
    phrases:[
      {hu:"Menjünk!",pr:"Men-yünk",en:"Let's go!"},
      {hu:"A parkba megyünk.",pr:"A park-ba me-dyünk",en:"We're going to the park."},
      {hu:"A boltba megyünk.",pr:"A bolt-ba me-dyünk",en:"We're going to the shop."},
      {hu:"Hova megyünk?",pr:"Ho-va me-dyünk",en:"Where are we going?"},
      {hu:"Megállj!",pr:"Meg-áj",en:"Stop!"},
      {hu:"Várj!",pr:"Várj",en:"Wait!"},
      {hu:"Gyere ide!",pr:"Dye-reh i-deh",en:"Come here!"},
      {hu:"Fogd a kezemet!",pr:"Fogd a ke-ze-met",en:"Hold my hand!"},
      {hu:"Nézz körbe!",pr:"Nézz kör-beh",en:"Look around!"},
      {hu:"Átmehetünk.",pr:"Át-me-he-tünk",en:"We can cross."},
    ], tip:"Announce before leaving: 'A boltba megyünk.'", pat:"-ba/-be = 'to' that place"},
  { id:8, phase:2, title:"In the Car", sub:"Seatbelt · Are we there yet", aud:"kids",
    phrases:[
      {hu:"Szállj be!",pr:"Sáyj be",en:"Get in!"},
      {hu:"Csatold be!",pr:"Cho-told be",en:"Buckle up!"},
      {hu:"Megérkeztünk?",pr:"Meg-ér-kez-tünk",en:"Are we there yet?"},
      {hu:"Még nem.",pr:"Még nem",en:"Not yet."},
      {hu:"Mindjárt ott leszünk!",pr:"Mind-yárt ott le-sünk",en:"Almost there!"},
      {hu:"Mit látsz?",pr:"Mit láts",en:"What can you see?"},
      {hu:"Megérkeztünk!",pr:"Meg-ér-kez-tünk",en:"We're here!"},
    ], tip:"'Csatold be!' before starting the engine."},
  { id:9, phase:2, title:"Playground", sub:"Slide · Swing · Safety", aud:"kids",
    phrases:[
      {hu:"Csúszdázzunk!",pr:"Chúz-dá-zunk",en:"Let's slide!"},
      {hu:"Hintázzunk!",pr:"Hin-táz-zunk",en:"Let's swing!"},
      {hu:"Vigyázz!",pr:"Vi-dyáz",en:"Be careful!"},
      {hu:"Én tolom!",pr:"Én to-lom",en:"I'll push you!"},
      {hu:"Még egyszer!",pr:"Még edy-ser",en:"One more time!"},
      {hu:"Fáj?",pr:"Fáy",en:"Does it hurt?"},
      {hu:"Nem baj.",pr:"Nem bay",en:"Never mind."},
      {hu:"Menjünk haza.",pr:"Men-yünk ho-zo",en:"Let's go home."},
    ], tip:"Say 'Én tolom!' before every push."},
  { id:10, phase:2, title:"Library", sub:"Quiet · Choosing books", aud:"kids",
    phrases:[
      {hu:"Csend legyen!",pr:"Chend le-dyen",en:"Quiet please!"},
      {hu:"Melyik könyvet akarod?",pr:"Me-yik köny-vet o-ko-rod",en:"Which book?"},
      {hu:"Olvassunk együtt!",pr:"Ol-vosh-shunk e-dyütt",en:"Let's read together!"},
      {hu:"Mi ez?",pr:"Mi ez",en:"What's this?"},
      {hu:"Tetszik?",pr:"Tet-shik",en:"Do you like it?"},
      {hu:"Vigyük haza.",pr:"Vi-dyük ho-zo",en:"Let's take it home."},
    ], tip:"'Mi ez?' pointing at pictures builds vocabulary."},
  { id:11, phase:2, title:"School Run", sub:"Drop-off · Pickup · Feelings", aud:"kids",
    phrases:[
      {hu:"Iskolába megyünk.",pr:"Ish-ko-lá-ba me-dyünk",en:"We're going to school."},
      {hu:"Szia, viszontlátásra!",pr:"Si-ya, vi-sont-lá-tá-shro",en:"Bye, see you!"},
      {hu:"Hamarosan jövök érted.",pr:"Ho-mo-ro-shon yö-vök ér-ted",en:"I'll come soon."},
      {hu:"Milyen napod volt?",pr:"Mi-yen no-pod volt",en:"How was your day?"},
      {hu:"Boldog vagyok.",pr:"Bol-dog vo-dyok",en:"I'm happy."},
      {hu:"Szomorú vagyok.",pr:"So-mo-rú vo-dyok",en:"I'm sad."},
      {hu:"Fáradt vagyok.",pr:"Fá-rott vo-dyok",en:"I'm tired."},
    ], tip:"At pickup: 'Boldog? Szomorú? Fáradt?'"},
  { id:12, phase:2, title:"Meeting People", sub:"Greetings · How are you", aud:"kids",
    phrases:[
      {hu:"Nagyihoz megyünk.",pr:"No-dyi-hoz me-dyünk",en:"We're going to grandma's."},
      {hu:"Ki jön ma?",pr:"Ki yön mo",en:"Who's coming?"},
      {hu:"Hogy vagy?",pr:"Hody vody",en:"How are you?"},
      {hu:"Jól vagyok, köszönöm.",pr:"Yól vo-dyok, kö-sö-nöm",en:"I'm well, thanks."},
      {hu:"Örülök, hogy látlak!",pr:"Ö-rü-lök hody lát-lok",en:"Glad to see you!"},
      {hu:"Viszontlátásra!",pr:"Vi-sont-lá-tá-shro",en:"Goodbye!"},
    ], tip:"Model the greeting: say 'Szia!' first."},
  { id:13, phase:2, title:"Time & Schedule", sub:"When · What time · Late", aud:"wife",
    phrases:[
      {hu:"Mikor?",pr:"Mi-kor",en:"When?"},
      {hu:"Hány órakor?",pr:"Hány ó-ro-kor",en:"What time?"},
      {hu:"Mikor kell indulnunk?",pr:"Mi-kor kell in-dul-nunk",en:"When must we leave?"},
      {hu:"Késésben vagyunk.",pr:"Ké-shésh-ben vo-dyunk",en:"We're late."},
      {hu:"Sietünk!",pr:"Shi-e-tünk",en:"Hurry!"},
      {hu:"Van időnk.",pr:"Von i-dőnk",en:"We have time."},
      {hu:"Holnap.",pr:"Hol-nop",en:"Tomorrow."},
      {hu:"A hétvégén.",pr:"O hét-vé-gén",en:"At the weekend."},
    ], tip:"'Mikor kell indulnunk?' gets you out the door."},
  { id:14, phase:2, title:"Who Does What", sub:"Tasks · Help · Thanks", aud:"wife",
    phrases:[
      {hu:"Én megcsinálom.",pr:"Én meg-chi-ná-lom",en:"I'll do it."},
      {hu:"Meg tudnád csinálni?",pr:"Meg tud-nád chi-nál-ni",en:"Could you do it?"},
      {hu:"Segítsek?",pr:"She-gí-chek",en:"Shall I help?"},
      {hu:"Segítenél?",pr:"She-gí-te-nél",en:"Could you help?"},
      {hu:"Köszönöm!",pr:"Kö-sö-nöm",en:"Thank you!"},
      {hu:"Én főzök, te fürdeted?",pr:"Én fő-zök, te für-de-ted",en:"I cook, you bath them?"},
      {hu:"Hagyd, megcsinálom én!",pr:"Hodyd, meg-chi-ná-lom én",en:"Leave it, I'll do it!"},
    ], tip:"-nád = polite 'could you'."},
  { id:15, phase:3, title:"Toy Names", sub:"What's this · Where is it", aud:"kids",
    phrases:[
      {hu:"Hogy hívják ezt?",pr:"Hody híy-yák ezt",en:"What's this called?"},
      {hu:"Ez egy baba.",pr:"Ez egy bo-bo",en:"This is a doll."},
      {hu:"Ez egy autó.",pr:"Ez egy o-u-tó",en:"This is a car."},
      {hu:"Ez egy labda.",pr:"Ez egy lob-do",en:"This is a ball."},
      {hu:"Hol van a...?",pr:"Hol von o...",en:"Where is the...?"},
      {hu:"Itt van!",pr:"Itt von",en:"Here it is!"},
      {hu:"Ott van!",pr:"Ott von",en:"There it is!"},
    ], tip:"3-4 toys per session."},
  { id:16, phase:3, title:"Turns & Games", sub:"Your turn · Won · Lost", aud:"kids",
    phrases:[
      {hu:"Te jössz!",pr:"Teh yösh",en:"Your turn!"},
      {hu:"Én jövök!",pr:"Én yö-vök",en:"My turn!"},
      {hu:"Megvan!",pr:"Meg-von",en:"Got it!"},
      {hu:"Jól csináltad!",pr:"Yól chi-nál-tod",en:"Well done!"},
      {hu:"Kezdjük újra!",pr:"Kezd-yük úy-ro",en:"Start again!"},
      {hu:"Ki nyert?",pr:"Ki nyert",en:"Who won?"},
      {hu:"Én nyertem!",pr:"Én nyer-tem",en:"I won!"},
    ], tip:"Announce every turn change out loud."},
  { id:17, phase:3, title:"Sharing & Sorry", sub:"Mine · Yours · Kind", aud:"kids",
    phrases:[
      {hu:"Ez az enyém.",pr:"Ez oz e-nyém",en:"This is mine."},
      {hu:"Ez a tiéd.",pr:"Ez o ti-éd",en:"This is yours."},
      {hu:"Osztozunk.",pr:"Os-to-zunk",en:"We're sharing."},
      {hu:"Bocsánat.",pr:"Bo-chá-not",en:"Sorry."},
      {hu:"Nem baj.",pr:"Nem bay",en:"It's okay."},
      {hu:"Légy kedves!",pr:"Lédy ked-vesh",en:"Be kind!"},
    ], tip:"Learn 'Ez az enyém' as one chunk."},
  { id:18, phase:3, title:"Boundaries", sub:"Stop · Not allowed · Calm", aud:"kids",
    phrases:[
      {hu:"Elég!",pr:"El-ég",en:"Enough!"},
      {hu:"Ez nem szabad.",pr:"Ez nem so-bod",en:"That's not allowed."},
      {hu:"Tedd vissza!",pr:"Tedd vis-so",en:"Put it back!"},
      {hu:"Nyugodj le!",pr:"Nyu-godj leh",en:"Calm down!"},
      {hu:"Lélegezz!",pr:"Lé-le-gezz",en:"Breathe!"},
      {hu:"Gyere, megbeszéljük.",pr:"Dye-reh, meg-be-sél-yük",en:"Come, let's talk about it."},
      {hu:"Értem.",pr:"Ér-tem",en:"I understand."},
    ], tip:"Emotionally loaded phrases stick fastest."},
  { id:19, phase:3, title:"Tidying Up", sub:"Put away · Where · Done", aud:"kids",
    phrases:[
      {hu:"Rakj rendet!",pr:"Roky ren-det",en:"Tidy up!"},
      {hu:"Tedd el!",pr:"Tedd el",en:"Put it away!"},
      {hu:"Hova tegyem?",pr:"Ho-vo te-dyem",en:"Where to put it?"},
      {hu:"Ide tedd!",pr:"I-deh tedd",en:"Put it here!"},
      {hu:"Együtt csináljuk!",pr:"E-dyütt chi-nály-yuk",en:"Together!"},
      {hu:"Kész van!",pr:"Kés von",en:"All done!"},
    ], tip:"Before transitions: 'Rakj rendet!'"},
  { id:20, phase:3, title:"Suggesting", sub:"What if · How about", aud:"wife",
    phrases:[
      {hu:"Mi lenne, ha...?",pr:"Mi len-ne, ho",en:"What if...?"},
      {hu:"Hogy hangzik?",pr:"Hody hong-zik",en:"How's that sound?"},
      {hu:"Inkább...",pr:"In-kább",en:"I'd rather..."},
      {hu:"Jó lenne!",pr:"Yó len-ne",en:"That'd be nice!"},
      {hu:"Rendben, csináljuk!",pr:"Rend-ben, chi-nály-yuk",en:"Let's do it!"},
      {hu:"Döntsd el te!",pr:"Dönchd el te",en:"You decide!"},
    ], tip:"'Mi lenne, ha...' works for any suggestion."},
  { id:21, phase:4, title:"What Do You Want?", sub:"Offering · Refusing", aud:"kids",
    phrases:[
      {hu:"Kérsz ebből?",pr:"Kérsz eb-ből",en:"Want some?"},
      {hu:"Igen, kérek.",pr:"I-gen, ké-rek",en:"Yes please."},
      {hu:"Nem kérek, köszönöm.",pr:"Nem ké-rek, kö-sö-nöm",en:"No, thank you."},
      {hu:"Kérsz még?",pr:"Kérsz még",en:"Want more?"},
      {hu:"Finom!",pr:"Fi-nom",en:"Delicious!"},
      {hu:"Nem szeretem.",pr:"Nem se-re-tem",en:"I don't like it."},
    ], tip:"'Kérsz ebből?' before every plate."},
  { id:22, phase:4, title:"Making Food", sub:"Cooking · Who made it", aud:"kids",
    phrases:[
      {hu:"Főzök.",pr:"Fő-zök",en:"I'm cooking."},
      {hu:"Ebédet készítek.",pr:"E-bé-det ké-sí-tek",en:"Making lunch."},
      {hu:"Anya csinálta.",pr:"O-nyo chi-nál-to",en:"Mum made it."},
      {hu:"Apa csinálta.",pr:"O-po chi-nál-to",en:"Dad made it."},
      {hu:"Segíts nekem!",pr:"She-gíts ne-kem",en:"Help me!"},
      {hu:"Megcsináljuk együtt!",pr:"Meg-chi-nály-yuk e-dyütt",en:"Let's make it together!"},
    ], tip:"'Anya csinálta' = mum + past tense in one chunk."},
  { id:23, phase:4, title:"Mealtimes", sub:"Sit · Eat · Thank you", aud:"kids",
    phrases:[
      {hu:"Gyertek enni!",pr:"Dyer-tek en-ni",en:"Come eat!"},
      {hu:"Jó étvágyat!",pr:"Yó ét-vá-dyot",en:"Enjoy your meal!"},
      {hu:"Lassan egyél.",pr:"Losh-shon e-dyél",en:"Eat slowly."},
      {hu:"Igyál vizet!",pr:"I-dyál vi-zet",en:"Drink water!"},
      {hu:"Köszönöm az ételt.",pr:"Kö-sö-nöm oz é-telt",en:"Thanks for the food."},
      {hu:"Felállhatok?",pr:"Fel-áll-ho-tok",en:"May I get up?"},
      {hu:"Persze!",pr:"Per-seh",en:"Of course!"},
    ], tip:"Ritual: Gyertek enni! → Jó étvágyat! → Köszönöm az ételt."},
  { id:24, phase:4, title:"Shopping", sub:"Need · List · Who goes", aud:"wife",
    phrases:[
      {hu:"Kell vennünk...",pr:"Kell ven-nünk",en:"We need to buy..."},
      {hu:"Mi kell még?",pr:"Mi kell még",en:"What else?"},
      {hu:"Nincs tej.",pr:"Ninch tey",en:"No milk."},
      {hu:"Megvan minden?",pr:"Meg-von min-den",en:"Got everything?"},
      {hu:"Én elmegyek a boltba.",pr:"Én el-me-dyek o bolt-bo",en:"I'll go to the shop."},
    ], tip:"Notice what's missing. Say it in Hungarian."},
  { id:25, phase:4, title:"Housework", sub:"Clean · Fix · Laundry", aud:"wife",
    phrases:[
      {hu:"Ki kell takarítani.",pr:"Ki kell to-ko-rí-to-ni",en:"Need to clean."},
      {hu:"Le kell mosni.",pr:"Le kell mosh-ni",en:"Dishes need washing."},
      {hu:"Ez elromlott.",pr:"Ez el-rom-lott",en:"This is broken."},
      {hu:"Megcsináltam.",pr:"Meg-chi-nál-tom",en:"Done!"},
    ], tip:"'Ki kell...' / 'Be kell...' = 'it needs doing'."},
  { id:26, phase:5, title:"Choosing a Book", sub:"Which · Long · Another", aud:"kids",
    phrases:[
      {hu:"Melyik könyvet olvassuk?",pr:"Me-yik köny-vet ol-vosh-shuk",en:"Which book?"},
      {hu:"A könyv vége.",pr:"O könyv vé-ge",en:"The end."},
      {hu:"Olvassunk még egyet?",pr:"Ol-vosh-shunk még e-dyet",en:"Read another?"},
      {hu:"Tetszett?",pr:"Tet-sett",en:"Did you like it?"},
    ], tip:"Two books at bedtime: 'Melyik könyvet olvassuk?'"},
  { id:27, phase:5, title:"Who & What", sub:"Characters · Actions", aud:"kids",
    phrases:[
      {hu:"Ki ez?",pr:"Ki ez",en:"Who is that?"},
      {hu:"Mit csinál?",pr:"Mit chi-nál",en:"What's he/she doing?"},
      {hu:"Fut.",pr:"Fut",en:"Running."},
      {hu:"Alszik.",pr:"Ol-shik",en:"Sleeping."},
      {hu:"Sír.",pr:"Shír",en:"Crying."},
      {hu:"Nevet.",pr:"Ne-vet",en:"Laughing."},
    ], tip:"Point at characters: 'Ki ez? Mit csinál?'"},
  { id:28, phase:5, title:"About the Book", sub:"Reactions · Predictions", aud:"kids",
    phrases:[
      {hu:"Mi történik itt?",pr:"Mi tör-té-nik itt",en:"What's happening?"},
      {hu:"Ez vicces!",pr:"Ez vit-chess",en:"Funny!"},
      {hu:"Ez szomorú.",pr:"Ez so-mo-rú",en:"Sad."},
      {hu:"Ez félelmetes!",pr:"Ez fé-lel-me-tesh",en:"Scary!"},
      {hu:"Fordíts lapot!",pr:"For-díts lo-pot",en:"Turn the page!"},
      {hu:"Szerinted mi lesz?",pr:"Se-rin-ted mi less",en:"What'll happen?"},
    ], tip:"One reaction per book."},
  { id:29, phase:5, title:"About the Kids", sub:"Milestones · Concerns", aud:"wife",
    phrases:[
      {hu:"Láttad, mit csinált?",pr:"Lát-tod, mit chi-nált",en:"See what they did?"},
      {hu:"Nagyon ügyes volt ma!",pr:"No-dyon ü-dyesh volt mo",en:"Really clever today!"},
      {hu:"Aggódom miatta.",pr:"Og-gó-dom mi-ot-to",en:"I'm worried."},
      {hu:"Beszélnünk kell erről.",pr:"Be-szél-nünk kell er-ről",en:"We need to talk."},
      {hu:"Mi legyen a szabály?",pr:"Mi le-dyen o so-bály",en:"What's the rule?"},
    ], tip:"Start with celebration."},
  { id:30, phase:6, title:"Bath Time", sub:"Wash · Toys · Splash", aud:"kids",
    phrases:[
      {hu:"Fürdés ideje!",pr:"Für-désh i-de-ye",en:"Bath time!"},
      {hu:"Vetkőzz le!",pr:"Vet-kőzz leh",en:"Get undressed!"},
      {hu:"Szállj be!",pr:"Sáyj be",en:"Get in!"},
      {hu:"Mosd meg a kezed!",pr:"Moshd meg o ke-zed",en:"Wash your hands!"},
      {hu:"Csukd be a szemed!",pr:"Chukd be o se-med",en:"Close your eyes!"},
      {hu:"Szállj ki!",pr:"Sáyj ki",en:"Get out!"},
      {hu:"Töröld meg magad!",pr:"Tö-röld meg mo-god",en:"Dry yourself!"},
      {hu:"Mosd meg a hajad!",pr:"Moshd meg o ho-yod",en:"Wash your hair!"},
      {hu:"Mosd meg a pocakod!",pr:"Moshd meg o po-tso-kod",en:"Wash your tummy!"},
      {hu:"Hol a kacsa?",pr:"Hol o ko-cho",en:"Where's the duck?"},
      {hu:"Ne fröcsögj!",pr:"Ne fröch-ögy",en:"Don't splash!"},
      {hu:"Meleg vagy hideg?",pr:"Me-leg vody hi-deg",en:"Warm or cold?"},
    ], tip:"Start with 3 phrases. Add 2 each bath.", pat:"verb + meg = 'completely'"},
  { id:31, phase:6, title:"Bedtime", sub:"Pyjamas · Tuck in · Goodnight", aud:"kids",
    phrases:[
      {hu:"Alvás ideje!",pr:"Ol-vásh i-de-ye",en:"Bedtime!"},
      {hu:"Vedd fel a pizsamád!",pr:"Vedd fel o pi-zho-mád",en:"Put on your pyjamas!"},
      {hu:"Feküdj le!",pr:"Fe-küdj leh",en:"Lie down!"},
      {hu:"Betakarlak.",pr:"Be-to-kor-lok",en:"I'll tuck you in."},
      {hu:"Jó éjszakát!",pr:"Yó éy-so-kát",en:"Good night!"},
      {hu:"Szép álmokat!",pr:"Sép ál-mo-kot",en:"Sweet dreams!"},
      {hu:"Szeretlek.",pr:"Se-ret-lek",en:"I love you."},
    ], tip:"Same order every night."},
  { id:32, phase:7, title:"Their Day", sub:"What did you do · Best part", aud:"kids",
    phrases:[
      {hu:"Mit csináltál ma?",pr:"Mit chi-nál-tál mo",en:"What did you do?"},
      {hu:"Mi volt a legjobb?",pr:"Mi volt o leg-yobb",en:"What was the best part?"},
      {hu:"Kivel voltál?",pr:"Ki-vel vol-tál",en:"Who with?"},
      {hu:"Történt valami érdekes?",pr:"Tör-tént vo-lo-mi ér-de-kesh",en:"Anything interesting?"},
    ], tip:"Two questions daily on the walk home."},
  { id:33, phase:7, title:"Your Day", sub:"Good day · Bad day · Sleepy", aud:"kids",
    phrases:[
      {hu:"Én dolgoztam ma.",pr:"Én dol-goz-tom mo",en:"I worked today."},
      {hu:"Futottam ma.",pr:"Fu-tot-tom mo",en:"I ran today."},
      {hu:"Főztem.",pr:"Főz-tem",en:"I cooked."},
      {hu:"Sétáltam.",pr:"Shé-tál-tom",en:"I walked."},
      {hu:"Jó volt a napom.",pr:"Yó volt o no-pom",en:"My day was good."},
      {hu:"Rossz napom volt.",pr:"Ross no-pom volt",en:"My day was bad."},
      {hu:"Nehéz nap volt.",pr:"Ne-héz nop volt",en:"It was a tough day."},
      {hu:"Álmos vagyok.",pr:"Ál-mosh vo-dyok",en:"I'm sleepy."},
    ], tip:"Start with one sentence about your day. 'Jó napom volt.' is enough."},
  { id:34, phase:7, title:"Feelings", sub:"Good · Bad · Proud · Love", aud:"kids",
    phrases:[
      {hu:"Milyen volt a napod?",pr:"Mi-yen volt o no-pod",en:"How was your day?"},
      {hu:"Jó napom volt.",pr:"Yó no-pom volt",en:"Good day."},
      {hu:"Fáradt vagyok.",pr:"Fá-rott vo-dyok",en:"I'm tired."},
      {hu:"Büszke vagyok rád.",pr:"Büsh-ke vo-dyok rád",en:"I'm proud of you."},
      {hu:"Szeretlek.",pr:"Se-ret-lek",en:"I love you."},
    ], tip:"End every day with 'Szeretlek.'"},
  { id:35, phase:7, title:"Emotions", sub:"Stressed · Grateful · Sorry", aud:"wife",
    phrases:[
      {hu:"Mi a baj?",pr:"Mi o boy",en:"What's wrong?"},
      {hu:"Jól vagy?",pr:"Yól vody",en:"Are you okay?"},
      {hu:"Stresszes vagyok.",pr:"Stres-ses vo-dyok",en:"I'm stressed."},
      {hu:"Hálás vagyok.",pr:"Há-lásh vo-dyok",en:"I'm grateful."},
      {hu:"Melletted vagyok.",pr:"Mel-let-ted vo-dyok",en:"I'm here for you."},
      {hu:"Sajnálom.",pr:"Shoy-ná-lom",en:"I'm sorry."},
      {hu:"Hiányoztál.",pr:"Hi-á-nyoz-tál",en:"I missed you."},
      {hu:"Szeretlek.",pr:"Se-ret-lek",en:"I love you."},
    ], tip:"'[feeling] vagyok' — same pattern, bigger vocab."},
  { id:36, phase:8, title:"Reactions & Fillers", sub:"Wow · Really · Of course", aud:"both",
    phrases:[
      {hu:"Tényleg?",pr:"Tény-leg",en:"Really?"},
      {hu:"Szuper!",pr:"Su-per",en:"Great!"},
      {hu:"Nagyon jó!",pr:"No-dyon yó",en:"Very good!"},
      {hu:"Nem tudom.",pr:"Nem tu-dom",en:"I don't know."},
      {hu:"Majd meglátjuk.",pr:"Moyd meg-lát-yuk",en:"We'll see."},
      {hu:"Persze!",pr:"Per-seh",en:"Of course!"},
      {hu:"Figyelj!",pr:"Fi-dyely",en:"Pay attention!"},
      {hu:"Ugye?",pr:"U-dye",en:"Right?"},
      {hu:"Biztos?",pr:"Biz-tosh",en:"Are you sure?"},
    ], tip:"React to everything in Hungarian for one full day."},
  { id:37, phase:8, title:"Quick Questions", sub:"Why · When · How", aud:"both",
    phrases:[
      {hu:"Miért?",pr:"Mi-ért",en:"Why?"},
      {hu:"Mikor?",pr:"Mi-kor",en:"When?"},
      {hu:"Hogyan?",pr:"Ho-dyon",en:"How?"},
      {hu:"Melyik?",pr:"Me-yik",en:"Which?"},
      {hu:"Ki?",pr:"Ki",en:"Who?"},
      {hu:"Hol?",pr:"Hol",en:"Where?"},
      {hu:"Kész vagy?",pr:"Kés vody",en:"Ready?"},
      {hu:"Jössz?",pr:"Yösh",en:"Coming?"},
    ], tip:"One-word questions keep conversation alive."},
  { id:38, phase:8, title:"When You're Stuck", sub:"How do you say · Slower", aud:"wife",
    phrases:[
      {hu:"Hogyan mondják ezt magyarul?",pr:"Ho-dyon mond-yák ezt mo-dyo-rul",en:"How do you say this?"},
      {hu:"Mondd el még egyszer!",pr:"Mond el még edy-ser",en:"Say it again!"},
      {hu:"Mondd el lassan!",pr:"Mond el losh-shon",en:"Say it slowly!"},
      {hu:"Nem értem.",pr:"Nem ér-tem",en:"I don't understand."},
      {hu:"Javíts ki!",pr:"Yo-víts ki",en:"Correct me!"},
      {hu:"Jól mondtam?",pr:"Yól mond-tom",en:"Did I say it right?"},
      {hu:"Köszi a türelmet!",pr:"Kö-si o tü-rel-met",en:"Thanks for patience!"},
    ], tip:"THE MOST IMPORTANT LESSON. Stay in Hungarian even when stuck."},
  { id:39, phase:8, title:"Opinions", sub:"I think · Agree · Tell me more", aud:"wife",
    phrases:[
      {hu:"Szerintem...",pr:"Se-rin-tem",en:"I think..."},
      {hu:"Igazad van.",pr:"I-go-zod von",en:"You're right."},
      {hu:"Egyetértek.",pr:"E-dyet-ér-tek",en:"I agree."},
      {hu:"Nem értek egyet.",pr:"Nem ér-tek e-dyet",en:"I disagree."},
      {hu:"Komolyan?",pr:"Ko-mo-lyon",en:"Seriously?"},
      {hu:"Mesélj még!",pr:"Me-shély még",en:"Tell me more!"},
      {hu:"Egyébként...",pr:"E-dyéb-ként",en:"By the way..."},
    ], tip:"Active listening counts. 'Komolyan?' keeps conversations alive."},
  { id:40, phase:1, title:"Rooms", sub:"Kitchen · Bedroom · Garden", aud:"kids",
    phrases:[
      {hu:"Gyere a konyhába!",pr:"Dye-reh o kon-yá-bo",en:"Come to the kitchen!"},
      {hu:"Menj a fürdőszobába!",pr:"Meny o für-dő-so-bá-bo",en:"Go to the bathroom!"},
      {hu:"Menj a szobádba!",pr:"Meny o so-bád-bo",en:"Go to your room!"},
      {hu:"Hol vagy?",pr:"Hol vody",en:"Where are you?"},
      {hu:"A nappaliban vagyok.",pr:"O nop-po-li-bon vo-dyok",en:"I'm in the living room."},
      {hu:"A konyhában vagyok.",pr:"O kon-yá-bon vo-dyok",en:"I'm in the kitchen."},
      {hu:"Kint vagyok a kertben.",pr:"Kint vo-dyok o kert-ben",en:"I'm out in the garden."},
    ], tip:"Name the room every time you call or move through the house.", pat:"-ban/-ben = 'in'. -ba/-be = 'into'"},
  { id:41, phase:8, title:"Where Is It?", sub:"On · Under · Next to", aud:"kids",
    phrases:[
      {hu:"Az asztalon van.",pr:"Az os-to-lon von",en:"It's on the table."},
      {hu:"A padlón van.",pr:"O pod-lón von",en:"It's on the floor."},
      {hu:"A polcon van.",pr:"O pol-tson von",en:"It's on the shelf."},
      {hu:"A fiókban van.",pr:"O fi-ók-bon von",en:"It's in the drawer."},
      {hu:"Alatta van.",pr:"O-lot-to von",en:"It's underneath."},
      {hu:"Mellette van.",pr:"Mel-let-te von",en:"It's next to it."},
      {hu:"Balra.",pr:"Bol-ro",en:"On the left."},
      {hu:"Jobbra.",pr:"Yobb-ro",en:"On the right."},
      {hu:"Középen.",pr:"Kö-zé-pen",en:"In the middle."},
    ], tip:"'Hol van?' then point and answer. Three locations per day.", pat:"-on/-en/-ön = on. -ban/-ben = in"},
  { id:42, phase:2, title:"Bikes & Scooters", sub:"Get on · Pedal · Well done", aud:"kids",
    phrases:[
      {hu:"Sisakot fel!",pr:"Shi-sho-kot fel",en:"Helmet on!"},
      {hu:"Szállj fel a biciklire!",pr:"Sáyj fel o bi-tsik-li-re",en:"Get on your bike!"},
      {hu:"Szállj fel a rollerre!",pr:"Sáyj fel o rol-ler-re",en:"Get on the scooter!"},
      {hu:"Szállj fel hozzám!",pr:"Sáyj fel hoz-zám",en:"Get on with me!"},
      {hu:"Szállj le!",pr:"Sáyj leh",en:"Get off!"},
      {hu:"Tekerd!",pr:"Te-kerd",en:"Pedal!"},
      {hu:"Fékezz!",pr:"Fé-kezz",en:"Brake!"},
      {hu:"Lassan!",pr:"Losh-shon",en:"Slow down!"},
      {hu:"Jól csináltad!",pr:"Yól chi-nál-tod",en:"Well done!"},
    ], tip:"'Sisakot fel!' every single time — no exceptions."},
  { id:43, phase:3, title:"Drawing & Colouring", sub:"Draw · Colour · Lines", aud:"kids",
    phrases:[
      {hu:"Mit rajzolsz?",pr:"Mit roy-zols",en:"What are you drawing?"},
      {hu:"Rajzoljunk egy cicát!",pr:"Roy-zol-yunk edy tsi-tsát",en:"Let's draw a cat!"},
      {hu:"Rajzoljunk egy autót!",pr:"Roy-zol-yunk edy o-u-tót",en:"Let's draw a car!"},
      {hu:"Színezd ki!",pr:"Sí-nezd ki",en:"Colour it in!"},
      {hu:"A vonalon belül!",pr:"O vo-no-lon be-lül",en:"Inside the lines!"},
      {hu:"Milyen színt kérsz?",pr:"Mi-yen sínt kérs",en:"What colour do you want?"},
      {hu:"Szép lett!",pr:"Sép lett",en:"It turned out nice!"},
      {hu:"Még egyet!",pr:"Még e-dyet",en:"One more!"},
      {hu:"Mutasd meg!",pr:"Mu-toshd meg",en:"Show me!"},
    ], tip:"Ask 'Mit rajzolsz?' any time they pick up a crayon.", pat:"rajzol = draw · színez = colour"},
  { id:44, phase:3, title:"Counting & Numbers", sub:"1-10 · How many · Count", aud:"kids",
    phrases:[
      {hu:"Számoljunk!",pr:"Sá-mol-yunk",en:"Let's count!"},
      {hu:"Egy, kettő, három.",pr:"Edy, ket-tő, há-rom",en:"One, two, three."},
      {hu:"Négy, öt, hat.",pr:"Nédy, öt, hot",en:"Four, five, six."},
      {hu:"Hét, nyolc, kilenc, tíz.",pr:"Hét, nyolts, ki-lents, tíz",en:"Seven, eight, nine, ten."},
      {hu:"Hány van?",pr:"Hány von",en:"How many are there?"},
      {hu:"Számold meg!",pr:"Sá-mold meg",en:"Count them!"},
      {hu:"Ez mennyi?",pr:"Ez men-nyi",en:"How many is this?"},
      {hu:"Kettő van.",pr:"Ket-tő von",en:"There are two."},
      {hu:"Még egy!",pr:"Még edy",en:"One more!"},
      {hu:"Hány ujjad van?",pr:"Hány uy-yod von",en:"How many fingers do you have?"},
    ], tip:"Count everything: stairs, grapes, toy cars. Use fingers.", pat:"Hány = how many (countable)"},
];

// ─── UTILITIES ─────────────────────────────────────────────────────────────
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function normalize(s){return s.replace(/[!?.,:;'"¡¿…]/g,"").toLowerCase().trim();}

// ─── DAILY FOCUS ENGINE ───────────────────────────────────────────────────
function getDailyFocus(stats){
  const now=new Date();
  const hour=now.getHours();
  const day=now.getDay(); // 0=Sun, 6=Sat
  const isWeekend=day===0||day===6;
  const timeSlot=hour<11?"morning":hour<14?"midday":hour<17?"afternoon":"evening";

  const scored=[];

  LESSONS.forEach(lesson=>{
    const phase=PHASES.find(p=>p.id===lesson.phase);
    let score=0;
    let reasons=[];

    // 1. Time-of-day relevance (0-3 points)
    const timeRelevant=TIME_TAGS[timeSlot]||[];
    if(timeRelevant.includes(lesson.id)){score+=3;reasons.push("timely");}

    // 2. Weekday/weekend relevance (0-2 points)
    if(isWeekend&&WEEKEND_BOOST.includes(lesson.id)){score+=2;reasons.push("weekend");}
    if(!isWeekend&&WEEKDAY_BOOST.includes(lesson.id)){score+=2;reasons.push("weekday");}

    // 3. Never attempted — explore new content (4 points)
    const ls=stats.lessonScores[lesson.id];
    if(!ls){score+=4;reasons.push("new");}
    // 4. Low score — needs revision (0-5 points)
    else if(ls.best<60){score+=5;reasons.push("struggling");}
    else if(ls.best<80){score+=2;reasons.push("improve");}

    // 5. Weak phrases in this lesson (0-4 points)
    const weakCount=lesson.phrases.filter(p=>{
      const ps=stats.phraseScores[p.hu];
      return ps&&ps.wrong>0&&ps.wrong>=ps.right;
    }).length;
    if(weakCount>=3){score+=4;reasons.push("weak_phrases");}
    else if(weakCount>=1){score+=2;reasons.push("some_weak");}

    // 6. Toolkit lessons always get a small boost (survival)
    if(lesson.phase===8&&!ls){score+=2;reasons.push("essential");}

    scored.push({lesson,phase,score,reasons,ls,weakCount});
  });

  // Sort by score descending, take top suggestions
  scored.sort((a,b)=>b.score-a.score);

  // Pick up to 3, but ensure variety: no more than 2 from same phase
  const picks=[];
  const phaseCount={};
  for(const item of scored){
    if(picks.length>=3)break;
    const pc=phaseCount[item.phase.id]||0;
    if(pc>=2)continue;
    picks.push(item);
    phaseCount[item.phase.id]=(pc||0)+1;
  }

  // Generate human-readable reason for each
  const reasonText=(item)=>{
    const r=item.reasons;
    if(r.includes("struggling"))return `You scored ${item.ls.best}% — let's improve`;
    if(r.includes("weak_phrases"))return `${item.weakCount} phrases need work`;
    if(r.includes("new")&&r.includes("timely"))return "New lesson · you'll use this now";
    if(r.includes("new")&&r.includes("essential"))return "Essential toolkit · learn this first";
    if(r.includes("new"))return "Haven't tried this yet";
    if(r.includes("timely")&&r.includes("some_weak"))return "Relevant now · some phrases to revise";
    if(r.includes("timely"))return "You'll use this today";
    if(r.includes("improve"))return `${item.ls.best}% — room to grow`;
    return "Suggested for you";
  };

  return picks.map(item=>({
    lesson:item.lesson,
    phase:item.phase,
    reason:reasonText(item),
    score:item.score,
  }));
}

// ─── STATS HOOK (with localStorage persistence) ───────────────────────────
const STORAGE_KEY = "magyar-otthon-stats-v1";

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {
    totalTime:0, sessionsCompleted:0, streakDays:[], phraseScores:{},
    lessonScores:{}, lastActive:null, todayTime:0, todayDate:new Date().toDateString(), dailyGoal:15,
  };
}

function saveStats(stats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch(e) {}
}

function useStats(){
  const [stats,setStats]=useState(()=>loadStats());
  const startRef=useRef(null);

  // Persist to localStorage whenever stats change
  useEffect(()=>{ saveStats(stats); },[stats]);

  const startTimer=useCallback(()=>{startRef.current=Date.now();},[]);
  const stopTimer=useCallback(()=>{
    if(!startRef.current)return 0;
    const elapsed=Math.floor((Date.now()-startRef.current)/1000);
    startRef.current=null;
    const today=new Date().toDateString();
    setStats(s=>{
      const isSameDay=s.todayDate===today;
      return {...s,totalTime:s.totalTime+elapsed,todayTime:(isSameDay?s.todayTime:0)+elapsed,todayDate:today};
    });
    return elapsed;
  },[]);
  const recordPhrase=useCallback((phraseHu,correct)=>{
    setStats(s=>{
      const prev=s.phraseScores[phraseHu]||{right:0,wrong:0};
      return {...s,phraseScores:{...s.phraseScores,[phraseHu]:{right:prev.right+(correct?1:0),wrong:prev.wrong+(correct?0:1)}}};
    });
  },[]);
  const recordSession=useCallback((lessonId,score,total)=>{
    const today=new Date().toDateString();
    setStats(s=>{
      const newStreak=s.streakDays.includes(today)?s.streakDays:[...s.streakDays,today];
      const prev=s.lessonScores[lessonId]||{best:0,attempts:0};
      return {...s, sessionsCompleted:s.sessionsCompleted+1, streakDays:newStreak, lastActive:today,
        lessonScores:{...s.lessonScores,[lessonId]:{best:Math.max(prev.best,Math.round(score/total*100)),attempts:prev.attempts+1}}};
    });
  },[]);
  const getWeakPhrases=useCallback((lessonPhrases)=>{
    return lessonPhrases.filter(p=>{
      const sc=stats.phraseScores[p.hu];
      return sc && sc.wrong>0 && sc.wrong>=sc.right;
    });
  },[stats]);
  const setDailyGoal=useCallback((mins)=>{setStats(s=>({...s,dailyGoal:mins}));},[]);

  // Check if today's date matches
  const todayMins=useMemo(()=>{
    const today=new Date().toDateString();
    return stats.todayDate===today?Math.floor(stats.todayTime/60):0;
  },[stats]);

  return {stats,startTimer,stopTimer,recordPhrase,recordSession,getWeakPhrases,setDailyGoal,todayMins};
}

// ─── QUESTION GENERATORS ──────────────────────────────────────────────────
function genMC_EnToHu(p,all){const d=shuffle(all.filter(x=>x.hu!==p.hu)).slice(0,3).map(x=>x.hu);return{type:"mc_en_hu",prompt:p.en,answer:p.hu,options:shuffle([p.hu,...d]),pr:p.pr,phrase:p};}
function genMC_HuToEn(p,all){const d=shuffle(all.filter(x=>x.en!==p.en)).slice(0,3).map(x=>x.en);return{type:"mc_hu_en",prompt:p.hu,promptPr:p.pr,answer:p.en,options:shuffle([p.en,...d]),phrase:p};}
function genType(p){return{type:"type",prompt:p.en,answer:p.hu,pr:p.pr,phrase:p};}
function genTF(p,all){const t=Math.random()>0.5;const shown=t?p.en:shuffle(all.filter(x=>x.en!==p.en))[0]?.en||p.en;return{type:"tf",prompt:p.hu,promptPr:p.pr,shown,answer:t,phrase:p};}
function genFill(p){const w=p.hu.split(" ");if(w.length<2)return genMC_EnToHu(p,LESSONS.flatMap(l=>l.phrases));const gi=Math.floor(Math.random()*w.length);return{type:"fill",prompt:p.en,display:w.map((x,i)=>i===gi?"____":x).join(" "),answer:w[gi],fullHu:p.hu,pr:p.pr,phrase:p};}
function genMatch(phrases){const s=shuffle(phrases).slice(0,4);return{type:"match",pairs:s.map(p=>({hu:p.hu,en:p.en})),phrase:s[0]};}

function generateQuestions(lesson,weakPhrases,count=15){
  const all=LESSONS.flatMap(l=>l.phrases);
  let pool=[...lesson.phrases];
  if(weakPhrases.length>0)pool=[...pool,...weakPhrases,...weakPhrases];
  const qs=[];const types=["mc_en_hu","mc_hu_en","type","tf","fill","match"];
  for(let t of types){if(qs.length>=count)break;const p=pool[Math.floor(Math.random()*pool.length)];
    if(t==="mc_en_hu")qs.push(genMC_EnToHu(p,all));else if(t==="mc_hu_en")qs.push(genMC_HuToEn(p,all));
    else if(t==="type")qs.push(genType(p));else if(t==="tf")qs.push(genTF(p,all));
    else if(t==="fill")qs.push(genFill(p));else if(t==="match"&&lesson.phrases.length>=4)qs.push(genMatch(lesson.phrases));
  }
  while(qs.length<count){const p=pool[Math.floor(Math.random()*pool.length)];const t=types[Math.floor(Math.random()*(types.length-1))];
    if(t==="mc_en_hu")qs.push(genMC_EnToHu(p,all));else if(t==="mc_hu_en")qs.push(genMC_HuToEn(p,all));
    else if(t==="type")qs.push(genType(p));else if(t==="tf")qs.push(genTF(p,all));else if(t==="fill")qs.push(genFill(p));
  }
  return shuffle(qs).slice(0,count);
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const C={bg:"#0F1117",card:"#161822",border:"#1E2030",text:"#E8E6E1",sub:"#7A7B8A",dim:"#555668",green:"#3A8F6E",red:"#D94A4A",amber:"#E8913A"};

// ─── SPEECH UTILITY ──────────────────────────────────────────────────────
function speakHu(text){if(!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="hu-HU";u.rate=0.85;window.speechSynthesis.speak(u);}
function SpeakBtn({text,color,size=18}){return <button onClick={e=>{e.stopPropagation();speakHu(text);}} title="Hear pronunciation" style={{background:"none",border:"none",cursor:"pointer",fontSize:size,padding:"2px 4px",color:color||C.sub,lineHeight:1,flexShrink:0}}>🔊</button>;}

// ─── FEEDBACK MODAL ────────────────────────────────────────────────────────
const FEEDBACK_CATEGORIES=[
  {value:"wrong-translation",label:"Wrong translation",gh_label:"wrong-translation"},
  {value:"wrong-pronunciation",label:"Wrong pronunciation",gh_label:"wrong-pronunciation"},
  {value:"suggestion",label:"Suggestion",gh_label:"suggestion"},
  {value:"bug",label:"Bug / Error",gh_label:"bug"},
  {value:"other",label:"Other",gh_label:"question"},
];

function FeedbackModal({onClose,context}){
  const [category,setCategory]=useState(FEEDBACK_CATEGORIES[0].value);
  const [description,setDescription]=useState("");
  const [status,setStatus]=useState("idle");

  const submit=async()=>{
    if(!description.trim())return;
    setStatus("loading");
    const cat=FEEDBACK_CATEGORIES.find(c=>c.value===category);
    const title=`[Feedback] ${cat.label}: ${description.slice(0,50)}${description.length>50?"…":""}`;
    const body=[`**Category:** ${cat.label}`,`**Context:** ${context||"General"}`,``,`**Description:**`,description.trim()].join("\n");
    try{
      const res=await fetch("https://api.github.com/repos/tomrook12/statichungarianapp/issues",{
        method:"POST",
        headers:{Authorization:`Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,"Content-Type":"application/json"},
        body:JSON.stringify({title,body,labels:[cat.gh_label]}),
      });
      if(!res.ok)throw new Error();
      setStatus("success");
    }catch{setStatus("error");}
  };

  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,padding:"0 0 20px"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"24px 20px",width:"100%",maxWidth:440}}>
      {status==="success"?<div style={{textAlign:"center",padding:"20px 0"}}>
        <div style={{fontSize:40}}>✅</div>
        <div style={{fontSize:18,fontWeight:800,color:C.text,marginTop:12}}>Feedback sent!</div>
        <div style={{fontSize:13,color:C.sub,marginTop:6}}>A GitHub issue has been created. Thanks!</div>
        <button onClick={onClose} style={{marginTop:20,padding:"12px 32px",borderRadius:12,background:`${C.green}20`,border:`1px solid ${C.green}40`,color:C.green,fontSize:14,fontWeight:700,cursor:"pointer"}}>Close</button>
      </div>:<>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:800,color:C.text}}>Send Feedback</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.sub,fontSize:22,cursor:"pointer",padding:"0 4px",lineHeight:1}}>×</button>
        </div>
        {context&&<div style={{fontSize:11,color:C.dim,marginBottom:14,padding:"6px 10px",background:C.bg,borderRadius:8}}>Context: {context}</div>}
        <div style={{fontSize:12,color:C.sub,marginBottom:6,fontWeight:600}}>Category</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
          {FEEDBACK_CATEGORIES.map(c=><button key={c.value} onClick={()=>setCategory(c.value)}
            style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${category===c.value?"#4A90D9":C.border}`,background:category===c.value?"#4A90D910":"transparent",color:category===c.value?"#4A90D9":C.sub,fontSize:12,fontWeight:700,cursor:"pointer"}}>{c.label}</button>)}
        </div>
        <div style={{fontSize:12,color:C.sub,marginBottom:6,fontWeight:600}}>Description</div>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the issue or suggestion..."
          style={{width:"100%",minHeight:90,padding:"12px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.bg,color:C.text,fontSize:14,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
        {status==="error"&&<div style={{fontSize:12,color:C.red,marginTop:6}}>Failed to submit. Check your connection and try again.</div>}
        <button onClick={submit} disabled={!description.trim()||status==="loading"}
          style={{marginTop:12,width:"100%",padding:"13px",borderRadius:12,background:description.trim()?"#4A90D9":C.border,border:"none",color:"#fff",fontSize:14,fontWeight:700,cursor:description.trim()?"pointer":"default",opacity:status==="loading"?0.6:1}}>
          {status==="loading"?"Sending…":"Send Feedback"}
        </button>
      </>}
    </div>
  </div>;
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────
function Header({title,sub,onBack,right}){
  return <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`}}>
    {onBack&&<button onClick={onBack} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer",padding:"4px 6px"}}>←</button>}
    <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,color:C.text}}>{title}</div>{sub&&<div style={{fontSize:12,color:C.sub}}>{sub}</div>}</div>
    {right}
  </div>;
}
function ProgressBar({pct,color}){return <div style={{width:"100%",height:4,background:C.border,borderRadius:2,overflow:"hidden"}}><div style={{width:`${Math.min(100,pct)}%`,height:"100%",background:color,borderRadius:2,transition:"width 0.4s"}}/></div>;}
function Badge({text,bg}){return <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:6,background:bg,color:"#fff",marginLeft:8,letterSpacing:0.5}}>{text.toUpperCase()}</span>;}

// ─── GOAL RING ────────────────────────────────────────────────────────────
function GoalRing({todayMins,goal,onTap}){
  const pct=Math.min(100,Math.round((todayMins/goal)*100));
  const done=todayMins>=goal;
  const r=38;const circ=2*Math.PI*r;const offset=circ-(pct/100)*circ;
  const color=done?C.green:pct>50?C.amber:"#4A90D9";

  return <div onClick={onTap} style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke={C.border} strokeWidth="5"/>
      <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 45 45)" style={{transition:"stroke-dashoffset 0.6s ease"}}/>
    </svg>
    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-55%)",textAlign:"center"}}>
      <div style={{fontSize:18,fontWeight:900,color:C.text}}>{todayMins}</div>
      <div style={{fontSize:9,color:C.sub,fontWeight:600}}>/ {goal} min</div>
    </div>
    <div style={{fontSize:10,color:done?C.green:C.sub,fontWeight:700,marginTop:2}}>{done?"Goal reached!":"Daily goal"}</div>
  </div>;
}

// ─── DAILY FOCUS CARD ─────────────────────────────────────────────────────
function DailyFocusCard({focus,onSelectLesson}){
  if(!focus.length)return null;
  const now=new Date();
  const greetings=now.getHours()<12?"Good morning":now.getHours()<17?"Good afternoon":"Good evening";

  return <div style={{padding:"0 16px",marginBottom:14}}>
    <div style={{fontSize:13,color:C.sub,marginBottom:8,fontWeight:600}}>{greetings} — here's your focus</div>
    {focus.map((f,i)=>(
      <div key={i} onClick={()=>onSelectLesson(f.lesson.id)} style={{background:`linear-gradient(135deg, ${f.phase.color}14, ${f.phase.color}06)`,border:`1px solid ${f.phase.color}30`,borderRadius:14,padding:"12px 14px",marginBottom:6,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:`${f.phase.color}22`,color:f.phase.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{f.phase.emoji}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>{f.lesson.title}</div>
          <div style={{fontSize:11,color:f.phase.color,fontWeight:600,marginTop:1}}>{f.reason}</div>
        </div>
        <span style={{color:C.dim,fontSize:16}}>›</span>
      </div>
    ))}
  </div>;
}

// ─── GOAL SETTINGS MODAL ──────────────────────────────────────────────────
function GoalSettings({goal,onSet,onClose}){
  const options=[5,10,15,20,30];
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}} onClick={onClose}>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"24px 20px",maxWidth:300,width:"100%"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:18,fontWeight:800,color:C.text,textAlign:"center",marginBottom:4}}>Daily Goal</div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center",marginBottom:20}}>How many minutes per day?</div>
      <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
        {options.map(m=>(
          <button key={m} onClick={()=>{onSet(m);onClose();}} style={{width:52,height:52,borderRadius:14,border:m===goal?`2px solid ${C.green}`:`2px solid ${C.border}`,background:m===goal?`${C.green}15`:C.bg,color:m===goal?C.green:C.text,fontSize:16,fontWeight:800,cursor:"pointer"}}>{m}</button>
        ))}
      </div>
      <div style={{fontSize:11,color:C.dim,textAlign:"center",marginTop:14}}>Research suggests 15-30 mins of focused study is optimal</div>
    </div>
  </div>;
}

// ─── STATS DASHBOARD ──────────────────────────────────────────────────────
function StatsView({stats,onBack}){
  const mins=Math.floor(stats.totalTime/60);
  const streak=stats.streakDays.length;
  const lc=Object.keys(stats.lessonScores).length;
  const avg=lc>0?Math.round(Object.values(stats.lessonScores).reduce((a,b)=>a+b.best,0)/lc):0;
  const weak=Object.entries(stats.phraseScores).filter(([,v])=>v.wrong>0).sort(([,a],[,b])=>(b.wrong/(b.right+b.wrong))-(a.wrong/(a.right+a.wrong))).slice(0,8);

  const box=(l,v,e)=>(<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 12px",textAlign:"center",flex:1}}><div style={{fontSize:24}}>{e}</div><div style={{fontSize:22,fontWeight:900,color:C.text,marginTop:2}}>{v}</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>{l}</div></div>);

  return <div>
    <Header title="Your Progress" onBack={onBack}/>
    <div style={{padding:"14px 16px 80px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {box("Minutes",mins,"⏱️")}{box("Days Active",streak,"🔥")}{box("Lessons",lc,"📚")}{box("Avg Score",avg+"%","🎯")}
      </div>
      {weak.length>0&&<div style={{marginTop:18}}>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:8}}>Phrases to work on</div>
        {weak.map(([hu,sc],i)=>{const phr=LESSONS.flatMap(l=>l.phrases).find(p=>p.hu===hu);const pct=Math.round(sc.right/(sc.right+sc.wrong)*100);
          return <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 12px",marginBottom:5}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:14,fontWeight:700,color:C.text}}>{hu}</span><span style={{fontSize:12,color:pct<50?C.red:C.sub}}>{pct}%</span></div>
            {phr&&<div style={{fontSize:11,color:C.sub,marginTop:1}}>{phr.en}</div>}<ProgressBar pct={pct} color={pct<50?C.red:C.green}/>
          </div>;})}
      </div>}
      {lc>0&&<div style={{marginTop:18}}>
        <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:8}}>Lesson scores</div>
        {Object.entries(stats.lessonScores).sort(([a],[b])=>a-b).map(([id,sc])=>{const l=LESSONS.find(x=>x.id===parseInt(id));if(!l)return null;const ph=PHASES.find(p=>p.id===l.phase);
          return <div key={id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{width:26,height:26,borderRadius:8,background:`${ph.color}20`,color:ph.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800}}>{l.id}</div>
            <div style={{flex:1,fontSize:13,fontWeight:600,color:C.text}}>{l.title}</div>
            <span style={{fontSize:12,color:sc.best>=80?C.green:sc.best>=50?C.amber:C.red,fontWeight:700}}>{sc.best}%</span>
            <span style={{fontSize:10,color:C.sub}}>×{sc.attempts}</span>
          </div>;})}
      </div>}
    </div>
  </div>;
}

// ─── QUIZ ENGINE ──────────────────────────────────────────────────────────
function QuizEngine({lesson,color,onFinish,statsApi}){
  const weak=statsApi.getWeakPhrases(lesson.phrases);
  const [qs]=useState(()=>generateQuestions(lesson,weak,15));
  const [qi,setQi]=useState(0);const [score,setScore]=useState(0);const [ans,setAns]=useState(null);const [typed,setTyped]=useState("");
  const [ms,setMs]=useState({sel:null,matched:[],wrong:null});
  useEffect(()=>{statsApi.startTimer();},[]);
  useEffect(()=>{ if(q.type==="mc_hu_en"||q.type==="tf")speakHu(q.prompt); else if(q.type==="fill")speakHu(q.phrase.hu); },[qi]);
  useEffect(()=>{ if(ans!==null&&q.type==="type")speakHu(q.answer); },[ans]);
  const q=qs[qi];const total=qs.length;
  const matchItems=useMemo(()=>{if(q.type!=="match")return[];return[...shuffle(q.pairs.map(p=>({text:p.hu,lang:"hu",key:p.hu}))),...shuffle(q.pairs.map(p=>({text:p.en,lang:"en",key:p.hu})))];},[qi]);
  const advance=(correct)=>{if(q.phrase)statsApi.recordPhrase(q.phrase.hu,correct);if(correct)setScore(s=>s+1);};
  const goNext=()=>{if(qi<total-1){setQi(i=>i+1);setAns(null);setTyped("");setMs({sel:null,matched:[],wrong:null});}
    else{statsApi.stopTimer();statsApi.recordSession(lesson.id,score,total);setAns("done");}};

  if(ans==="done"){return <div style={{padding:"40px 20px",textAlign:"center"}}>
    <div style={{fontSize:52}}>{score>=total*0.8?"🎉":score>=total*0.5?"👏":"💪"}</div>
    <div style={{fontSize:30,fontWeight:900,color:C.text,marginTop:10}}>{score}/{total}</div>
    <div style={{fontSize:15,color:C.sub,marginTop:4}}>{score>=total*0.8?"Excellent!":score>=total*0.5?"Good work!":"Keep going!"}</div>
    <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"center"}}>
      <button onClick={onFinish} style={{padding:"12px 24px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer"}}>Done</button>
      <button onClick={()=>{setQi(0);setScore(0);setAns(null);setTyped("");statsApi.startTimer();}} style={{padding:"12px 24px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer"}}>Retry</button>
    </div></div>;}

  const label={mc_en_hu:"Pick the Hungarian",mc_hu_en:"Pick the English",type:"Type the Hungarian",tf:"True or false?",fill:"Fill the gap",match:"Match pairs"}[q.type];

  const mcBtn=(opt,i,isAns,isSel)=>{let st=null;if(ans!==null){if(isAns)st="correct";else if(isSel)st="wrong";}
    return <button key={i} disabled={ans!==null} onClick={()=>{if(q.type==="mc_en_hu")speakHu(q.answer);setAns(opt);advance(isAns);}}
      style={{width:"100%",padding:"13px 15px",borderRadius:12,border:`2px solid ${st==="correct"?C.green:st==="wrong"?C.red:C.border}`,background:st==="correct"?`${C.green}12`:st==="wrong"?`${C.red}12`:C.card,color:st==="correct"?"#5FD4A0":st==="wrong"?"#FF8888":C.text,fontSize:15,fontWeight:600,cursor:ans?"default":"pointer",marginBottom:6,textAlign:"left"}}>{opt}</button>;};

  const typeInput=(placeholder)=>(<>
    <input value={typed} onChange={e=>setTyped(e.target.value)} disabled={ans!==null} placeholder={placeholder}
      style={{width:"100%",padding:"13px 15px",borderRadius:12,border:`2px solid ${ans===null?C.border:ans?C.green:C.red}`,background:C.card,color:C.text,fontSize:16,fontWeight:600,outline:"none",boxSizing:"border-box"}}
      onKeyDown={e=>{if(e.key==="Enter"&&!ans&&typed.trim()){const c=normalize(typed)===normalize(q.answer);setAns(c);advance(c);}}}/>
    {!ans&&typed.trim()&&<button onClick={()=>{const c=normalize(typed)===normalize(q.answer);setAns(c);advance(c);}}
      style={{width:"100%",padding:"12px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer",marginTop:8}}>Check</button>}
    {ans!==null&&<div style={{textAlign:"center",marginTop:10,fontSize:13,fontWeight:600,color:ans?"#5FD4A0":"#FF8888"}}>{ans?`✓ ${q.fullHu||q.answer}`:`✗ ${q.answer}`}{q.pr&&` — ${q.pr}`}</div>}
  </>);

  return <div style={{padding:"14px 16px 80px"}}>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.sub,marginBottom:5}}>
      <span>{qi+1}/{total}</span><span style={{background:`${color}18`,color,padding:"2px 8px",borderRadius:8,fontWeight:700,fontSize:11}}>{label}</span>
    </div>
    <ProgressBar pct={(qi/total)*100} color={color}/>
    <div style={{marginTop:18}}>
    {q.type==="mc_en_hu"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center"}}>How do you say:</div>
      <div style={{fontSize:21,fontWeight:800,color:C.text,textAlign:"center",margin:"10px 0 18px"}}>{q.prompt}</div>
      {q.options.map((o,i)=>mcBtn(o,i,o===q.answer,o===ans))}
    </div>}
    {q.type==="mc_hu_en"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center"}}>What does this mean:</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,margin:"6px 0 2px"}}><div style={{fontSize:21,fontWeight:800,color:C.text}}>{q.prompt}</div><SpeakBtn text={q.prompt} color={color}/></div>
      <div style={{fontSize:12,color:C.dim,textAlign:"center",fontStyle:"italic",marginBottom:14}}>{q.promptPr}</div>
      {q.options.map((o,i)=>mcBtn(o,i,o===q.answer,o===ans))}
    </div>}
    {q.type==="type"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center"}}>Type in Hungarian:</div>
      <div style={{fontSize:21,fontWeight:800,color:C.text,textAlign:"center",margin:"10px 0 18px"}}>{q.prompt}</div>
      {typeInput("Type here...")}
    </div>}
    {q.type==="tf"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center",marginBottom:6}}>Does this Hungarian:</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><div style={{fontSize:19,fontWeight:800,color:C.text}}>{q.prompt}</div><SpeakBtn text={q.prompt} color={color}/></div>
      <div style={{fontSize:12,color:C.dim,textAlign:"center",fontStyle:"italic",marginBottom:6}}>{q.promptPr}</div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center",marginBottom:3}}>mean:</div>
      <div style={{fontSize:17,fontWeight:700,color:"#9A9BAA",textAlign:"center",marginBottom:16}}>"{q.shown}"</div>
      <div style={{display:"flex",gap:8}}>
        {[true,false].map(v=>{let st=null;if(ans!==null){if(v===q.answer)st="correct";else if(v===ans)st="wrong";}
          return <button key={String(v)} disabled={ans!==null} onClick={()=>{setAns(v);advance(v===q.answer);}}
            style={{flex:1,padding:"14px",borderRadius:14,border:`2px solid ${st==="correct"?C.green:st==="wrong"?C.red:C.border}`,background:st==="correct"?`${C.green}12`:st==="wrong"?`${C.red}12`:C.card,color:st==="correct"?"#5FD4A0":st==="wrong"?"#FF8888":C.text,fontSize:17,fontWeight:800,cursor:ans?"default":"pointer"}}>{v?"True ✓":"False ✗"}</button>;})}
      </div>
    </div>}
    {q.type==="fill"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center"}}>Fill the missing word:</div>
      <div style={{fontSize:12,color:C.dim,textAlign:"center",margin:"6px 0"}}>{q.prompt}</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,margin:"10px 0 18px"}}><div style={{fontSize:19,fontWeight:800,color:C.text}}>{q.display}</div><SpeakBtn text={q.phrase.hu} color={color}/></div>
      {typeInput("Missing word...")}
    </div>}
    {q.type==="match"&&<div>
      <div style={{fontSize:13,color:C.sub,textAlign:"center",marginBottom:14}}>Match Hungarian ↔ English</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {matchItems.map((item,i)=>{
          const matched=ms.matched.includes(item.key+item.lang);const sel=ms.sel&&ms.sel.text===item.text;const wr=ms.wrong===item.text;
          return <button key={i} disabled={matched} onClick={()=>{
            if(item.lang==="hu")speakHu(item.text);if(matched)return;if(!ms.sel){setMs({...ms,sel:item,wrong:null});return;}if(ms.sel.lang===item.lang){setMs({...ms,sel:item,wrong:null});return;}
            const pair=q.pairs.find(p=>(p.hu===ms.sel.text&&p.en===item.text)||(p.en===ms.sel.text&&p.hu===item.text));
            if(pair){const nm=[...ms.matched,pair.hu+"hu",pair.hu+"en"];setMs({sel:null,matched:nm,wrong:null});
              if(nm.length===q.pairs.length*2){statsApi.recordPhrase(q.phrase.hu,true);setScore(s=>s+1);setAns("match_done");}}
            else{setMs({...ms,sel:null,wrong:item.text});setTimeout(()=>setMs(m=>({...m,wrong:null})),600);}
          }} style={{padding:"12px 8px",borderRadius:11,border:`2px solid ${matched?C.green:sel?color:wr?C.red:C.border}`,background:matched?`${C.green}10`:sel?`${color}10`:wr?`${C.red}10`:C.card,color:matched?"#5FD4A0":C.text,fontSize:13,fontWeight:600,cursor:matched?"default":"pointer",opacity:matched?0.4:1,textAlign:"center"}}>{item.text}</button>;
        })}
      </div>
    </div>}
    </div>
    {ans!==null&&<button onClick={goNext} style={{width:"100%",padding:"14px",borderRadius:14,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:15,fontWeight:700,cursor:"pointer",marginTop:16}}>{qi<total-1?"Next →":"Finish"}</button>}
  </div>;
}

// ─── PHRASE & FLASH VIEWS ─────────────────────────────────────────────────
function PhraseView({lesson,color}){const [exp,setExp]=useState(null);
  return <div style={{padding:"0 16px 80px"}}>
    {lesson.tip&&<div style={{background:`${color}10`,border:`1px solid ${color}22`,borderRadius:12,padding:"10px 12px",margin:"10px 0",fontSize:12,color:"#C8C7D0",lineHeight:1.5}}><span style={{fontWeight:800,color}}>Tip: </span>{lesson.tip}</div>}
    {lesson.pat&&<div style={{background:"#1A1428",border:"1px solid #2D2548",borderRadius:12,padding:"10px 12px",margin:"6px 0",fontSize:12,color:"#B8A8D8",lineHeight:1.5,whiteSpace:"pre-wrap"}}><span style={{fontWeight:800,color:"#A78BFA"}}>Pattern: </span>{lesson.pat}</div>}
    {lesson.phrases.map((p,i)=><div key={i} style={{background:C.card,borderRadius:11,padding:"11px 13px",marginBottom:5,border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>setExp(exp===i?null:i)}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:16,fontWeight:700,color:C.text}}>{p.hu}</div><SpeakBtn text={p.hu} color={color}/></div>
      {exp===i?<><div style={{fontSize:12,color:C.dim,marginTop:2,fontStyle:"italic"}}>{p.pr}</div><div style={{fontSize:13,color:C.sub,marginTop:3}}>{p.en}</div></>
      :<div style={{fontSize:10,color:C.dim,marginTop:1}}>tap to reveal</div>}
    </div>)}
  </div>;}

function FlashView({lesson,color}){const [dir,setDir]=useState("hu");const [cards,setCards]=useState(()=>shuffle(lesson.phrases));const [idx,setIdx]=useState(0);const [flip,setFlip]=useState(false);
  const reset=()=>{setCards(shuffle(lesson.phrases));setIdx(0);setFlip(false);};const card=cards[idx];
  useEffect(()=>{ if(dir==="hu") speakHu(card.hu); },[idx,dir]);
  const handleFlip=()=>{ const nf=!flip;setFlip(nf);if(dir==="en"&&nf)speakHu(card.hu); };
  return <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",alignItems:"center",minHeight:"50vh"}}>
    <div style={{display:"flex",gap:6,marginBottom:14}}>
      {["hu","en"].map(d=><button key={d} onClick={()=>{setDir(d);reset();}} style={{padding:"6px 13px",borderRadius:20,border:dir===d?`2px solid ${color}`:`2px solid ${C.border}`,background:dir===d?`${color}10`:"transparent",color:dir===d?color:C.sub,fontSize:11,fontWeight:700,cursor:"pointer"}}>{d==="hu"?"HU → EN":"EN → HU"}</button>)}
    </div>
    <div style={{fontSize:12,color:C.sub}}>{idx+1}/{cards.length}</div>
    <div onClick={handleFlip} style={{width:"100%",maxWidth:320,minHeight:190,borderRadius:16,padding:"26px 20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:flip?C.card:`linear-gradient(145deg, ${color}20, ${color}06)`,border:`2px solid ${flip?"#2A2C3E":color+"38"}`,textAlign:"center",marginTop:10,userSelect:"none",position:"relative"}}>
      <div style={{position:"absolute",top:8,right:8}}><SpeakBtn text={card.hu} color={color} size={16}/></div>
      <div style={{fontSize:22,fontWeight:800,color:C.text}}>{dir==="hu"?card.hu:card.en}</div>
      {dir==="hu"&&!flip&&<div style={{fontSize:13,color:C.dim,marginTop:6,fontStyle:"italic"}}>{card.pr}</div>}
      {flip&&<div style={{fontSize:16,color:C.sub,marginTop:12}}>{dir==="hu"?card.en:card.hu}</div>}
      {flip&&dir==="en"&&<div style={{fontSize:12,color:C.dim,marginTop:4,fontStyle:"italic"}}>{card.pr}</div>}
      {!flip&&<div style={{fontSize:11,color:C.dim,marginTop:14}}>tap to flip</div>}
    </div>
    <div style={{display:"flex",gap:8,marginTop:16,width:"100%",maxWidth:320}}>
      <button onClick={()=>{setFlip(false);setIdx(Math.max(0,idx-1));}} style={{flex:1,padding:"11px",borderRadius:11,background:`${color}14`,border:`1px solid ${color}28`,color,fontSize:13,fontWeight:700,cursor:"pointer"}}>←</button>
      <button onClick={()=>{if(idx<cards.length-1){setFlip(false);setIdx(idx+1);}else reset();}} style={{flex:1,padding:"11px",borderRadius:11,background:`${color}14`,border:`1px solid ${color}28`,color,fontSize:13,fontWeight:700,cursor:"pointer"}}>{idx<cards.length-1?"→":"↻"}</button>
    </div>
  </div>;}

// ─── LESSON VIEW ──────────────────────────────────────────────────────────
function LessonView({lessonId,onBack,statsApi}){const lesson=LESSONS.find(l=>l.id===lessonId);const phase=PHASES.find(p=>p.id===lesson.phase);const [mode,setMode]=useState("phrases");const color=phase.color;const sc=statsApi.stats.lessonScores[lessonId];
  return <div><Header title={lesson.title} sub={lesson.sub} onBack={onBack} right={sc&&<div style={{fontSize:12,fontWeight:700,color:sc.best>=80?C.green:sc.best>=50?C.amber:C.red}}>{sc.best}%</div>}/>
    <div style={{display:"flex",gap:5,padding:"10px 16px",position:"sticky",top:0,background:C.bg,zIndex:10,borderBottom:`1px solid ${C.border}`}}>
      {["phrases","flashcards","quiz"].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px 0",borderRadius:10,border:mode===m?`2px solid ${color}`:`2px solid ${C.border}`,background:mode===m?`${color}10`:"transparent",color:mode===m?color:C.sub,fontSize:12,fontWeight:700,cursor:"pointer"}}>{m[0].toUpperCase()+m.slice(1)}</button>)}
    </div>
    {mode==="phrases"&&<PhraseView lesson={lesson} color={color}/>}
    {mode==="flashcards"&&<FlashView lesson={lesson} color={color}/>}
    {mode==="quiz"&&<QuizEngine lesson={lesson} color={color} onFinish={()=>setMode("phrases")} statsApi={statsApi}/>}
  </div>;}

// ─── APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("home");
  const [phaseId,setPhaseId]=useState(null);
  const [lessonId,setLessonId]=useState(null);
  const [showGoalSettings,setShowGoalSettings]=useState(false);
  const [showFeedback,setShowFeedback]=useState(false);
  const statsApi=useStats();
  const focus=useMemo(()=>getDailyFocus(statsApi.stats),[statsApi.stats]);

  const feedbackContext=useMemo(()=>{
    if(screen==="lesson"&&lessonId){const l=LESSONS.find(x=>x.id===lessonId);return l?`Lesson ${lessonId}: ${l.title}`:"Lesson";}
    if(screen==="phase"&&phaseId){const p=PHASES.find(x=>x.id===phaseId);return p?`Phase: ${p.title}`:"Phase";}
    if(screen==="stats")return "Stats screen";
    return "Home screen";
  },[screen,lessonId,phaseId]);

  const goToLesson=(id)=>{const l=LESSONS.find(x=>x.id===id);if(l){setPhaseId(l.phase);setLessonId(id);setScreen("lesson");}};

  return <div style={{fontFamily:"'Nunito',sans-serif",background:C.bg,color:C.text,minHeight:"100vh",maxWidth:480,margin:"0 auto",position:"relative"}}>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>

    {showGoalSettings&&<GoalSettings goal={statsApi.stats.dailyGoal} onSet={statsApi.setDailyGoal} onClose={()=>setShowGoalSettings(false)}/>}
    {showFeedback&&<FeedbackModal onClose={()=>setShowFeedback(false)} context={feedbackContext}/>}
    <button onClick={()=>setShowFeedback(true)} title="Send feedback" style={{position:"fixed",bottom:24,right:16,width:48,height:48,borderRadius:24,background:"#4A90D9",border:"none",color:"#fff",fontSize:20,cursor:"pointer",boxShadow:"0 4px 16px rgba(74,144,217,0.4)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}>💬</button>

    {screen==="home"&&<div>
      {/* Header with goal ring */}
      <div style={{padding:"16px 16px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5}}>Magyar Otthon</div><div style={{fontSize:11,color:C.sub}}>Family Hungarian · 39 lessons</div></div>
        <GoalRing todayMins={statsApi.todayMins} goal={statsApi.stats.dailyGoal} onTap={()=>setShowGoalSettings(true)}/>
      </div>

      {/* Daily Focus */}
      <DailyFocusCard focus={focus} onSelectLesson={goToLesson}/>

      {/* Quick actions */}
      <div style={{padding:"0 16px",marginBottom:12,display:"flex",gap:8}}>
        <button onClick={()=>setScreen("stats")} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px",color:C.text,fontSize:12,fontWeight:700,cursor:"pointer"}}>📊 Progress</button>
        <button onClick={()=>{if(focus.length)goToLesson(focus[0].lesson.id);}} style={{flex:1,background:`${C.green}18`,border:`1px solid ${C.green}30`,borderRadius:12,padding:"10px",color:C.green,fontSize:12,fontWeight:700,cursor:"pointer"}}>▶ Start Focus</button>
      </div>

      {/* Phase list */}
      <div style={{padding:"0 16px 80px"}}>
        <div style={{fontSize:13,color:C.sub,fontWeight:600,marginBottom:8}}>All phases</div>
        {PHASES.map(phase=>{
          const pLessons=LESSONS.filter(l=>l.phase===phase.id);
          const scored=pLessons.filter(l=>statsApi.stats.lessonScores[l.id]);
          return <div key={phase.id} style={{background:`linear-gradient(135deg, ${phase.color}12, ${phase.color}04)`,border:`1px solid ${phase.color}22`,borderRadius:12,padding:"12px 14px",marginBottom:6,cursor:"pointer"}} onClick={()=>{setPhaseId(phase.id);setScreen("phase");}}>
            <div style={{display:"flex",alignItems:"center"}}>
              <span style={{fontSize:20}}>{phase.emoji}</span>
              <span style={{fontSize:14,fontWeight:700,marginLeft:8,flex:1}}>{phase.title}</span>
              <span style={{fontSize:11,color:C.sub}}>{scored.length}/{pLessons.length}</span>
            </div>
            {scored.length>0&&<div style={{marginTop:5}}><ProgressBar pct={scored.length/pLessons.length*100} color={phase.color}/></div>}
          </div>;
        })}
      </div>
    </div>}

    {screen==="stats"&&<StatsView stats={statsApi.stats} onBack={()=>setScreen("home")}/>}

    {screen==="phase"&&<div>
      <Header title={PHASES.find(p=>p.id===phaseId)?.title} sub={`${LESSONS.filter(l=>l.phase===phaseId).length} lessons`} onBack={()=>setScreen("home")}/>
      {LESSONS.filter(l=>l.phase===phaseId).map(lesson=>{const ph=PHASES.find(p=>p.id===lesson.phase);const sc=statsApi.stats.lessonScores[lesson.id];
        return <div key={lesson.id} style={{display:"flex",alignItems:"center",padding:"11px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",gap:10}} onClick={()=>{setLessonId(lesson.id);setScreen("lesson");}}>
          <div style={{width:28,height:28,borderRadius:8,background:`${ph.color}20`,color:ph.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{lesson.id}</div>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center"}}><span style={{fontSize:13,fontWeight:700,color:C.text}}>{lesson.title}</span>
            {lesson.aud==="wife"&&<Badge text="Wife" bg="#C17B3A"/>}{lesson.aud==="both"&&<Badge text="All" bg="#7B61C1"/>}</div>
            <div style={{fontSize:11,color:C.sub}}>{lesson.sub}</div></div>
          {sc&&<span style={{fontSize:11,fontWeight:700,color:sc.best>=80?C.green:sc.best>=50?C.amber:C.red}}>{sc.best}%</span>}
          <span style={{color:C.dim,fontSize:15}}>›</span>
        </div>;})}
    </div>}

    {screen==="lesson"&&<LessonView lessonId={lessonId} onBack={()=>setScreen("phase")} statsApi={statsApi}/>}
  </div>;
}
