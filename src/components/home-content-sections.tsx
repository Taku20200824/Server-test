"use client";

import Link from "next/link";
import { ArrowRight, Megaphone, RadioTower, Shield, Trophy, Users } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { LocalizedText } from "@/components/localized-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

type LocalizedFields = Record<string, string>;

type LocalizedRecord<T> = T & {
  i18n?: Partial<Record<Locale, Partial<T & LocalizedFields>>>;
};

type Announcement = LocalizedRecord<{
  title: string;
  body: string;
  date: string;
}>;

type NewsCard = LocalizedRecord<{
  title: string;
  excerpt: string;
  image: string;
}>;

type Feature = LocalizedRecord<{
  title: string;
  description: string;
  icon: string;
}>;

type HomeContentSectionsProps = {
  announcements: Announcement[];
  newsCards: NewsCard[];
  features: Feature[];
};

const featureIcons = { RadioTower, Shield, Trophy, Users };

function localized<T extends Record<string, unknown>>(item: LocalizedRecord<T>, locale: Locale): T {
  return {
    ...item,
    ...(item.i18n?.[locale] ?? {})
  };
}

export function HomeContentSections({ announcements, newsCards, features }: HomeContentSectionsProps) {
  const { locale } = useLanguage();

  return (
    <>
      <section className="container pb-20">
        <SectionHeading
          eyebrow="Operations"
          title="Latest announcements"
          description="Staff posts, community updates, and server-wide notices."
          eyebrowKey="page.announcements.eyebrow"
          titleKey="page.announcements.title"
          descriptionKey="page.announcements.description"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {announcements.map((rawItem) => {
            const item = localized(rawItem, locale);

            return (
              <Card key={`${rawItem.date}-${rawItem.title}`} className="hud-card transition duration-300 hover:-translate-y-1 hover:border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Megaphone className="h-4 w-4" />
                    {item.date}
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{item.body}</CardContent>
              </Card>
            );
          })}
        </div>
      </section>
      <section className="border-y border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.035),rgba(15,23,42,.12))] py-20">
        <div className="container">
          <SectionHeading
            eyebrow="News"
            title="Community intelligence"
            description="Highlights from server operations, events, balance policies, and regional play."
            eyebrowKey="page.news.eyebrow"
            titleKey="page.news.title"
            descriptionKey="page.news.description"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {newsCards.map((rawCard) => {
              const card = localized(rawCard, locale);

              return (
                <Card key={rawCard.title} className="group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary/30">
                  <div className="relative h-48 overflow-hidden">
                    <img src={card.image} alt={card.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>
                  <CardHeader className="relative z-10 -mt-5">
                    <CardTitle>{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{card.excerpt}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      <section className="container py-20">
        <SectionHeading eyebrow="Server features" title="Built for serious survival communities" eyebrowKey="page.features.eyebrow" titleKey="page.features.title" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((rawFeature) => {
            const feature = localized(rawFeature, locale);
            const Icon = featureIcons[rawFeature.icon as keyof typeof featureIcons] ?? RadioTower;

            return (
              <Card key={rawFeature.title} className="hud-card transition duration-300 hover:-translate-y-1 hover:border-secondary/30">
                <CardContent className="p-5">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-primary/20 bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-5 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/dinosaurs">
            <LocalizedText tKey="cta.exploreDinosaurs" />
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </>
  );
}
