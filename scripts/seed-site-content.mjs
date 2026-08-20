import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "taku-f8db6";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!getApps().length) {
  if (clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId
    });
  } else {
    initializeApp({ projectId });
  }
}

const db = getFirestore();

const dinosaurImages = {
  tyrannosaurus: "https://www.theisle.info/Tyrannosaurus.webp",
  allosaurus: "https://www.theisle.info/allo.jpg",
  carnotaurus: "https://www.theisle.info/The_isle_carnotaurus_new_2020.webp",
  ceratosaurus: "https://www.theisle.info/Ceratosaurus_The_Isle.webp",
  baryonyx: "https://www.theisle.info/Baryonyx.webp",
  dilophosaurus: "https://www.theisle.info/Dilophosaurus.webp",
  herrerasaurus: "https://www.theisle.info/Herrerasaurus.webp",
  austroraptor: "https://www.theisle.info/austro.webp",
  troodon: "https://www.theisle.info/Troodon_The_Isle.webp",
  omniraptor: "https://www.theisle.info/omniraptor.webp",
  deinosuchus: "https://www.theisle.info/deinosucus.jpg",
  pteranodon: "https://www.theisle.info/pteranodon.webp",
  triceratops: "https://www.theisle.info/triceratops.png",
  stegosaurus: "https://www.theisle.info/The_isle_stegosaurus_new_2020.webp",
  diabloceratops: "https://www.theisle.info/diablo.png",
  kentrosaurus: "https://www.theisle.info/The_isle_kentrosaurus.webp",
  tenontosaurus: "https://www.theisle.info/Tenontosaurus.webp",
  maiasaura: "https://www.theisle.info/mai.png",
  pachycephalosaurus: "https://www.theisle.info/Pachycephalosaurus.webp",
  dryosaurus: "https://www.theisle.info/dryosaurus.webp",
  hypsilophodon: "https://www.theisle.info/Hypsilophodon_The_Isle.webp",
  beipiaosaurus: "https://www.theisle.info/Beipiaosaurus.jpg",
  gallimimus: "https://www.theisle.info/Gallimimus.webp"
};

const dinosaurSummaries = {
  tyrannosaurus: "The Isle's headline apex: slow, heavy, and built to finish fights when the bite lands.",
  allosaurus: "Versatile mid-tier carnivore with strong bleed pressure, fast healing, and high skill expression.",
  carnotaurus: "Charging menace and one of the fastest land threats, built around ram-down-prey pressure.",
  ceratosaurus: "Aggressive bully carnivore with bacterial bite pressure, corpse control, and iron-stomach survival.",
  baryonyx: "Fast riverside carnivore that stays close to water and ambushes from banks and crossings.",
  dilophosaurus: "Nocturnal predator with strong night pressure and a disruptive venom or bleed-focused kit.",
  herrerasaurus: "Small, fast, tree-climbing carnivore that uses vertical routes for scouting and ambushes.",
  austroraptor: "Tall raptor with speed, reach, fish routes, and a skirmisher style that avoids direct brawls.",
  troodon: "Tiny pack hunter built around venom pounce pressure, harassment, and coordinated timing.",
  omniraptor: "Agile small carnivore with pounce-and-grapple pressure, dangerous in coordinated packs.",
  deinosuchus: "Massive crocodilian that controls rivers, swamps, shorelines, and thirsty prey routes.",
  pteranodon: "The roster flyer: fragile on the ground but excellent for scouting, fishing, and repositioning.",
  triceratops: "Iconic horned bruiser with elite 1v1 tank power and devastating frontal control.",
  stegosaurus: "Heavy defensive herbivore with punishing tail pressure and strong area denial.",
  diabloceratops: "Compact ceratopsian that fights what it cannot outrun and outruns what it cannot fight.",
  kentrosaurus: "Spiked stegosaur cousin that punishes careless carnivores with defensive spacing.",
  tenontosaurus: "Explosive herbivore with bite, claw, kick, tail pressure, and strong dueling tools.",
  maiasaura: "Herd-bound speed tank that survives through movement, grouping, and coordinated routes.",
  pachycephalosaurus: "Fracture-focused herbivore whose bone-dome ram can cripple careless attackers.",
  dryosaurus: "Small, fast, fragile herbivore that survives by speed, cover, dodging, and never getting caught.",
  hypsilophodon: "Tiny feathered herbivore that blinds pursuers and survives with agility and jungle routes.",
  beipiaosaurus: "Semi-aquatic omnivore that moves well in water and fights with slashing claws on land.",
  gallimimus: "Fast flock-based omnivore built around speed, stamina, scouting, and mobilization calls."
};

