import { firebaseConfig } from "@/lib/firebase/config";
import { locales, type Locale, type TranslationKey } from "@/lib/i18n";

export type SiteTextOverrides = Partial<Record<Locale, Partial<Record<TranslationKey, string>>>>;

const siteTextCollection = "siteText";
const siteTextDocumentId = "main";

const firebaseTextKeys: Record<string, TranslationKey> = {
  home: "nav.home",
  server: "nav.server",
  rules: "nav.rules",
  dinosaurs: "nav.dinosaurs",
  map: "nav.map",
  leaderboard: "nav.leaderboard",
  events: "nav.events",
  discord: "nav.discord",
  donate: "nav.donate",
  heroBadge: "hero.badge",
  heroBody: "hero.body",
  joinDiscord: "cta.joinDiscord",
  connectServer: "cta.connectServer",
  copyIp: "cta.copyIp",
  copied: "cta.copied",
  status: "status.status",
  players: "status.players",
  address: "status.address",
  location: "status.location",
  version: "status.version",
  mapLabel: "status.map",
  hosting: "status.hosting",
  lastUpdated: "status.lastUpdated",
  online: "status.online",
  offline: "status.offline",
  maintenance: "status.maintenance",
  notSynced: "status.notSynced",
  syncing: "status.syncing",
  liveRefresh: "status.liveRefresh"
};

function parseFirestoreValue(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const field = value as Record<string, unknown>;

  if ("stringValue" in field) {
    return field.stringValue;
  }

  if ("mapValue" in field) {
    const fields = (field.mapValue as { fields?: Record<string, unknown> }).fields ?? {};
    return Object.fromEntries(Object.entries(fields).map(([key, nestedValue]) => [key, parseFirestoreValue(nestedValue)]));
  }

  return undefined;
}

function normalizeLocaleText(value: unknown) {
  if (!value || typeof value !== "object") {
    return {};
  }

  const text = value as Record<string, unknown>;
  const normalized: Partial<Record<TranslationKey, string>> = {};

  for (const [key, rawValue] of Object.entries(text)) {
    if (typeof rawValue !== "string" || !rawValue.trim()) {
      continue;
    }

    const translationKey = firebaseTextKeys[key] ?? (key as TranslationKey);
    normalized[translationKey] = rawValue;
  }

  return normalized;
}

export async function getSiteTextOverrides(): Promise<SiteTextOverrides> {
  const projectId = firebaseConfig.projectId ?? process.env.FIREBASE_PROJECT_ID;
  const apiKey = firebaseConfig.apiKey;

  if (!projectId || !apiKey) {
    return {};
  }

  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${siteTextCollection}/${siteTextDocumentId}?key=${apiKey}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return {};
    }

    const document = (await response.json()) as { fields?: Record<string, unknown> };
    const data = Object.fromEntries(Object.entries(document.fields ?? {}).map(([key, value]) => [key, parseFirestoreValue(value)]));

    return Object.fromEntries(locales.map((locale) => [locale, normalizeLocaleText(data[locale])])) as SiteTextOverrides;
  } catch {
    return {};
  }
}
