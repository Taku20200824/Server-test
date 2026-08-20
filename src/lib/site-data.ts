export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "ASIA JP,MNG,KR Test",
  discordUrl: process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/vmn3YjCZSE",
  serverIp: process.env.NEXT_PUBLIC_SERVER_IP || "209.102.250.73",
  serverPort: process.env.NEXT_PUBLIC_SERVER_PORT || "9075",
  location: process.env.NEXT_PUBLIC_SERVER_LOCATION || "Singapore",
};

export const features = [
  {
    title: "Asia Community",
    body: "English-speaking The Isle community for Japan, Mongolia, Korea, Hong Kong, Taiwan, Singapore, and Southeast Asia.",
  },
  {
    title: "Live Server Hub",
    body: "Firebase-ready server status, news, rules, leaderboard, events, and admin-managed content.",
  },
  {
    title: "Vercel Ready",
    body: "Next.js app router setup designed for fast production deployment from the main branch.",
  },
];

export const stats = [
  ["Region", "Asia"],
  ["Mode", "Evrima"],
  ["Map", "Gateway"],
  ["Players", "32 slots"],
];
