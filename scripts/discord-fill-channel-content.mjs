const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID ?? "1536921178931859476";
const shouldPin = process.env.DISCORD_PIN_MESSAGES === "true";

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

function embed(color, title, description, fields = []) {
  return {
    color,
    title,
    description,
    fields,
    footer: { text: "THE ISLE ASIA • JP / MNG / KR / EN" }
  };
}

const channelPosts = new Map([
  ["welcome", {
    content: "👋🌈 **WELCOME / ТАВТАЙ МОРИЛ / ようこそ / 환영합니다**",
    embeds: [embed(0x2dd4bf, "🦖 THE ISLE ASIA-д тавтай морил!", "🇬🇧 Welcome to our Asia Evrima server.\n🇲🇳 ASIA серверт тавтай морил, хөгжилтэй тоглоё.\n🇯🇵 THE ISLE ASIAへようこそ。\n🇰🇷 THE ISLE ASIA에 오신 것을 환영합니다.", [
      { name: "🎮 Server", value: "ASIA JP,MNG,KR Test\n`209.102.250.73:9075`", inline: true },
      { name: "📌 Start", value: "Read #📜・rules, then open #🎮・how-to-join.", inline: true },
      { name: "💬 Languages", value: "English / Монгол / 日本語 / 한국어", inline: false }
    ])]
  }],
  ["how-to-join", {
    content: "🎮📌 **HOW TO JOIN / ОРОХ ЗААВАР / 参加方法 / 접속 방법**",
    embeds: [embed(0x22c55e, "🟢 Join ASIA JP,MNG,KR Test", "🇬🇧 Open The Isle Evrima, search by address, then join.\n🇲🇳 The Isle Evrima нээгээд address-аар хайж ороорой.\n🇯🇵 The Isle Evrimaでアドレス検索して参加してください。\n🇰🇷 The Isle Evrima에서 주소로 검색 후 접속하세요.", [
      { name: "🌐 Direct address", value: "`209.102.250.73:9075`", inline: true },
      { name: "📍 Region", value: "Singapore", inline: true },
      { name: "🔗 Live status", value: "https://the-isle.vercel.app/server", inline: false }
    ])]
  }],
  ["rules", {
    content: "📜✨ **RULES / ДҮРЭМ / ルール / 규칙**",
    embeds: [embed(0xf59e0b, "Keep it clean, fun, and fair", "1. Respect everyone. No harassment, racism, hate speech, or personal attacks.\n2. No cheats, exploits, macro abuse, or modified clients.\n3. No spam, scam, advertising, or NSFW content.\n4. Use proof for reports: screenshot/clip, Steam name, time.\n5. Voice chat must stay calm.\n6. Staff decisions can be appealed politely in #📝・ban-appeal.\n7. EN / MNG / JP / KR players are welcome.")]
  }],
  ["announcements", {
    content: "📢🌟 **NEWS / МЭДЭЭ / お知らせ / 공지**",
    embeds: [embed(0x60a5fa, "Official announcements", "Server updates, events, wipe notices, rule changes, and website news will be posted here.\n\n🇲🇳 Серверийн мэдээ, event, update энд орно.\n🇯🇵 サーバーのお知らせはこちら。\n🇰🇷 서버 공지는 여기에서 확인하세요.")]
  }],
  ["server-status", {
    content: "🟢📡 **SERVER STATUS / СЕРВЕР МЭДЭЭЛЭЛ / サーバー状態 / 서버 상태**",
    embeds: [embed(0x10b981, "ASIA JP,MNG,KR Test", "Address: `209.102.250.73:9075`\nLocation: Singapore\nWebsite: https://the-isle.vercel.app/server\n\nStatus changes from Firebase/site can be checked on the website.")]
  }],
  ["general-chat", {
    content: "💬🎉 **GENERAL CHAT / ЕРӨНХИЙ ЧАТ / 雑談 / 일반 채팅**",
    embeds: [embed(0xa78bfa, "Talk, ask, laugh", "Use this room for normal chat, quick questions, pack talk, and friendly island chaos. Keep it respectful and easy to read.")]
  }],
  ["jp-mng-kr-chat", {
    content: "🌏🗣️ **JP / MNG / KR / EN CHAT**",
    embeds: [embed(0xec4899, "4-language room", "🇲🇳 Монгол хэл OK\n🇯🇵 日本語 OK\n🇰🇷 한국어 OK\n🇬🇧 English OK\n\nHelp each other with joining, packs, events, and server questions.")]
  }],
  ["screenshots", {
    content: "📷🦕 **SCREENSHOTS / ЗУРАГ / スクショ / 스크린샷**",
    embeds: [embed(0x38bdf8, "Show your island moments", "Post clean screenshots, funny scenes, pack photos, beautiful views, and event memories. Keep spoilers and drama out.")]
  }],
  ["clips-media", {
    content: "🎥🔥 **CLIPS & MEDIA**",
    embeds: [embed(0xfb7185, "Wins, fails, hunts, escapes", "Drop short clips, highlights, funny moments, and clean media. If it involves a report, use #🚨・player-report instead.")]
  }],
  ["pack-recruitment", {
    content: "🤝🦖 **PACK RECRUITMENT / БАГ ХАЙХ / 仲間募集 / 파티 모집**",
    embeds: [embed(0x84cc16, "Find your pack", "Use this simple format:\n`Dino:`\n`Language:` EN / MNG / JP / KR\n`Play time:`\n`Voice:` Yes/No\n`Looking for:` Chill / Hunt / Event / New player help")]
  }],
  ["bug-report", {
    content: "🐞🛠️ **BUG REPORT / BUG МЭДЭЭЛЭХ / バグ報告 / 버그 제보**",
    embeds: [embed(0xef4444, "Make reports easy to fix", "Please include:\n• What happened\n• Screenshot or clip\n• Time/date\n• Your Steam name\n• Location or dino if useful")]
  }],
  ["player-report", {
    content: "🚨🧾 **PLAYER REPORT / ТОГЛОГЧ МЭДЭЭЛЭХ / プレイヤー報告 / 플레이어 신고**",
    embeds: [embed(0xdc2626, "Evidence first", "Use calm wording and include proof.\n• Player name / Steam name\n• What rule was broken\n• Screenshot/clip\n• Time/date\nNo public fighting in the channel.")]
  }],
  ["ban-appeal", {
    content: "📝⚖️ **BAN APPEAL / BAN APPEAL / 異議申し立て / 제재 이의제기**",
    embeds: [embed(0xf97316, "Appeal calmly", "Include your Steam name, ban time, what happened, and why you want review. Staff will check when available.")]
  }],
  ["admin-contact", {
    content: "📩🛡️ **ADMIN CONTACT / ADMIN ХОЛБОО / 管理者連絡 / 관리자 문의**",
    embeds: [embed(0x6366f1, "Important issues only", "Use this for urgent server matters, partnership questions, or private admin contact. For normal reports, use the report rooms.")]
  }]
]);

async function postMessage(channelId, payload) {
  return discord(`/channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

async function pinMessage(channelId, messageId) {
  return discord(`/channels/${channelId}/pins/${messageId}`, { method: "PUT" });
}

async function main() {
  const channels = await discord(`/guilds/${guildId}/channels`);
  let posted = 0;

  for (const channel of channels) {
    if (channel.type !== 0 && channel.type !== 5) continue;

    const baseName = cleanName(channel.name);
    const payload = channelPosts.get(baseName);
    if (!payload) continue;

    const message = await postMessage(channel.id, payload);
    posted += 1;
    console.log(`Posted intro in #${channel.name}`);

    if (shouldPin) {
      await pinMessage(channel.id, message.id);
      console.log(`Pinned intro in #${channel.name}`);
    }
  }

  console.log(`Done. Posted ${posted} organized Discord channel intro messages.`);
  if (!shouldPin) {
    console.log("Tip: set DISCORD_PIN_MESSAGES=true to pin messages if the bot has Manage Messages permission.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
