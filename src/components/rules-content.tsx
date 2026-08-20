"use client";

import type { ComponentType } from "react";
import { Crown, Shield, Skull, Swords, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

type RuleGroup = {
  title: string;
  icon: string | ComponentType<{ className?: string }>;
  items: string[];
  i18n?: Partial<Record<Locale, Partial<Pick<RuleGroup, "title" | "items">>>>;
};

const ruleIcons = { Crown, Shield, Skull, Swords, Users };

const ruleText: Record<string, Partial<Record<Locale, Pick<RuleGroup, "title" | "items">>>> = {
  "General Rules": {
    ja: {
      title: "基本ルール",
      items: ["すべてのプレイヤーとスタッフを尊重してください。", "グローバルチャットでは英語を使用してください。", "嫌がらせ、ヘイト発言、狙い撃ちの迷惑行為は禁止です。", "トラブル時はスタッフの指示に従ってください。"]
    },
    ko: {
      title: "기본 규칙",
      items: ["모든 플레이어와 스태프를 존중하세요.", "글로벌 채팅에서는 영어를 사용하세요.", "괴롭힘, 혐오 발언, 특정 대상 방해 행위는 금지입니다.", "상황 발생 시 스태프 지시를 따르세요."]
    },
    mn: {
      title: "Ерөнхий дүрэм",
      items: ["Бүх тоглогч болон staff-ыг хүндэлнэ.", "Global chat дээр англи хэл хэрэглэнэ.", "Доромжлол, hate speech, зориуд grief хийхийг хориглоно.", "Асуудал гарвал staff-ын зааврыг дагана."]
    }
  },
  "PvP Rules": {
    ja: {
      title: "PvP ルール",
      items: ["戦闘中のログアウトは禁止です。", "承認済みイベント以外での mix-pack は禁止です。", "死体妨害や地形悪用は禁止です。", "大会中は大会専用ルールに従ってください。"]
    },
    ko: {
      title: "PvP 규칙",
      items: ["전투 중 로그아웃은 금지입니다.", "승인된 이벤트 외 mix-pack은 금지입니다.", "시체 방해나 지형 악용은 금지입니다.", "토너먼트 중에는 전용 규칙을 지켜주세요."]
    },
    mn: {
      title: "PvP дүрэм",
      items: ["Combat logging хийхийг хориглоно.", "Зөвшөөрсөн event-ээс бусад үед mix-pack хийхгүй.", "Body denial болон terrain abuse хориглоно.", "Tournament идэвхтэй үед тухайн дүрмийг мөрдөнө."]
    }
  },
  "Chat Rules": {
    ja: {
      title: "チャットルール",
      items: ["グローバルチャットを読みやすく保ってください。", "スパム、差別語、政治的な争い、露骨な内容は禁止です。", "揉め事は通報チャンネルを使ってください。", "非公開チケットの内容を漏らさないでください。"]
    },
    ko: {
      title: "채팅 규칙",
      items: ["글로벌 채팅을 읽기 좋게 유지하세요.", "스팸, 비하 표현, 정치 싸움, 노골적 내용은 금지입니다.", "분쟁은 신고 채널을 이용하세요.", "비공개 티켓 내용을 유출하지 마세요."]
    },
    mn: {
      title: "Chat дүрэм",
      items: ["Global chat-ыг уншихад цэвэр байлгана.", "Spam, доромж үг, улс төрийн маргаан, зохисгүй контент хориглоно.", "Маргааныг report channel-аар явуулна.", "Private ticket-ийн мэдээлэл задруулахгүй."]
    }
  },
  Exploits: {
    ja: {
      title: "不正利用",
      items: ["マップ悪用、複製、マクロ、不正ツールは禁止です。", "再現できるバグは非公開で報告してください。", "不正利用の方法を公開チャンネルで教えないでください。"]
    },
    ko: {
      title: "악용 금지",
      items: ["지도 악용, 복제, 매크로, 외부 이점 도구는 금지입니다.", "재현 가능한 버그는 비공개로 신고하세요.", "악용 방법을 공개 채널에서 공유하지 마세요."]
    },
    mn: {
      title: "Exploit хориг",
      items: ["Map exploit, dupe, macro, third-party advantage tool ашиглахгүй.", "Давтагдаж болох bug-ыг хувийн сувгаар report хийнэ.", "Exploit хийх аргыг public channel дээр заахгүй."]
    }
  },
  Punishments: {
    ja: {
      title: "処罰",
      items: ["警告、ミュート、キック、一時BAN、永久BANが適用される場合があります。", "異議申し立ては公式フォームで確認します。", "繰り返しの違反は素早く重い処分になります。"]
    },
    ko: {
      title: "처벌",
      items: ["경고, 뮤트, 킥, 임시 밴, 영구 밴이 적용될 수 있습니다.", "이의 제기는 공식 양식으로 검토됩니다.", "반복적인 악용은 빠르게 가중 처벌됩니다."]
    },
    mn: {
      title: "Шийтгэл",
      items: ["Warning, mute, kick, temporary ban эсвэл permanent ban өгч болно.", "Appeal-ыг албан ёсны form-оор шалгана.", "Давтан зөрчил хурдан шаталж хүндэрнэ."]
    }
  }
};

function localizeRule(group: RuleGroup, locale: Locale): RuleGroup {
  return {
    ...group,
    ...(ruleText[group.title]?.[locale] ?? {}),
    ...(group.i18n?.[locale] ?? {})
  };
}

export function RulesContent({ rules }: { rules: RuleGroup[] }) {
  const { locale } = useLanguage();

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {rules.map((rawGroup) => {
        const group = localizeRule(rawGroup, locale);
        const Icon = typeof rawGroup.icon === "string" ? ruleIcons[rawGroup.icon as keyof typeof ruleIcons] ?? Shield : rawGroup.icon;

        return (
          <Card key={rawGroup.title} className="min-w-0">
            <CardHeader>
              <Icon className="h-7 w-7 text-primary" />
              <CardTitle className="break-words leading-snug">{group.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {group.items.map((item) => (
                  <li key={item} className="break-words rounded-md border border-white/10 bg-white/[0.03] p-3 leading-6">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
