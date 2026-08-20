const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID ?? "1536921178931859476";

if (!token) {
  throw new Error("Set DISCORD_BOT_TOKEN before running this script.");
}

const apiBase = "https://discord.com/api/v10";

async function discord(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}

function cleanName(name) {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const categoryNames = new Map([
  ["start-here", "🌈 START HERE"],
  ["server-support", "🛟 SERVER SUPPORT"],
  ["the-isle-voice", "🎙 THE ISLE VOICE"],
  ["language-chat", "🌏 LANGUAGE CHAT"],
  ["community", "🦖 COMMUNITY"]
]);

const textChannels = new Map([
  ["welcome", { name: "👋・welcome", topic: "🇬🇧 Welcome / 🇲🇳 Тавтай морил / 🇯🇵 ようこそ / 🇰🇷 환영합니다" }],
  ["rules", { name: "📜・rules", topic: "🇬🇧 Rules / 🇲🇳 Дүрэм / 🇯🇵 ルール / 🇰🇷 규칙" }],
  ["announcements", { name: "📢・announcements", topic: "🇬🇧 News / 🇲🇳 Мэдээ / 🇯🇵 お知らせ / 🇰🇷 공지" }],
  ["server-status", { name: "🟢・server-status", topic: "🎮 ASIA JP,MNG,KR Test • 209.102.250.73:9075 • Singapore" }],
  ["how-to-join", { name: "🎮・how-to-join", topic: "🇬🇧 Join guide / 🇲🇳 Орох заавар / 🇯🇵 参加方法 / 🇰🇷 접속 방법" }],
  ["english-chat", { name: "🇬🇧・english-chat", topic: "English chat, pack finder, help, event calls" }],
  ["mongolian-chat", { name: "🇲🇳・mongolian-chat", topic: "Монгол чат, pack хайх, server/help мэдээлэл" }],
  ["japanese-chat", { name: "🇯🇵・japanese-chat", topic: "日本語チャット、質問、参加案内、イベント連絡" }],
  ["korean-chat", { name: "🇰🇷・korean-chat", topic: "한국어 채팅, 파티 모집, 질문, 서버 정보" }],
  ["general-chat", { name: "💬・general-chat", topic: "🇬🇧 General / 🇲🇳 Ерөнхий / 🇯🇵 雑談 / 🇰🇷 일반 채팅" }],
  ["jp-mng-kr-chat", { name: "🌏・jp-mng-kr-chat", topic: "🇲🇳 Монгол / 🇯🇵 日本語 / 🇰🇷 한국어 / 🇬🇧 English OK" }],
  ["screenshots", { name: "📷・screenshots", topic: "Screenshots / Зураг / スクショ / 스크린샷" }],
  ["clips-media", { name: "📸・clips-media", topic: "Screenshots, clips, wins, fails, and funny island moments" }],
  ["pack-recruitment", { name: "🤝・pack-recruitment", topic: "Find pack members / Баг хайх / 仲間募集 / 파티 모집" }],
  ["bug-report", { name: "🐞・bug-report", topic: "Bug report with screenshot/clip, Steam name, time, details" }],
  ["player-report", { name: "🚨・player-report", topic: "Player report with evidence. Keep it calm and clear." }],
  ["ban-appeal", { name: "📝・ban-appeal", topic: "Ban appeal / Appeal тайван бичих / 異議申し立て / 이의제기" }],
  ["admin-contact", { name: "📩・admin-contact", topic: "Important admin contact only / чухал admin холбоо" }]
]);

const voiceChannels = new Map([
  ["lobby", "🔊・Lobby"],
  ["pack-room-1", "🦕・Pack Room 1"],
  ["pack-room-2", "🦖・Pack Room 2"],
  ["event-voice", "🏁・Event Voice"],
  ["staff-voice", "🛡・Staff Voice"]
]);

async function patchChannel(channelId, body) {
  return discord(`/channels/${channelId}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

async function main() {
  const channels = await discord(`/guilds/${guildId}/channels`);
  const updates = [];

  for (const channel of channels) {
    const baseName = cleanName(channel.name);

    if (channel.type === 4 && categoryNames.has(baseName)) {
      const name = categoryNames.get(baseName);
      updates.push(patchChannel(channel.id, { name }));
      console.log(`Category: ${channel.name} -> ${name}`);
      continue;
    }

    if ((channel.type === 0 || channel.type === 5) && textChannels.has(baseName)) {
      const next = textChannels.get(baseName);
      updates.push(patchChannel(channel.id, next));
      console.log(`Text: ${channel.name} -> ${next.name}`);
      continue;
    }

    if (channel.type === 2 && voiceChannels.has(baseName)) {
      const name = voiceChannels.get(baseName);
      updates.push(patchChannel(channel.id, { name }));
      console.log(`Voice: ${channel.name} -> ${name}`);
    }
  }

  await Promise.all(updates);
  console.log(`Updated ${updates.length} Discord categories/channels with emoji names and four-language topics.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
