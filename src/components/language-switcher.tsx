"use client";

import { Globe2 } from "lucide-react";
import { localeLabels, locales, type Locale } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <label className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-xs font-semibold uppercase text-muted-foreground backdrop-blur transition hover:bg-white/10">
      <Globe2 className="h-4 w-4 text-primary" />
      <select
        className="bg-transparent text-foreground outline-none"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label="Select language"
      >
        {locales.map((item) => (
          <option key={item} value={item} className="bg-background text-foreground">
            {localeLabels[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
