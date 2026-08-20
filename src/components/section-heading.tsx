"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  eyebrowKey,
  titleKey,
  descriptionKey
}: {
  eyebrow: string;
  title: string;
  description?: string;
  eyebrowKey?: TranslationKey;
  titleKey?: TranslationKey;
  descriptionKey?: TranslationKey;
}) {
  const { locale, t } = useLanguage();
  const renderedEyebrow = eyebrowKey ? t(eyebrowKey) : eyebrow;
  const renderedTitle = titleKey ? t(titleKey) : title;
  const renderedDescription = descriptionKey ? t(descriptionKey) : description;

  return (
    <div className="mb-8 max-w-3xl">
      <Badge className="border-primary/25 bg-primary/10 text-primary">{renderedEyebrow}</Badge>
      <h2
        className={cn(
          "mt-4 max-w-full break-words text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl",
          locale === "mn" && "text-2xl sm:text-3xl"
        )}
      >
        {renderedTitle}
      </h2>
      <div className="accent-rule mt-5" />
      {renderedDescription ? <p className="mt-4 max-w-full break-words leading-7 text-muted-foreground">{renderedDescription}</p> : null}
    </div>
  );
}
