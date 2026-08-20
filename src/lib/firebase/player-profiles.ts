import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore, hasFirebaseAdminCredentials } from "@/lib/firebase/admin";
import { firebaseConfig } from "@/lib/firebase/config";
import { prisma } from "@/lib/prisma";

export type SteamPublicProfile = {
  steamId: string;
  personaName: string;
  avatarUrl: string;
  profileUrl: string;
  isFallback?: boolean;
};

export type PlayerProfile = SteamPublicProfile & {
  username: string;
  playtimeMinutes: number;
  playtimeSeconds: number;
  kills: number;
  deaths: number;
  growth: number;
  nest: number;
  favoriteDinosaur: string;
  rankScore: number;
  lastSeen: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type FirestoreDocument = {
  name?: string;
  fields?: Record<string, unknown>;
};

type PlaytimeSources = Record<string, number>;

function hasPostgresUrl() {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL);
}

function shouldUseVercelPlayerData() {
  return process.env.PLAYER_DATA_SOURCE !== "firebase" && hasPostgresUrl();
}

function parseFirestoreValue(value: unknown): unknown {
  if (!value || typeof value !== "object") return undefined;

  const field = value as Record<string, unknown>;
  if ("stringValue" in field) return field.stringValue;
  if ("integerValue" in field) return Number(field.integerValue);
  if ("doubleValue" in field) return Number(field.doubleValue);
  if ("timestampValue" in field) return String(field.timestampValue);
  if ("booleanValue" in field) return Boolean(field.booleanValue);

  return undefined;
}

function serializeTimestamp(value: unknown) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}

function parseDate(value: string | null) {
  return value ? new Date(value) : undefined;
}

function isFallbackPersonaName(value: unknown, steamId: string) {
  return String(value ?? "") === `Steam ${steamId.slice(-6)}`;
}

function toProfile(id: string, data: Record<string, unknown>): PlayerProfile {
  const steamId = String(data.steamId ?? id);
  const playtimeMinutes = Number(data.playtimeMinutes ?? 0);
  const playtimeSeconds = Number(data.playtimeSeconds ?? playtimeMinutes * 60);
  const kills = Number(data.kills ?? 0);
  const deaths = Number(data.deaths ?? 0);
  const growth = Number(data.growth ?? data.growthPercent ?? 0);
  const nest = Number(data.nest ?? data.nestSuccess ?? 0);
  const personaName = String(data.personaName ?? data.username ?? steamId);
  const username = String(data.username ?? data.personaName ?? steamId);

  return {
    steamId,
    personaName,
    username,
    avatarUrl: String(data.avatarUrl ?? data.avatar ?? ""),
    profileUrl: String(data.profileUrl ?? `https://steamcommunity.com/profiles/${steamId}`),
    isFallback: isFallbackPersonaName(personaName, steamId) || isFallbackPersonaName(username, steamId),
    playtimeMinutes,
    playtimeSeconds,
    kills,
    deaths,
    growth,
    nest,
    favoriteDinosaur: String(data.favoriteDinosaur ?? data.dinosaur ?? "Unknown"),
    rankScore: Number(data.rankScore ?? (playtimeSeconds / 3600) * 10 + kills * 25 + nest * 15 + growth - deaths * 5),
    lastSeen: serializeTimestamp(data.lastSeen),
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt)
  };
}

