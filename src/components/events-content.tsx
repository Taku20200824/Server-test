"use client";

import type { ComponentType } from "react";
import { CalendarDays, Sparkles, Swords } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

type EventItem = {
  title: string;
  type: string;
  when: string;
  icon: string | ComponentType<{ className?: string }>;
  i18n?: Partial<Record<Locale, Partial<Pick<EventItem, "title" | "type" | "when">>>>;
};

const eventIcons = { CalendarDays, Sparkles, Swords };
const eventTones = [
  "from-cyan-300/25 via-sky-300/10 to-white/[.04]",
  "from-amber-300/25 via-orange-300/10 to-white/[.04]",
  "from-fuchsia-300/25 via-pink-300/10 to-white/[.04]"
];

const eventText: Record<string, Partial<Record<Locale, Pick<EventItem, "title" | "type" | "when">>>> = {
  "Weekly Herd Run": {
    ja: { title: "週間ハードラン", type: "週間イベント", when: "毎週水曜 21:00 JST" },
    ko: { title: "주간 무리 이동", type: "주간 이벤트", when: "매주 수요일 21:00 JST" },
    mn: { title: "Долоо хоногийн сүргийн гүйлт", type: "Долоо хоногийн эвент", when: "Лхагва бүр 21:00 JST" }
  },
  "Double Growth Weekend": {
    ja: { title: "成長2倍ウィークエンド", type: "成長ブースト", when: "承認された週末イベントごと" },
    ko: { title: "성장 2배 주말", type: "성장 부스트", when: "승인된 커뮤니티 주말마다" },
    mn: { title: "Өсөлт 2 дахин Weekend", type: "Өсөлтийн boost", when: "Зөвшөөрсөн community weekend бүр" }
  },
  "PvP Tournament": {
    ja: { title: "PvP トーナメント", type: "競技イベント", when: "毎月日曜 20:00 JST" },
    ko: { title: "PvP 토너먼트", type: "경쟁 이벤트", when: "매월 일요일 20:00 JST" },
    mn: { title: "PvP Tournament", type: "Өрсөлдөөнт эвент", when: "Сар бүрийн Ням 20:00 JST" }
  }
};

const dayLabels: Record<Locale, string[]> = {
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  ja: ["月", "火", "水", "木", "金", "土", "日"],
  ko: ["월", "화", "수", "목", "금", "토", "일"],
  mn: ["Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям", "Ням"]
};

function localizeEvent(event: EventItem, locale: Locale): EventItem {
  return {
    ...event,
    ...(eventText[event.title]?.[locale] ?? {}),
    ...(event.i18n?.[locale] ?? {})
  };
}

export function EventsContent({ events }: { events: EventItem[] }) {
  const { locale } = useLanguage();
  const days = dayLabels[locale];
  const weekly = eventText["Weekly Herd Run"][locale]?.title ?? "Weekly Herd Run";
  const growth = eventText["Double Growth Weekend"][locale]?.title ?? "Double Growth";

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        {events.map((rawEvent, index) => {
          const event = localizeEvent(rawEvent, locale);
          const Icon = typeof rawEvent.icon === "string" ? eventIcons[rawEvent.icon as keyof typeof eventIcons] ?? CalendarDays : rawEvent.icon;

          return (
            <Card key={rawEvent.title} className={`min-w-0 border-white/10 bg-gradient-to-br ${eventTones[index % eventTones.length]} shadow-[0_20px_70px_rgba(0,0,0,.3)]`}>
              <CardHeader>
                <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <CardTitle className="break-words leading-snug text-white">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="break-words text-sm text-zinc-400">{event.type}</div>
                <div className="mt-2 break-words font-semibold text-white">{event.when}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="mt-8 overflow-hidden border-white/10 bg-black/30 shadow-[0_18px_70px_rgba(0,0,0,.3)]">
        <CardContent className="grid gap-2 p-4 sm:grid-cols-7">
          {days.map((day, index) => (
            <div key={day} className="min-h-28 min-w-0 rounded-md border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[.07]">
              <div className="text-sm font-semibold text-white">{day}</div>
              {index === 2 ? <p className="mt-4 break-words rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{weekly}</p> : null}
              {index >= 4 ? <p className="mt-4 break-words rounded bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-300">{growth}</p> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}