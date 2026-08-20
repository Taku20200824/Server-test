"use client";

import { CalendarClock, Gamepad2, Globe2, Headphones, Map, Server, Users } from "lucide-react";
import { CopyIpButton } from "@/components/copy-ip-button";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import { useLiveServerStatus } from "@/hooks/use-live-server-status";
import { formatServerAddress, type ServerStatusDocument } from "@/lib/firebase/server-status-shared";

function formatDate(date: Date | string | null, fallback: string) {
  if (!date) {
    return fallback;
  }

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsedDate);
}

function formatLiveRefreshLabel(label: string) {
  return label.replace(/5s/gi, "15s").replace(/5秒/g, "15秒").replace(/5초/g, "15초").replace(/5 секунд/gi, "15 секунд");
}

const statTones = [
  "from-cyan-300/20 via-sky-300/8 to-white/[.03]",
  "from-emerald-300/20 via-teal-300/8 to-white/[.03]",
  "from-amber-300/20 via-orange-300/8 to-white/[.03]",
  "from-violet-300/20 via-fuchsia-300/8 to-white/[.03]"
];

export function ServerStatusSummary({ status: initialStatus }: { status: ServerStatusDocument }) {
  const { t } = useLanguage();
  const { status, isRefreshing } = useLiveServerStatus(initialStatus);
  const address = formatServerAddress(status);
  const voiceAddress = status.voiceHost ? `${status.voiceHost}:${status.voicePort}` : t("status.notSynced");
  const liveRefreshLabel = formatLiveRefreshLabel(t("status.liveRefresh"));
  const stats = [
    { label: t("status.address"), value: address, icon: Server },
    { label: t("status.players"), value: `${status.onlinePlayers}/${status.maxPlayers}`, icon: Users },
    { label: t("status.location"), value: status.location, icon: Globe2 },
    { label: t("status.version"), value: status.version, icon: Gamepad2 },
    { label: t("status.map"), value: status.map, icon: Map },
    { label: t("status.hosting"), value: status.hostingProvider, icon: Server },
    { label: t("status.voice"), value: voiceAddress, icon: Headphones },
    { label: t("status.lastUpdated"), value: formatDate(status.lastUpdated, t("status.notSynced")), icon: CalendarClock }
  ];

  return (
    <Card className="border-primary/20 bg-black/35 shadow-xl shadow-emerald-900/10 backdrop-blur-xl">
      <CardContent className="p-5 sm:p-6">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <StatusBadge status={status.status} />
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <h2 className="font-display text-3xl font-black text-white sm:text-4xl">{status.serverName}</h2>
              <span className="mb-1 text-xs uppercase text-zinc-400">{isRefreshing ? t("status.syncing") : liveRefreshLabel}</span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">{status.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyIpButton ip={address} />
            {status.voiceHost ? (
              <Button asChild variant="outline">
                <a href="/voice">{t("cta.voiceChat")}</a>
              </Button>
            ) : null}
            {status.discordUrl ? (
              <Button asChild>
                <a href={status.discordUrl}>{t("cta.joinDiscord")}</a>
              </Button>
            ) : (
              <Button disabled>{t("cta.joinDiscord")}</Button>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <div key={item.label} className={`rounded-md border border-white/10 bg-gradient-to-br ${statTones[index % statTones.length]} p-4 shadow-[0_14px_45px_rgba(0,0,0,.25)]`}>
              <div className="flex items-center gap-2 text-xs uppercase text-zinc-400">
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </div>
              <div className="relative z-10 mt-2 break-words text-lg font-bold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}