import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore, hasFirebaseAdminCredentials } from "@/lib/firebase/admin";
import { firebaseConfig } from "@/lib/firebase/config";
import { initialServerStatus, serverStatusSchema, type ServerStatusDocument } from "@/lib/firebase/server-status-shared";
export { formatServerAddress, initialServerStatus, serverStatusSchema, type ServerStatusDocument } from "@/lib/firebase/server-status-shared";

export const serverStatusCollection = "serverStatus";
export const serverStatusDocumentId = "main";

const initialStatusFallbackDelayMs = 700;
const staleServerNames = new Set(["TAKU's The Isle"]);

function parseTimestamp(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function parseFirestoreValue(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const field = value as Record<string, unknown>;

  if ("stringValue" in field) {
    return field.stringValue;
  }

  if ("integerValue" in field) {
    return Number(field.integerValue);
  }

  if ("doubleValue" in field) {
    return Number(field.doubleValue);
  }

  if ("timestampValue" in field) {
    return String(field.timestampValue);
  }

  return undefined;
}

function normalizeServerStatusData(data: Record<string, unknown>): Record<string, unknown> {
  const serverName = typeof data.serverName === "string" && staleServerNames.has(data.serverName) ? initialServerStatus.serverName : data.serverName;

  return {
    ...data,
    serverName,
    location: data.location ?? data.Location,
    port: data.port ?? data["port "],
    hostingProvider: data.hostingProvider ?? "BisectHosting"
  };
}

function getInitialServerStatus(): ServerStatusDocument {
  return {
    ...initialServerStatus,
    lastUpdated: null
  };
}

async function getServerStatusViaRest(): Promise<ServerStatusDocument | null> {
  const projectId = firebaseConfig.projectId ?? process.env.FIREBASE_PROJECT_ID;
  const apiKey = firebaseConfig.apiKey;

  if (!projectId || !apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${serverStatusCollection}/${serverStatusDocumentId}?key=${apiKey}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return null;
    }

    const document = (await response.json()) as { fields?: Record<string, unknown> };
    const data = Object.fromEntries(Object.entries(document.fields ?? {}).map(([key, value]) => [key, parseFirestoreValue(value)]));
    const normalizedData = normalizeServerStatusData(data);
    const parsed = serverStatusSchema.safeParse(normalizedData);

    if (!parsed.success) {
      return null;
    }

    return {
      ...parsed.data,
      lastUpdated: typeof normalizedData.lastUpdated === "string" ? normalizedData.lastUpdated : null
    };
  } catch {
    return null;
  }
}

export async function getServerStatusDocument(): Promise<ServerStatusDocument | null> {
  if (!hasFirebaseAdminCredentials()) {
    return getServerStatusViaRest();
  }

  try {
    const snapshot = await getAdminFirestore().collection(serverStatusCollection).doc(serverStatusDocumentId).get();

    if (!snapshot.exists) {
      return null;
    }

    const data = normalizeServerStatusData(snapshot.data() ?? {});
    const parsed = serverStatusSchema.safeParse(data);

    if (!parsed.success) {
      return null;
    }

    return {
      ...parsed.data,
      lastUpdated: parseTimestamp(data.lastUpdated)
    };
  } catch {
    return getServerStatusViaRest();
  }
}

export async function getServerStatusOrInitial(): Promise<ServerStatusDocument> {
  return (await getServerStatusDocument()) ?? getInitialServerStatus();
}

export async function getFastServerStatusOrInitial(): Promise<ServerStatusDocument> {
  return Promise.race([
    getServerStatusOrInitial(),
    new Promise<ServerStatusDocument>((resolve) => {
      setTimeout(() => resolve(getInitialServerStatus()), initialStatusFallbackDelayMs);
    })
  ]);
}

export async function seedServerStatusDocument() {
  await getAdminFirestore().collection(serverStatusCollection).doc(serverStatusDocumentId).set({
    ...initialServerStatus,
    lastUpdated: FieldValue.serverTimestamp()
  });
}

export async function updateServerStatusDocument(input: unknown) {
  const parsed = serverStatusSchema.parse(input);

  await getAdminFirestore().collection(serverStatusCollection).doc(serverStatusDocumentId).set(
    {
      ...parsed,
      lastUpdated: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return getServerStatusOrInitial();
}
