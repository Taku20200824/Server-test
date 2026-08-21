"use client";

import { useCallback, useEffect, useState } from "react";
import { Language, LabelSet, isLanguage, languageOptions } from "@/lib/i18n";

const LANG_KEY = "irisLanguage";
const THEME_KEY = "irisTheme";

export function useLanguage(): [Language, (next: Language) => void] {
  const [language, setLanguage] = useState<Language>("ja");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (isLanguage(stored)) setLanguage(stored);
    } catch {
      /* localStorage が使えない環境では既定値のまま */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const update = useCallback((next: Language) => {
    setLanguage(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      /* 保存できなくても切り替えは反映される */
    }
  }, []);

  return [language, update];
}

export function useTheme(): [boolean, () => void] {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let initial = false;
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      initial =
        stored === "dark" || stored === "light"
          ? stored === "dark"
          : window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      initial = false;
    }
    setDark(initial);
    document.documentElement.dataset.theme = initial ? "dark" : "light";
  }, []);

  const toggle = useCallback(() => {
    setDark((value) => {
      const next = !value;
      document.documentElement.dataset.theme = next ? "dark" : "light";
      try {
        window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {
        /* 保存できなくても切り替えは反映される */
      }
      return next;
    });
  }, []);

  return [dark, toggle];
}

export function LanguageSelect({
  language,
  onChange
}: {
  language: Language;
  onChange: (next: Language) => void;
}) {
  return (
    <select
      className="language-select"
      aria-label="Language"
      value={language}
      onChange={(event) => {
        const next = event.target.value;
        if (isLanguage(next)) onChange(next);
      }}
    >
      {languageOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ThemeToggle({
  dark,
  onToggle,
  t,
  className = "theme-float"
}: {
  dark: boolean;
  onToggle: () => void;
  t: LabelSet;
  className?: string;
}) {
  return (
    <button className={className} type="button" onClick={onToggle}>
      {dark ? t.lightMode : t.darkMode}
    </button>
  );
}

export function BrandMark({ small = false }: { small?: boolean }) {
  return <span className={small ? "brand-mark is-small" : "brand-mark"} aria-hidden />;
}
