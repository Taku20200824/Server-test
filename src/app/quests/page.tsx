import { SectionHeading } from "@/components/section-heading";
import { QuestProgressPanel } from "@/components/quest-progress-panel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function QuestsPage() {
  return (
    <main className="container min-h-screen pt-28 pb-20">
      <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_10%_16%,rgba(45,212,191,.24),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(250,204,21,.16),transparent_28%),linear-gradient(135deg,rgba(6,20,18,.94),rgba(9,16,26,.82)_55%,rgba(26,18,38,.58))] p-6 shadow-[0_30px_120px_rgba(0,0,0,.45)] sm:p-8">
        <SectionHeading
          eyebrow="Server quests"
          title="Community progression"
          description="Steam-linked quests powered by live server profile data. Playtime quests update automatically when the server tracker syncs you."
        />
        <QuestProgressPanel />
      </section>
    </main>
  );
}
