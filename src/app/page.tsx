import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { HomeContentSections } from "@/components/home-content-sections";
import { DinosaurShowcase } from "@/components/dinosaur-showcase";
import { getFirestoreAnnouncements, getFirestoreFeatures, getFirestoreNewsCards } from "@/lib/firebase/firestore-data";
import { getFastServerStatusOrInitial } from "@/lib/firebase/server-status";
import { ServerStatusSummary } from "@/components/server-status-summary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  const [announcements, serverStatus, newsCards, features] = await Promise.all([
    getFirestoreAnnouncements(),
    getFastServerStatusOrInitial(),
    getFirestoreNewsCards(),
    getFirestoreFeatures()
  ]);

  return (
    <main>
      <Hero serverStatus={serverStatus} />
      <DinosaurShowcase />
      <section className="container py-20">
        <SectionHeading
          eyebrow="BisectHosting server"
          title="Live community server information"
          description="The Isle runs on BisectHosting. The website reads server information from Firebase."
          eyebrowKey="page.server.eyebrow"
          titleKey="page.server.title"
          descriptionKey="page.server.description"
        />
        <ServerStatusSummary status={serverStatus} />
      </section>
      <HomeContentSections announcements={announcements} newsCards={newsCards} features={features} />
    </main>
  );
}
