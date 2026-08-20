"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import type { ServerStatusDocument } from "@/lib/firebase/server-status-shared";
import type { TranslationKey } from "@/lib/i18n";

const statusStyles = {
  online: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
  offline: "border-rose-300/30 bg-rose-400/15 text-rose-200",
  maintenance: "border-amber-300/30 bg-amber-400/15 text-amber-100"
};

export function StatusBadge({ status, className }: { status: ServerStatusDocument["status"]; className?: string }) {
  const { t } = useLanguage();
  const statusLabelKey = `status.${status}` as TranslationKey;

  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide", statusStyles[status], className)}>
      <span className={cn("mr-2", status === "online" ? "live-dot" : "h-2 w-2 rounded-full bg-current")} />
      {t(statusLabelKey)}
    </span>
  );
}
