import { SectionHeading } from "@/components/section-heading";
import { DinosaurGrid } from "@/components/dinosaur-grid";
import { getFirestoreDinosaurs } from "@/lib/firebase/firestore-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DinosaursPage() {
  const dinosaurs = await getFirestoreDinosaurs();

  return (
    <main className="container min-h-screen pt-32 pb-20 sm:pt-36">
      <SectionHeading eyebrow="Dinosaurs" title="Playable dinosaur field guide" description="Every profile is structured for later game balance and wiki data integration." eyebrowKey="nav.dinosaurs" titleKey="page.dinosaurs.title" descriptionKey="page.dinosaurs.description" />
      <DinosaurGrid dinosaurs={dinosaurs} />
    </main>
  );
}
