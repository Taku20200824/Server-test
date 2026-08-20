"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { navItems, siteConfig } from "@/data/site";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/i18n";

const navTranslationKeys: Record<string, TranslationKey> = {
  "/": "nav.home",
  "/server": "nav.server",
  "/rules": "nav.rules",
  "/dinosaurs": "nav.dinosaurs",
  "/map": "nav.map",
  "/voice": "nav.voice",
  "/leaderboard": "nav.leaderboard",
  "/events": "nav.events",
  "/discord": "nav.discord",
  "/donate": "nav.donate"
};

export function SiteHeader() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const navigation = useMemo(() => {
    const leaderboardIndex = navItems.findIndex((item) => item.href === "/leaderboard");
    const questsItem = { href: "/quests", label: "Quests" };

    if (leaderboardIndex === -1 || navItems.some((item) => item.href === questsItem.href)) {
      return navItems;
    }

    return [
      ...navItems.slice(0, leaderboardIndex + 1),
      questsItem,
      ...navItems.slice(leaderboardIndex + 1)
    ];
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-white/10 bg-black/70 shadow-[0_10px_40px_rgba(0,0,0,.5)] backdrop-blur-2xl"
          : "border-transparent bg-black/20 backdrop-blur-md"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-3 font-display text-lg font-black tracking-normal text-primary">
          <span className="h-3 w-3 rounded-sm border border-primary/80 bg-primary shadow-[0_0_22px_rgba(45,212,191,.75)] transition group-hover:rotate-45" />
          <span className="drop-shadow-[0_0_18px_rgba(45,212,191,.35)]">{siteConfig.name}</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const translationKey = navTranslationKeys[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative transition after:absolute after:-bottom-2 after:left-0 after:h-px after:bg-primary after:transition-all hover:text-foreground",
                  isActive ? "text-foreground after:w-full" : "after:w-0 hover:after:w-full"
                )}
              >
                {translationKey ? t(translationKey) : item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button asChild className="hidden sm:inline-flex">
            <a href={siteConfig.discordInvite}>{t("cta.joinDiscord")}</a>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