const dinosaurCategories = {
  tyrannosaurus: "Apex Carnivore",
  allosaurus: "Apex Carnivore",
  carnotaurus: "Apex Carnivore",
  ceratosaurus: "Apex Carnivore",
  baryonyx: "Mid Carnivore",
  dilophosaurus: "Mid Carnivore",
  herrerasaurus: "Mid Carnivore",
  austroraptor: "Mid Carnivore",
  troodon: "Small Carnivore",
  omniraptor: "Small Carnivore",
  deinosuchus: "Aquatic Apex",
  pteranodon: "Flyer",
  triceratops: "Large Herbivore",
  stegosaurus: "Large Herbivore",
  diabloceratops: "Large Herbivore",
  kentrosaurus: "Mid Herbivore",
  tenontosaurus: "Mid Herbivore",
  maiasaura: "Mid Herbivore",
  pachycephalosaurus: "Mid Herbivore",
  dryosaurus: "Small Herbivore",
  hypsilophodon: "Small Herbivore",
  beipiaosaurus: "Omnivore",
  gallimimus: "Omnivore"
};

const scientificNames = {
  tyrannosaurus: "Tyrannosaurus rex",
  allosaurus: "Allosaurus fragilis",
  carnotaurus: "Carnotaurus sastrei",
  ceratosaurus: "Ceratosaurus nasicornis",
  baryonyx: "Baryonyx walkeri",
  dilophosaurus: "Dilophosaurus wetherilli",
  herrerasaurus: "Herrerasaurus ischigualastensis",
  austroraptor: "Austroraptor cabazai",
  troodon: "Troodon formosus",
  omniraptor: "Omniraptor",
  deinosuchus: "Deinosuchus riograndensis",
  pteranodon: "Pteranodon longiceps",
  triceratops: "Triceratops horridus",
  stegosaurus: "Stegosaurus stenops",
  diabloceratops: "Diabloceratops eatoni",
  kentrosaurus: "Kentrosaurus aethiopicus",
  tenontosaurus: "Tenontosaurus tilletti",
  maiasaura: "Maiasaura peeblesorum",
  pachycephalosaurus: "Pachycephalosaurus wyomingensis",
  dryosaurus: "Dryosaurus altus",
  hypsilophodon: "Hypsilophodon foxii",
  beipiaosaurus: "Beipiaosaurus inexpectus",
  gallimimus: "Gallimimus bullatus"
};

const categoryLabels = {
  ja: {
    "Apex Carnivore": "頂点肉食",
    "Mid Carnivore": "中型肉食",
    "Small Carnivore": "小型肉食",
    "Aquatic Apex": "水中の頂点捕食者",
    Flyer: "飛行生物",
    "Large Herbivore": "大型草食",
    "Mid Herbivore": "中型草食",
    "Small Herbivore": "小型草食",
    Omnivore: "雑食"
  },
  ko: {
    "Apex Carnivore": "최상위 육식",
    "Mid Carnivore": "중형 육식",
    "Small Carnivore": "소형 육식",
    "Aquatic Apex": "수중 최상위 포식자",
    Flyer: "비행 생물",
    "Large Herbivore": "대형 초식",
    "Mid Herbivore": "중형 초식",
    "Small Herbivore": "소형 초식",
    Omnivore: "잡식"
  },
  mn: {
    "Apex Carnivore": "Apex махчин",
    "Mid Carnivore": "Дунд махчин",
    "Small Carnivore": "Жижиг махчин",
    "Aquatic Apex": "Усны apex махчин",
    Flyer: "Нисдэг амьтан",
    "Large Herbivore": "Том өвсөн тэжээлтэн",
    "Mid Herbivore": "Дунд өвсөн тэжээлтэн",
    "Small Herbivore": "Жижиг өвсөн тэжээлтэн",
    Omnivore: "Холимог тэжээлтэн"
  }
};

const dietLabels = {
  ja: { Carnivore: "肉食", Herbivore: "草食", Omnivore: "雑食" },
  ko: { Carnivore: "육식", Herbivore: "초식", Omnivore: "잡식" },
  mn: { Carnivore: "Махчин", Herbivore: "Өвсөн тэжээлтэн", Omnivore: "Холимог тэжээлтэн" }
};

const difficultyLabels = {
  ja: { Beginner: "初心者向け", Intermediate: "中級者向け", Advanced: "上級者向け" },
  ko: { Beginner: "초보자용", Intermediate: "중급자용", Advanced: "상급자용" },
  mn: { Beginner: "Анхан шат", Intermediate: "Дунд шат", Advanced: "Ахисан шат" }
};

