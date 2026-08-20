import { Database, Github, RadioTower, ServerCog } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ServerStatusSummary } from "@/components/server-status-summary";
import { getFastServerStatusOrInitial } from "@/lib/firebase/server-status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const infra = [
  { icon: Github, title: "GitHub", body: "Source code and change history", tone: "from-cyan-300/25 via-sky-300/10 to-white/5" },
  { icon: RadioTower, title: "Vercel", body: "Website deploy and API routes", tone: "from-emerald-300/25 via-teal-300/10 to-white/5" },
  { icon: Database, title: "Firebase", body: "Server status and page content", tone: "from-amber-300/25 via-orange-300/10 to-white/5" },
  { icon: ServerCog, title: "BisectHosting", body: "The Isle Evrima game server", tone: "from-fuchsia-300/25 via-pink-300/10 to-white/5" }
];

export default async function ServerPage() {
  const status = await getFastServerStatusOrInitial();

  return (
    <main className="container min-h-screen pt-28 pb-20 sm:pt-32">
      <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_12%_18%,rgba(45,212,191,.28),transparent_30%),radial-gradient(circle_at_88%_14%,rgba(34,211,238,.18),transparent_28%),linear-gradient(135deg,rgba(6,20,18,.92),rgba(9,16,26,.78)_55%,rgba(38,16,30,.62))] p-6 shadow-[0_30px_120px_rgba(0,0,0,.45)] sm:p-8">
        <div className="absolute right-8 top-8 h-2 w-2 rounded-full bg-primary shadow-[0_0_28px_rgba(45,212,191,.9)]" />
        <SectionHeading
          eyebrow="Server"
          title="ASIA JP,MNG,KR Test server hub"
          description="Live server status, connection details, voice service, hosting stack, and public community information in one clean dashboard."
        />
        <ServerStatusSummary status={status} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {infra.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className={`rounded-lg border border-white/10 bg-gradient-to-br ${item.tone} p-5 shadow-[0_18px_60px_rgba(0,0,0,.26)]`}>
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-primary/25 bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-black text-white">{item.title}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{item.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}