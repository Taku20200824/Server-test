import { SectionHeading } from "@/components/section-heading";
import { EventsContent } from "@/components/events-content";
import { getFirestoreEvents } from "@/lib/firebase/firestore-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EventsPage() {
  const events = await getFirestoreEvents();

  return (
    <main className="container min-h-screen pt-28 pb-20">
      <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_10%_16%,rgba(45,212,191,.24),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(244,114,182,.18),transparent_30%),linear-gradient(135deg,rgba(6,20,18,.94),rgba(9,16,26,.82)_55%,rgba(39,21,10,.58))] p-6 shadow-[0_30px_120px_rgba(0,0,0,.45)] sm:p-8">
        <SectionHeading eyebrow="Events" title="Community calendar" description="Weekly events, Double Growth Weekend, and PvP Tournament scheduling." eyebrowKey="nav.events" titleKey="page.events.title" descriptionKey="page.events.description" />
        <EventsContent events={events} />
      </section>
    </main>
  );
}