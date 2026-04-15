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
  { id: 9, emoji: "💡", title: "Reasoning", color: "#D4A843" },
  { id: 10, emoji: "📝", title: "Stories", color: "#8B5E3C" },
  { id: 11, emoji: "🔮", title: "Plans & What-ifs", color: "#7B4FA0" },
];

// Time-of-day relevance tags for the focus engine
const TIME_TAGS = {
  morning: [1,2,3,4,5,6,40,49,51,55,75], // Morning routines + rooms + plans + shoe hunt + room movement + breakfast detail
  midday: [7,8,9,10,11,12,13,14,21,22,23,24,25,42,48,53,54,76,77,78,83,84], // Going out + food + bikes + politeness + transport + coming home + directions + doctor + travel + restaurant + shopping
  afternoon: [15,16,17,18,19,20,26,27,28,29,41,42,43,44,50,52,56,79,80,81,82], // Playing + reading + imperatives + sharing + comparison + nature + sports + tastes + cooking
  evening: [30,31,32,33,34,35,45,46,63,64,65,66,67,68,69,70,71,72,73,74,86,87,88], // Bath, bed, end of day + storytime + narrative/stories + plans & what-ifs + nuanced emotions + relationship + apologies
};
// Weekend = more playing, outings, reading; Weekday = school run, routines
const WEEKEND_BOOST = [9,10,12,15,16,17,19,20,26,27,28,42,43,44,69,73,78,79,80,83]; // playground, library, playing, reading, bikes, drawing, tomorrow plans, decision-making + travel + nature + sports + restaurant
const WEEKDAY_BOOST = [1,2,3,4,5,7,8,11,13,23,75,77]; // morning routine, school, car, mealtimes + breakfast + doctor

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
  { id:32, phase:7, title:"Their Day", sub:"What did you do · Yesterday · Best part", aud:"kids", patternId:"past-use",
    phrases:[
      {hu:"Mit csináltál ma?",pr:"Mit chi-nál-tál mo",en:"What did you do?"},
      {hu:"Mi volt a legjobb?",pr:"Mi volt o leg-yobb",en:"What was the best part?"},
      {hu:"Kivel voltál?",pr:"Ki-vel vol-tál",en:"Who with?"},
      {hu:"Történt valami érdekes?",pr:"Tör-tént vo-lo-mi ér-de-kesh",en:"Anything interesting?"},
      {hu:"Tegnap az iskolában voltam.",pr:"Teg-nop oz ish-ko-lá-bon vol-tom",en:"Yesterday I was at school."},
      {hu:"Aludtál egyet?",pr:"O-lud-tál e-dyet",en:"Did you have a nap?"},
      {hu:"Mentünk a parkba.",pr:"Men-tünk o pork-bo",en:"We went to the park."},
      {hu:"Ettetek otthon?",pr:"Et-te-tek ot-hon",en:"Did you eat at home?"},
      {hu:"Megcsináltam a házimat.",pr:"Meg-chi-nál-tom o há-zi-mot",en:"I did my homework."},
      {hu:"Olvastunk egy könyvet.",pr:"Ol-vosh-tunk edy kön-yet",en:"We read a book."},
      {hu:"Jól aludtál éjjel?",pr:"Yól o-lud-tál éy-yel",en:"Did you sleep well last night?"},
    ], tip:"Two questions daily on the walk home. Try narrating what you did today — past tense becomes natural through story.", pat:"Common irregular pasts:\nvan   → volt    |  megy  → ment\nalszik → aludt  |  eszik → evett\nolvas → olvasott|  csinál → csinált"},
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

  { id:45, phase:5, title:"Reading the Book vs a Book", sub:"Olvasok egy könyvet · olvasom a könyvet", aud:"both", patternId:"def-vs-indef",
    phrases:[
      {hu:"Olvasok egy könyvet.",pr:"Ol-vo-shok edy kön-yet",en:"I'm reading a book."},
      {hu:"Olvasom a könyvet.",pr:"Ol-vo-shom o kön-yet",en:"I'm reading the book."},
      {hu:"Eszek almát.",pr:"Es-ek ol-mát",en:"I'm eating an apple."},
      {hu:"Eszem az almát.",pr:"Es-em oz ol-mát",en:"I'm eating the apple."},
      {hu:"Keresek egy játékot.",pr:"Ke-re-shek edy yá-té-kot",en:"I'm looking for a toy."},
      {hu:"Keresem a játékot.",pr:"Ke-re-shem o yá-té-kot",en:"I'm looking for the toy."},
      {hu:"Látok egy madarat.",pr:"Lá-tok edy mo-do-rot",en:"I see a bird."},
      {hu:"Látom a madarat.",pr:"Lá-tom o mo-do-rot",en:"I see the bird."},
    ], tip:"Use 'a/az' before the object to trigger definite conjugation — if you say 'the', the verb ending changes.", pat:"Indefinite: -ok/-ek/-ök (unknown/unspecified)\nDefinite:   -om/-em/-öm (known — 'the')\n\nolvas: olvas-ok  /  olvas-om\neszik: esz-ek    /  esz-em\nkeres: keres-ek  /  keres-em"},
  { id:46, phase:7, title:"What Everyone Did Today", sub:"Csináltam · csináltál · csináltunk", aud:"both", patternId:"past-indef",
    phrases:[
      {hu:"Csináltam.",pr:"Chi-nál-tom",en:"I did it."},
      {hu:"Csináltál valamit?",pr:"Chi-nál-tál vo-lo-mit",en:"Did you do something?"},
      {hu:"Csinált valamit.",pr:"Chi-nált vo-lo-mit",en:"He/she did something."},
      {hu:"Csináltunk valamit.",pr:"Chi-nál-tunk vo-lo-mit",en:"We did something."},
      {hu:"Csináltatok valamit?",pr:"Chi-nál-to-tok vo-lo-mit",en:"Did you all do something?"},
      {hu:"Csináltak valamit.",pr:"Chi-nál-tok vo-lo-mit",en:"They did something."},
      {hu:"Mit csináltál ma?",pr:"Mit chi-nál-tál mo",en:"What did you do today?"},
      {hu:"Jól csináltad!",pr:"Yól chi-nál-tod",en:"You did it well!"},
    ], tip:"Drill all six forms with csinál, then swap in any regular verb.", pat:"Past -t- + personal ending:\nén:  csinál-t-am\nte:  csinál-t-ál\nő:   csinál-t     (no ending)\nmi:  csinál-t-unk\nti:  csinál-t-atok\nők:  csinál-t-ak"},
  { id:48, phase:4, title:"I Would Like…", sub:"Szeretnék · kérnék · jó lenne", aud:"both", patternId:"conditional",
    phrases:[
      {hu:"Szeretnék fagylaltot.",pr:"Se-ret-nék fody-lol-tot",en:"I would like an ice cream."},
      {hu:"Szeretnél te is?",pr:"Se-ret-nél te ish",en:"Would you like some too?"},
      {hu:"Mennék veled.",pr:"Men-nék ve-led",en:"I would go with you."},
      {hu:"Mehetnénk a parkba.",pr:"Me-het-nénk o pork-bo",en:"We could go to the park."},
      {hu:"Csinálnék valamit.",pr:"Chi-nál-nék vo-lo-mit",en:"I would make something."},
      {hu:"Kérnék egy pohár vizet.",pr:"Kér-nék edy po-hár vi-zet",en:"I would like a glass of water."},
      {hu:"Jó lenne!",pr:"Yó len-ne",en:"That would be good!"},
      {hu:"Megcsinálnád?",pr:"Meg-chi-nál-nád",en:"Would you do it?"},
    ], tip:"Szeretnék + noun is the polite 'I'd like'. Use it at shops and restaurants too.", pat:"Conditional -ná-/-né- + ending:\nén:  csinál-nék\nte:  csinál-nál\nő:   csinál-na\nmi:  csinál-nánk\nti:  csinál-nátok\nők:  csinál-nának"},
  { id:49, phase:1, title:"What We'll Do Today", sub:"Fogok · fogsz · fog · fogunk", aud:"both", patternId:"future-fog",
    phrases:[
      {hu:"Fogok menni.",pr:"Fo-gok men-ni",en:"I'm going to go."},
      {hu:"Fogsz enni?",pr:"Fogsz en-ni",en:"Are you going to eat?"},
      {hu:"Fog esni az eső.",pr:"Fog esh-ni oz e-shő",en:"It's going to rain."},
      {hu:"Fogunk játszani.",pr:"Fo-gunk yát-so-ni",en:"We're going to play."},
      {hu:"Fogtok jönni?",pr:"Fog-tok yön-ni",en:"Are you going to come?"},
      {hu:"Fognak aludni.",pr:"Fog-nok o-lud-ni",en:"They're going to sleep."},
      {hu:"Ma fogunk sütni.",pr:"Mo fo-gunk shüt-ni",en:"Today we're going to bake."},
      {hu:"Holnap fogok takarítani.",pr:"Hol-nop fo-gok to-ko-rí-to-ni",en:"Tomorrow I'm going to clean."},
    ], tip:"fog is always followed by the infinitive (-ni). One helper verb, unlimited futures.", pat:"fog + infinitive (-ni):\nén:  fog-ok\nte:  fog-sz\nő:   fog\nmi:  fog-unk\nti:  fog-tok\nők:  fog-nak"},
  { id:50, phase:3, title:"Come Here! Go Back!", sub:"Gyere · menj · edd meg · ne csináld", aud:"both", patternId:"imperative",
    phrases:[
      {hu:"Gyere ide!",pr:"Dye-re i-de",en:"Come here!"},
      {hu:"Menj vissza!",pr:"Meny vis-so",en:"Go back!"},
      {hu:"Edd meg!",pr:"Ed meg",en:"Eat it up!"},
      {hu:"Igyál vizet!",pr:"I-dyál vi-zet",en:"Drink some water!"},
      {hu:"Feküdj le!",pr:"Fe-küdy le",en:"Lie down!"},
      {hu:"Ne csináld!",pr:"Ne chi-náld",en:"Don't do that!"},
      {hu:"Gyerünk!",pr:"Dye-rünk",en:"Let's go!"},
      {hu:"Kérd meg szépen!",pr:"Kérd meg sé-pen",en:"Ask nicely!"},
    ], tip:"Imperatives are the most useful forms for parents — you use them dozens of times a day.", pat:"Imperative: stem + -j- + ending\nenni  → egyél!  |  inni  → igyál!\nmenni → menj!   |  jönni → gyere!\nfeküdni → feküdj!\nNegative: Ne + imperative form"},
  { id:51, phase:1, title:"Where's Your Shoe?", sub:"Könyvem · cipőd · táskája", aud:"both", patternId:"possessive",
    phrases:[
      {hu:"Ez az én könyvem.",pr:"Ez oz én kön-vem",en:"This is my book."},
      {hu:"Ez a te játékod.",pr:"Ez o te yá-té-kod",en:"This is your toy."},
      {hu:"Ez az ő táskája.",pr:"Ez oz ő tásh-ká-yo",en:"This is their bag."},
      {hu:"Ez a mi macskánk.",pr:"Ez o mi moch-kánk",en:"This is our cat."},
      {hu:"Hol van a cipőd?",pr:"Hol von o tsi-pőd",en:"Where is your shoe?"},
      {hu:"Megvan a kulacsod?",pr:"Meg-von o ku-lo-chod",en:"Have you got your water bottle?"},
      {hu:"Ez a kis szobánk.",pr:"Ez o kish so-bánk",en:"This is our little room."},
      {hu:"Apukád vár rád.",pr:"O-pu-kád vár rád",en:"Your daddy is waiting for you."},
    ], tip:"Try 'Hol van a ...d/ed/öd?' for every lost item hunt.", pat:"Possessive suffixes (one owner):\n1st: könyv-em   my book\n2nd: könyv-ed   your book\n3rd: könyv-e    their book\n1pl: könyv-ünk  our book\n2pl: könyv-etek your (pl) book\n3pl: könyv-ük   their book"},
  { id:52, phase:3, title:"Give it to Your Sister", sub:"Add oda testvérednek · mondd apának", aud:"both", patternId:"dative",
    phrases:[
      {hu:"Add oda a testvérednek!",pr:"Od-do o-do o tesht-vé-red-nek",en:"Give it to your sibling!"},
      {hu:"Mondd meg apának!",pr:"Mondd meg o-pá-nok",en:"Tell dad!"},
      {hu:"Adok neked valamit.",pr:"O-dok ne-ked vo-lo-mit",en:"I'll give you something."},
      {hu:"Ez neked való.",pr:"Ez ne-ked vo-ló",en:"This is for you."},
      {hu:"Kérd meg anyának!",pr:"Kérd meg o-nyá-nok",en:"Ask mum!"},
      {hu:"Adok a kutyának enni.",pr:"O-dok o ku-tyá-nok en-ni",en:"I'll give the dog some food."},
      {hu:"Ajándékot hoztam nektek.",pr:"O-yán-dé-kot hoz-tom nek-tek",en:"I brought a gift for you all."},
      {hu:"Szólj a tanárnak!",pr:"Sóly o to-nár-nok",en:"Tell the teacher!"},
    ], tip:"Add -nak/-nek to any name to say 'to/for' them. Personal forms: nekem, neked, neki.", pat:"Dative -nak/-nek = to / for\napa   → apá-nak\nanya  → anyá-nak\nkutya → kutyá-nak\nPersonal:\nén→nekem  te→neked  ő→neki\nmi→nekünk ti→nektek ők→nekik"},
  { id:53, phase:2, title:"Going Together", sub:"Autóval · veled · anyával", aud:"both", patternId:"instrumental",
    phrases:[
      {hu:"Jövök veled.",pr:"Yö-vök ve-led",en:"I'm coming with you."},
      {hu:"Játssz a testvéreddel!",pr:"Yáts o tesht-vé-red-del",en:"Play with your sibling!"},
      {hu:"Megyek autóval.",pr:"Me-dyek ou-tó-vol",en:"I'm going by car."},
      {hu:"Eszünk kanállal.",pr:"E-sünk ko-nál-lol",en:"We're eating with a spoon."},
      {hu:"Írok ceruzával.",pr:"Í-rok tse-ru-zá-vol",en:"I'm writing with a pencil."},
      {hu:"Együtt megyünk anyával.",pr:"E-gyüt me-dyünk o-nyá-vol",en:"We're going together with mum."},
      {hu:"Vágd késsel!",pr:"Vágd kés-sel",en:"Cut it with a knife!"},
      {hu:"Jöttél baráttal?",pr:"Yöt-tél bo-rát-tol",en:"Did you come with a friend?"},
    ], tip:"The suffix assimilates to the final consonant: autóval, but baráttal, késsel.", pat:"Instrumental -val/-vel (assimilates):\nautó  + val → autóval\nkés   + vel → késsel\nanya  + val → anyával\nbarát + tal → baráttal\nPersonal: velem · veled · vele\nvelünk · veletek · velük"},
  { id:54, phase:2, title:"Coming Home From…", sub:"Jövök a parkból · leszálltam a bicikliről", aud:"both", patternId:"from-cases",
    phrases:[
      {hu:"Jövök az iskolából.",pr:"Yö-vök oz ish-ko-lá-ból",en:"I'm coming from school."},
      {hu:"Hazajöttem a parkból.",pr:"Ho-zo-yöt-tem o pork-ból",en:"I came home from the park."},
      {hu:"Leszálltam a bicikliről.",pr:"Le-sállt-om o bi-tsik-li-ről",en:"I got off the bike."},
      {hu:"Lejöttem a fáról.",pr:"Le-yöt-tem o fá-ról",en:"I came down from the tree."},
      {hu:"Kaptam apától egy levelet.",pr:"Kop-tom o-pá-tól edy le-ve-let",en:"I got a letter from dad."},
      {hu:"Messze van az állomástól.",pr:"Mes-se von oz ál-lo-másh-tól",en:"It's far from the station."},
      {hu:"Kiveszem a fiókból.",pr:"Ki-ve-sem o fi-ók-ból",en:"I take it out of the drawer."},
      {hu:"Elvettem tőle a labdát.",pr:"El-vet-tem tő-le o lob-dát",en:"I took the ball from them."},
    ], tip:"Three different 'from': ból/ből from inside, ról/ről off a surface, tól/től away from nearby.", pat:"Three 'from' cases:\n-ból/-ből  out of (was inside)\n-ról/-ről  off of (was on surface)\n-tól/-től  away from (was beside)\n\niskola  → iskolá-ból\nbicikli → bicikli-ről\napa     → apá-tól"},
  { id:55, phase:1, title:"In, Out, Up, Down", sub:"Bemegyek · kimegy · felmegyünk · lemész", aud:"both", patternId:"prefixes",
    phrases:[
      {hu:"Bemegyek a szobába.",pr:"Be-me-dyek o so-bá-bo",en:"I'm going into the room."},
      {hu:"Kimegy az ajtón.",pr:"Ki-medy oz oy-tón",en:"They go out through the door."},
      {hu:"Felmegyünk a lépcsőn.",pr:"Fel-me-dyünk o lép-chőn",en:"We're going up the stairs."},
      {hu:"Lemész a kertbe?",pr:"Le-mész o kert-be",en:"Are you going down to the garden?"},
      {hu:"Átmegyünk az úton.",pr:"Át-me-dyünk oz ú-ton",en:"We're crossing the road."},
      {hu:"Visszamegyek érte.",pr:"Vis-so-me-dyek ér-te",en:"I'm going back for it."},
      {hu:"Bejön hozzánk.",pr:"Be-yön hoz-zánk",en:"They're coming in to us."},
      {hu:"Gyere ki ide!",pr:"Dye-re ki i-de",en:"Come out here!"},
    ], tip:"The prefix separates from the verb when negating: Bemegyek → Nem megyek be.", pat:"Prefixes with megy/jön:\nbe-     into     |  ki-    out of\nfel-    up       |  le-    down\nát-     across   |  vissza- back\n\nWith negation, prefix moves after the verb:\nBemegyek. → Nem megyek be."},
  { id:56, phase:3, title:"Bigger, Smaller, Best", sub:"Nagyobb · kisebb · legjobb · mint", aud:"both", patternId:"comparative",
    phrases:[
      {hu:"Ez nagyobb.",pr:"Ez nod-yobb",en:"This is bigger."},
      {hu:"A kék kisebb.",pr:"O kék ki-shebb",en:"The blue one is smaller."},
      {hu:"Te vagy a legerősebb!",pr:"Te vody o leg-e-rő-shebb",en:"You are the strongest!"},
      {hu:"Ez a legszebb!",pr:"Ez o leg-sebb",en:"This is the most beautiful!"},
      {hu:"Ez nehezebb, mint az.",pr:"Ez ne-he-zebb, mint oz",en:"This is harder than that."},
      {hu:"Gyorsabb vagy nálam.",pr:"Dyor-shobb vody ná-lom",en:"You are faster than me."},
      {hu:"Melyik a jobb?",pr:"Me-yik o yobb",en:"Which is better?"},
      {hu:"Ez a legjobb!",pr:"Ez o leg-yobb",en:"This is the best!"},
    ], tip:"Add -bb to almost any adjective for comparative, then add leg- prefix for superlative.", pat:"Comparative: adjective + -bb\nnagyobb · kisebb · szebb · jobb\n\nSuperlative: leg- + comparative\nlegnagyobb · legkisebb · legjobb\n\n'Than': mint + nominative\nEz nagyobb, mint az."},
  { id:57, phase:9, title:"Because & So", sub:"mert · ezért · azért, mert · tehát", aud:"both", patternId:"connectors-cause",
    phrases:[
      {hu:"Nem mehetünk ki, mert esik.",pr:"Nem me-he-tünk ki, mert e-shik",en:"We can't go out because it's raining."},
      {hu:"Fáradt vagyok, ezért lefekszem.",pr:"Fá-rott vo-dyok, e-zért le-fek-sem",en:"I'm tired, so I'm lying down."},
      {hu:"Azért sietek, mert késő van.",pr:"O-zért shi-e-tek, mert ké-ső von",en:"I'm hurrying because it's late."},
      {hu:"Tehát holnap megyünk.",pr:"Te-hát hol-nop me-dyünk",en:"So we'll go tomorrow."},
      {hu:"Azért kérdezem, mert nem tudom.",pr:"O-zért kér-de-zem, mert nem tu-dom",en:"I'm asking because I don't know."},
      {hu:"Nem eheti, mert allergiás.",pr:"Nem e-he-ti, mert ol-ler-gi-ásh",en:"She can't eat it because she's allergic."},
      {hu:"Szereti, ezért csinálja.",pr:"Se-re-ti, e-zért chi-nál-yo",en:"She likes it, so she does it."},
      {hu:"Jó volt, azért megettük.",pr:"Yó volt, o-zért meg-et-tük",en:"It was good, so we ate it all up."},
    ], tip:"Start with 'mert' (because) — it's the most versatile connector. Use it to answer every 'Miért?' (Why?).", pat:"mert = because (mid-sentence)\nezért = so / therefore\nazért… mert = the reason is… because\ntehát = thus / so (more formal)"},
  { id:58, phase:9, title:"I Think", sub:"szerintem · azt hiszem · úgy gondolom · úgy érzem", aud:"both", patternId:"connectors-opinion",
    phrases:[
      {hu:"Szerintem jó lesz.",pr:"Se-rin-tem yó lesz",en:"I think it'll be fine."},
      {hu:"Azt hiszem, otthon van.",pr:"Ozt hi-sem, ott-hon von",en:"I think she's at home."},
      {hu:"Úgy gondolom, holnap indulunk.",pr:"Údy gon-do-lom, hol-nop in-du-lunk",en:"I think we'll set off tomorrow."},
      {hu:"Úgy érzem, valami nincs rendben.",pr:"Údy ér-zem, vo-lo-mi ninch rend-ben",en:"I feel something isn't right."},
      {hu:"Szerintem ez a jobb megoldás.",pr:"Se-rin-tem ez o yobb meg-ol-dásh",en:"I think this is the better solution."},
      {hu:"Azt hiszem, már elindult.",pr:"Ozt hi-sem, már el-in-dult",en:"I think she's already left."},
      {hu:"Úgy gondolom, pihenned kell.",pr:"Údy gon-do-lom, pi-hen-ned kell",en:"I think you need to rest."},
      {hu:"Szerinted mi a legjobb?",pr:"Se-rin-ted mi o leg-yobb",en:"What do you think is best?"},
    ], tip:"Szerintem (in my opinion) works for everything from dinner choices to world views — start there.", pat:"szerintem = in my opinion\nazt hiszem = I think / I believe\núgy gondolom = I think (considered)\núgy érzem = I feel\nszerinted = in your opinion"},
  { id:59, phase:9, title:"If… Then", sub:"ha · akkor · ha… akkor", aud:"both", patternId:"conditional-real",
    phrases:[
      {hu:"Ha esik, akkor bent maradunk.",pr:"Ho e-shik, ok-kor bent mo-ro-dunk",en:"If it rains, then we stay inside."},
      {hu:"Ha készen vagy, mehetünk.",pr:"Ho ké-sen vody, me-he-tünk",en:"If you're ready, we can go."},
      {hu:"Ha éhes vagy, egyél valamit!",pr:"Ho é-hesh vody, e-dyél vo-lo-mit",en:"If you're hungry, eat something!"},
      {hu:"Ha megteszed, meglepünk.",pr:"Ho meg-te-sed, meg-le-pünk",en:"If you do it, we'll surprise you."},
      {hu:"Ha nem alszol, fáradt leszel.",pr:"Ho nem ol-sol, fá-rott le-sel",en:"If you don't sleep, you'll be tired."},
      {hu:"Ha időnk van, elmegyünk.",pr:"Ho i-dőnk von, el-me-dyünk",en:"If we have time, we'll go."},
      {hu:"Ha segítesz, hamarabb kész lesz.",pr:"Ho she-gí-tes, ho-mo-robb kés lesz",en:"If you help, it'll be done sooner."},
      {hu:"Ha akarod, próbáld meg!",pr:"Ho o-ko-rod, pró-báld meg",en:"If you want to, try it!"},
    ], tip:"Use 'ha… akkor' for real everyday conditions. Leave 'akkor' out once you're comfortable — Hungarians often do.", pat:"ha + present → akkor + present/future\nHa esik, akkor bent maradunk.\nHa kész vagy, mehetünk. (akkor optional)\n\nNegative: ha nem + verb\nHa nem alszol, fáradt leszel."},
  { id:60, phase:9, title:"Agreeing & Disagreeing", sub:"egyetértek · nem értek egyet · igazad van · nem biztos", aud:"both", patternId:"connectors-agree",
    phrases:[
      {hu:"Egyetértek veled.",pr:"E-dye-tér-tek ve-led",en:"I agree with you."},
      {hu:"Nem értek egyet ezzel.",pr:"Nem ér-tek e-dyet ez-zel",en:"I don't agree with this."},
      {hu:"Igazad van, elnézést.",pr:"I-go-zod von, el-né-zésht",en:"You're right, sorry."},
      {hu:"Nem biztos, hogy így van.",pr:"Nem biz-tosh, hogy ídy von",en:"I'm not sure it's like that."},
      {hu:"Teljesen igazad van!",pr:"Tel-ye-shen i-go-zod von",en:"You are absolutely right!"},
      {hu:"Abban nem értek egyet.",pr:"Ob-bon nem ér-tek e-dyet",en:"I don't agree with that."},
      {hu:"Szerintem is igazad van.",pr:"Se-rin-tem ish i-go-zod von",en:"I think you're right too."},
      {hu:"Nem tudom biztosan.",pr:"Nem tu-dom biz-to-shon",en:"I don't know for sure."},
    ], tip:"Igazad van (you're right) is the kindest phrase you can say in an argument — use it freely.", pat:"egyetértek = I agree\nnem értek egyet = I disagree\nigazad van = you're right\nteljesen = completely / absolutely\nnem biztos = not sure / uncertain"},
  { id:61, phase:9, title:"Comparing Things", sub:"jobb, mint · ugyanolyan · inkább · kevésbé", aud:"both", patternId:"comparative-use",
    phrases:[
      {hu:"Ez jobb, mint a másik.",pr:"Ez yobb, mint o má-shik",en:"This is better than the other one."},
      {hu:"Ugyanolyan szép, mint a tied.",pr:"U-dyon-o-lyon sép, mint o ti-ed",en:"It's just as beautiful as yours."},
      {hu:"Inkább a pirosat kérem.",pr:"In-kább o pi-ro-shot ké-rem",en:"I'd rather have the red one."},
      {hu:"Kevésbé édes, mint a múltkor.",pr:"Ke-vésh-bé é-desh, mint o múlt-kor",en:"It's less sweet than last time."},
      {hu:"A tied szebb, mint az enyém.",pr:"O ti-ed sebb, mint oz e-nyém",en:"Yours is nicer than mine."},
      {hu:"Melyiket szereted inkább?",pr:"Me-yi-ket se-re-ted in-kább",en:"Which one do you like better?"},
      {hu:"Ez ugyanolyan nehéz.",pr:"Ez u-dyon-o-lyon ne-héz",en:"This is just as difficult."},
      {hu:"A régi jobb volt.",pr:"O ré-gi yobb volt",en:"The old one was better."},
    ], tip:"Build comparatives by adding -bb: nagy → nagyobb, jó → jobb. Then add leg- for superlative. This lesson puts them to use in real arguments.", pat:"X -bb mint Y = X is more … than Y\nugyanolyan + adj = just as …\ninkább = rather / more\nkevésbé = less\nlegjobb · legszebb · legtöbb"},
  { id:62, phase:9, title:"Explaining a Problem", sub:"az a baj, hogy · a probléma az, hogy · nem működik", aud:"both", patternId:"connectors-problem",
    phrases:[
      {hu:"Az a baj, hogy elfelejtette.",pr:"Oz o boy, hogy el-fe-ley-tet-te",en:"The problem is that she forgot."},
      {hu:"A probléma az, hogy nincs idő.",pr:"O prob-lé-mo oz, hogy ninch i-dő",en:"The issue is that there's no time."},
      {hu:"Nem működik a telefon.",pr:"Nem mű-kö-dik o te-le-fon",en:"The phone isn't working."},
      {hu:"Az a gond, hogy nem akar.",pr:"Oz o gond, hogy nem o-kor",en:"The trouble is that she doesn't want to."},
      {hu:"Elromlott a bicikli.",pr:"El-rom-lott o bi-tsik-li",en:"The bike has broken."},
      {hu:"Valami baj van?",pr:"Vo-lo-mi boy von",en:"Is something wrong?"},
      {hu:"A baj az, hogy nem értjük egymást.",pr:"O boy oz, hogy nem ért-yük edy-másht",en:"The problem is we don't understand each other."},
      {hu:"Nem tudom megcsinálni.",pr:"Nem tu-dom meg-chi-nál-ni",en:"I can't fix it."},
    ], tip:"Az a baj, hogy… (the problem is that…) is the go-to phrase for explaining any difficulty to the family.", pat:"az a baj, hogy = the problem is that\na probléma az, hogy = the issue is that\naz a gond, hogy = the trouble is that\nnem működik = it doesn't work\nelromlott = it broke"},
  { id:63, phase:10, title:"What We Did Today", sub:"ma · aztán · végül", aud:"both", patternId:"narrative-past",
    phrases:[
      {hu:"Ma sokat játszottunk.",pr:"Mo sho-kot yát-sot-tunk",en:"Today we played a lot."},
      {hu:"Aztán mentünk a parkba.",pr:"Oz-tán men-tünk o pork-bo",en:"Then we went to the park."},
      {hu:"Végül hazajöttünk.",pr:"Vé-gül ho-zo-yöt-tünk",en:"In the end we came home."},
      {hu:"Ma jó napunk volt.",pr:"Mo yó no-punk volt",en:"Today we had a good day."},
      {hu:"Először olvastunk, aztán ettünk.",pr:"E-lő-ször ol-vosh-tunk, oz-tán et-tünk",en:"First we read, then we ate."},
      {hu:"Végül mindenki álmos lett.",pr:"Vé-gül min-den-ki ál-mosh lett",en:"In the end everyone got sleepy."},
      {hu:"Mit csináltál ma?",pr:"Mit chi-nál-tál mo",en:"What did you do today?"},
      {hu:"Ma láttuk a nagymamát.",pr:"Mo lát-tuk o nody-mo-mát",en:"Today we saw grandma."},
    ], tip:"Build a daily narrative with just three words: ma (today), aztán (then), végül (finally).", pat:"ma = today\naztán = then / after that\nvégül = finally / in the end\n\nPast tense recap:\n-tunk/-tünk = we did\n-tál/-tél = you did\n-tt = she/he did"},
  { id:64, phase:10, title:"First, Then, After That", sub:"először · aztán · utána · végül", aud:"kids", patternId:"narrative-sequence",
    phrases:[
      {hu:"Először megmosakszol.",pr:"E-lő-ször meg-mo-shok-sol",en:"First you wash up."},
      {hu:"Aztán fogat mosol.",pr:"Oz-tán fo-got mo-shol",en:"Then you brush your teeth."},
      {hu:"Utána felöltözöl.",pr:"U-tá-no fel-öl-tö-zöl",en:"After that you get dressed."},
      {hu:"Végül reggelizel.",pr:"Vé-gül reg-ge-li-zel",en:"Finally you have breakfast."},
      {hu:"Először kérd meg szépen!",pr:"E-lő-ször kérd meg sé-pen",en:"First ask nicely!"},
      {hu:"Aztán lefekszel, utána jön a mese.",pr:"Oz-tán le-fek-sel, u-tá-no yön o me-she",en:"Then you lie down, after that comes the story."},
      {hu:"Végül mindenki boldog volt.",pr:"Vé-gül min-den-ki bol-dog volt",en:"In the end everyone was happy."},
      {hu:"Mi volt az első?",pr:"Mi volt oz el-ső",en:"What was the first thing?"},
    ], tip:"Először, aztán, utána, végül — these four connectors turn any bedtime routine into a story.", pat:"először = first\naztán = then\nutána = after that\nvégül = finally\n\nAll followed by present or past tense"},
  { id:65, phase:10, title:"What She Said", sub:"azt mondta, hogy · megkérdezte, hogy", aud:"both", patternId:"reported-speech",
    phrases:[
      {hu:"Azt mondta, hogy holnap jön.",pr:"Ozt mond-to, hogy hol-nop yön",en:"She said that she's coming tomorrow."},
      {hu:"Megkérdezte, hogy éhes vagy-e.",pr:"Meg-kér-dez-te, hogy é-hesh vody-e",en:"She asked whether you're hungry."},
      {hu:"Azt mondta, hogy szeret.",pr:"Ozt mond-to, hogy se-ret",en:"She said that she loves you."},
      {hu:"Apukád azt kérdezte, hogy készen vagy.",pr:"O-pu-kád ozt kér-dez-te, hogy ké-sen vody",en:"Your dad asked whether you're ready."},
      {hu:"Azt mondta, hogy nem tud jönni.",pr:"Ozt mond-to, hogy nem tud yön-ni",en:"She said that she can't come."},
      {hu:"Megkérdezte, hogy mi a kedvenced.",pr:"Meg-kér-dez-te, hogy mi o ked-ven-tsed",en:"She asked what your favourite is."},
      {hu:"Azt mondtam, hogy szeretem.",pr:"Ozt mond-tom, hogy se-re-tem",en:"I said that I love it."},
      {hu:"Azt mondta, hogy büszke rád.",pr:"Ozt mond-to, hogy büs-ke rád",en:"She said that she's proud of you."},
    ], tip:"Azt mondta, hogy… (she said that…) unlocks reported speech — 'hogy' does the same job as English 'that'.", pat:"azt mondta, hogy = she/he said that\nazt mondtam, hogy = I said that\nmegkérdezte, hogy = she/he asked whether\nvagy-e = whether (yes/no question tag)"},
  { id:66, phase:10, title:"When I Was Little", sub:"amikor · voltam · voltál", aud:"both", patternId:"narrative-when",
    phrases:[
      {hu:"Amikor kicsi voltam, sokat úsztam.",pr:"O-mi-kor ki-chi vol-tom, sho-kot úsh-tom",en:"When I was little, I swam a lot."},
      {hu:"Amikor fiatal voltam, sokat kirándultam.",pr:"O-mi-kor fi-o-tol vol-tom, sho-kot ki-rán-dul-tom",en:"When I was young, I hiked a lot."},
      {hu:"Amikor te születtél, nagyon boldog voltam.",pr:"O-mi-kor te sü-let-tél, no-dyon bol-dog vol-tom",en:"When you were born, I was very happy."},
      {hu:"Amikor kicsi voltál, mindig énekeltünk.",pr:"O-mi-kor ki-chi vol-tál, min-dig é-ne-kel-tünk",en:"When you were little, we always sang."},
      {hu:"Nekem is volt ilyen játékom.",pr:"Ne-kem ish volt i-yen yá-té-kom",en:"I had a toy like this too."},
      {hu:"Én is imádtam a meséket.",pr:"Én ish i-mád-tom o me-shé-ket",en:"I loved fairy tales too."},
      {hu:"Amikor esős volt, bent játszottunk.",pr:"O-mi-kor e-shősh volt, bent yát-sot-tunk",en:"When it was rainy, we played inside."},
      {hu:"Olyan voltam, mint te most.",pr:"O-lyon vol-tom, mint te mosht",en:"I was just like you are now."},
    ], tip:"Amikor… voltam frames your own childhood stories. Sharing them with 'Én is…' (me too) shows your child they're not alone.", pat:"amikor + past tense = when I/you…\nvoltam = I was\nvoltál = you were\nnekem is = I also / me too\nén is = I too"},
  { id:67, phase:10, title:"Bedtime Story Retelling", sub:"ki · mit csinált · hol · miért · hogyan", aud:"kids", patternId:"narrative-retell",
    phrases:[
      {hu:"Ki volt a főszereplő?",pr:"Ki volt o fő-se-rep-lő",en:"Who was the main character?"},
      {hu:"Mi történt a végén?",pr:"Mi tör-tént o vé-gén",en:"What happened at the end?"},
      {hu:"Mit csinált a nyuszi?",pr:"Mit chi-nált o nyus-zi",en:"What did the bunny do?"},
      {hu:"Hol játszódott a mese?",pr:"Hol yát-só-dott o me-she",en:"Where did the story take place?"},
      {hu:"Miért sírt a kislány?",pr:"Mi-ért shírt o kish-lány",en:"Why was the little girl crying?"},
      {hu:"Hogyan ért véget?",pr:"Ho-dyon ért vé-get",en:"How did it end?"},
      {hu:"Mi volt a legszebb rész?",pr:"Mi volt o leg-sebb rés",en:"What was the most beautiful part?"},
      {hu:"Ki a kedvenc szereplőd?",pr:"Ki o ked-vents se-rep-lőd",en:"Who is your favourite character?"},
    ], tip:"Turn any story into a conversation: Ki? Mit? Hol? Miért? Hogyan? (Who? What? Where? Why? How?)", pat:"Ki? = Who?\nMit csinált? = What did she/he do?\nHol? = Where?\nMiért? = Why?\nHogyan? = How?\nMi volt a kedvenc részed? = What was your favourite part?"},
  { id:68, phase:10, title:"The Funny Thing That Happened", sub:"képzeld · tudod mit · és akkor", aud:"wife", patternId:"narrative-anecdote",
    phrases:[
      {hu:"Képzeld, mit mondott!",pr:"Kép-zeld, mit mon-dott",en:"Imagine what she said!"},
      {hu:"Tudod mit, meglepett.",pr:"Tu-dod mit, meg-le-pett",en:"You know what, she surprised me."},
      {hu:"És akkor egyszerre mindenki nevetett.",pr:"Ésh ok-kor edy-ser-re min-den-ki ne-ve-tett",en:"And then everyone laughed at once."},
      {hu:"Képzeld, ott volt az egész család!",pr:"Kép-zeld, ott volt oz e-gés cho-lád",en:"Imagine, the whole family was there!"},
      {hu:"Tudod, mi volt a vicces?",pr:"Tu-dod, mi volt o vit-sesh",en:"You know what was funny?"},
      {hu:"És akkor esett az eső, de mi csak nevettünk.",pr:"Ésh ok-kor e-shett oz e-shő, de mi chok ne-vet-tünk",en:"And then it started raining, but we just laughed."},
      {hu:"Képzeld, elfelejtette a cipőjét!",pr:"Kép-zeld, el-fe-ley-tet-te o tsi-pő-yét",en:"Imagine, she forgot her shoe!"},
      {hu:"Aztán kiderült, hogy nálam volt.",pr:"Oz-tán ki-de-rült, hogy ná-lom volt",en:"Then it turned out I had it."},
    ], tip:"Képzeld! (Imagine!) is your go-to opener for any funny story — it signals 'you won't believe this'.", pat:"képzeld! = imagine! / you won't believe it!\ntudod mit? = you know what?\nés akkor = and then\negyszerre = all at once / suddenly\nkiderült, hogy = it turned out that"},
  { id:69, phase:11, title:"Tomorrow We Will…", sub:"fog + infinitive · holnap · a hétvégén", aud:"both", patternId:"future-plans",
    phrases:[
      {hu:"Mit fogunk csinálni holnap?",pr:"Mit fo-gunk chi-nál-ni hol-nop",en:"What are we going to do tomorrow?"},
      {hu:"Holnap elmegyünk a parkba.",pr:"Hol-nop el-me-dyünk o pork-bo",en:"Tomorrow we're going to the park."},
      {hu:"A hétvégén meglátogatjuk a nagymamát.",pr:"O hét-vé-gén meg-lá-to-got-yuk o nody-mo-mát",en:"At the weekend we'll visit grandma."},
      {hu:"Jövő héten el fogunk menni kirándulni.",pr:"Yö-vő hé-ten el fo-gunk men-ni ki-rán-dul-ni",en:"Next week we'll go on a trip."},
      {hu:"Este fogunk vacsorázni.",pr:"Esh-te fo-gunk vo-cho-ráz-ni",en:"We'll have dinner this evening."},
      {hu:"Holnap korán fogunk kelni.",pr:"Hol-nop ko-rán fo-gunk kel-ni",en:"Tomorrow we'll get up early."},
      {hu:"Nyáron Magyarországra fogunk menni.",pr:"Nyá-ron Mo-dyor-or-ság-ro fo-gunk men-ni",en:"In summer we'll go to Hungary."},
      {hu:"Tervezzük meg a hétvégét!",pr:"Ter-vez-zük meg o hét-vé-gét",en:"Let's plan the weekend!"},
    ], tip:"Weekend mornings are perfect for this lesson — plan the day together in Hungarian. See lesson 49 for the full fog paradigm table.", pat:"fog + infinitive = will / going to\nholnap = tomorrow\na hétvégén = at the weekend\njövő héten = next week\nnyáron = in summer\nhamarosan = soon"},
  { id:70, phase:11, title:"I Would Like To…", sub:"szeretnék · szeretnénk · + infinitive", aud:"both", patternId:"conditional-wishes",
    phrases:[
      {hu:"Szeretnék kávét inni.",pr:"Se-ret-nék ká-vét in-ni",en:"I'd like to have a coffee."},
      {hu:"Szeretnénk ma sétálni menni.",pr:"Se-ret-nénk mo shé-tál-ni men-ni",en:"We'd like to go for a walk today."},
      {hu:"Szeretnél jönni velünk?",pr:"Se-ret-nél yön-ni ve-lünk",en:"Would you like to come with us?"},
      {hu:"Szeretném megmutatni neked a kedvenc helyemet.",pr:"Se-ret-ném meg-mu-tot-ni ne-ked o ked-vents he-ye-met",en:"I'd like to show you my favourite place."},
      {hu:"Szeretnénk egy szép nyarat tölteni.",pr:"Se-ret-nénk edy sép nyá-rot töl-te-ni",en:"We'd like to spend a lovely summer."},
      {hu:"Szeretnék megtanulni úszni.",pr:"Se-ret-nék meg-to-nul-ni ús-ni",en:"I'd like to learn to swim."},
      {hu:"Szeretnénk együtt moziba menni.",pr:"Se-ret-nénk e-dyütt mo-zi-bo men-ni",en:"We'd like to go to the cinema together."},
      {hu:"Szeretném, ha boldogok lennétek.",pr:"Se-ret-ném, ho bol-do-gok len-né-tek",en:"I'd like you to be happy."},
    ], tip:"Szeretnék is the most natural way to say 'I'd like to' — use it anywhere you'd say 'I want' in English. See lesson 48 for the full conditional paradigm.", pat:"szeretnék = I would like\nszeretnél = you would like\nszeretne = he/she would like\nszeretnénk = we would like\n+ infinitive follows"},
  { id:71, phase:11, title:"If I Could…", sub:"ha + conditional · lenne · tudnék", aud:"both", patternId:"conditional-if",
    phrases:[
      {hu:"Ha tudnék, segítenék neked.",pr:"Ho tud-nék, she-gí-te-nék ne-ked",en:"If I could, I'd help you."},
      {hu:"Ha lenne időm, sokat olvasnék.",pr:"Ho len-ne i-dőm, sho-kot ol-vosh-nék",en:"If I had time, I'd read a lot."},
      {hu:"Ha szép idő lenne, kimennénk a parkba.",pr:"Ho sép i-dő len-ne, ki-men-nénk o pork-bo",en:"If the weather were nice, we'd go to the park."},
      {hu:"Ha tehetnénk, elmennénk Magyarországra.",pr:"Ho te-het-nénk, el-men-nénk Mo-dyor-or-ság-ro",en:"If we could, we'd go to Hungary."},
      {hu:"Ha tudnál repülni, hova mennél?",pr:"Ho tud-nál re-pül-ni, ho-vo men-nél",en:"If you could fly, where would you go?"},
      {hu:"Ha gazdag lennék, sokat utaznánk.",pr:"Ho goz-dog len-nék, sho-kot u-toz-nánk",en:"If I were rich, we'd travel a lot."},
      {hu:"Ha nem kellene dolgoznom, itthon maradnék.",pr:"Ho nem kel-le-ne dol-goz-nom, itt-hon mo-rod-nék",en:"If I didn't have to work, I'd stay home."},
      {hu:"Ha lenne egy kívánságom, a ti boldogságotokat kérném.",pr:"Ho len-ne edy kí-ván-shá-gom, o ti bol-dog-shá-go-to-kot kér-ném",en:"If I had one wish, I'd ask for your happiness."},
    ], tip:"Ha + conditional is your 'what if' construction. Great for dreaming out loud with the family. See lesson 48 for the conditional -nék endings.", pat:"ha = if\nha…, …nék / …nénk = if…, I / we would…\nlenne = there would be / it would be\ntudnék = I could\nmennénk = we would go\nha…akkor… = if…then…"},
  { id:72, phase:11, title:"Maybe, Probably, Definitely", sub:"talán · valószínűleg · biztosan · lehet, hogy", aud:"both", patternId:"modal-hedging",
    phrases:[
      {hu:"Talán elmegyünk a parkba.",pr:"To-lán el-me-dyünk o pork-bo",en:"Maybe we'll go to the park."},
      {hu:"Valószínűleg esni fog.",pr:"Vo-ló-sí-nű-leg esh-ni fog",en:"It will probably rain."},
      {hu:"Biztosan ott lesz ő is.",pr:"Biz-to-shon ott les ő ish",en:"She'll definitely be there too."},
      {hu:"Lehet, hogy késő lesz.",pr:"Le-het, hogy ké-shő les",en:"It might be late."},
      {hu:"Talán megvesszük azt a játékot.",pr:"To-lán meg-ves-sük ozt o yá-té-kot",en:"Maybe we'll buy that toy."},
      {hu:"Biztosan jól fogod érezni magad.",pr:"Biz-to-shon yól fo-god é-rez-ni mo-god",en:"You'll definitely enjoy yourself."},
      {hu:"Lehet, hogy holnap találkozunk velük.",pr:"Le-het, hogy hol-nop to-lál-ko-zunk ve-lük",en:"Maybe we'll meet them tomorrow."},
      {hu:"Valószínűleg hamarosan hazaérünk.",pr:"Vo-ló-sí-nű-leg ho-mo-ro-shon ho-zo-é-rünk",en:"We'll probably be home soon."},
    ], tip:"Layer these hedges onto any plan to sound more natural: Talán… / Valószínűleg… / Biztosan… — they give you the full spectrum from 'maybe' to 'for sure'.", pat:"talán = maybe / perhaps\nvalószínűleg = probably\nbiztosan = definitely / certainly\nlehet, hogy = it may be that / maybe\nbiztos, hogy = it is certain that"},
  { id:73, phase:11, title:"Making Decisions Together", sub:"mit szólsz · melyiket · inkább · megegyeztünk", aud:"both", patternId:"decision-questions",
    phrases:[
      {hu:"Mit szólsz, elmenjünk?",pr:"Mit sólsh, el-men-yünk",en:"What do you say, shall we go?"},
      {hu:"Melyiket válasszuk?",pr:"Me-yi-ket vá-los-suk",en:"Which one shall we choose?"},
      {hu:"Inkább maradjunk otthon.",pr:"In-kább mo-rod-yunk ott-hon",en:"Let's rather stay home."},
      {hu:"Mi legyen ebédre?",pr:"Mi le-dyen e-béd-re",en:"What should we have for lunch?"},
      {hu:"Megegyeztünk!",pr:"Meg-e-dyez-tünk",en:"We've agreed! It's settled!"},
      {hu:"Szavazzunk!",pr:"So-voz-zunk",en:"Let's vote!"},
      {hu:"Te mit gondolsz?",pr:"Te mit gon-dolsh",en:"What do you think?"},
      {hu:"Ezt a tervet elfogadom.",pr:"Ezt o ter-vet el-fo-go-dom",en:"I agree to this plan."},
    ], tip:"Mit szólsz…? is your go-to for including your partner or kids in any decision — much warmer than just announcing a plan.", pat:"mit szólsz? = what do you say? / how about…?\nmelyiket? = which one?\ninkább = rather / preferably\nmegegyeztünk = we agreed / it's settled\nszavazzunk = let's vote"},
  { id:74, phase:11, title:"Dreams & Hopes", sub:"remélem · szeretném, ha · álom · cél", aud:"both", patternId:"hopes-subjunctive",
    phrases:[
      {hu:"Remélem, hogy egészségesek lesztek.",pr:"Re-mé-lem, hogy e-gés-shé-ge-shek les-tek",en:"I hope you'll be healthy."},
      {hu:"Az álmom az, hogy egyszer visszamegyünk Magyarországra.",pr:"Oz ál-mom oz, hogy edy-ser vis-so-me-dyünk Mo-dyor-or-ság-ro",en:"My dream is that one day we'll go back to Hungary."},
      {hu:"Szeretném, ha boldogok lennétek.",pr:"Se-ret-ném, ho bol-do-gok len-né-tek",en:"I'd like you to be happy."},
      {hu:"Remélem, hogy teljesülnek az álmaid.",pr:"Re-mé-lem, hogy tel-ye-shül-nek oz ál-mo-id",en:"I hope your dreams come true."},
      {hu:"Az a célom, hogy folyékonyan beszéljek magyarul.",pr:"Oz o tsé-lom, hogy fo-yé-ko-nyon be-sél-yek mo-dyo-rul",en:"My goal is to speak Hungarian fluently."},
      {hu:"Reméljük, hogy szép emlékeink lesznek.",pr:"Re-mél-yük, hogy sép em-lé-ke-ink les-nek",en:"We hope we'll have beautiful memories."},
      {hu:"Szeretném, ha szeretnétek a magyar kultúrát.",pr:"Se-ret-ném, ho se-ret-né-tek o mo-dyor kul-tú-rát",en:"I'd like you to love Hungarian culture."},
      {hu:"Azt kívánom neked, hogy sok barátod legyen.",pr:"Ozt kí-vá-nom ne-ked, hogy shok bo-rá-tod le-dyen",en:"I wish for you to have many friends."},
    ], tip:"Remélem… and Szeretném, ha… are the most-used hope and wish openers. Teach them as fixed phrases first — the grammar behind szeretném, ha + conditional is B1+, but the chunks are everyday.", pat:"remélem, hogy = I hope that\nszeretném, ha = I'd like it if / I wish that\naz álmom az, hogy = my dream is that\na célom az, hogy = my goal is that\nteljesül = comes true / is fulfilled\nkívánom = I wish (for someone)"},
  // ── Breadth Pass (IDs 75–92) ─────────────────────────────────────────────
  { id:75, phase:1, title:"Breakfast in Detail", sub:"pirítós · tojás · tej · kend meg", aud:"both",
    phrases:[
      {hu:"Kérsz pirítóst?",pr:"Kérs pi-rí-tósht",en:"Do you want toast?"},
      {hu:"Szeretem a müzlit.",pr:"Se-re-tem o müz-lit",en:"I like muesli."},
      {hu:"Tojást süssek neked?",pr:"To-yásht süsh-shek ne-ked",en:"Shall I fry an egg for you?"},
      {hu:"Öntsd rá a tejet!",pr:"Öntsd rá o te-yet",en:"Pour the milk on it!"},
      {hu:"Kend meg vajjal!",pr:"Kend meg voy-yol",en:"Spread it with butter!"},
      {hu:"Mit eszel reggelire?",pr:"Mit e-sel reg-ge-li-re",en:"What do you eat for breakfast?"},
      {hu:"Igyál egy pohár tejet!",pr:"I-dyál edy po-hár te-yet",en:"Drink a glass of milk!"},
      {hu:"Kész a reggeli!",pr:"Kész o reg-ge-li",en:"Breakfast is ready!"},
    ], tip:"Use Kérsz…? (Do you want…?) for every morning offer — toast, juice, milk. Pair it with the food name and kids respond naturally without needing a full sentence.", pat:"pirítós = toast\nmüzli = muesli/cereal\ntojás = egg\nvaj = butter\nlekvár = jam\ntej = milk\nkend meg = spread it\nönt = pours\nkész = ready"},
  { id:76, phase:2, title:"Directions & Navigation", sub:"balra · jobbra · egyenesen · a sarkon", aud:"both",
    phrases:[
      {hu:"Fordulj balra a sarkon!",pr:"For-duy bol-ro o shor-kon",en:"Turn left at the corner!"},
      {hu:"Menj egyenesen előre!",pr:"Meny e-dye-ne-shen e-lő-re",en:"Go straight ahead!"},
      {hu:"Jobbra van az iskola.",pr:"Yob-ro von oz ish-ko-lo",en:"The school is on the right."},
      {hu:"Hogyan jutok el oda?",pr:"Ho-dyon yu-tok el o-do",en:"How do I get there?"},
      {hu:"A zebránál kell átmenni.",pr:"O zeb-rá-nál kel át-men-ni",en:"You need to cross at the zebra crossing."},
      {hu:"Közel van, gyalog is megközelíthető.",pr:"Kö-zel von, dyo-log ish meg-kö-ze-lít-he-tő",en:"It's close, you can walk there too."},
      {hu:"Eltévedtünk.",pr:"El-té-ved-tünk",en:"We got lost."},
      {hu:"Keressük a parkolót.",pr:"Ke-res-sük o por-ko-lót",en:"We're looking for the car park."},
    ], tip:"Balra (left) and jobbra (right) always come first in directions — add the motion verb after: fordulj balra, menj jobbra, menj egyenesen.", pat:"balra = to the left\njobbra = to the right\negyenesen = straight ahead\na sarkon = at the corner\nátmenni = to cross\neltéved = gets lost\nközel = near/close\nmessze = far\nfordulj = turn (imperative)"},
  { id:77, phase:2, title:"Doctor & Pharmacy", sub:"fáj · beteg vagyok · láz · gyógyszer", aud:"both",
    phrases:[
      {hu:"Fáj a hasa.",pr:"Fáy o ho-sho",en:"Her/his tummy hurts."},
      {hu:"Beteg vagyok.",pr:"Be-teg vo-dyok",en:"I'm sick."},
      {hu:"Orvoshoz kell menni.",pr:"Or-vo-shoz kel men-ni",en:"We need to go to the doctor."},
      {hu:"Van lázad?",pr:"Von lá-zod",en:"Do you have a fever?"},
      {hu:"Köhög és folyik az orra.",pr:"Kö-hög ésh fo-yik oz or-ro",en:"She's coughing and has a runny nose."},
      {hu:"A patikában veszünk gyógyszert.",pr:"O po-ti-ká-bon ve-sünk dyódj-sert",en:"We'll get medicine at the pharmacy."},
      {hu:"Mutasd meg, hol fáj!",pr:"Mu-tosd meg, hol fáy",en:"Show me where it hurts!"},
      {hu:"Már jobban érzed magad?",pr:"Már yob-bon ér-zed mo-god",en:"Do you feel better now?"},
    ], tip:"Fáj a [body part] is the single most useful sick-day pattern. Fáj a hasa (tummy hurts), fáj a feje (head hurts), fáj a torka (throat hurts) — just swap the body part.", pat:"fáj = hurts/aches\nbeteg = sick/ill\nláz = fever\nköhög = coughs\nfolyik az orra = runny nose\ngyógyszer = medicine\npatika = pharmacy\norvos = doctor\nhas = tummy/stomach\nfej = head\ntorok = throat"},
  { id:78, phase:2, title:"Travel & Transport", sub:"jegy · vonat · busz · repülő", aud:"both",
    phrases:[
      {hu:"Vegyünk jegyet!",pr:"Ve-dyünk ye-dyet",en:"Let's buy tickets!"},
      {hu:"A vonat öt percet késik.",pr:"O vo-not öt per-cet ké-shik",en:"The train is five minutes late."},
      {hu:"Busszal vagy metróval menjünk?",pr:"Bus-sol vody met-ró-vol men-yünk",en:"Shall we go by bus or metro?"},
      {hu:"Mikor indul a következő busz?",pr:"Mi-kor in-dul o kö-vet-ke-ző bus",en:"When does the next bus leave?"},
      {hu:"Repülőn megyünk nyaralni.",pr:"Re-pü-lőn me-dyünk nyo-rol-ni",en:"We're going on holiday by plane."},
      {hu:"Foglaltam egy szobát a szállodában.",pr:"Fog-lol-tom edy so-bát o sál-lo-dá-bon",en:"I booked a room in the hotel."},
      {hu:"Hol van a megálló?",pr:"Hol von o meg-ál-ló",en:"Where is the stop?"},
      {hu:"Csatlakozunk a metróra.",pr:"Chot-lo-ko-zunk o met-ró-ro",en:"We're connecting to the metro."},
    ], tip:"Busszal / vonattal / repülőn — transport words take -val/-vel (by bus/train) or -n/-on for plane: busszal, vonattal, repülőn. Vonattal megyünk = we go by train.", pat:"jegy = ticket\nvonat = train\nbusz = bus\nmetró = metro/underground\nrepülő = plane\nszálloda = hotel\nmegálló = stop (bus/tram)\nkésik = is late/delayed\nindul = departs\nfoglal = books/reserves"},
  { id:79, phase:3, title:"Nature & Animals", sub:"mókus · pillangó · virág · madár", aud:"both",
    phrases:[
      {hu:"Nézd, egy mókus!",pr:"Nézd, edy mó-kush",en:"Look, a squirrel!"},
      {hu:"A kertben pillangók röpülnek.",pr:"O kert-ben pil-lon-gók rö-pül-nek",en:"Butterflies are flying in the garden."},
      {hu:"Ez egy tölgyfa.",pr:"Ez edy töly-fo",en:"This is an oak tree."},
      {hu:"A csigák lassan másznak.",pr:"O chi-gák losh-shon más-nok",en:"Snails crawl slowly."},
      {hu:"Milyen virág ez?",pr:"Mi-yen vi-rág ez",en:"What kind of flower is this?"},
      {hu:"Figyelj, madár énekel!",pr:"Fi-dye-y, mo-dár é-ne-kel",en:"Listen, a bird is singing!"},
      {hu:"Az eső után jönnek ki a giliszták.",pr:"Oz e-shő u-tán yön-nek ki o gi-lis-ták",en:"Earthworms come out after rain."},
      {hu:"Gyűjtsünk makkot!",pr:"Dyüy-tsünk mok-kot",en:"Let's collect acorns!"},
    ], tip:"Nézd! (Look!) and Figyelj! (Listen!/Watch!) are your attention-grabbers on walks. Add any creature or plant name after and you have a complete pointing sentence.", pat:"mókus = squirrel\npillangó = butterfly\ntölgyfa = oak tree\ncsiga = snail\nvirág = flower\nmadár = bird\ngiliszta = earthworm\nmakk = acorn\nröpül = flies\nmászik = crawls"},
  { id:80, phase:3, title:"Sports & Movement", sub:"futni · úszni · labdázni · kerékpározni", aud:"both",
    phrases:[
      {hu:"Futunk egyet a parkban?",pr:"Fu-tunk e-dyet o pork-bon",en:"Shall we have a run in the park?"},
      {hu:"Megtanultál úszni?",pr:"Meg-to-nul-tál ús-ni",en:"Have you learned to swim?"},
      {hu:"Rúgjuk a labdát!",pr:"Rúy-yuk o lob-dát",en:"Let's kick the ball!"},
      {hu:"Kerékpározunk a hétvégén.",pr:"Ke-rék-pá-ro-zunk o hét-vé-gén",en:"We're cycling at the weekend."},
      {hu:"Nyújtózzál kicsit!",pr:"Nyúy-tóz-zál ki-chit",en:"Stretch a little!"},
      {hu:"Felméssz a mászókára?",pr:"Fel-méss o má-só-ká-ro",en:"Will you climb the climbing frame?"},
      {hu:"Labdázunk a kertben.",pr:"Lob-dá-zunk o kert-ben",en:"We're playing ball in the garden."},
      {hu:"Az úszást szeretem a legjobban.",pr:"Oz ú-sásht se-re-tem o leg-yob-bon",en:"I like swimming the most."},
    ], tip:"Hungarian sport verbs often take -z/-zik ending: labdázni (to play ball), kerékpározni (to cycle). Add -unk/-ünk for 'we': futunk, úszunk, labdázunk.", pat:"futni = to run\núszni = to swim\nlabdázni = to play ball\nkerékpározni = to cycle\nrúgni = to kick\nmászni = to climb\nnyújtózni = to stretch\na legjobban = the most\nmegtanul = learns / picks up a skill"},
  { id:81, phase:4, title:"Tastes & Textures", sub:"édes · sós · keserű · fűszeres · ropogós", aud:"both",
    phrases:[
      {hu:"Ez nagyon édes.",pr:"Ez no-dyon é-desh",en:"This is very sweet."},
      {hu:"Túl sós ez a leves.",pr:"Túl shósh ez o le-vesh",en:"This soup is too salty."},
      {hu:"Szereted a keserű csokoládét?",pr:"Se-re-ted o ke-she-rű cho-ko-lá-dét",en:"Do you like bitter chocolate?"},
      {hu:"Ez egy kicsit fűszeres.",pr:"Ez edy ki-chit fű-se-resh",en:"This is a little spicy."},
      {hu:"A kenyér puha és friss.",pr:"O ke-nyér pu-ho ésh frish",en:"The bread is soft and fresh."},
      {hu:"Imádom a ropogós pizzát.",pr:"I-má-dom o ro-po-gósh piz-zát",en:"I love crispy pizza."},
      {hu:"Savanykás, de finom.",pr:"Sho-von-kás, de fi-nom",en:"It's a bit tart, but nice."},
      {hu:"Milyen az íze?",pr:"Mi-yen oz í-ze",en:"What does it taste like?"},
    ], tip:"Milyen az íze? (what's its taste?) invites kids to reach for these adjectives. Édes, sós, keserű, savanyú, fűszeres — these five cover nearly every flavour conversation at the table.", pat:"édes = sweet\nsós = salty\nkeserű = bitter\nsavanyú = sour\nfűszeres = spicy/herby\npuha = soft\nropogós = crispy/crunchy\nsavanykás = slightly tart\nfriss = fresh\níz = flavour/taste"},
  { id:82, phase:4, title:"Cooking Verbs", sub:"sütni · főzni · vágni · keverni", aud:"both",
    phrases:[
      {hu:"Süssünk együtt kenyeret!",pr:"Süsh-shünk e-gyütt ke-nye-ret",en:"Let's bake bread together!"},
      {hu:"Főzök ma gulyást.",pr:"Fő-zök mo gu-yásht",en:"I'm making goulash today."},
      {hu:"Vágjuk fel a sárgarépát!",pr:"Váy-yuk fel o shár-go-ré-pát",en:"Let's chop up the carrot!"},
      {hu:"Keverd össze a lisztet a tojással!",pr:"Ke-verd ös-se o lis-tet o to-yás-shol",en:"Mix the flour with the egg!"},
      {hu:"Pirítsd meg a hagymát!",pr:"Pi-rítsd meg o ho-dy-mát",en:"Sauté the onion!"},
      {hu:"Tegyük be a sütőbe!",pr:"Te-dyük be o sü-tő-be",en:"Let's put it in the oven!"},
      {hu:"Forrald fel a vizet!",pr:"For-rold fel o vi-zet",en:"Boil the water!"},
      {hu:"Kész a vacsora!",pr:"Kész o vo-cho-ro",en:"Dinner is ready!"},
    ], tip:"Süssük (let's bake/fry) vs főzzük (let's cook/boil) — first covers oven and pan, second covers pot. Vágni (to cut), keverni (to stir), pirítani (to sauté) complete the core recipe verb set.", pat:"sütni = to bake / fry\nfőzni = to cook / boil\nvágni = to cut / chop\nkeverni = to mix / stir\npirítani = to sauté\nforralni = to boil\nbeletenni = to put into\nsütő = oven\nlábos = pot\nserpenyő = frying pan"},
  { id:83, phase:4, title:"At a Restaurant", sub:"kérem a · mit ajánl · számlát kérek", aud:"both",
    phrases:[
      {hu:"Kérem az étlapot!",pr:"Ké-rem oz ét-lo-pot",en:"Could I have the menu, please!"},
      {hu:"Mit ajánl ma?",pr:"Mit o-yánl mo",en:"What do you recommend today?"},
      {hu:"Én a gulyáslevest kérem.",pr:"Én o gu-yásh-le-vesht ké-rem",en:"I'll have the goulash soup."},
      {hu:"A gyerekek pizzát kérnek.",pr:"O dye-re-kek piz-zát kér-nek",en:"The children would like pizza."},
      {hu:"Számlát kérek, legyen szíves!",pr:"Sám-lát ké-rek, le-dyen sí-vesh",en:"The bill, please!"},
      {hu:"Kártyával fizetek.",pr:"Kár-tyá-vol fi-ze-tek",en:"I'll pay by card."},
      {hu:"Ez nagyon finom volt!",pr:"Ez no-dyon fi-nom volt",en:"That was very tasty!"},
      {hu:"Van gluténmentes opció?",pr:"Von glu-tén-men-tesh op-ci-ó",en:"Is there a gluten-free option?"},
    ], tip:"Kérem… (I'd like/I request…) is the magic word for ordering — attach any food name. Számlát kérek, legyen szíves! (the bill, please) is ready-to-use as a fixed chunk.", pat:"kérem = I'd like / please (requesting)\naz étlap = the menu\nmit ajánl? = what do you recommend?\nszámla = bill/invoice\nlegyen szíves = please / be so kind\nkártyával = by card\nkészpénzzel = in cash\nfinom = tasty/delicious"},
  { id:84, phase:4, title:"Ingredients & Shopping Detail", sub:"liszt · cukor · tojás · tej · mennyi", aud:"both",
    phrases:[
      {hu:"Vegyek lisztet és cukrot?",pr:"Ve-dyek lis-tet ésh cu-krot",en:"Shall I buy flour and sugar?"},
      {hu:"Elfogyott a tej.",pr:"El-fo-dyott o tey",en:"We've run out of milk."},
      {hu:"Kell hat tojás a recepthez.",pr:"Kel hot to-yásh o re-cept-hez",en:"Six eggs are needed for the recipe."},
      {hu:"Mennyi liszt kell?",pr:"Men-nyi list kel",en:"How much flour is needed?"},
      {hu:"Vegyünk fél kiló almát!",pr:"Ve-dyünk fél ki-ló ol-mát",en:"Let's buy half a kilo of apples!"},
      {hu:"Nézd meg az árat!",pr:"Nézd meg oz á-rot",en:"Check the price!"},
      {hu:"Ez bio, az meg hagyományos.",pr:"Ez bi-o, oz meg ho-dyo-má-nyosh",en:"This is organic, that one is conventional."},
      {hu:"A szupermarketben olcsóbb.",pr:"O su-per-mor-ket-ben ol-chóbb",en:"It's cheaper at the supermarket."},
    ], tip:"Elfogyott a… (we've run out of…) is essential at home. Attach any pantry item: elfogyott a tej / cukor / kenyér. Kell + number + ingredient covers most recipe shopping.", pat:"liszt = flour\ncukor = sugar\ntojás = egg\ntej = milk\nvaj = butter\nfél kiló = half a kilo\nmennyi? = how much/many?\nelfogyott = ran out / is finished\nrecept = recipe\nbio = organic"},
  { id:85, phase:5, title:"Describing Characters", sub:"okos · bátor · vicces · gonosz · kedves", aud:"both",
    phrases:[
      {hu:"Ez a karakter nagyon okos.",pr:"Ez o ko-rok-ter no-dyon o-kosh",en:"This character is very clever."},
      {hu:"Félénk, de belül bátor.",pr:"Fé-lénk, de be-lül bá-tor",en:"She's shy, but brave inside."},
      {hu:"A mesebeli boszorkány gonosz.",pr:"O me-she-be-li bo-sor-kány go-nos",en:"The witch in the story is evil."},
      {hu:"Kedves és segítőkész.",pr:"Ked-vesh ésh she-gí-tő-kész",en:"She/he is kind and helpful."},
      {hu:"Vicces, mindenkit megnevettet.",pr:"Vic-chesh, min-den-kit meg-ne-vet-tet",en:"She's funny, she makes everyone laugh."},
      {hu:"A hős nagyon ügyes.",pr:"O hős no-dyon ü-dyesh",en:"The hero is very skilled."},
      {hu:"Türelmes, soha nem mérgelődik.",pr:"Tü-rel-mesh, sho-ho nem mér-ge-lő-dik",en:"Patient, she never gets irritated."},
      {hu:"Milyen a kedvenc karaktered?",pr:"Mi-yen o ked-venc ko-rok-te-red",en:"What is your favourite character like?"},
    ], tip:"Milyen? (What is … like?) is the key question for character description. Answer with adjectives: okos, bátor, gonosz, kedves, vicces. Great to practise while reading bedtime stories together.", pat:"okos = clever/smart\nbátor = brave\ngonosz = evil/wicked\nkedves = kind/nice\nvicces = funny\nügyes = skilled/capable\ntürelmes = patient\nfélénk = shy/timid\nhős = hero\nboszorkány = witch"},
  { id:86, phase:7, title:"Nuanced Emotions", sub:"frusztrált · büszke · hálás · megkönnyebbülés", aud:"both",
    phrases:[
      {hu:"Frusztrált vagyok.",pr:"Frus-trált vo-dyok",en:"I'm frustrated."},
      {hu:"Nagy megkönnyebbülést érzek.",pr:"Nody meg-köny-nyeb-bü-lésht ér-zek",en:"I feel great relief."},
      {hu:"Büszke vagyok rátok.",pr:"Büs-ke vo-dyok rá-tok",en:"I'm proud of you all."},
      {hu:"Zavarban vagyok.",pr:"Zo-vor-bon vo-dyok",en:"I feel embarrassed."},
      {hu:"Hálás vagyok érte.",pr:"Há-lásh vo-dyok ér-te",en:"I'm grateful for it."},
      {hu:"Túlterhelve érzem magam.",pr:"Túl-ter-hel-ve ér-zem mo-gom",en:"I feel overwhelmed."},
      {hu:"Aggódom miattad.",pr:"Og-gó-dom mi-ot-tod",en:"I'm worried about you."},
      {hu:"Boldog és hálás vagyok.",pr:"Bol-dog ésh há-lásh vo-dyok",en:"I'm happy and grateful."},
    ], tip:"Beyond boldog/szomorú (happy/sad), these emotions show real fluency. Büszke vagyok rátok is especially powerful to say to children after an achievement — say it often.", pat:"frusztrált = frustrated\nmegkönnyebbülés = relief\nbüszke = proud\nzavarban = embarrassed\nhálás = grateful\ntúlterhelt = overwhelmed\naggódik = worries\nbüszke vagyok rád = I'm proud of you (singular)\nbüszke vagyok rátok = I'm proud of you (plural)"},
  { id:87, phase:7, title:"Relationship Talk", sub:"beszélnünk kell · hogyan érzed magad · meghallgatlak", aud:"wife",
    phrases:[
      {hu:"Beszélnünk kell.",pr:"Be-sél-nünk kel",en:"We need to talk."},
      {hu:"Hogyan érzed magad ma?",pr:"Ho-dyon ér-zed mo-god mo",en:"How do you feel today?"},
      {hu:"Meghallgatlak.",pr:"Meg-holl-got-lok",en:"I'm listening to you."},
      {hu:"Mi nyomaszt téged?",pr:"Mi nyo-most té-ged",en:"What's weighing on you?"},
      {hu:"Köszönöm, hogy elmondtad.",pr:"Kö-sö-nöm, hogy el-mond-tod",en:"Thank you for telling me."},
      {hu:"Szükségem van rád.",pr:"Sük-shé-gem von rád",en:"I need you."},
      {hu:"Szeretlek és melleted állok.",pr:"Se-ret-lek ésh mel-le-ted ál-lok",en:"I love you and I'm by your side."},
      {hu:"Csináljuk együtt.",pr:"Chi-nál-yuk e-gyütt",en:"Let's do it together."},
    ], tip:"Meghallgatlak (I'm listening to you) and Köszönöm, hogy elmondtad (thank you for telling me) transform any difficult conversation — they show genuine presence. Learn these two first.", pat:"meghallgat = listens to (attentively)\nhogyan érzed magad? = how do you feel?\nmi nyomaszt? = what's weighing on you?\nelmondtad = you told (it)\nszükségem van rád = I need you\nmelleted állok = I stand by your side\negyütt = together"},
  { id:88, phase:7, title:"Apologies & Repair", sub:"bocsánat · sajnálom · nem kellett volna · megígérem", aud:"both",
    phrases:[
      {hu:"Bocsánat, tévedtem.",pr:"Bo-chá-not, té-ved-tem",en:"Sorry, I was wrong."},
      {hu:"Nem kellett volna azt mondanom.",pr:"Nem kel-lett vol-no ozt mon-do-nom",en:"I shouldn't have said that."},
      {hu:"Megígérem, hogy jobban figyelek.",pr:"Meg-í-gé-rem, hogy yob-bon fi-dye-lek",en:"I promise I'll pay better attention."},
      {hu:"Hogyan tehetem jóvá?",pr:"Ho-dyon te-he-tem yó-vá",en:"How can I make it right?"},
      {hu:"Sajnálom, megbántottalak.",pr:"Shoy-ná-lom, meg-bán-tot-to-lok",en:"I'm sorry I hurt you."},
      {hu:"Elfogadod a bocsánatomat?",pr:"El-fo-go-dod o bo-chá-no-to-mot",en:"Do you accept my apology?"},
      {hu:"Mindketten hibáztunk.",pr:"Mind-két-ten hi-báz-tunk",en:"We both made mistakes."},
      {hu:"Kezdjük újra!",pr:"Kez-dyük új-ro",en:"Let's start over!"},
    ], tip:"Bocsánat (sorry) is quick and informal; sajnálom (I'm sorry) is fuller and more heartfelt. Nem kellett volna… + infinitive is your self-correction pattern: nem kellett volna elmondanom (I shouldn't have told it).", pat:"bocsánat = sorry (apology)\nsajnálom = I'm sorry / I regret\ntévedtem = I was wrong / I made a mistake\nnem kellett volna = I shouldn't have (+ infinitive)\nmegígérem = I promise\njóvá tesz = makes it right\nelfogad = accepts\nhibázik = makes a mistake"},
  { id:89, phase:8, title:"Formal Register", sub:"Ön · tessék · Jó napot kívánok · Viszontlátásra", aud:"both", patternId:"formal-register",
    phrases:[
      {hu:"Jó napot kívánok!",pr:"Yó no-pot kí-vá-nok",en:"Good day! (formal greeting)"},
      {hu:"Hogy van, tanár úr?",pr:"Hogy von, to-nár úr",en:"How are you, sir? (to male teacher)"},
      {hu:"Önnek van szabad ideje?",pr:"Ön-nek von so-bod i-de-ye",en:"Do you have free time? (formal)"},
      {hu:"Tessék, foglaljon helyet!",pr:"Tes-sék, fog-lol-yon he-yet",en:"Please, take a seat! (formal)"},
      {hu:"Köszönöm a segítségét.",pr:"Kö-sö-nöm o she-gít-shé-gét",en:"Thank you for your help. (formal)"},
      {hu:"Viszontlátásra!",pr:"Vi-sont-lá-tásh-ro",en:"Goodbye! (formal)"},
      {hu:"Bocsásson meg, hogy zavarni merem.",pr:"Bo-chás-shon meg, hogy zo-vor-ni me-rem",en:"Excuse me for disturbing you. (formal)"},
      {hu:"Miben segíthetek Önnek?",pr:"Mi-ben she-gít-he-tek Ön-nek",en:"How can I help you? (formal)"},
    ], tip:"Swap te (informal 'you') for Ön (formal 'you') with teachers, doctors, and strangers. Verb endings change to match: Ön tudja (you know), Ön mondja (you say). Tessék is a versatile formal filler — use it for 'please', 'here you go', and 'pardon?'.", pat:"Ön = formal 'you' (uses 3rd-person singular verb forms)\nte = informal 'you'\ntessék = please / here you go / pardon? (formal)\ntanár úr = Mr Teacher / sir (male)\ntanárnő = Ms Teacher (female)\nJó napot kívánok = Good day (formal)\nViszontlátásra = Goodbye (formal)\nBocsásson meg = Excuse me (formal imperative)"},
  { id:90, phase:8, title:"Phone & Messaging", sub:"felhívlak · visszahívlak · üzenet · hallod?", aud:"both",
    phrases:[
      {hu:"Felhívlak ma este.",pr:"Fel-hív-lok mo esh-te",en:"I'll call you tonight."},
      {hu:"Visszahívlak hamarosan.",pr:"Vis-so-hív-lok ho-mo-ro-shon",en:"I'll call you back soon."},
      {hu:"Küldj egy üzenetet, ha megérkezel!",pr:"Küldj edy ü-ze-ne-tet, ho meg-ér-ke-zel",en:"Send a message when you arrive!"},
      {hu:"Hallod, amit mondok?",pr:"Hol-lod, o-mit mon-dok",en:"Can you hear what I'm saying?"},
      {hu:"Rossz a kapcsolat.",pr:"Ross o kop-cho-lot",en:"The connection is bad."},
      {hu:"Töltsd fel a telefont!",pr:"Töltsd fel o te-le-font",en:"Charge the phone!"},
      {hu:"Elolvastam az üzeneted.",pr:"El-ol-vosh-tom oz ü-ze-ne-ted",en:"I read your message."},
      {hu:"Videóhívást indítok.",pr:"Vi-de-ó-hí-vásht in-dí-tok",en:"I'm starting a video call."},
    ], tip:"Felhívlak (I'll call you) vs visszahívlak (I'll call you back) — fel- means you initiate, vissza- means you return the call. The -lak/-lek ending fuses 'I → you' into one word — no separate pronoun needed.", pat:"felhív = calls (someone)\nvissza­hív = calls back\nüzenet = message\nküld = sends\nhallod? = can you hear?\nkapcsolat = connection\ntölt = charges / loads\nindít = starts / initiates\nvideóhívás = video call"},
  { id:91, phase:8, title:"Numbers, Dates & Money", sub:"számok · dátum · forint · mennyibe kerül", aud:"both",
    phrases:[
      {hu:"Tizenegy, tizenkettő, tizenhárom.",pr:"Ti-zen-edy, ti-zen-ket-tő, ti-zen-há-rom",en:"Eleven, twelve, thirteen."},
      {hu:"Ma január huszonharmadika van.",pr:"Mo yo-nu-ár hu-son-hor-mo-di-ko von",en:"Today is the twenty-third of January."},
      {hu:"Mennyibe kerül?",pr:"Men-nyi-be ke-rül",en:"How much does it cost?"},
      {hu:"Ezer forint.",pr:"E-zer fo-rint",en:"One thousand forints."},
      {hu:"Az első, a második, a harmadik.",pr:"Az el-shő, o má-so-dik, o hor-mo-dik",en:"The first, the second, the third."},
      {hu:"Március tizenötödikén van az ünnep.",pr:"Már-ci-ush ti-zen-ö-tö-di-kén von oz ün-nep",en:"The holiday is on the fifteenth of March."},
      {hu:"Húsz euró és ötven cent.",pr:"Húss eu-ró ésh öt-ven cent",en:"Twenty euros and fifty cents."},
      {hu:"Melyik hónapban születtél?",pr:"Me-yik hó-nop-bon sü-let-tél",en:"Which month were you born in?"},
    ], tip:"Hungarian dates: month name + ordinal day + '-dikán/-dikén' for 'on the …th'. Tens: húsz (20), harminc (30), negyven (40), ötven (50), hatvan (60), hetven (70), nyolcvan (80), kilencven (90), száz (100).", pat:"tíz = 10 / húsz = 20 / harminc = 30 / negyven = 40 / ötven = 50\nhatvan = 60 / hetven = 70 / nyolcvan = 80 / kilencven = 90 / száz = 100\nezer = 1,000\nforint = Hungarian currency\nmennyibe kerül? = how much does it cost?\nordinals: első (1st), második (2nd), harmadik (3rd), negyedik (4th), ötödik (5th)"},
  { id:92, phase:8, title:"Household & DIY", sub:"csavar · fúró · festeni · szerelni", aud:"both",
    phrases:[
      {hu:"Kell egy csavar és egy csavarhúzó.",pr:"Kel edy cho-vor ésh edy cho-vor-hú-zó",en:"I need a screw and a screwdriver."},
      {hu:"Hol van a fúró?",pr:"Hol von o fú-ró",en:"Where is the drill?"},
      {hu:"Festeni fogom a kerítést.",pr:"Fesh-te-ni fo-gom o ke-rí-tésht",en:"I'm going to paint the fence."},
      {hu:"Megszerelem a csapot.",pr:"Meg-se-re-lem o cho-pot",en:"I'll fix the tap."},
      {hu:"Öntözd meg a virágokat!",pr:"Ön-tözd meg o vi-rá-go-kot",en:"Water the flowers!"},
      {hu:"A villanykörte kicserélendő.",pr:"O vil-lony-kör-te ki-che-ré-len-dő",en:"The light bulb needs replacing."},
      {hu:"Ásni kell a kertben.",pr:"Ásh-ni kel o kert-ben",en:"We need to dig in the garden."},
      {hu:"Kitakarítom a garázsot.",pr:"Ki-to-ko-rí-tom o go-rá-zsot",en:"I'll clean out the garage."},
    ], tip:"Meg- prefix marks completion: szerelek (I'm fixing) → megszerelem (I'll fix it). Apply to any household task: megjavítom (I'll repair it), megtisztítom (I'll clean it), megcsinálom (I'll do/fix it).", pat:"csavar = screw\ncsavarhúzó = screwdriver\nfúró = drill\nfesteni = to paint\nszerelni = to fix / repair\nöntözni = to water (plants)\nvillanykörte = light bulb\nkicserél = replaces\nás = digs\nkitakarít = cleans out"},
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
  const today=todayISO();

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

    // 7. SRS due phrases in this lesson (0-4 points)
    const dueCount=lesson.phrases.filter(p=>{const ps=stats.phraseScores[p.hu];return ps&&ps.due&&ps.due<=today;}).length;
    if(dueCount>=5){score+=4;reasons.push("many_due");}
    else if(dueCount>=2){score+=2;reasons.push("some_due");}

    scored.push({lesson,phase,score,reasons,ls,weakCount,dueCount});
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
    if(r.includes("many_due"))return`${item.dueCount} phrases due for review`;
    if(r.includes("some_due"))return`${item.dueCount} phrases due for review`;
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
    if (raw) {
      const parsed=JSON.parse(raw);
      const today=new Date().toISOString().slice(0,10);
      const scores=parsed.phraseScores||{};
      Object.keys(scores).forEach(hu=>{
        const s=scores[hu];
        if(s.ease===undefined){
          const{right=0,wrong=0}=s;
          let ease,interval;
          if(right===0&&wrong===0){ease=2.5;interval=0;}
          else if(right>wrong*2){ease=2.5;interval=7;}
          else if(right>wrong){ease=2.3;interval=3;}
          else{ease=1.8;interval=1;}
          scores[hu]={...s,ease,interval,due:today,lastSeen:today};
        }
      });
      return parsed;
    }
  } catch(e) {}
  return {
    totalTime:0, sessionsCompleted:0, streakDays:[], phraseScores:{},
    lessonScores:{}, lastActive:null, todayTime:0, todayDate:new Date().toDateString(), dailyGoal:15,
  };
}

