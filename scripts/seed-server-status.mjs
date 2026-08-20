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

await getFirestore().collection("serverStatus").doc("main").set({
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
  voiceProvider: "ASIA JP,MNG,KR Test Voice (Mumble)",
  voiceUrl: "https://www.mumble.info/downloads/",
  voiceHost: "157.230.40.149",
  voicePort: 64738,
  voiceChannel: "Root",
  voicePluginUrl: "https://157-230-40-149.nip.io/downloads/ASIA-JP-MNG-KR-Test-Voice-Proximity-v0.1.zip",
  voiceStatus: "active",
  description:
    "An English-speaking The Isle Asia community server for players from Japan, Mongolia, Korea, Hong Kong, Taiwan, Singapore, and Southeast Asia.",
  hostingProvider: "BisectHosting",
  lastUpdated: FieldValue.serverTimestamp()
});

console.log("Seeded Firestore document: serverStatus/main");
