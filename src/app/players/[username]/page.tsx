import { notFound } from "next/navigation";
import { ExternalLink, MessageCircle, Shield, Skull, Timer, Trophy, UserRound } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { getFirestoreLeaderboard, getFirestorePlayer } from "@/lib/firebase/rankings";
import { formatPlaytime } from "@/lib/format-playtime";

export async function generateStaticParams() {
  const leaderboard = await getFirestoreLeaderboard();
  return leaderboard.map((player) => ({ username: player.username }));
}

type PlayerProfilePageProps = {
  params: Promise<{ username: string }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { username } = await params;
  const player = await getFirestorePlayer(decodeURIComponent(username));

  if (!player) {
    notFound();
  }

  const stats = [
    ["Playtime", formatPlaytime(player.playtimeSeconds), Timer, "text-cyan-300"],
    ["Kills", String(player.kills), Skull, "text-rose-300"],
    ["Deaths", String(player.deaths), Shield, "text-amber-300"],
    ["Growth", `${player.growth}%`, Trophy, "text-emerald-300"],
    ["Nest Success", String(player.nest), UserRound, "text-sky-300"],
    ["Favorite Dinosaur", player.dinosaur, UserRound, "text-fuchsia-300"]
  ] as const;

  return (
    <main className="container min-h-screen pt-28 pb-20">
      <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_10%_18%,rgba(45,212,191,.26),transparent_30%),radial-gradient(circle_at_90%_14%,rgba(244,114,182,.18),transparent_28%),linear-gradient(135deg,rgba(6,20,18,.94),rgba(9,16,26,.8)_55%,rgba(30,18,42,.58))] p-6 shadow-[0_30px_120px_rgba(0,0,0,.45)] sm:p-8">
        <SectionHeading eyebrow="Player profile" title={player.username} description="Steam-linked public profile, playtime, rank stats, and community progression." />

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <div className="rounded-lg border border-white/10 bg-black/35 p-5 text-center shadow-[0_20px_70px_rgba(0,0,0,.3)]">
            <img src={player.avatar || `https://api.dicebear.com/9.x/shapes/svg?seed=${player.username}`} alt="" className="mx-auto h-44 w-44 rounded-lg border border-white/10 bg-white/10 p-2" />
            <h2 className="mt-4 break-words font-display text-2xl font-black text-white">{player.username}</h2>
            <p className="mt-2 text-xs text-zinc-400">{player.steamId ? `SteamID ${player.steamId}` : "Community profile"}</p>
            <Button className="mt-5 w-full" asChild>
              <a href={player.discord || "https://discord.com"} target="_blank" rel="noreferrer">
                {player.steamId ? <ExternalLink className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                {player.steamId ? "Steam Profile" : "Discord Link"}
              </a>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map(([label, value, Icon, color]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-[0_16px_50px_rgba(0,0,0,.25)]">
                <Icon className={`h-5 w-5 ${color}`} />
                <div className="mt-4 text-sm text-zinc-400">{label}</div>
                <div className="mt-1 break-words text-2xl font-black text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