function saveStats(stats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch(e) {}
}

// ─── SRS UTILITIES ────────────────────────────────────────────────────────
const SRS_MAX_INTERVAL=60;
function todayISO(){return new Date().toISOString().slice(0,10);}
function schedulePhraseReview(entry,correct){
  let{ease=2.5,interval=0}=entry;
  if(correct){
    if(interval===0)interval=1;
    else if(interval===1)interval=3;
    else interval=Math.min(SRS_MAX_INTERVAL,Math.round(interval*ease));
    ease=Math.min(3.0,ease+0.1);
  }else{
    interval=1;
    ease=Math.max(1.3,ease-0.2);
  }
  const d=new Date();d.setDate(d.getDate()+interval);
  return{...entry,ease,interval,due:d.toISOString().slice(0,10),lastSeen:todayISO()};
}
function getDuePhrases(stats){
  const today=todayISO();
  const attempted=new Set(Object.keys(stats.lessonScores));
  const due=[];
  LESSONS.forEach(lesson=>{
    if(!attempted.has(String(lesson.id)))return;
    lesson.phrases.forEach(p=>{
      const sc=stats.phraseScores[p.hu];
      if(!sc)return;
      if((sc.due||today)<=today)due.push(p);
    });
  });
  return due;
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
      const updated={...prev,right:prev.right+(correct?1:0),wrong:prev.wrong+(correct?0:1)};
      return{...s,phraseScores:{...s.phraseScores,[phraseHu]:schedulePhraseReview(updated,correct)}};
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

// ─── REVIEW DUE CARD ─────────────────────────────────────────────────────
function ReviewDueCard({dueCount,onStart}){
  const color="#4A90D9";
  if(dueCount===0)return null;
  return <div style={{padding:"0 16px",marginBottom:14}}>
    <div onClick={onStart} style={{background:`linear-gradient(135deg, ${color}18, ${color}06)`,border:`1px solid ${color}28`,borderRadius:14,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:36,height:36,borderRadius:10,background:`${color}20`,color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🔁</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:700,color:C.text}}>Review Due</div>
        <div style={{fontSize:11,color,fontWeight:600,marginTop:1}}>{dueCount} phrase{dueCount!==1?"s":""} ready to review</div>
      </div>
      <span style={{color:C.dim,fontSize:16}}>›</span>
    </div>
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

// ─── REVIEW DUE QUIZ ─────────────────────────────────────────────────────
function ReviewDueQuiz({onBack,statsApi}){
  const [duePhrases]=useState(()=>getDuePhrases(statsApi.stats).slice(0,15));
  const syntheticLesson=useMemo(()=>({id:"review-due",phrases:duePhrases}),[]);
  const color="#4A90D9";
  if(duePhrases.length===0)return <div style={{padding:"40px 20px",textAlign:"center"}}>
    <div style={{fontSize:48}}>✓</div>
    <div style={{fontSize:22,fontWeight:900,color:C.text,marginTop:12}}>All caught up!</div>
    <div style={{fontSize:14,color:C.sub,marginTop:4}}>No phrases are due right now.</div>
    <button onClick={onBack} style={{marginTop:20,padding:"12px 28px",borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,color,fontSize:14,fontWeight:700,cursor:"pointer"}}>Back</button>
  </div>;
  return <div>
    <Header title="Review Due" sub={`${duePhrases.length} phrase${duePhrases.length!==1?"s":""}`} onBack={onBack}/>
    <QuizEngine lesson={syntheticLesson} color={color} onFinish={onBack} statsApi={statsApi}/>
  </div>;
}

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
  const duePhrases=useMemo(()=>getDuePhrases(statsApi.stats),[statsApi.stats]);

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
        <div><div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5}}>Magyar Otthon</div><div style={{fontSize:11,color:C.sub}}>Family Hungarian · 55 lessons</div></div>
        <GoalRing todayMins={statsApi.todayMins} goal={statsApi.stats.dailyGoal} onTap={()=>setShowGoalSettings(true)}/>
      </div>

      {/* Daily Focus */}
      <DailyFocusCard focus={focus} onSelectLesson={goToLesson}/>

      {/* Review Due */}
      <ReviewDueCard dueCount={duePhrases.length} onStart={()=>setScreen("review-due")}/>

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
    {screen==="review-due"&&<ReviewDueQuiz onBack={()=>setScreen("home")} statsApi={statsApi}/>}
  </div>;
}