const statusLabels = {
  ja: { Playable: "プレイ可能", Upcoming: "今後追加予定", "Hordetesting / upcoming": "Hordetesting / 今後追加予定" },
  ko: { Playable: "플레이 가능", Upcoming: "추가 예정", "Hordetesting / upcoming": "Hordetesting / 추가 예정" },
  mn: { Playable: "Тоглох боломжтой", Upcoming: "Удахгүй нэмэгдэнэ", "Hordetesting / upcoming": "Hordetesting / удахгүй" }
};

const roleLabels = {
  ja: {
    "Speed ambusher": "高速奇襲型",
    "Corpse controller": "死体・エリア制圧型",
    "Aquatic apex": "水中の頂点捕食者",
    "Nocturnal hunter": "夜間ハンター",
    "Tree ambusher": "高所奇襲型",
    "Pack hunter": "群れハンター",
    "Aerial scout": "空中偵察型",
    "Herd anchor": "群れの防衛軸",
    "Duelist herbivore": "近接防衛型草食",
    "Starter survivor": "初心者向け生存型",
    "Flock runner": "高速偵察型",
    "Water-edge omnivore": "水辺の雑食型",
    "Scout herbivore": "小型偵察草食",
    Disruptor: "妨害型",
    "Herd defender": "群れの守護役",
    "Herd runner": "群れ移動型",
    "Pack venom hunter": "毒を使う群れハンター",
    "Apex herbivore": "頂点草食",
    "Apex carnivore": "頂点肉食",
    "Mid carnivore": "中型肉食",
    "Riverside predator": "川沿い捕食者",
    "Defensive herbivore": "防衛型草食",
    Skirmisher: "遊撃型"
  },
  ko: {
    "Speed ambusher": "고속 기습형",
    "Corpse controller": "시체와 구역 장악형",
    "Aquatic apex": "수중 최상위 포식자",
    "Nocturnal hunter": "야간 사냥꾼",
    "Tree ambusher": "고지대 기습형",
    "Pack hunter": "무리 사냥꾼",
    "Aerial scout": "공중 정찰형",
    "Herd anchor": "무리 방어 핵심",
    "Duelist herbivore": "근접 방어 초식",
    "Starter survivor": "초보 생존형",
    "Flock runner": "고속 정찰형",
    "Water-edge omnivore": "물가 잡식형",
    "Scout herbivore": "소형 정찰 초식",
    Disruptor: "교란형",
    "Herd defender": "무리 수비수",
    "Herd runner": "무리 이동형",
    "Pack venom hunter": "독 무리 사냥꾼",
    "Apex herbivore": "최상위 초식",
    "Apex carnivore": "최상위 육식",
    "Mid carnivore": "중형 육식",
    "Riverside predator": "강가 포식자",
    "Defensive herbivore": "방어형 초식",
    Skirmisher: "교전 기동형"
  },
  mn: {
    "Speed ambusher": "Хурдтай отогч",
    "Corpse controller": "Сэг болон бүс хянагч",
    "Aquatic apex": "Усны apex махчин",
    "Nocturnal hunter": "Шөнийн анчин",
    "Tree ambusher": "Өндрөөс отогч",
    "Pack hunter": "Багийн анчин",
    "Aerial scout": "Агаарын тагнуул",
    "Herd anchor": "Сүргийн хамгаалалтын тулгуур",
    "Duelist herbivore": "Тулаанч өвсөн тэжээлтэн",
    "Starter survivor": "Эхлэгчийн амьд үлдэх төрөл",
    "Flock runner": "Хурдан тагнуул",
    "Water-edge omnivore": "Усны эргийн холимог тэжээлтэн",
    "Scout herbivore": "Жижиг тагнуул өвсөн тэжээлтэн",
    Disruptor: "Саатуулагч",
    "Herd defender": "Сүргийн хамгаалагч",
    "Herd runner": "Сүргээр нүүдэллэгч",
    "Pack venom hunter": "Хортой багийн анчин",
    "Apex herbivore": "Apex өвсөн тэжээлтэн",
    "Apex carnivore": "Apex махчин",
    "Mid carnivore": "Дунд махчин",
    "Riverside predator": "Голын эргийн махчин",
    "Defensive herbivore": "Хамгаалалтын өвсөн тэжээлтэн",
    Skirmisher: "Түргэн довтлогч"
  }
};

