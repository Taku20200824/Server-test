"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { locales, translations, type Locale, type TranslationKey } from "@/lib/i18n";
import type { SiteTextOverrides } from "@/lib/firebase/site-texts";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const storedLocale = window.localStorage.getItem("the-isle-locale");

  if (locales.includes(storedLocale as Locale)) {
    return storedLocale as Locale;
  }

  const browserLocale = window.navigator.language.toLowerCase();

  if (browserLocale.startsWith("ja")) {
    return "ja";
  }

  if (browserLocale.startsWith("ko")) {
    return "ko";
  }

  if (browserLocale.startsWith("mn")) {
    return "mn";
  }

  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [overrides, setOverrides] = useState<SiteTextOverrides>({});

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSiteText() {
      try {
        const response = await fetch("/api/site-texts", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as SiteTextOverrides;

        if (isMounted) {
          setOverrides(data);
        }
      } catch {
        // Built-in translations remain available when Firebase text is unavailable.
      }
    }

    void loadSiteText();
    const intervalId = window.setInterval(() => void loadSiteText(), 60000);
    window.addEventListener("focus", loadSiteText);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadSiteText);
    };
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      locale,
      setLocale(nextLocale) {
        setLocaleState(nextLocale);
        window.localStorage.setItem("the-isle-locale", nextLocale);
      },
      t(key) {
        return overrides[locale]?.[key] ?? translations[locale][key] ?? translations.en[key];
      }
    };
  }, [locale, overrides]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
