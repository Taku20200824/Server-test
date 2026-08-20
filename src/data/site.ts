import {
  CalendarDays,
  Crown,
  RadioTower,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Trophy,
  Users
} from "lucide-react";

export const siteConfig = {
  name: "THE ISLE ASIA",
  description:
    "The largest English-speaking Asia community server for The Isle, built for Japan, Mongolia, Korea, Hong Kong, Taiwan, Singapore, and Southeast Asia.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://server-test-pi-eight.vercel.app",
  discordInvite: process.env.NEXT_PUBLIC_DISCORD_URL ?? process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "https://discord.gg/vmn3YjCZSE",
  discordGeneralChannel: "https://discord.com/channels/1536921178931859476/1536955772548681818",
  serverIp: process.env.NEXT_PUBLIC_SERVER_IP ?? "209.102.250.73",
  regions: ["Japan", "Mongolia", "Korea", "Hong Kong", "Taiwan", "Singapore", "Southeast Asia"]
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/server", label: "Server" },
  { href: "/rules", label: "Rules" },
  { href: "/dinosaurs", label: "Dinosaurs" },
  { href: "/map", label: "Map" },
  { href: "/voice", label: "Voice" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/events", label: "Events" },
  { href: "/discord", label: "Discord" },
  { href: "/donate", label: "Donate" }
];

export const serverStatus = {
  online: true,
  players: 83,
  maxPlayers: 100,
  ping: 36,
  location: "Hong Kong",
  version: "Evrima latest stable",
  ip: siteConfig.serverIp
};

export const announcements = [
  {
    title: "Asia migration routes refreshed",
    body: "New sanctuary and migration callouts are live for weekend play.",
    date: "2026-08-03"
  },
  {
    title: "Double Growth Weekend",
    body: "Friday 20:00 JST through Monday 02:00 JST for verified Discord members.",
    date: "2026-08-07"
  },
  {
    title: "Moderator applications open",
    body: "We are recruiting English-speaking staff for JP/KR/TW/HK/SG time zones.",
    date: "2026-08-10"
  }
];

export const newsCards = [
  {
    title: "Hong Kong host upgrade",
    excerpt: "Lower routing latency for Japan, Korea, Taiwan, and Singapore players.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Nest week spotlight",
    excerpt: "Community nesting channels and helper groups are now available.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Tournament ruleset",
    excerpt: "Structured PvP bracket rules are ready for public testing.",
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80"
  }
];

export const features = [
  { title: "Asia-first routing", description: "Hong Kong host, low-latency target, and regional play windows.", icon: RadioTower },
  { title: "Active moderation", description: "English-speaking staff coverage across major Asia time zones.", icon: Shield },
  { title: "Competitive events", description: "PvP tournaments, pack hunts, nesting events, and seasonal ladders.", icon: Trophy },
  { title: "Community progression", description: "Profiles, leaderboards, supporter roles, and staff-led onboarding.", icon: Users }
];

export const rules = [
  {
    title: "General Rules",
    icon: Shield,
    items: ["Respect all players and staff.", "Use English in global channels.", "No harassment, hate speech, or targeted griefing.", "Follow staff instructions during incidents."]
  },
  {
    title: "PvP Rules",
    icon: Swords,
    items: ["No combat logging.", "No mix-packing outside approved event formats.", "No body denial or terrain abuse.", "Honor tournament-specific rules when active."]
  },
  {
    title: "Chat Rules",
    icon: Users,
    items: ["Keep global chat readable.", "No spam, slurs, political fights, or explicit content.", "Use report channels for disputes.", "Do not leak private tickets."]
  },
  {
    title: "Exploits",
    icon: Skull,
    items: ["No map exploits, dupes, macro abuse, or third-party advantage tools.", "Report reproducible bugs privately.", "Do not teach exploit methods in public channels."]
  },
  {
    title: "Punishments",
    icon: Crown,
    items: ["Warnings, mutes, kicks, temporary bans, or permanent bans may be applied.", "Appeals are reviewed through the official form.", "Repeat abuse escalates quickly."]
  }
];

export const dinosaurs = [
  {
    slug: "carnotaurus",
    name: "Carnotaurus",
    diet: "Carnivore",
    growth: "2h 15m",
    strength: "Explosive speed and ambush pressure",
    weakness: "Poor turning and fragile in extended brawls",
    playstyle: "Scout open ground, isolate wounded targets, and disengage before packs can surround you.",
    image: "https://images.unsplash.com/photo-1525877442103-5ddb2089b2bb?auto=format&fit=crop&w=1200&q=80"
  },
  {
    slug: "ceratosaurus",
    name: "Ceratosaurus",
    diet: "Carnivore",
    growth: "2h 40m",
    strength: "High pressure, bleed tolerance, and corpse control",
    weakness: "Vulnerable to coordinated larger predators",
    playstyle: "Win through attrition, punish mistakes, and keep fights near food pressure."
  },
  {
    slug: "deinosuchus",
    name: "Deinosuchus",
    diet: "Carnivore",
    growth: "5h 30m",
    strength: "Water ambush dominance",
    weakness: "Slow land movement and predictable territory",
    playstyle: "Control crossings, remain patient, and let thirsty prey make the first mistake."
  },
  {
    slug: "dilophosaurus",
    name: "Dilophosaurus",
    diet: "Carnivore",
    growth: "1h 50m",
    strength: "Night pressure and venom disruption",
    weakness: "Weak in direct daylight trades",
    playstyle: "Hunt in pairs at night, create panic, and avoid clean face-tank fights."
  },
  {
    slug: "herrerasaurus",
    name: "Herrerasaurus",
    diet: "Carnivore",
    growth: "1h 20m",
    strength: "Climbing, scouting, and vertical ambush",
    weakness: "Low mass and risky failed leaps",
    playstyle: "Use trees and cliffs to gather intel, pick isolated prey, and escape vertically."
  },
  {
    slug: "omniraptor",
    name: "Omniraptor",
    diet: "Carnivore",
    growth: "1h 45m",
    strength: "Pack pounce and bleed stacking",
    weakness: "Low durability when caught",
    playstyle: "Coordinate pounces, rotate attackers, and keep stamina discipline."
  },
  {
    slug: "pteranodon",
    name: "Pteranodon",
    diet: "Piscivore",
    growth: "1h 05m",
    strength: "Flight, scouting, and safe repositioning",
    weakness: "Very fragile on the ground",
    playstyle: "Stay airborne, scout events, fish safely, and avoid low stamina landings."
  },
  {
    slug: "stegosaurus",
    name: "Stegosaurus",
    diet: "Herbivore",
    growth: "4h 30m",
    strength: "Area denial and tail damage",
    weakness: "Slow, loud, and stamina constrained",
    playstyle: "Hold terrain, protect herds, and punish overconfident predators."
  },
  {
    slug: "tenontosaurus",
    name: "Tenontosaurus",
    diet: "Herbivore",
    growth: "2h 25m",
    strength: "Agility, kicks, and defensive dueling",
    weakness: "Requires spacing precision",
    playstyle: "Bait lunges, kick through commits, and rotate with herd support."
  },
  {
    slug: "dryosaurus",
    name: "Dryosaurus",
    diet: "Herbivore",
    growth: "45m",
    strength: "Small profile and escape speed",
    weakness: "Minimal fighting power",
    playstyle: "Play alert, use cover, and focus on survival routes and nesting support."
  },
  {
    slug: "gallimimus",
    name: "Gallimimus",
    diet: "Herbivore",
    growth: "1h 30m",
    strength: "Speed, stamina, and scouting",
    weakness: "Limited damage and poor brawl value",
    playstyle: "Control information, escort herds, and never let predators dictate your path."
  },
  {
    slug: "beipiaosaurus",
    name: "Beipiaosaurus",
    diet: "Omnivore",
    growth: "1h 15m",
    strength: "Flexible water-edge survival",
    weakness: "Outclassed by specialists",
    playstyle: "Use mixed diet options, avoid apex routes, and survive through adaptability."
  },
  {
    slug: "hypsilophodon",
    name: "Hypsilophodon",
    diet: "Herbivore",
    growth: "40m",
    strength: "Tiny profile, agility, and defensive spit",
    weakness: "Almost no direct fighting power",
    playstyle: "Stay in dense cover, warn herds, blind pursuers, and survive through movement instead of combat.",
    role: "Scout herbivore",
    difficulty: "Beginner"
  },
  {
    slug: "pachycephalosaurus",
    name: "Pachycephalosaurus",
    diet: "Herbivore",
    growth: "2h 10m",
    strength: "Bone-breaking headbutt pressure",
    weakness: "Needs clean spacing and stamina control",
    playstyle: "Use terrain and timing to punish charges, fracture careless predators, and disengage before being surrounded.",
    role: "Disruptor",
    difficulty: "Intermediate"
  },
  {
    slug: "diabloceratops",
    name: "Diabloceratops",
    diet: "Herbivore",
    growth: "3h 15m",
    strength: "Compact bruiser with strong defensive trades",
    weakness: "Can be kited by faster coordinated predators",
    playstyle: "Hold herd edges, protect juveniles, and force predators into bad angles.",
    role: "Herd defender",
    difficulty: "Intermediate"
  },
  {
    slug: "maiasaura",
    name: "Maiasaura",
    diet: "Herbivore",
    growth: "3h 30m",
    strength: "Herd speed, stamina, and group survival",
    weakness: "Solo players are vulnerable when caught in open ground",
    playstyle: "Move with the herd, rotate through safe feeding zones, and avoid unnecessary fights.",
    role: "Herd runner",
    difficulty: "Beginner"
  },
  {
    slug: "troodon",
    name: "Troodon",
    diet: "Carnivore",
    growth: "1h 00m",
    strength: "Venom pounce and pack harassment",
    weakness: "Extremely fragile when isolated",
    playstyle: "Attack in coordinated waves, stack pressure, and leave before larger prey can pin you down.",
    role: "Pack venom hunter",
    difficulty: "Advanced"
  },
  {
    slug: "triceratops",
    name: "Triceratops",
    diet: "Herbivore",
    growth: "5h+",
    strength: "Apex herbivore tank with devastating frontal control",
    weakness: "Slow, loud, and a major target for organized carnivores",
    playstyle: "Anchor the herd, face threats directly, and avoid being split from support.",
    role: "Apex herbivore",
    difficulty: "Advanced",
    status: "Hordetesting / upcoming"
  },
  {
    slug: "tyrannosaurus",
    name: "Tyrannosaurus",
    diet: "Carnivore",
    growth: "6h+",
    strength: "Apex bite pressure and finishing power",
    weakness: "Slow acceleration and costly stamina mistakes",
    playstyle: "Control territory, force prey into bad routes, and commit only when the kill is realistic.",
    role: "Apex carnivore",
    difficulty: "Advanced",
    status: "Hordetesting / upcoming"
  },
  {
    slug: "allosaurus",
    name: "Allosaurus",
    diet: "Carnivore",
    growth: "3h+",
    strength: "Balanced mid-tier pressure, bleed, and mobility",
    weakness: "Can lose trades against specialists",
    playstyle: "Track wounded prey, pressure from angles, and use mobility instead of face-tanking.",
    role: "Mid carnivore",
    difficulty: "Intermediate",
    status: "Upcoming"
  },
  {
    slug: "baryonyx",
    name: "Baryonyx",
    diet: "Carnivore",
    growth: "3h+",
    strength: "Riverside ambush and fish-route control",
    weakness: "Less dominant away from water corridors",
    playstyle: "Patrol banks, punish thirsty prey, and retreat through water-side cover.",
    role: "Riverside predator",
    difficulty: "Intermediate",
    status: "Upcoming"
  },
  {
    slug: "kentrosaurus",
    name: "Kentrosaurus",
    diet: "Herbivore",
    growth: "2h+",
    strength: "Spike punishment and defensive spacing",
    weakness: "Needs careful positioning against packs",
    playstyle: "Punish close commits, guard tight paths, and move with larger herbivores.",
    role: "Defensive herbivore",
    difficulty: "Intermediate",
    status: "Upcoming"
  },
  {
    slug: "austroraptor",
    name: "Austroraptor",
    diet: "Carnivore",
    growth: "2h+",
    strength: "Speed, reach, and fish specialist routes",
    weakness: "Weak if forced into direct brawls",
    playstyle: "Skirmish around water and cover, pick isolated prey, and avoid long trades.",
    role: "Skirmisher",
    difficulty: "Intermediate",
    status: "Upcoming"
  }
];

export const mapMarkers = [
  { type: "Water", icon: "W", x: 18, y: 34, color: "bg-cyan-300" },
  { type: "Sanctuary", icon: "S", x: 38, y: 52, color: "bg-emerald-300" },
  { type: "Migration", icon: "M", x: 61, y: 43, color: "bg-amber-300" },
  { type: "Spawn", icon: "P", x: 76, y: 68, color: "bg-sky-300" },
  { type: "Food", icon: "F", x: 48, y: 23, color: "bg-rose-300" },
  { type: "Water", icon: "W", x: 70, y: 29, color: "bg-cyan-300" },
  { type: "Migration", icon: "M", x: 28, y: 72, color: "bg-amber-300" }
];

export const leaderboard = [
  { username: "ShinRex", playtime: 612, kills: 221, deaths: 38, growth: 98, nest: 31, dinosaur: "Carnotaurus" },
  { username: "MongolHerd", playtime: 588, kills: 74, deaths: 22, growth: 100, nest: 44, dinosaur: "Stegosaurus" },
  { username: "HKAmbush", playtime: 542, kills: 194, deaths: 41, growth: 91, nest: 18, dinosaur: "Deinosuchus" },
  { username: "TaipeiClaw", playtime: 497, kills: 163, deaths: 57, growth: 86, nest: 21, dinosaur: "Omniraptor" },
  { username: "SeoulScout", playtime: 451, kills: 66, deaths: 19, growth: 93, nest: 29, dinosaur: "Pteranodon" }
];

export const events = [
  { title: "Weekly Herd Run", type: "Weekly Event", when: "Every Wednesday 21:00 JST", icon: CalendarDays },
  { title: "Double Growth Weekend", type: "Growth Boost", when: "Aug 7-10, 2026", icon: Sparkles },
  { title: "PvP Tournament", type: "Competitive", when: "Aug 16, 2026 20:00 JST", icon: Swords }
];

export const staff = [
  { name: "Taku", role: "Owner", discord: "@taku", avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=Taku" },
  { name: "Mina", role: "Administrator", discord: "@mina.asia", avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=Mina" },
  { name: "Joon", role: "Moderator", discord: "@joon.kr", avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=Joon" },
  { name: "Wei", role: "Helper", discord: "@wei.tw", avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=Wei" }
];

export const adminModules = [
  "Players",
  "Announcements",
  "Events",
  "Ban List",
  "Reports",
  "Discord Integration",
  "News Editor",
  "Server Status"
];