function localizedDinosaurFields({ name, diet, growth, role, difficulty, status, category }) {
  return {
    ja: {
      diet: dietLabels.ja[diet] ?? diet,
      growth,
      role: roleLabels.ja[role] ?? role,
      difficulty: difficultyLabels.ja[difficulty] ?? difficulty,
      status: statusLabels.ja[status] ?? status,
      category: categoryLabels.ja[category] ?? category,
      summary: `${name} は ${categoryLabels.ja[category] ?? category} のプレイアブル恐竜です。役割は ${roleLabels.ja[role] ?? role} で、成長時間は ${growth} です。`,
      strength: `${name} の強みは、${roleLabels.ja[role] ?? role} として試合の流れを作れる点です。`,
      weakness: "位置取り、スタミナ管理、群れとの距離を誤ると一気に不利になります。",
      playstyle: "無理に正面から戦わず、地形・視界・味方との連携を使って安全に圧力をかけましょう。"
    },
    ko: {
      diet: dietLabels.ko[diet] ?? diet,
      growth,
      role: roleLabels.ko[role] ?? role,
      difficulty: difficultyLabels.ko[difficulty] ?? difficulty,
      status: statusLabels.ko[status] ?? status,
      category: categoryLabels.ko[category] ?? category,
      summary: `${name}는 ${categoryLabels.ko[category] ?? category} 플레이 가능 공룡입니다. 역할은 ${roleLabels.ko[role] ?? role}이며 성장 시간은 ${growth}입니다.`,
      strength: `${name}의 강점은 ${roleLabels.ko[role] ?? role} 역할로 전투 흐름을 만들 수 있다는 점입니다.`,
      weakness: "위치 선정, 스태미나 관리, 무리와의 거리 조절을 실패하면 빠르게 불리해집니다.",
      playstyle: "정면 싸움만 고집하지 말고 지형, 시야, 팀 연계를 활용해 안전하게 압박하세요."
    },
    mn: {
      diet: dietLabels.mn[diet] ?? diet,
      growth,
      role: roleLabels.mn[role] ?? role,
      difficulty: difficultyLabels.mn[difficulty] ?? difficulty,
      status: statusLabels.mn[status] ?? status,
      category: categoryLabels.mn[category] ?? category,
      summary: `${name} бол ${categoryLabels.mn[category] ?? category} ангиллын тоглох боломжтой динозавр. Үүрэг нь ${roleLabels.mn[role] ?? role}, өсөх хугацаа ${growth}.`,
      strength: `${name}-ийн давуу тал нь ${roleLabels.mn[role] ?? role} байдлаар тулааны хэмнэлийг удирдаж чаддаг.`,
      weakness: "Байрлал, stamina, сүргээсээ холдох зайгаа буруу тооцвол хурдан сул талтай болно.",
      playstyle: "Шууд нүүр тулж зодолдохоос илүү газар нутаг, харагдах орчин, багийн холбоог ашиглан аюулгүй дарамт үзүүл."
    }
  };
}

