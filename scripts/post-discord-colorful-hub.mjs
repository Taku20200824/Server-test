const token = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID ?? "1536955046162333699";

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

async function send(payload) {
  return discord(`/channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

const messages = [
  {
    content:
      "╭── 🌈🦖 **THE ISLE ASIA HUB** 🦖🌈 ──╮\n" +
      "🇬🇧 EN • 🇲🇳 MNG • 🇯🇵 JP • 🇰🇷 KR players welcome ✨\n" +
      "🎮 Server info • 📜 Rules • 🎙 Voice • 🤝 Packs • 📸 Clips • 😂 Funny moments\n" +
      "╰──────────────────────────────╯",
    embeds: [
      {
        title: "🟢🦕 ASIA JP,MNG,KR Test",
        description:
          "🇬🇧 Bright Asia community for The Isle players. Be friendly, read info, join the island, enjoy the chaos.\n\n🇲🇳 The Isle Asia community server. Найрсаг байж, дүрмээ уншаад, server-т орцгооё.\n\n🇯🇵 The Isle Asia コミュニティです。ルールを読んで、明るく楽しく参加してください。\n\n🇰🇷 The Isle Asia 커뮤니티 서버입니다. 규칙을 읽고, 친절하게 즐겨 주세요。\n\n🛰 **Server:** `209.102.250.73:9075`\n🌏 **Region:** Singapore\n🌐 **Website:** https://the-isle.vercel.app/discord\n💬 **Channel:** https://discord.com/channels/1536921178931859476/1536955046162333699",
        color: 0x22d3ee,
        fields: [
          { name: "🦖🤝 Pack / Баг / 仲間 / 파티", value: "Find friends, join events, and survive together.", inline: true },
          { name: "🎙⚡ Voice / Дуу / ボイス / 보이스", value: "Use voice rooms for hunts, events, and support.", inline: true },
          { name: "📸🎬 Media / Clip / クリップ / 영상", value: "Share screenshots, clips, wins, fails, and funny moments.", inline: true }
        ],
        footer: { text: "THE ISLE ASIA • EN/MNG/JP/KR • colorful, useful, friendly" }
      }
    ]
  },
  {
    content:
      "╭── 📜🛡 **THE ISLE ASIA RULES** 🛡📜 ──╮\n" +
      "🇬🇧 Read first • 🇲🇳 Эхлээд унш • 🇯🇵 最初に読んで • 🇰🇷 먼저 읽기\n" +
      "✨ Friendly server. 🎮 Fair play. 🚫 No drama. 🦖 Have fun.\n" +
      "╰──────────────────────────────╯",
    embeds: [
      {
        title: "🇬🇧 English Rules",
        description:
          "1️⃣🤝 Respect all players and staff. No harassment, racism, hate speech, or personal attacks.\n2️⃣🎮 No cheating, exploits, macro abuse, combat logging, or modified clients.\n3️⃣🚫 No spam, scams, NSFW, suspicious links, or advertising.\n4️⃣📸 Reports need screenshots/clips, Steam name, time, and clear details.\n5️⃣🎙 Do not abuse voice chat or disturb other players.\n6️⃣🛡 Staff decisions can be appealed calmly in the right channel.",
        color: 0x22d3ee
      },
      {
        title: "🇲🇳 Монгол дүрэм",
        description:
          "1️⃣🤝 Бүх тоглогч, staff-ыг хүндэл. Доромжлол, racism, hate speech, personal attack хориотой.\n2️⃣🎮 Cheat, exploit, macro, combat log, modified client ашиглахгүй.\n3️⃣🚫 Spam, scam, NSFW, сэжигтэй link, зөвшөөрөлгүй advertise хийхгүй.\n4️⃣📸 Report хийхдээ screenshot/clip, Steam name, цаг, тайлбараа тодорхой өг.\n5️⃣🎙 Voice chat-аа зөв ашигла, бусдад саад болохгүй.\n6️⃣🛡 Staff шийдвэрийг тайван appeal хийж болно.",
        color: 0xfacc15
      },
      {
        title: "🇯🇵 日本語ルール",
        description:
          "1️⃣🤝 全プレイヤーとスタッフを尊重してください。暴言、差別、ヘイト、個人攻撃は禁止です。\n2️⃣🎮 チート、悪用、マクロ、combat log、改造クライアントは禁止です。\n3️⃣🚫 スパム、詐欺、NSFW、不審なリンク、無許可の宣伝は禁止です。\n4️⃣📸 通報にはスクショ/動画、Steam名、時間、説明を入れてください。\n5️⃣🎙 ボイスチャットの迷惑行為は禁止です。\n6️⃣🛡 スタッフ判断への異議申し立ては落ち着いて専用チャンネルで行ってください。",
        color: 0xf472b6
      },
      {
        title: "🇰🇷 한국어 규칙",
        description:
          "1️⃣🤝 모든 플레이어와 스태프를 존중하세요. 괴롭힘, 차별, 혐오 발언, 인신공격은 금지입니다.\n2️⃣🎮 치트, 악용, 매크로, combat log, 변조 클라이언트는 금지입니다.\n3️⃣🚫 스팸, 사기, NSFW, 수상한 링크, 무단 광고는 금지입니다.\n4️⃣📸 신고에는 스크린샷/영상, Steam 이름, 시간, 설명을 포함하세요.\n5️⃣🎙 보이스 채팅을 악용하거나 다른 플레이어를 방해하지 마세요.\n6️⃣🛡 스태프 결정은 전용 채널에서 차분하게 이의제기할 수 있습니다.",
        color: 0xa78bfa
      }
    ]
  },
  {
    content: "🌏💬 **LANGUAGE ROOMS / ХЭЛНИЙ ӨРӨӨ / 言語チャンネル / 언어 채널** 💬🌏",
    embeds: [
      {
        title: "🇬🇧 🇲🇳 🇯🇵 🇰🇷 Choose your language room",
        description:
          "🇬🇧 **English** — global chat, help, event calls, pack finder.\n🇲🇳 **Монгол** — Монгол тоглогчдын чат, pack хайх, тусламж авах.\n🇯🇵 **日本語** — 日本語の案内、質問、雑談、イベント連絡。\n🇰🇷 **한국어** — 한국어 안내, 파티 모집, 질문, 서버 정보.\n\n✨ New players, solo players, quiet players, loud players — all welcome.",
        color: 0xa78bfa,
        fields: [
          { name: "✨🌈 Mood", value: "Friendly • colorful • useful • funny • no heavy drama", inline: true },
          { name: "📌🚀 First step", value: "Read rules → check status → join game → try not to become lunch.", inline: true },
          { name: "🤝🦕 Pack finder", value: "Use language rooms to find teammates and event buddies.", inline: false }
        ]
      }
    ]
  },
  {
    content: "🟢📡 **SERVER STATUS / SERVER МЭДЭЭ / サーバー情報 / 서버 정보** 📡🟢",
    embeds: [
      {
        title: "🎮🦖 Jump Into The Island",
        description:
          "🇬🇧 Pin this if players ask: server name, IP, where to join.\n🇲🇳 Server name/IP асуувал энэ post-г харуул.\n🇯🇵 サーバー名、IP、参加方法はここで確認できます。\n🇰🇷 서버 이름, IP, 접속 방법은 여기서 확인하세요.\n\n🏷 **Name:** ASIA JP,MNG,KR Test\n🛰 **Address:** `209.102.250.73:9075`\n📍 **Location:** Singapore\n📊 **Live status:** https://the-isle.vercel.app/server",
        color: 0x34d399,
        fields: [
          { name: "🎮🔎 How to join", value: "Open The Isle Evrima → search server name → join → survive.", inline: false },
          { name: "⚡📊 Live info", value: "Website keeps server status and player info easy to check.", inline: false },
          { name: "🦴 Mini mission", value: "Find food, find water, find friends. Maybe in that order.", inline: false }
        ]
      }
    ]
  },
  {
    content: "🛟👑 **HELP + STAFF / ТУСЛАМЖ / サポート / 지원** 👑🛟",
    embeds: [
      {
        title: "🚨 Need help? Use the right support room",
        description:
          "🇬🇧 Screenshots/clips help staff understand fast. Calm report = faster support.\n🇲🇳 Screenshot/clip байвал staff хурдан ойлгоно. Тайван report = хурдан support.\n🇯🇵 スクショ/動画があるとスタッフが確認しやすいです。落ち着いて報告してください。\n🇰🇷 스크린샷/영상이 있으면 스태프가 빠르게 확인할 수 있습니다. 차분하게 신고해 주세요.",
        color: 0x60a5fa,
        fields: [
          { name: "🐞🛠 Bug report", value: "Game/server issue, connection problem, weird behavior.", inline: true },
          { name: "🚨🧾 Player report", value: "Rule break, harassment, cheating suspicion. Evidence helps.", inline: true },
          { name: "📝🔓 Ban appeal", value: "Explain calmly. No rage essay required.", inline: true },
          { name: "📩👑 Admin contact", value: "Important server/community questions only.", inline: true }
        ],
        footer: { text: "Be chill • be clear • bring evidence • staff are people too" }
      }
    ]
  },
  {
    content: "📌🔗 **QUICK LINKS / ХОЛБООС / リンク / 링크** 🔗📌",
    embeds: [
      {
        title: "🎮🌐 Website x Discord x Server",
        description:
          "🇬🇧 Everything important in one place.\n🇲🇳 Чухал бүх link нэг дор.\n🇯🇵 重要リンクをまとめています。\n🇰🇷 중요한 링크를 한곳에 모았습니다。",
        color: 0xfacc15,
        fields: [
          { name: "🎮🟢 Server", value: "https://the-isle.vercel.app/server", inline: true },
          { name: "📜🛡 Rules", value: "https://the-isle.vercel.app/rules", inline: true },
          { name: "🎙⚡ Voice", value: "https://the-isle.vercel.app/voice", inline: true },
          { name: "🦖📚 Dinosaurs", value: "https://the-isle.vercel.app/dinosaurs", inline: true },
          { name: "🗺📍 Map", value: "https://the-isle.vercel.app/map", inline: true },
          { name: "🏁🎉 Events", value: "https://the-isle.vercel.app/events", inline: true }
        ],
        footer: { text: "Save this post. Future you will thank present you." }
      }
    ]
  }
];

for (const message of messages) {
  await send(message);
}

console.log(`Posted ${messages.length} full four-language Discord messages to channel ${channelId}.`);