async function getCollectionViaRest(collection: string): Promise<PlayerProfile[]> {
  const projectId = firebaseConfig.projectId ?? process.env.FIREBASE_PROJECT_ID;
  const apiKey = firebaseConfig.apiKey;

  if (!projectId || !apiKey) return [];

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?key=${apiKey}`,
    { cache: "no-store" }
  );

  if (!response.ok) return [];

  const payload = (await response.json()) as { documents?: FirestoreDocument[] };
  return (payload.documents ?? []).map((document) => {
    const id = document.name?.split("/").pop() ?? "";
    const data = Object.fromEntries(Object.entries(document.fields ?? {}).map(([key, value]) => [key, parseFirestoreValue(value)]));
    return toProfile(id, data);
  });
}

async function getFirebasePlayerProfiles() {
  if (!hasFirebaseAdminCredentials()) {
    return getCollectionViaRest("playerProfiles");
  }

  try {
    const snapshot = await getAdminFirestore().collection("playerProfiles").get();
    return snapshot.docs.map((doc) => toProfile(doc.id, doc.data()));
  } catch {
    return getCollectionViaRest("playerProfiles");
  }
}

async function getFirebasePlayerProfile(steamId: string) {
  if (!hasFirebaseAdminCredentials()) {
    return (await getFirebasePlayerProfiles()).find((profile) => profile.steamId === steamId) ?? null;
  }

  const snapshot = await getAdminFirestore().collection("playerProfiles").doc(steamId).get();
  return snapshot.exists ? toProfile(snapshot.id, snapshot.data() ?? {}) : null;
}

async function getVercelPlayerProfiles() {
  const rows = await prisma.playerProfile.findMany();
  return rows.map((row) => toProfile(row.steamId, row as unknown as Record<string, unknown>));
}

async function getVercelPlayerProfile(steamId: string) {
  const row = await prisma.playerProfile.findUnique({ where: { steamId } });
  return row ? toProfile(row.steamId, row as unknown as Record<string, unknown>) : null;
}

function createFallbackSteamProfile(steamId: string): SteamPublicProfile {
  return {
    steamId,
    personaName: `Steam ${steamId.slice(-6)}`,
    avatarUrl: `https://api.dicebear.com/9.x/shapes/svg?seed=${steamId}`,
    profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
    isFallback: true
  };
}