const dinosaurs = [
  ["carnotaurus", "Carnotaurus", "Carnivore", "2h 15m", "Fastest land carnivore with explosive charge pressure.", "Poor turning and fragile in long fights.", "Scout open ground, isolate wounded targets, then disengage before packs surround you.", "Speed ambusher", "Intermediate", "Playable"],
  ["ceratosaurus", "Ceratosaurus", "Carnivore", "2h 40m", "Bacterial bite pressure, corpse control, and strong bully potential.", "Can be overwhelmed by coordinated larger predators.", "Win through attrition, punish mistakes, and keep fights near food pressure.", "Corpse controller", "Intermediate", "Playable"],
  ["deinosuchus", "Deinosuchus", "Carnivore", "5h 30m", "Water ambush dominance and river control.", "Slow on land and predictable around water territory.", "Control crossings, remain patient, and let thirsty prey make the first mistake.", "Aquatic apex", "Advanced", "Playable"],
  ["dilophosaurus", "Dilophosaurus", "Carnivore", "1h 50m", "Night pressure, venom disruption, and ambush control.", "Weak in direct daylight trades.", "Hunt in pairs at night, create panic, and avoid clean face-tank fights.", "Nocturnal hunter", "Intermediate", "Playable"],
  ["herrerasaurus", "Herrerasaurus", "Carnivore", "1h 20m", "Climbing, scouting, and vertical ambush.", "Low mass and risky failed leaps.", "Use trees and cliffs for intel, pick isolated prey, and escape vertically.", "Tree ambusher", "Advanced", "Playable"],
  ["omniraptor", "Omniraptor", "Carnivore", "1h 45m", "Pack pounce and bleed stacking.", "Low durability when caught.", "Coordinate pounces, rotate attackers, and keep stamina discipline.", "Pack hunter", "Advanced", "Playable"],
  ["pteranodon", "Pteranodon", "Carnivore", "1h 05m", "Flight, scouting, fishing, and safe repositioning.", "Very fragile on the ground.", "Stay airborne, scout events, fish safely, and avoid low stamina landings.", "Aerial scout", "Beginner", "Playable"],
  ["stegosaurus", "Stegosaurus", "Herbivore", "4h 30m", "Area denial and devastating tail damage.", "Slow, loud, and stamina constrained.", "Hold terrain, protect herds, and punish overconfident predators.", "Herd anchor", "Intermediate", "Playable"],
  ["tenontosaurus", "Tenontosaurus", "Herbivore", "2h 25m", "Agility, kicks, and defensive dueling.", "Requires precise spacing.", "Bait lunges, kick through commits, and rotate with herd support.", "Duelist herbivore", "Intermediate", "Playable"],
  ["dryosaurus", "Dryosaurus", "Herbivore", "45m", "Small profile and escape speed.", "Minimal fighting power.", "Play alert, use cover, and focus on survival routes and nesting support.", "Starter survivor", "Beginner", "Playable"],
  ["gallimimus", "Gallimimus", "Omnivore", "1h 30m", "Speed, stamina, scouting, and flock mobility.", "Limited damage and poor brawl value.", "Control information, escort herds, and never let predators dictate your path.", "Flock runner", "Beginner", "Playable"],
  ["beipiaosaurus", "Beipiaosaurus", "Omnivore", "1h 15m", "Flexible semi-aquatic survival.", "Outclassed by specialists.", "Use mixed diet options, avoid apex routes, and survive through adaptability.", "Water-edge omnivore", "Beginner", "Playable"],
  ["hypsilophodon", "Hypsilophodon", "Herbivore", "40m", "Tiny profile, agility, and defensive spit.", "Almost no direct fighting power.", "Stay in dense cover, warn herds, blind pursuers, and survive through movement.", "Scout herbivore", "Beginner", "Playable"],
  ["pachycephalosaurus", "Pachycephalosaurus", "Herbivore", "2h 10m", "Bone-breaking headbutt pressure.", "Needs clean spacing and stamina control.", "Use terrain and timing to fracture careless predators and escape pressure.", "Disruptor", "Intermediate", "Playable"],
  ["diabloceratops", "Diabloceratops", "Herbivore", "3h 15m", "Compact bruiser with strong defensive trades.", "Can be kited by faster coordinated predators.", "Hold herd edges, protect juveniles, and force predators into bad angles.", "Herd defender", "Intermediate", "Playable"],
  ["maiasaura", "Maiasaura", "Herbivore", "3h 30m", "Herd speed, stamina, and group survival.", "Solo players are vulnerable in open ground.", "Move with the herd, rotate feeding zones, and avoid unnecessary fights.", "Herd runner", "Beginner", "Playable"],
  ["troodon", "Troodon", "Carnivore", "1h 00m", "Venom pounce and pack harassment.", "Extremely fragile when isolated.", "Attack in coordinated waves, stack pressure, and leave before larger prey pins you.", "Pack venom hunter", "Advanced", "Playable"],
  ["triceratops", "Triceratops", "Herbivore", "5h+", "Apex herbivore tank with devastating frontal control.", "Slow, loud, and a major target for organized carnivores.", "Anchor the herd, face threats directly, and avoid being split from support.", "Apex herbivore", "Advanced", "Hordetesting / upcoming"],
  ["tyrannosaurus", "Tyrannosaurus", "Carnivore", "6h+", "Apex bite pressure and finishing power.", "Slow acceleration and costly stamina mistakes.", "Control territory and commit only when the kill is realistic.", "Apex carnivore", "Advanced", "Hordetesting / upcoming"],
  ["allosaurus", "Allosaurus", "Carnivore", "3h+", "Balanced mid-tier pressure, bleed, and mobility.", "Can lose trades against specialists.", "Track wounded prey, pressure from angles, and avoid face-tanking.", "Mid carnivore", "Intermediate", "Upcoming"],
  ["baryonyx", "Baryonyx", "Carnivore", "3h+", "Riverside ambush and fish-route control.", "Less dominant away from water corridors.", "Patrol banks, punish thirsty prey, and retreat through water-side cover.", "Riverside predator", "Intermediate", "Upcoming"],
  ["kentrosaurus", "Kentrosaurus", "Herbivore", "2h+", "Spike punishment and defensive spacing.", "Needs careful positioning against packs.", "Punish close commits, guard tight paths, and move with larger herbivores.", "Defensive herbivore", "Intermediate", "Upcoming"],
  ["austroraptor", "Austroraptor", "Carnivore", "2h+", "Speed, reach, and fish specialist routes.", "Weak if forced into direct brawls.", "Skirmish around water and cover, pick isolated prey, and avoid long trades.", "Skirmisher", "Intermediate", "Upcoming"]
].map(([slug, name, diet, growth, strength, weakness, playstyle, role, difficulty, status], order) => {
  const category = dinosaurCategories[slug] ?? role;

  return {
    slug,
    name,
    diet,
    growth,
    strength,
    weakness,
    playstyle,
    role,
    difficulty,
    status,
    category,
    scientificName: scientificNames[slug] ?? "",
    summary: dinosaurSummaries[slug] ?? `${name} is a ${category} profile for The Isle Evrima community planning.`,
    sourceUrl: `https://www.theisle.info/dinosaurs/${slug}`,
    image: dinosaurImages[slug],
    i18n: localizedDinosaurFields({ name, diet, growth, role, difficulty, status, category }),
    order
  };
});

