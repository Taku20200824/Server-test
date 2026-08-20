import { z } from "zod";

const defaultVoiceProvider = "ASIA JP,MNG,KR Test Voice (Mumble)";
const defaultVoicePluginUrl = "https://157-230-40-149.nip.io/downloads/ASIA-JP-MNG-KR-Test-Voice-Proximity-v0.1.zip";

export const serverStatusSchema = z.object({
  serverName: z.string().min(1).max(80),
  status: z.enum(["online", "offline", "maintenance"]),
  ip: z.string().max(120),
  port: z.coerce.number().int().min(1).max(65535),
  location: z.string().min(1).max(80),
  onlinePlayers: z.coerce.number().int().min(0),
  maxPlayers: z.coerce.number().int().min(1),
  version: z.string().min(1).max(80),
  map: z.string().min(1).max(80),
  discordUrl: z.string().max(240),
  discordServerId: z.string().max(40).default(""),
  voiceProvider: z.string().min(1).max(80).default(defaultVoiceProvider),
  voiceUrl: z.string().max(240).default("https://www.mumble.info/downloads/"),
  voiceHost: z.string().max(120).default("157.230.40.149"),
  voicePort: z.coerce.number().int().min(1).max(65535).default(64738),
  voiceChannel: z.string().min(1).max(120).default("Root"),
  voicePluginUrl: z.string().max(240).default(defaultVoicePluginUrl),
  voiceStatus: z.enum(["pending", "active", "offline"]).default("active"),
  description: z.string().min(1).max(700),
  hostingProvider: z.string().min(1).max(80)
});

export type ServerStatusDocument = z.infer<typeof serverStatusSchema> & {
  lastUpdated: Date | string | null;
};

export const initialServerStatus = {
  serverName: "ASIA JP,MNG,KR Test",
  status: "online",
  ip: "209.102.250.73",
  port: 9075,
  location: "Singapore",
  onlinePlayers: 0,
  maxPlayers: 32,
  version: "Evrima",
  map: "Gateway",
  discordUrl: "https://discord.gg/vmn3YjCZSE",
  discordServerId: "792269772473106452",
  voiceProvider: defaultVoiceProvider,
  voiceUrl: "https://www.mumble.info/downloads/",
  voiceHost: "157.230.40.149",
  voicePort: 64738,
  voiceChannel: "Root",
  voicePluginUrl: defaultVoicePluginUrl,
  voiceStatus: "active",
  description:
    "An English-speaking The Isle Asia community server for players from Japan, Mongolia, Korea, Hong Kong, Taiwan, Singapore, and Southeast Asia.",
  hostingProvider: "BisectHosting"
} satisfies z.infer<typeof serverStatusSchema>;

export function formatServerAddress(status: Pick<ServerStatusDocument, "ip" | "port">) {
  if (!status.ip) {
    return `IP pending:${status.port}`;
  }

  return status.ip.includes(":") ? status.ip : `${status.ip}:${status.port}`;
}
