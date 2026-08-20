export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "IRIS Server-test",
  region: process.env.NEXT_PUBLIC_SYSTEM_REGION || "Japan",
  endpoint: process.env.NEXT_PUBLIC_SYSTEM_ENDPOINT || "IRIS / Laravel / Firestore",
};

export const serverStatusFallback = {
  serverName: site.name,
  status: "ready",
  ip: site.endpoint,
  port: "live",
  location: site.region,
  onlinePlayers: 0,
  maxPlayers: 3,
  map: "Employee registration",
  version: "Server-test",
};

export const features = [
  {
    title: "Employee Register",
    body: "Registration data is written to Firebase Firestore, matching the Server-test employee workflow.",
  },
  {
    title: "User Search",
    body: "User data is read from Firebase and filtered on the page for quick checks.",
  },
  {
    title: "Live Firebase Status",
    body: "The dashboard listens to Firestore serverStatus/main, so changes move live without a Vercel rebuild.",
  },
];

export const stats = [
  ["Project", "Server-test"],
  ["Core", "Register"],
  ["Search", "User data"],
  ["Firebase", "Separate"],
];