const content = {
  announcements: [
    {
      id: "asia-routes",
      title: "Asia migration routes refreshed",
      body: "New sanctuary and migration callouts are live for weekend play.",
      date: "2026-08-03",
      i18n: {
        ja: { title: "アジア移動ルート更新", body: "週末プレイ向けに、新しい聖域と移動ルートの案内を公開しました。" },
        ko: { title: "아시아 이동 루트 업데이트", body: "주말 플레이를 위한 새 성역과 이동 루트 안내가 적용되었습니다." },
        mn: { title: "Азийн migration route шинэчлэгдлээ", body: "Weekend тоглолтод зориулсан sanctuary болон migration callout шинэчлэгдсэн." }
      }
    },
    {
      id: "double-growth",
      title: "Double Growth Weekend",
      body: "Friday 20:00 JST through Monday 02:00 JST for verified Discord members.",
      date: "2026-08-07",
      i18n: {
        ja: { title: "成長2倍ウィークエンド", body: "Discord 認証済みメンバー向けに、金曜20:00 JSTから月曜02:00 JSTまで開催します。" },
        ko: { title: "성장 2배 주말", body: "Discord 인증 멤버 대상으로 금요일 20:00 JST부터 월요일 02:00 JST까지 진행됩니다." },
        mn: { title: "Double Growth Weekend", body: "Discord баталгаажсан гишүүдэд Баасан 20:00 JST-оос Даваа 02:00 JST хүртэл идэвхтэй." }
      }
    },
    {
      id: "moderator-applications",
      title: "Moderator applications open",
      body: "We are recruiting English-speaking staff for JP/KR/TW/HK/SG time zones.",
      date: "2026-08-10",
      i18n: {
        ja: { title: "モデレーター募集開始", body: "日本・韓国・台湾・香港・シンガポール時間帯をカバーできる英語対応スタッフを募集しています。" },
        ko: { title: "모더레이터 모집 시작", body: "JP/KR/TW/HK/SG 시간대를 지원할 수 있는 영어 가능 스태프를 모집합니다." },
        mn: { title: "Moderator бүртгэл нээгдлээ", body: "JP/KR/TW/HK/SG цагийн бүсэд ажиллах англи хэлтэй staff хайж байна." }
      }
    }
  ],
  newsCards: [
    {
      id: "host-upgrade",
      title: "Hong Kong host upgrade",
      excerpt: "Lower routing latency for Japan, Korea, Taiwan, and Singapore players.",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      order: 1,
      i18n: {
        ja: { title: "香港ホストを強化", excerpt: "日本、韓国、台湾、シンガポールのプレイヤー向けにルーティング遅延を低減します。" },
        ko: { title: "홍콩 호스트 업그레이드", excerpt: "일본, 한국, 대만, 싱가포르 플레이어의 라우팅 지연을 줄입니다." },
        mn: { title: "Hong Kong host upgrade", excerpt: "Япон, Солонгос, Тайвань, Сингапур тоглогчдын routing latency-г багасгана." }
      }
    },
    {
      id: "nest-week",
      title: "Nest week spotlight",
      excerpt: "Community nesting channels and helper groups are now available.",
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      order: 2,
      i18n: {
        ja: { title: "巣作り週間スポットライト", excerpt: "コミュニティの巣作りチャンネルとヘルパーグループが利用可能になりました。" },
        ko: { title: "둥지 주간 하이라이트", excerpt: "커뮤니티 둥지 채널과 헬퍼 그룹을 사용할 수 있습니다." },
        mn: { title: "Nest week онцлох мэдээ", excerpt: "Community nesting channel болон helper group ашиглах боломжтой боллоо." }
      }
    },
    {
      id: "tournament-ruleset",
      title: "Tournament ruleset",
      excerpt: "Structured PvP bracket rules are ready for public testing.",
      image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
      order: 3,
      i18n: {
        ja: { title: "トーナメントルールセット", excerpt: "PvP ブラケット用のルールが公開テストできる状態になりました。" },
        ko: { title: "토너먼트 규칙 세트", excerpt: "구조화된 PvP 브라켓 규칙이 공개 테스트 준비를 마쳤습니다." },
        mn: { title: "Tournament ruleset", excerpt: "PvP bracket-ийн дүрэм public test хийхэд бэлэн боллоо." }
      }
    }
  ],
  features: [
    {
      id: "routing",
      title: "Asia-first routing",
      description: "Hong Kong host, low-latency target, and regional play windows.",
      icon: "RadioTower",
      order: 1,
      i18n: {
        ja: { title: "アジア優先ルーティング", description: "香港ホスト、低遅延目標、地域ごとのプレイ時間帯に最適化します。" },
        ko: { title: "아시아 우선 라우팅", description: "홍콩 호스트, 낮은 지연 목표, 지역별 플레이 시간대에 맞춥니다." },
        mn: { title: "Asia-first routing", description: "Hong Kong host, бага latency зорилт, бүс нутгийн тоглох цагт тохируулсан." }
      }
    },
    {
      id: "moderation",
      title: "Active moderation",
      description: "English-speaking staff coverage across major Asia time zones.",
      icon: "Shield",
      order: 2,
      i18n: {
        ja: { title: "アクティブなモデレーション", description: "主要なアジア時間帯をカバーする英語対応スタッフがサポートします。" },
        ko: { title: "활발한 관리", description: "주요 아시아 시간대를 커버하는 영어 가능 스태프가 지원합니다." },
        mn: { title: "Идэвхтэй moderation", description: "Азийн гол цагийн бүсүүдэд англи хэлтэй staff ажиллана." }
      }
    },
    {
      id: "events",
      title: "Competitive events",
      description: "PvP tournaments, pack hunts, nesting events, and seasonal ladders.",
      icon: "Trophy",
      order: 3,
      i18n: {
        ja: { title: "競技イベント", description: "PvP トーナメント、群れ狩り、巣作りイベント、シーズンランキングを開催します。" },
        ko: { title: "경쟁 이벤트", description: "PvP 토너먼트, 무리 사냥, 둥지 이벤트, 시즌 래더를 운영합니다." },
        mn: { title: "Competitive event", description: "PvP tournament, pack hunt, nesting event, seasonal ladder зохион байгуулна." }
      }
    },
    {
      id: "progression",
      title: "Community progression",
      description: "Profiles, leaderboards, supporter roles, and staff-led onboarding.",
      icon: "Users",
      order: 4,
      i18n: {
        ja: { title: "コミュニティ進行", description: "プロフィール、ランキング、支援者ロール、スタッフによる案内を用意します。" },
        ko: { title: "커뮤니티 성장 시스템", description: "프로필, 리더보드, 후원자 역할, 스태프 온보딩을 제공합니다." },
        mn: { title: "Community progression", description: "Profile, leaderboard, supporter role, staff onboarding зэргийг ашиглана." }
      }
    }
  ],
  rules: [
    { id: "general", title: "General Rules", icon: "Shield", items: ["Respect all players and staff.", "Use English in global channels.", "No harassment, hate speech, or targeted griefing.", "Follow staff instructions during incidents."], order: 1 },
    { id: "pvp", title: "PvP Rules", icon: "Swords", items: ["No combat logging.", "No mix-packing outside approved event formats.", "No body denial or terrain abuse.", "Honor tournament-specific rules when active."], order: 2 },
    { id: "chat", title: "Chat Rules", icon: "Users", items: ["Keep global chat readable.", "No spam, slurs, political fights, or explicit content.", "Use report channels for disputes.", "Do not leak private tickets."], order: 3 },
    { id: "exploits", title: "Exploits", icon: "Skull", items: ["No map exploits, dupes, macro abuse, or third-party advantage tools.", "Report reproducible bugs privately.", "Do not teach exploit methods in public channels."], order: 4 },
    { id: "punishments", title: "Punishments", icon: "Crown", items: ["Warnings, mutes, kicks, temporary bans, or permanent bans may be applied.", "Appeals are reviewed through the official form.", "Repeat abuse escalates quickly."], order: 5 }
  ],
  dinosaurs,
  events: [
    { id: "weekly-herd-run", title: "Weekly Herd Run", type: "Weekly Event", when: "Every Wednesday 21:00 JST", icon: "CalendarDays", order: 1 },
    { id: "double-growth-weekend", title: "Double Growth Weekend", type: "Growth Boost", when: "Every approved community weekend", icon: "Sparkles", order: 2 },
    { id: "pvp-tournament", title: "PvP Tournament", type: "Competitive", when: "Monthly Sunday 20:00 JST", icon: "Swords", order: 3 }
  ],
  staff: [
    { id: "owner-taku", name: "Taku", role: "Owner", discord: "@taku", avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=Taku", order: 1 },
    { id: "admin-mina", name: "Mina", role: "Administrator", discord: "@mina.asia", avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=Mina", order: 2 },
    { id: "mod-joon", name: "Joon", role: "Moderator", discord: "@joon.kr", avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=Joon", order: 3 },
    { id: "helper-wei", name: "Wei", role: "Helper", discord: "@wei.tw", avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=Wei", order: 4 }
  ],
  mapMarkers: [
    { id: "delta-water", type: "water", name: "Delta Crossing", x: 22, y: 36, risk: "High", note: "Heavy predator traffic around shallow crossings.", order: 1 },
    { id: "north-water", type: "water", name: "Northern Falls", x: 67, y: 27, risk: "Medium", note: "Reliable water with cliff cover and ambush angles.", order: 2 },
    { id: "fern-nursery", type: "sanctuary", name: "Fern Nursery", x: 39, y: 53, risk: "Low", note: "Good early growth zone with nearby cover.", order: 3 },
    { id: "central-migration", type: "migration", name: "Central Migration", x: 61, y: 45, risk: "High", note: "Prime herd route and carnivore intercept lane.", order: 4 },
    { id: "east-spawn", type: "spawn", name: "Eastern Spawn", x: 76, y: 69, risk: "Low", note: "Starter route toward water and food.", order: 5 },
    { id: "highland-carcass", type: "food", name: "Highland Carcass", x: 49, y: 24, risk: "High", note: "Contested food source during peak hours.", order: 6 }
  ],
  gallery: [
    { id: "sanctuary-sunrise", type: "Screenshot", title: "Sanctuary sunrise", image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80", order: 1 },
    { id: "tournament-final", type: "Video", title: "Tournament final", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80", order: 2 },
    { id: "pack-emblem", type: "Community Creation", title: "Pack emblem", image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=80", order: 3 }
  ],
  donationRewards: [
    { id: "vip", title: "VIP", icon: "Crown", body: "Supporter profile badge and VIP Discord channel access.", order: 1 },
    { id: "cosmetics", title: "Cosmetic rewards", icon: "Gem", body: "Cosmetic-only recognition systems designed to avoid pay-to-win pressure.", order: 2 },
    { id: "priority-queue", title: "Priority Queue", icon: "Server", body: "Optional queue priority once payment APIs and server hooks are connected.", order: 3 }
  ],
  donationGoals: [
    { id: "monthly", label: "Monthly goal", current: 184, target: 300, currency: "$", description: "Hosting, moderation tools, analytics, event prizes, and community infrastructure." }
  ]
};

const siteText = {
  en: {
    heroBadge: "English-speaking Asia community",
    heroBody: "A premium Hong Kong hosted community for survival, PvP, nesting, events, and regional coordination across Japan, Mongolia, Korea, Hong Kong, Taiwan, Singapore, and Southeast Asia.",
    joinDiscord: "Join Discord",
    connectServer: "Connect Server",
    copyIp: "Copy IP",
    copied: "Copied"
  },
  ja: {
    heroBadge: "アジア向け英語コミュニティ",
    heroBody: "日本、モンゴル、韓国、香港、台湾、シンガポール、東南アジアのプレイヤーに向けた The Isle コミュニティサーバーです。",
    joinDiscord: "Discord に参加",
    connectServer: "サーバー接続",
    copyIp: "IPをコピー",
    copied: "コピー済み"
  },
  ko: {
    heroBadge: "아시아 영어 커뮤니티",
    heroBody: "일본, 몽골, 한국, 홍콩, 대만, 싱가포르, 동남아시아 플레이어를 위한 The Isle 커뮤니티 서버입니다.",
    joinDiscord: "Discord 참여",
    connectServer: "서버 접속",
    copyIp: "IP 복사",
    copied: "복사됨"
  },
  mn: {
    heroBadge: "Азийн англи хэлтэй community",
    heroBody: "Япон, Монгол, Солонгос, Хонконг, Тайвань, Сингапур болон Зүүн Өмнөд Азийн тоглогчдод зориулсан The Isle community server.",
    joinDiscord: "Discord-д нэгдэх",
    connectServer: "Серверт холбогдох",
    copyIp: "IP хуулах",
    copied: "Хуулсан"
  }
};

const batch = db.batch();

for (const [collection, documents] of Object.entries(content)) {
  for (const document of documents) {
    const { id, ...data } = document;
    const documentId = id || document.slug || document.name || document.title;
    batch.set(db.collection(collection).doc(String(documentId)), { ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
}

batch.set(db.collection("siteText").doc("main"), siteText, { merge: true });

await batch.commit();

console.log(`Seeded Firestore content collections in project ${projectId}.`);