function decodeXmlValue(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  const value = match?.[1] ?? match?.[2];

  return value
    ?.replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

async function fetchSteamProfileViaXml(steamId: string, fallback: SteamPublicProfile) {
  const response = await fetch(`https://steamcommunity.com/profiles/${steamId}?xml=1`, { cache: "no-store" });

  if (!response.ok) return fallback;

  const xml = await response.text();
  const personaName = decodeXmlValue(xml, "steamID");
  const avatarUrl = decodeXmlValue(xml, "avatarFull");
  const profileUrl = decodeXmlValue(xml, "steamID64") ? `https://steamcommunity.com/profiles/${steamId}` : fallback.profileUrl;

  if (!personaName && !avatarUrl) return fallback;

  return {
    steamId,
    personaName: personaName || fallback.personaName,
    avatarUrl: avatarUrl || fallback.avatarUrl,
    profileUrl,
    isFallback: false
  };
}

export async function fetchSteamPublicProfile(steamId: string): Promise<SteamPublicProfile> {
  const fallback = createFallbackSteamProfile(steamId);
  const apiKey = process.env.STEAM_WEB_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`,
        { cache: "no-store" }
      );

      if (response.ok) {
        const payload = (await response.json()) as {
          response?: { players?: Array<{ personaname?: string; avatarfull?: string; profileurl?: string }> };
        };
        const player = payload.response?.players?.[0];

        if (player?.personaname || player?.avatarfull) {
          return {
            steamId,
            personaName: player.personaname || fallback.personaName,
            avatarUrl: player.avatarfull || fallback.avatarUrl,
            profileUrl: player.profileurl || fallback.profileUrl,
            isFallback: false
          };
        }
      }
    } catch {
      // Fall through to the public XML profile endpoint below.
    }
  }

  try {
    return await fetchSteamProfileViaXml(steamId, fallback);
  } catch {
    return fallback;
  }
}

export async function getPlayerProfiles() {
  if (shouldUseVercelPlayerData()) {
    try {
      return await getVercelPlayerProfiles();
    } catch {
      return getFirebasePlayerProfiles();
    }
  }

  return getFirebasePlayerProfiles();
}

export async function getPlayerProfile(steamId: string) {
  if (shouldUseVercelPlayerData()) {
    try {
      return await getVercelPlayerProfile(steamId);
    } catch {
      return getFirebasePlayerProfile(steamId);
    }
  }

  return getFirebasePlayerProfile(steamId);
}

async function upsertVercelPlayerProfile(profile: SteamPublicProfile) {
  const previous = await getVercelPlayerProfile(profile.steamId);
  const hasRealPreviousName = previous && !previous.isFallback;
  const safeProfile = profile.isFallback && hasRealPreviousName
    ? {
        steamId: profile.steamId,
        personaName: previous.personaName,
        username: previous.username,
        avatarUrl: previous.avatarUrl,
        profileUrl: previous.profileUrl
      }
    : {
        steamId: profile.steamId,
        personaName: profile.personaName,
        username: profile.personaName,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl
      };

  await prisma.playerProfile.upsert({
    where: { steamId: profile.steamId },
    create: {
      ...safeProfile,
      favoriteDinosaur: "Unknown",
      lastSeen: new Date()
    },
    update: {
      ...safeProfile,
      lastSeen: new Date()
    }
  });

  return getVercelPlayerProfile(profile.steamId);
}

async function upsertFirebasePlayerProfile(profile: SteamPublicProfile) {
  if (!hasFirebaseAdminCredentials()) {
    return null;
  }

  const ref = getAdminFirestore().collection("playerProfiles").doc(profile.steamId);
  const snapshot = await ref.get();
  const previous = snapshot.exists ? toProfile(snapshot.id, snapshot.data() ?? {}) : null;
  const hasRealPreviousName = previous && !previous.isFallback;
  const safeProfile = profile.isFallback && hasRealPreviousName
    ? {
        steamId: profile.steamId,
        personaName: previous.personaName,
        username: previous.username,
        avatarUrl: previous.avatarUrl,
        profileUrl: previous.profileUrl,
        isFallback: false
      }
    : {
        ...profile,
        username: profile.personaName
      };

  await ref.set(
    {
      ...safeProfile,
      playtimeMinutes: FieldValue.increment(0),
      playtimeSeconds: FieldValue.increment(0),
      kills: FieldValue.increment(0),
      deaths: FieldValue.increment(0),
      growth: FieldValue.increment(0),
      nest: FieldValue.increment(0),
      favoriteDinosaur: snapshot.exists ? snapshot.data()?.favoriteDinosaur ?? "Unknown" : "Unknown",
      lastSeen: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      ...(snapshot.exists ? {} : { createdAt: FieldValue.serverTimestamp() })
    },
    { merge: true }
  );

  return getFirebasePlayerProfile(profile.steamId);
}

export async function upsertSteamPlayerProfile(profile: SteamPublicProfile) {
  if (shouldUseVercelPlayerData()) {
    try {
      return await upsertVercelPlayerProfile(profile);
    } catch {
      return upsertFirebasePlayerProfile(profile);
    }
  }

  return upsertFirebasePlayerProfile(profile);
}

export async function touchSteamPlayerSession(steamId: string, source = "website") {
  if (shouldUseVercelPlayerData()) {
    try {
      await prisma.playerSession.create({ data: { steamId, source } });
      await prisma.playerProfile.upsert({
        where: { steamId },
        create: { steamId, lastSeen: new Date() },
        update: { lastSeen: new Date() }
      });
      return true;
    } catch {
      // Fall back to Firebase below.
    }
  }

  if (!hasFirebaseAdminCredentials()) {
    return null;
  }

  const db = getAdminFirestore();
  const sessionRef = db.collection("playerSessions").doc(`${steamId}_${Date.now()}`);
  await sessionRef.set({ steamId, source, seenAt: FieldValue.serverTimestamp() });
  await db.collection("playerProfiles").doc(steamId).set(
    {
      steamId,
      lastSeen: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return true;
}

function normalizePlaytimeSources(value: unknown): PlaytimeSources {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, count]) => [key, Number(count) || 0])
  );
}

async function addVercelPlaytimeSeconds(steamId: string, seconds: number, source: string) {
  const safeSeconds = Math.max(0, Math.min(24 * 60 * 60, Math.floor(seconds)));
  const safeMinutes = safeSeconds / 60;
  const previous = await prisma.playerProfile.findUnique({
    where: { steamId },
    select: { playtimeSources: true }
  });
  const playtimeSources = normalizePlaytimeSources(previous?.playtimeSources);
  playtimeSources[source] = (playtimeSources[source] ?? 0) + safeSeconds;

  await prisma.playerProfile.upsert({
    where: { steamId },
    create: {
      steamId,
      playtimeMinutes: safeMinutes,
      playtimeSeconds: safeSeconds,
      playtimeSources,
      lastSeen: new Date()
    },
    update: {
      playtimeMinutes: { increment: safeMinutes },
      playtimeSeconds: { increment: safeSeconds },
      playtimeSources,
      lastSeen: new Date()
    }
  });

  return getVercelPlayerProfile(steamId);
}

async function addFirebasePlaytimeSeconds(steamId: string, seconds: number, source: string) {
  if (!hasFirebaseAdminCredentials()) {
    return null;
  }

  const safeSeconds = Math.max(0, Math.min(24 * 60 * 60, Math.floor(seconds)));
  const safeMinutes = safeSeconds / 60;
  const ref = getAdminFirestore().collection("playerProfiles").doc(steamId);
  await ref.set(
    {
      steamId,
      playtimeMinutes: FieldValue.increment(safeMinutes),
      playtimeSeconds: FieldValue.increment(safeSeconds),
      lastSeen: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      [`playtimeSources.${source}`]: FieldValue.increment(safeSeconds)
    },
    { merge: true }
  );

  return getFirebasePlayerProfile(steamId);
}

export async function addSteamPlaytimeSeconds(steamId: string, seconds: number, source = "server") {
  if (shouldUseVercelPlayerData()) {
    try {
      return await addVercelPlaytimeSeconds(steamId, seconds, source);
    } catch {
      return addFirebasePlaytimeSeconds(steamId, seconds, source);
    }
  }

  return addFirebasePlaytimeSeconds(steamId, seconds, source);
}

export async function addSteamPlaytimeMinutes(steamId: string, minutes: number, source = "server") {
  return addSteamPlaytimeSeconds(steamId, minutes * 60, source);
}

export async function ensureVercelPlayerDataTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PlayerProfile" (
      "steamId" TEXT PRIMARY KEY,
      "personaName" TEXT,
      "username" TEXT,
      "avatarUrl" TEXT,
      "profileUrl" TEXT,
      "playtimeMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "playtimeSeconds" INTEGER NOT NULL DEFAULT 0,
      "kills" INTEGER NOT NULL DEFAULT 0,
      "deaths" INTEGER NOT NULL DEFAULT 0,
      "growth" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "nest" INTEGER NOT NULL DEFAULT 0,
      "favoriteDinosaur" TEXT NOT NULL DEFAULT 'Unknown',
      "rankScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "lastSeen" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "playtimeSources" JSONB
    )
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PlayerProfile_rankScore_idx" ON "PlayerProfile" ("rankScore")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PlayerProfile_playtimeSeconds_idx" ON "PlayerProfile" ("playtimeSeconds")`);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PlayerSession" (
      "id" TEXT PRIMARY KEY,
      "steamId" TEXT NOT NULL,
      "source" TEXT NOT NULL,
      "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PlayerSession_steamId_idx" ON "PlayerSession" ("steamId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PlayerSession_seenAt_idx" ON "PlayerSession" ("seenAt")`);
}

export async function copyFirebaseProfilesToVercelDatabase() {
  await ensureVercelPlayerDataTables();
  const profiles = await getFirebasePlayerProfiles();

  for (const profile of profiles) {
    await prisma.playerProfile.upsert({
      where: { steamId: profile.steamId },
      create: {
        steamId: profile.steamId,
        personaName: profile.personaName,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl,
        playtimeMinutes: profile.playtimeMinutes,
        playtimeSeconds: profile.playtimeSeconds,
        kills: profile.kills,
        deaths: profile.deaths,
        growth: profile.growth,
        nest: profile.nest,
        favoriteDinosaur: profile.favoriteDinosaur,
        rankScore: profile.rankScore,
        lastSeen: parseDate(profile.lastSeen),
        createdAt: parseDate(profile.createdAt),
        updatedAt: parseDate(profile.updatedAt)
      },
      update: {
        personaName: profile.personaName,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl,
        playtimeMinutes: profile.playtimeMinutes,
        playtimeSeconds: profile.playtimeSeconds,
        kills: profile.kills,
        deaths: profile.deaths,
        growth: profile.growth,
        nest: profile.nest,
        favoriteDinosaur: profile.favoriteDinosaur,
        rankScore: profile.rankScore,
        lastSeen: parseDate(profile.lastSeen)
      }
    });
  }

  return profiles.length;
}
