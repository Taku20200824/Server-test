"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import { getDinosaurImage } from "@/lib/dinosaur-images";
import { localizeDinosaur } from "@/lib/dinosaurs-localization";
import type { DinosaurRecord } from "@/lib/firebase/firestore-data";

type DinosaurGridProps = {
  dinosaurs: DinosaurRecord[];
};

export function DinosaurGrid({ dinosaurs }: DinosaurGridProps) {
  const { locale } = useLanguage();

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {dinosaurs.map((rawDino) => {
        const dino = localizeDinosaur(rawDino, locale);

        return (
          <Link href={`/dinosaurs/${dino.slug}`} key={dino.slug}>
            <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:border-primary/40">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getDinosaurImage(dino.slug, dino.image)}
                  alt={dino.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <Badge className="absolute left-4 top-4 bg-black/50 text-white">{dino.diet}</Badge>
              </div>
              <CardHeader className="relative z-10 -mt-6">
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="min-w-0 break-words">{dino.name}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{dino.role || dino.growth}</p>
                <p className="mt-2 line-clamp-3">{dino.summary || dino.strength}</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
