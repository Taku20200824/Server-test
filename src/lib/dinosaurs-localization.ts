import type { DinosaurRecord } from "@/lib/firebase/firestore-data";
import type { Locale } from "@/lib/i18n";

export function localizeDinosaur(dinosaur: DinosaurRecord, locale: Locale): DinosaurRecord {
  const localized = dinosaur.i18n?.[locale] ?? {};

  return {
    ...dinosaur,
    ...localized,
    i18n: dinosaur.i18n
  };
}
