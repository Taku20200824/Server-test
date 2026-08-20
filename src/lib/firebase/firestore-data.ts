import {
  announcements as fallbackAnnouncements,
  dinosaurs as fallbackDinosaurs,
  events as fallbackEvents,
  features as fallbackFeatures,
  leaderboard as fallbackLeaderboard,
  mapMarkers as fallbackMapMarkers,
  newsCards as fallbackNewsCards,
  rules as fallbackRules,
  staff as fallbackStaff
} from "@/data/site";
import { firebaseConfig } from "@/lib/firebase/config";
import { getAdminFirestore, hasFirebaseAdminCredentials } from "@/lib/firebase/admin";
import { getPlayerProfiles } from "@/lib/firebase/player-profiles";

const fallbackGallery = [
  { type: "Screenshot", title: "Sanctuary sunrise", image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80" },
  { type: "Video", title: "Tournament final", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80" },
  { type: "Community Creation", title: "Pack emblem", image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=80" }
];

const fallbackDonationRewards = [
  { title: "VIP", icon: "Crown", body: "Supporter profile badge and VIP Discord channel access." },
  { title: "Cosmetic rewards", icon: "Gem", body: "Cosmetic-only recognition systems designed to avoid pay-to-win pressure." },
  { title: "Priority Queue", icon: "Server", body: "Optional queue priority once payment APIs and server hooks are connected." }
];

const fallbackDonationGoal = {
  label: "Monthly goal",
  current: 184,
  target: 300,
  currency: "$",
  description: "Hosting, moderation tools, analytics, event prizes, and community infrastructure."
};

export type ScoreRecord = {
  username: string;
  playtime?: number;
  playtimeHours?: number;
  kills?: number;
  deaths?: number;
  growth?: number;
  growthPercent?: number;
  nest?: number;
  nestSuccess?: number;
  dinosaur?: string;
  favoriteDinosaur?: string;
  discord?: string;
  avatar?: string;
};

export type DinosaurRecord = {
  slug: string;
  name: string;
  diet: string;
  growth: string;
  strength: string;
  weakness: string;
  playstyle: string;
  image: string;
  tier: string;
  role: string;
  difficulty: string;
  status: string;
  category: string;
  scientificName: string;
  summary: string;
  sourceUrl: string;
  i18n: Record<string, Partial<Omit<DinosaurRecord, "i18n">>>;
};

type FirestoreDocument = {
  name?: string;
  fields?: Record<string, unknown>;
};

function parseFirestoreValue(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const field = value as Record<string, unknown>;

  if ("stringValue" in field) return field.stringValue;
  if ("integerValue" in field) return Number(field.integerValue);
  if ("doubleValue" in field) return Number(field.doubleValue);
  if ("booleanValue" in field) return Boolean(field.booleanValue);
  if ("timestampValue" in field) return String(field.timestampValue);

  if ("arrayValue" in field) {
    const values = (field.arrayValue as { values?: unknown[] }).values ?? [];
    return values.map(parseFirestoreValue);
  }

  if ("mapValue" in field) {
    const fields = (field.mapValue as { fields?: Record<string, unknown> }).fields ?? {};
    return Object.fromEntries(Object.entries(fields).map(([key, nestedValue]) => [key, parseFirestoreValue(nestedValue)]));
  }

  return undefined;
}

function documentId(document: FirestoreDocument) {
  return document.name?.split("/").pop() ?? "";
}

async function getCollectionViaRest(collection: string): Promise<Record<string, unknown>[]> {
  const projectId = firebaseConfig.projectId ?? process.env.FIREBASE_PROJECT_ID;
  const apiKey = firebaseConfig.apiKey;

  if (!projectId || !apiKey) {
    return [];
  }

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?key=${apiKey}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { documents?: FirestoreDocument[] };

  return (payload.documents ?? []).map((document) => ({
    id: documentId(document),
    ...Object.fromEntries(Object.entries(document.fields ?? {}).map(([key, value]) => [key, parseFirestoreValue(value)]))
  }));
}

async function getCollection(collection: string): Promise<Record<string, unknown>[]> {
  if (hasFirebaseAdminCredentials()) {
    try {
      const snapshot = await getAdminFirestore().collection(collection).get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch {
      return getCollectionViaRest(collection);
    }
  }

  try {
    return await getCollectionViaRest(collection);
  } catch {
    return [];
  }
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function sortByNumber<T extends Record<string, unknown>>(items: T[], field: string, direction: "asc" | "desc" = "asc") {
  return [...items].sort((a, b) => {
    const first = Number(a[field] ?? 0);
    const second = Number(b[field] ?? 0);
    return direction === "asc" ? first - second : second - first;
  });
}

function scoreRank(player: { playtime: number; kills: number; deaths: number; growth: number; nest: number }) {
  return player.playtime * 10 + player.kills * 25 + player.nest * 15 + player.growth - player.deaths * 5;
}

function toDinosaurRecord(data: Record<string, unknown>): DinosaurRecord {
  return {
    slug: String(data.slug ?? data.id),
    name: String(data.name ?? data.id),
    diet: String(data.diet ?? "Unknown"),
    growth: String(data.growth ?? data.growthTime ?? "Unknown"),
    strength: String(data.strength ?? ""),
    weakness: String(data.weakness ?? ""),
    playstyle: String(data.playstyle ?? data.recommendedPlaystyle ?? ""),
    image: String(data.image ?? data.imageUrl ?? ""),
    tier: String(data.tier ?? ""),
    role: String(data.role ?? ""),
    difficulty: String(data.difficulty ?? ""),
    status: String(data.status ?? "Playable"),
    category: String(data.category ?? data.tier ?? data.role ?? ""),
    scientificName: String(data.scientificName ?? ""),
    summary: String(data.summary ?? ""),
    sourceUrl: String(data.sourceUrl ?? ""),
    i18n: data.i18n && typeof data.i18n === "object" ? (data.i18n as DinosaurRecord["i18n"]) : {}
  };
}

export async function getFirestoreAnnouncements() {
  const rows = await getCollection("announcements");

  if (!rows.length) {
    return fallbackAnnouncements;
  }

  return rows
    .map((data) => ({
      title: String(data.title ?? data.id),
      body: String(data.body ?? data.description ?? ""),
      date: String(data.date ?? data.createdAt ?? ""),
      i18n: data.i18n && typeof data.i18n === "object" ? data.i18n : {}
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);
}

export async function getFirestoreNewsCards() {
  const rows = await getCollection("newsCards");

  if (!rows.length) {
    return fallbackNewsCards;
  }

  return sortByNumber(rows, "order").map((data) => ({
    title: String(data.title ?? data.id),
    excerpt: String(data.excerpt ?? data.body ?? ""),
    image: String(data.image ?? data.imageUrl ?? ""),
    i18n: data.i18n && typeof data.i18n === "object" ? data.i18n : {}
  }));
}

export async function getFirestoreFeatures() {
  const rows = await getCollection("features");

  if (!rows.length) {
    return fallbackFeatures.map((feature, index) => ({
      title: feature.title,
      description: feature.description,
      icon: ["RadioTower", "Shield", "Trophy", "Users"][index] ?? "RadioTower",
      i18n: {}
    }));
  }

  return sortByNumber(rows, "order").map((data) => ({
    title: String(data.title ?? data.id),
    description: String(data.description ?? data.body ?? ""),
    icon: String(data.icon ?? "RadioTower"),
    i18n: data.i18n && typeof data.i18n === "object" ? data.i18n : {}
  }));
}

export async function getFirestoreRules() {
  const rows = await getCollection("rules");

  if (!rows.length) {
    return fallbackRules;
  }

  return sortByNumber(rows, "order").map((data) => ({
    title: String(data.title ?? data.id),
    icon: String(data.icon ?? "Shield"),
    items: toStringArray(data.items)
  }));
}

export async function getFirestoreDinosaurs() {
  const rows = await getCollection("dinosaurs");

  if (!rows.length) {
    return fallbackDinosaurs.map((dinosaur) => toDinosaurRecord(dinosaur as Record<string, unknown>));
  }

  return sortByNumber(rows, "order").map(toDinosaurRecord);
}

export async function getFirestoreDinosaur(slug: string) {
  const dinosaurs = await getFirestoreDinosaurs();
  return dinosaurs.find((item) => item.slug === slug);
}

export async function getFirestoreLeaderboard() {
  const rows = await getCollection("scores");
  const scorePlayers = rows.length
    ? rows.map((data) => {
        const playtime = Number(data.playtime ?? data.playtimeHours ?? 0);
        return {
          username: String(data.username ?? data.name ?? data.id),
          playtime,
          playtimeSeconds: Number(data.playtimeSeconds ?? playtime * 3600),
          kills: Number(data.kills ?? 0),
          deaths: Number(data.deaths ?? 0),
          growth: Number(data.growth ?? data.growthPercent ?? 0),
          nest: Number(data.nest ?? data.nestSuccess ?? 0),
          dinosaur: String(data.dinosaur ?? data.favoriteDinosaur ?? "Unknown"),
          discord: String(data.discord ?? ""),
          avatar: String(data.avatar ?? ""),
          steamId: String(data.steamId ?? "")
        };
      })
    : fallbackLeaderboard.map((player) => ({ ...player, playtimeSeconds: Number(player.playtime ?? 0) * 3600, discord: "", avatar: "", steamId: "" }));

  const steamPlayers = (await getPlayerProfiles()).map((profile) => ({
    username: profile.username || profile.personaName,
    playtime: profile.playtimeSeconds / 3600,
    playtimeSeconds: profile.playtimeSeconds,
    kills: profile.kills,
    deaths: profile.deaths,
    growth: profile.growth,
    nest: profile.nest,
    dinosaur: profile.favoriteDinosaur,
    discord: profile.profileUrl,
    avatar: profile.avatarUrl,
    steamId: profile.steamId
  }));

  const merged = new Map<string, (typeof scorePlayers)[number]>();

  for (const player of [...scorePlayers, ...steamPlayers]) {
    const key = player.steamId || player.username.toLowerCase();
    const existing = merged.get(key);

    if (!existing || scoreRank(player) > scoreRank(existing)) {
      merged.set(key, player);
    }
  }

  return [...merged.values()]
    .sort((a, b) => scoreRank(b) - scoreRank(a))
    .slice(0, 25);
}

export async function getFirestorePlayer(username: string) {
  const players = await getFirestoreLeaderboard();
  return players.find((item) => item.username.toLowerCase() === username.toLowerCase() || item.steamId === username);
}

export async function getFirestoreEvents() {
  const rows = await getCollection("events");

  if (!rows.length) {
    return fallbackEvents;
  }

  return sortByNumber(rows, "order").map((data) => ({
    title: String(data.title ?? data.id),
    type: String(data.type ?? "Community Event"),
    when: String(data.when ?? data.date ?? ""),
    icon: String(data.icon ?? "CalendarDays")
  }));
}

export async function getFirestoreStaff() {
  const rows = await getCollection("staff");

  if (!rows.length) {
    return fallbackStaff;
  }

  return sortByNumber(rows, "order").map((data) => ({
    name: String(data.name ?? data.id),
    role: String(data.role ?? "Staff"),
    discord: String(data.discord ?? ""),
    avatar: String(data.avatar ?? "")
  }));
}

export async function getFirestoreMapMarkers() {
  const rows = await getCollection("mapMarkers");

  if (!rows.length) {
    return fallbackMapMarkers.map((marker, index) => ({
      id: `${marker.type}-${index}`,
      type: marker.type.toLowerCase(),
      name: marker.type,
      x: marker.x,
      y: marker.y,
      risk: "Medium",
      note: `${marker.type} marker managed from fallback data. Add mapMarkers documents in Firebase to override it.`
    }));
  }

  return sortByNumber(rows, "order").map((data) => ({
    id: String(data.id ?? data.slug ?? data.name),
    type: String(data.type ?? "water"),
    name: String(data.name ?? data.id),
    x: Number(data.x ?? 50),
    y: Number(data.y ?? "50"),
    risk: String(data.risk ?? "Medium"),
    note: String(data.note ?? data.description ?? "")
  }));
}

export async function getFirestoreGallery() {
  const rows = await getCollection("gallery");

  if (!rows.length) {
    return fallbackGallery;
  }

  return sortByNumber(rows, "order").map((data) => ({
    type: String(data.type ?? "Screenshot"),
    title: String(data.title ?? data.id),
    image: String(data.image ?? data.imageUrl ?? "")
  }));
}

export async function getFirestoreDonationRewards() {
  const rows = await getCollection("donationRewards");

  if (!rows.length) {
    return fallbackDonationRewards;
  }

  return sortByNumber(rows, "order").map((data) => ({
    title: String(data.title ?? data.id),
    icon: String(data.icon ?? "Crown"),
    body: String(data.body ?? data.description ?? "")
  }));
}

export async function getFirestoreDonationGoal() {
  const rows = await getCollection("donationGoals");
  const data = rows[0];

  if (!data) {
    return fallbackDonationGoal;
  }

  return {
    label: String(data.label ?? "Monthly goal"),
    current: Number(data.current ?? 0),
    target: Number(data.target ?? 1),
    currency: String(data.currency ?? "$"),
    description: String(data.description ?? "")
  };
}
