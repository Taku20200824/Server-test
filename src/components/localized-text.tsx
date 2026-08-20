"use client";

import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/lib/i18n";

export function LocalizedText({ tKey }: { tKey: TranslationKey }) {
  const { t } = useLanguage();

  return t(tKey);
}
