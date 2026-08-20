"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Gamepad2, MessageCircle, RadioTower, ShieldCheck, Star, Users, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import { siteConfig } from "@/data/site";
import type { Locale } from "@/lib/i18n";
import type { getDiscordCommunity } from "@/lib/integrations/discord";

type DiscordCommunity = Awaited<ReturnType<typeof getDiscordCommunity>>;

type MiniCard = { icon: string; title: string; body: string };

type Copy = {
  title: string;
  body: string;
  join: string;
  general: string;
  server: string;
  serverTitle: string;
  labels: [string, string, string, string];
  guideTitle: string;
  guides: MiniCard[];
  roomsTitle: string;
  rooms: MiniCard[];
  planTitle: string;
  moodTitle: string;
  moodBody: string;
  staffTitle: string;
  modsReady: string;
  linksTitle: string;
  links: Array<[string, string, string]>;
  pinnedTitle: string;
  pins: MiniCard[];
};

const channelGroups = [
  { title: "START HERE", icon: "🌈", tone: "from-amber-300/30 via-orange-400/15 to-pink-400/15", channels: ["👋 #welcome", "📜 #rules", "📢 #announcements", "🟢 #server-status", "🎮 #how-to-join"] },
  { title: "COMMUNITY", icon: "🦖", tone: "from-emerald-300/30 via-teal-300/15 to-cyan-400/15", channels: ["💬 #general-chat", "🌏 #jp-mng-kr-chat", "📷 #screenshots", "🎬 #clips-media", "🤝 #pack-recruitment"] },
  { title: "SUPPORT", icon: "🛟", tone: "from-sky-300/30 via-blue-400/15 to-indigo-400/15", channels: ["🐞 #bug-report", "🚨 #player-report", "📝 #ban-appeal", "📩 #admin-contact"] },
  { title: "THE ISLE VOICE", icon: "🎙", tone: "from-violet-300/30 via-fuchsia-400/15 to-rose-400/15", channels: ["🔊 Lobby", "🦕 Pack Room 1", "🦖 Pack Room 2", "🏁 Event Voice", "🛡 Staff Voice"] }
];

const cardTones = [
  "from-cyan-300/25 via-sky-300/10 to-white/5",
  "from-amber-300/25 via-orange-300/10 to-white/5",
  "from-emerald-300/25 via-lime-300/10 to-white/5",
  "from-fuchsia-300/25 via-pink-300/10 to-white/5"
];

