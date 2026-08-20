import { getServerStatusOrInitial, updateServerStatusDocument } from "@/lib/firebase/server-status";
import type { ServerStatusDocument } from "@/lib/firebase/server-status-shared";

type GameDigState = {
  name?: string;
  map?: string;
  maxplayers?: number;
  numplayers?: number;
  players?: unknown[];
  ping?: number;
  raw?: {
    lastUpdated?: string;
    version?: string;
    serverversion?: string;
  };
};

const defaultMaxQueryAgeSeconds = 180;
const liveQueryCacheMs = 15000;

let cachedLiveStatus: { value: ServerStatusDocument; expiresAt: number } | null = null;

type GameDigModule = {
  GameDig: {
    query(options: {
      type: "tie" | "theisle";
      host: string;
      port: number;
      socketTimeout?: number;
      attemptTimeout?: number;
      maxRetries?: number;
    }): Promise<GameDigState>;
  };
};

function normalizeHost(ip: string) {
  return ip.includes(":") ? ip.split(":")[0] : ip;
}

function getQueryPort(status: ServerStatusDocument) {
  const configuredPort = Number(process.env.SERVER_QUERY_PORT);

  if (Number.isInteger(configuredPort) && configuredPort > 0 && configuredPort <= 65535) {
    return configuredPort;
  }

  return status.port;
}

function getMaxQueryAgeMs() {
  const configuredSeconds = Number(process.env.SERVER_QUERY_MAX_AGE_SECONDS);

  if (Number.isFinite(configuredSeconds) && configuredSeconds > 0) {
    return configuredSeconds * 1000;
  }

  return defaultMaxQueryAgeSeconds * 1000;
}

function isFreshQuery(query: GameDigState) {
  if (!query.raw?.lastUpdated) {
    return true;
  }

  const updatedAt = new Date(query.raw.lastUpdated).getTime();

  if (Number.isNaN(updatedAt)) {
    return true;
  }

  return Date.now() - updatedAt <= getMaxQueryAgeMs();
}

function applyLiveQuery(status: ServerStatusDocument, query: GameDigState): ServerStatusDocument {
  if (!isFreshQuery(query)) {
    return status;
  }

  const playerCount = typeof query.numplayers === "number" ? query.numplayers : query.players?.length;

  return {
    ...status,
    serverName: query.name?.trim() || status.serverName,
    status: "online",
    onlinePlayers: typeof playerCount === "number" ? playerCount : status.onlinePlayers,
    maxPlayers: typeof query.maxplayers === "number" ? query.maxplayers : status.maxPlayers,
    map: query.map?.trim() || status.map,
    version: query.raw?.version || query.raw?.serverversion || status.version,
    lastUpdated: new Date().toISOString()
  };
}

function serializeServerStatus(status: ServerStatusDocument): ServerStatusDocument {
  return {
    ...status,
    lastUpdated: status.lastUpdated instanceof Date ? status.lastUpdated.toISOString() : status.lastUpdated
  };
}

async function queryTheIsleServer(status: ServerStatusDocument): Promise<ServerStatusDocument> {
  if (process.env.SERVER_QUERY_ENABLED === "false" || !status.ip) {
    return status;
  }

  if (cachedLiveStatus && cachedLiveStatus.expiresAt > Date.now()) {
    return cachedLiveStatus.value;
  }

  const host = normalizeHost(status.ip);
  const port = getQueryPort(status);

  try {
    const { GameDig } = (await import("gamedig")) as GameDigModule;
    const queryOptions = {
      host,
      port,
      socketTimeout: 900,
      attemptTimeout: 1400,
      maxRetries: 0
    };

    const query = await Promise.any([
      GameDig.query({ ...queryOptions, type: "tie" }),
      GameDig.query({ ...queryOptions, type: "theisle" })
    ]);
    const liveStatus = applyLiveQuery(status, query);
    cachedLiveStatus = { value: liveStatus, expiresAt: Date.now() + liveQueryCacheMs };

    return liveStatus;
  } catch {
    return status;
  }
}

export async function getLiveServerStatus() {
  return serializeServerStatus(await queryTheIsleServer(await getServerStatusOrInitial()));
}

export async function getServerStatus() {
  return getLiveServerStatus();
}

export async function syncServerStatusToFirebase() {
  const liveStatus = await getLiveServerStatus();
  const syncedStatus = await updateServerStatusDocument(liveStatus);

  return serializeServerStatus(syncedStatus);
}
