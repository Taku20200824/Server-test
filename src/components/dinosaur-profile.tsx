"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import { getDinosaurImage } from "@/lib/dinosaur-images";
import { localizeDinosaur } from "@/lib/dinosaurs-localization";
import type { DinosaurRecord } from "@/lib/firebase/firestore-data";
import type { TranslationKey } from "@/lib/i18n";

type DinosaurProfileProps = {
  dinosaur: DinosaurRecord;
};

export function DinosaurProfile({ dinosaur }: DinosaurProfileProps) {
  const { locale, t } = useLanguage();
  const dino = localizeDinosaur(dinosaur, locale);

  const details: Array<[TranslationKey, string]> = [
    ["dino.status", dino.status || "Playable"],
    ["dino.role", dino.role || dino.category || dino.diet],
    ["dino.difficulty", dino.difficulty || "Standard"],
    ["dino.growthTime", dino.growth],
    ["dino.strength", dino.strength],
    ["dino.weakness", dino.weakness],
    ["dino.playstyle", dino.playstyle]
  ];

  return (
    <main className="min-h-screen pt-16">
      <section className="relative min-h-[58vh] overflow-hidden">
        <img
          src={getDinosaurImage(dino.slug, dino.image)}
          alt={dino.name}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/45" />
        <div className="container relative z-10 flex min-h-[58vh] items-center py-16">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <Badge>{dino.diet}</Badge>
              {dino.category ? <Badge className="bg-white/10 text-white">{dino.category}</Badge> : null}
            </div>
            <h1 className="mt-5 break-words font-display text-5xl font-black sm:text-7xl">{dino.name}</h1>
            {dino.scientificName ? (
              <p className="mt-2 text-lg italic text-primary/85">{dino.scientificName}</p>
            ) : null}
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{dino.summary || dino.playstyle}</p>
          </div>
        </div>
      </section>
      <section className="container grid gap-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        {details.map(([labelKey, value]) => (
          <Card key={labelKey} className={labelKey === "dino.playstyle" ? "lg:col-span-2" : undefined}>
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{t(labelKey)}</div>
              <div className="mt-2 break-words font-semibold leading-7">{value}</div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