const copies: Record<Locale, Copy> = {
  en: {
    title: "The Isle Asia players Discord hub!",
    body: "Use Discord for server status, rules, reports, clips, pack recruitment, voice rooms, and website links. The page only shows the selected language.",
    join: "Join Discord",
    general: "Open General",
    server: "Server Page",
    serverTitle: "ASIA JP,MNG,KR Test",
    labels: ["Address", "Region", "Website", "Discord ID"],
    guideTitle: "Discord guide",
    guides: [
      { icon: "🎮", title: "How to join", body: "Open The Isle Evrima, search the server address, then join ASIA JP,MNG,KR Test." },
      { icon: "📜", title: "Read rules first", body: "Check rules before playing. No harassment, cheating, spam, scams, or NSFW content." },
      { icon: "🤝", title: "Find a pack", body: "Post your dino, language, play time, and voice preference in pack recruitment." },
      { icon: "🚨", title: "Reports", body: "Use screenshots or clips, Steam name, time, and clear details for reports." }
    ],
    roomsTitle: "Useful rooms",
    rooms: [
      { icon: "💬", title: "#general-chat", body: "Main community chat and quick questions." },
      { icon: "🌏", title: "#jp-mng-kr-chat", body: "Regional language help and Asia chat." },
      { icon: "📷", title: "#screenshots", body: "Share screenshots and good moments." },
      { icon: "🎙", title: "Voice rooms", body: "Use lobby, pack rooms, event voice, and staff voice clearly." }
    ],
    planTitle: "Discord room plan",
    moodTitle: "Community mood",
    moodBody: "Friendly, useful, simple, and easy to read.",
    staffTitle: "Staff online view",
    modsReady: "mods ready",
    linksTitle: "Page links to pin in Discord",
    links: [["Server", "/server", "IP, players, Singapore status"], ["Voice", "/voice", "TAKU Voice setup"], ["Rules", "/rules", "Rules and reports"], ["Dinosaurs", "/dinosaurs", "Playable guide"], ["Map", "/map", "Gateway routes"], ["Events", "/events", "Weekly community nights"]],
    pinnedTitle: "Pinned message style",
    pins: [
      { icon: "👋", title: "#welcome", body: "Pick useful rooms, read rules, check status, then jump in." },
      { icon: "📜", title: "#rules", body: "No drama, no exploit, no spam. Keep the island fun." },
      { icon: "🟢", title: "#server-status", body: "ASIA JP,MNG,KR Test | 209.102.250.73:9075 | Singapore" },
      { icon: "🎉", title: "#events", body: "Weekend growth, pack nights, clips, and community moments." }
    ]
  },
  mn: {
    title: "The Isle Asia тоглогчдын Discord төв!",
    body: "Discord дээр server status, дүрэм, report, clip, pack хайлт, voice өрөө, website link бүгд нэг дор байна. Сонгосон хэлээрээ л харагдана.",
    join: "Discord-д нэгдэх",
    general: "General нээх",
    server: "Сервер хуудас",
    serverTitle: "ASIA JP,MNG,KR Test",
    labels: ["Хаяг", "Бүс", "Website", "Discord ID"],
    guideTitle: "Discord заавар",
    guides: [
      { icon: "🎮", title: "Яаж орох вэ", body: "The Isle Evrima нээгээд server address-аар хайж ASIA JP,MNG,KR Test рүү орно." },
      { icon: "📜", title: "Эхлээд дүрмээ унш", body: "Тоглохоос өмнө дүрмээ шалга. Доромжлол, cheat, spam, scam, NSFW байхгүй." },
      { icon: "🤝", title: "Pack олох", body: "Dino, хэл, тоглох цаг, voice ашиглах эсэхээ pack recruitment дээр бичээрэй." },
      { icon: "🚨", title: "Report", body: "Screenshot эсвэл clip, Steam name, цаг, тодорхой тайлбартай бичээрэй." }
    ],
    roomsTitle: "Хэрэгтэй өрөөнүүд",
    rooms: [
      { icon: "💬", title: "#general-chat", body: "Ерөнхий community chat болон хурдан асуулт." },
      { icon: "🌏", title: "#jp-mng-kr-chat", body: "Азийн хэлний тусламж болон чат." },
      { icon: "📷", title: "#screenshots", body: "Зураг болон гоё moment оруулах." },
      { icon: "🎙", title: "Voice өрөөнүүд", body: "Lobby, pack room, event voice, staff voice-ийг зөв ашиглана." }
    ],
    planTitle: "Discord өрөөний бүтэц",
    moodTitle: "Community mood",
    moodBody: "Найрсаг, хэрэгтэй, энгийн, уншихад амар.",
    staffTitle: "Staff online харагдац",
    modsReady: "модератор бэлэн",
    linksTitle: "Discord дээр pin хийх page link-үүд",
    links: [["Сервер", "/server", "IP, player, Singapore status"], ["Voice", "/voice", "TAKU Voice тохиргоо"], ["Дүрэм", "/rules", "Дүрэм болон report"], ["Динозавр", "/dinosaurs", "Тоглох guide"], ["Map", "/map", "Gateway route"], ["Эвент", "/events", "Долоо хоногийн event"]],
    pinnedTitle: "Pin message загвар",
    pins: [
      { icon: "👋", title: "#welcome", body: "Хэрэгтэй өрөөгөө сонгоод, дүрмээ уншаад, status шалгаад орцгооё." },
      { icon: "📜", title: "#rules", body: "Drama, exploit, spam байхгүй. Server-ээ цэвэр байлгая." },
      { icon: "🟢", title: "#server-status", body: "ASIA JP,MNG,KR Test | 209.102.250.73:9075 | Singapore" },
      { icon: "🎉", title: "#events", body: "Weekend growth, pack night, clip, community moment." }
    ]
  },
  ja: {
    title: "The Isle Asia プレイヤーの Discord ハブ!",
    body: "Discord ではサーバー状態、ルール、通報、クリップ、仲間募集、ボイス部屋、サイトリンクをまとめて確認できます。選択した言語だけで表示されます。",
    join: "Discord に参加",
    general: "General を開く",
    server: "サーバーページ",
    serverTitle: "ASIA JP,MNG,KR Test",
    labels: ["アドレス", "地域", "Website", "Discord ID"],
    guideTitle: "Discord ガイド",
    guides: [
      { icon: "🎮", title: "参加方法", body: "The Isle Evrima を開き、サーバーアドレスで ASIA JP,MNG,KR Test を検索して参加します。" },
      { icon: "📜", title: "まずルール確認", body: "プレイ前にルールを確認してください。嫌がらせ、チート、スパム、詐欺、NSFWは禁止です。" },
      { icon: "🤝", title: "仲間募集", body: "恐竜、言語、プレイ時間、ボイス可否を pack recruitment に書いてください。" },
      { icon: "🚨", title: "通報", body: "スクショまたはクリップ、Steam名、時間、分かりやすい内容を添えてください。" }
    ],
    roomsTitle: "便利なルーム",
    rooms: [
      { icon: "💬", title: "#general-chat", body: "一般チャットと簡単な質問。" },
      { icon: "🌏", title: "#jp-mng-kr-chat", body: "アジア向け多言語サポートと雑談。" },
      { icon: "📷", title: "#screenshots", body: "スクショや良い瞬間を投稿。" },
      { icon: "🎙", title: "ボイスルーム", body: "Lobby、pack room、event voice、staff voice を分かりやすく使います。" }
    ],
    planTitle: "Discord ルーム構成",
    moodTitle: "Community mood",
    moodBody: "親切、便利、シンプル、読みやすい。",
    staffTitle: "スタッフ状況",
    modsReady: "スタッフ対応可",
    linksTitle: "Discord に pin するページリンク",
    links: [["サーバー", "/server", "IP、人数、Singapore 状態"], ["Voice", "/voice", "TAKU Voice 設定"], ["ルール", "/rules", "ルールと通報"], ["恐竜", "/dinosaurs", "プレイガイド"], ["Map", "/map", "Gateway ルート"], ["イベント", "/events", "週間イベント"]],
    pinnedTitle: "Pin メッセージ例",
    pins: [
      { icon: "👋", title: "#welcome", body: "便利なルームを選び、ルールと状態を確認して参加してください。" },
      { icon: "📜", title: "#rules", body: "Drama、exploit、spamは禁止。きれいに使いましょう。" },
      { icon: "🟢", title: "#server-status", body: "ASIA JP,MNG,KR Test | 209.102.250.73:9075 | Singapore" },
      { icon: "🎉", title: "#events", body: "Weekend growth、pack night、clip、community moment。" }
    ]
  },
  ko: {
    title: "The Isle Asia 플레이어 Discord 허브!",
    body: "Discord에서 서버 상태, 규칙, 신고, 클립, 파티 모집, 보이스 방, 웹사이트 링크를 한곳에서 확인할 수 있습니다. 선택한 언어만 표시됩니다.",
    join: "Discord 참여",
    general: "General 열기",
    server: "서버 페이지",
    serverTitle: "ASIA JP,MNG,KR Test",
    labels: ["주소", "지역", "Website", "Discord ID"],
    guideTitle: "Discord 가이드",
    guides: [
      { icon: "🎮", title: "접속 방법", body: "The Isle Evrima를 열고 서버 주소로 ASIA JP,MNG,KR Test를 검색해 접속하세요." },
      { icon: "📜", title: "먼저 규칙 확인", body: "플레이 전 규칙을 확인하세요. 괴롭힘, 치트, 스팸, 사기, NSFW는 금지입니다." },
      { icon: "🤝", title: "팩 찾기", body: "공룡, 언어, 플레이 시간, 보이스 여부를 pack recruitment에 적어주세요." },
      { icon: "🚨", title: "신고", body: "스크린샷 또는 클립, Steam 이름, 시간, 명확한 내용을 함께 작성하세요." }
    ],
    roomsTitle: "유용한 방",
    rooms: [
      { icon: "💬", title: "#general-chat", body: "일반 커뮤니티 채팅과 빠른 질문." },
      { icon: "🌏", title: "#jp-mng-kr-chat", body: "아시아 다국어 지원 및 채팅." },
      { icon: "📷", title: "#screenshots", body: "스크린샷과 좋은 순간을 공유하세요." },
      { icon: "🎙", title: "보이스 방", body: "Lobby, pack room, event voice, staff voice를 명확히 사용하세요." }
    ],
    planTitle: "Discord 방 구성",
    moodTitle: "Community mood",
    moodBody: "친절하고, 유용하고, 단순하고, 읽기 쉽게.",
    staffTitle: "스태프 상태",
    modsReady: "스태프 대기",
    linksTitle: "Discord에 pin할 페이지 링크",
    links: [["서버", "/server", "IP, 인원, Singapore 상태"], ["Voice", "/voice", "TAKU Voice 설정"], ["규칙", "/rules", "규칙과 신고"], ["공룡", "/dinosaurs", "플레이 가이드"], ["Map", "/map", "Gateway 경로"], ["이벤트", "/events", "주간 이벤트"]],
    pinnedTitle: "Pin 메시지 예시",
    pins: [
      { icon: "👋", title: "#welcome", body: "유용한 방을 선택하고 규칙과 상태를 확인한 뒤 접속하세요." },
      { icon: "📜", title: "#rules", body: "Drama, exploit, spam 금지. 깔끔하게 사용해요." },
      { icon: "🟢", title: "#server-status", body: "ASIA JP,MNG,KR Test | 209.102.250.73:9075 | Singapore" },
      { icon: "🎉", title: "#events", body: "Weekend growth, pack night, clip, community moment." }
    ]
  }
};

const statValues = ["209.102.250.73:9075", "Singapore", "the-isle.vercel.app"];
const panelClass = "border-white/10 bg-gradient-to-br from-white/[.08] via-primary/[.05] to-secondary/[.08] shadow-2xl shadow-black/25 backdrop-blur-xl";
const tileClass = "rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm font-semibold text-zinc-100 shadow-inner shadow-white/5";

export function DiscordPageContent({ discord }: { discord: DiscordCommunity }) {
  const { locale } = useLanguage();
  const copy = copies[locale];

  return (
    <main className="min-h-screen overflow-hidden pt-24 pb-20">
      <section className="container relative py-12 sm:py-16">
        <div className="pointer-events-none absolute left-4 top-8 -z-10 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-24 -z-10 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-64 -z-10 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl" />

        <div className="mb-6 flex flex-wrap gap-2">
          {["🦖", "🎙", "📸", "🏁", "🟢", "✨"].map((chip) => <span key={chip} className="rounded-full border border-white/10 bg-white/[.07] px-3 py-2 text-sm shadow-lg shadow-black/20 backdrop-blur">{chip}</span>)}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-[linear-gradient(90deg,rgba(45,212,191,.18),rgba(244,114,182,.14),rgba(251,191,36,.14))] px-4 py-2 text-xs font-bold uppercase text-primary shadow-[0_0_36px_rgba(45,212,191,.22)]"><MessageCircle className="h-4 w-4" />Discord</div>
            <h1 className="text-gradient mt-6 max-w-4xl font-display text-5xl font-black leading-none sm:text-7xl">{copy.title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-200 sm:text-lg">{copy.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-14 px-7 text-base shadow-[0_0_44px_rgba(45,212,191,.38)]"><a href={discord.invite}><MessageCircle className="h-5 w-5" />{copy.join}</a></Button>
              <Button asChild variant="outline" size="lg" className="h-14 border-cyan-300/30 bg-cyan-300/10 px-7 text-base hover:bg-cyan-300/15"><a href={siteConfig.discordGeneralChannel}>{copy.general}</a></Button>
              <Button asChild variant="outline" size="lg" className="h-14 border-amber-300/30 bg-amber-300/10 px-7 text-base hover:bg-amber-300/15"><Link href="/server"><Gamepad2 className="h-5 w-5" />{copy.server}</Link></Button>
            </div>
          </div>

          <Card className={panelClass}>
            <CardHeader><CardTitle className="flex items-center gap-2 text-2xl"><RadioTower className="h-6 w-6 text-primary" />🟢 {copy.serverTitle}</CardTitle></CardHeader>
            <CardContent><div className="grid gap-3 sm:grid-cols-2">{[...statValues, discord.serverId].map((value, index) => <div key={copy.labels[index]} className="rounded-md border border-white/10 bg-black/25 p-4 shadow-inner shadow-white/5"><div className="text-xs uppercase text-muted-foreground">{copy.labels[index]}</div><div className="mt-1 break-words font-bold text-white">{value}</div></div>)}</div></CardContent>
          </Card>
        </div>
      </section>

      <CardGrid title={copy.guideTitle} items={copy.guides} />
      <CardGrid title={copy.roomsTitle} items={copy.rooms} offset={1} />

      <section className="container py-10">
        <SectionTitle icon={<Users className="h-5 w-5 text-primary" />} title={copy.planTitle} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {channelGroups.map((group) => <Card key={group.title} className={`border-white/10 bg-gradient-to-br ${group.tone} shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25`}><CardContent className="p-5"><h3 className="font-display text-lg font-black text-white">{group.icon} {group.title}</h3><div className="mt-4 space-y-2">{group.channels.map((channel) => <div key={channel} className={tileClass}>{channel}</div>)}</div></CardContent></Card>)}
        </div>
      </section>

      <section className="container py-10"><Card className="border-white/10 bg-[linear-gradient(90deg,rgba(34,211,238,.16),rgba(244,114,182,.14),rgba(251,191,36,.16),rgba(52,211,153,.14))] shadow-2xl shadow-black/20"><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><div className="flex items-center gap-2 text-sm font-bold uppercase text-primary"><ShieldCheck className="h-4 w-4" />{copy.moodTitle}</div><p className="mt-2 text-xl font-black text-white">{copy.moodBody}</p></div></CardContent></Card></section>

      <section className="container grid gap-5 py-10 lg:grid-cols-[.85fr_1.15fr]">
        <Card className={panelClass}><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" />{copy.staffTitle}</CardTitle></CardHeader><CardContent><div className="mb-5 flex items-end gap-3"><div className="text-5xl font-black text-white">{discord.onlineModerators}</div><div className="pb-2 text-sm font-bold text-muted-foreground">{copy.modsReady}</div></div><div className="space-y-3">{discord.staff.map((member) => <div key={member.name} className="flex items-center gap-3 rounded-md border border-white/10 bg-black/25 p-3 transition hover:border-primary/30 hover:bg-primary/5"><img src={member.avatar} alt="" className="h-10 w-10 rounded-md" /><div><div className="font-semibold text-white">{member.name}</div><div className="text-xs text-muted-foreground">{member.role} · {member.discord}</div></div></div>)}</div></CardContent></Card>
        <Card className={panelClass}><CardHeader><CardTitle className="flex items-center gap-2"><Volume2 className="h-6 w-6 text-primary" />{copy.linksTitle}</CardTitle></CardHeader><CardContent><div className="grid gap-3 md:grid-cols-3">{copy.links.map(([title, href, note]) => <Link key={href} href={href} className="rounded-md border border-white/10 bg-black/25 p-4 transition hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5"><div className="font-bold text-white">{title}</div><div className="mt-2 text-xs leading-5 text-muted-foreground">{note}</div></Link>)}</div></CardContent></Card>
      </section>

      <CardGrid title={copy.pinnedTitle} items={copy.pins} star offset={2} />
    </main>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return <div className="mb-5 flex items-center gap-3">{icon}<h2 className="font-display text-3xl font-black text-foreground">{title}</h2></div>;
}

function CardGrid({ title, items, star = false, offset = 0 }: { title: string; items: MiniCard[]; star?: boolean; offset?: number }) {
  return (
    <section className="container py-10">
      <SectionTitle icon={star ? <Star className="h-5 w-5 text-primary" /> : <MessageCircle className="h-5 w-5 text-primary" />} title={title} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => <Card key={`${title}-${item.title}`} className={`border-white/10 bg-gradient-to-br ${cardTones[(index + offset) % cardTones.length]} shadow-2xl shadow-black/25 transition duration-300 hover:-translate-y-1 hover:border-primary/40`}><CardContent className="p-5">{star ? <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10"><Star className="h-5 w-5 text-primary" /></div> : <div className="text-5xl drop-shadow-[0_0_24px_rgba(255,255,255,.18)]">{item.icon}</div>}<h3 className="mt-4 text-lg font-black text-white">{item.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-300">{item.body}</p></CardContent></Card>)}
      </div>
    </section>
  );
}
