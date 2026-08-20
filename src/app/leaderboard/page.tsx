import Link from "next/link";
import { Crown, Skull, Timer, Trophy, UserRound } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { SteamRankPanel } from "@/components/steam-rank-panel";
import { Card, CardContent } from "@/components/ui/card";
import { getFirestoreLeaderboard } from "@/lib/firebase/rankings";
import { formatPlaytime } from "@/lib/format-playtime";
import { LocalizedText } from "@/components/localized-text";
import type { TranslationKey } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const tableHeaders: Array<[string, TranslationKey]> = [
  ["Rank", "table.rank"],
  ["Player", "table.player"],
  ["Playtime", "table.playtime"],
  ["Kills", "table.kills"],
  ["Deaths", "table.deaths"],
  ["Growth", "table.growth"],
  ["Nest Success", "table.nestSuccess"],
  ["Favorite", "table.favorite"]
];

const podiumTones = [
  "from-amber-300/30 via-orange-300/15 to-white/[.04]",
  "from-cyan-300/25 via-sky-300/12 to-white/[.04]",
  "from-emerald-300/25 via-teal-300/12 to-white/[.04]"
];

export default async function LeaderboardPage() {
  const leaderboard = await getFirestoreLeaderboard();
  const topPlayers = leaderboard.slice(0, 3);

  return (
    <main className="container min-h-screen pt-28 pb-20">
      <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_8%_18%,rgba(45,212,191,.24),transparent_28%),radial-gradient(circle_at_92%_12%,rgba(250,204,21,.16),transparent_30%),linear-gradient(135deg,rgba(6,20,18,.94),rgba(9,16,26,.8)_55%,rgba(40,20,12,.58))] p-6 shadow-[0_30px_120px_rgba(0,0,0,.45)] sm:p-8">
        <SectionHeading eyebrow="Leaderboard" title="Top players" description="Rankings for playtime, kills, deaths, growth, and nest success." eyebrowKey="nav.leaderboard" titleKey="page.leaderboard.title" descriptionKey="page.leaderboard.description" />

        <div className="grid gap-4 md:grid-cols-3">
          {topPlayers.map((player, index) => (
            <div key={`${player.username}-${index}`} className={`rounded-lg border border-white/10 bg-gradient-to-br ${podiumTones[index]} p-5 shadow-[0_20px_70px_rgba(0,0,0,.32)]`}>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-black/35 font-display text-lg font-black text-primary">#{index + 1}</span>
                {index === 0 ? <Crown className="h-6 w-6 text-amber-300" /> : <Trophy className="h-6 w-6 text-primary" />}
              </div>
              <Link href={`/players/${encodeURIComponent(player.steamId || player.username)}`} className="mt-4 block break-words font-display text-2xl font-black text-white hover:text-primary">
                {player.username}
              </Link>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-zinc-300">
                <div className="rounded-md border border-white/10 bg-black/25 p-2"><Timer className="mb-1 h-4 w-4 text-primary" />{formatPlaytime(player.playtimeSeconds)}</div>
                <div className="rounded-md border border-white/10 bg-black/25 p-2"><Skull className="mb-1 h-4 w-4 text-rose-300" />{player.kills}</div>
                <div className="rounded-md border border-white/10 bg-black/25 p-2"><UserRound className="mb-1 h-4 w-4 text-sky-300" />{player.dinosaur}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <SteamRankPanel />
      </div>

      <Card className="mt-8 overflow-hidden border-white/10 bg-black/35 shadow-[0_24px_80px_rgba(0,0,0,.35)]">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/[0.06] text-zinc-400">
              <tr>
                {tableHeaders.map(([head, key]) => (
                  <th key={head} className="px-5 py-4 font-semibold"><LocalizedText tKey={key} /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player, index) => (
                <tr key={`${player.username}-${index}`} className="border-t border-white/10 transition hover:bg-white/[.04]">
                  <td className="px-5 py-4 font-bold text-primary">#{index + 1}</td>
                  <td className="px-5 py-4">
                    <Link href={`/players/${encodeURIComponent(player.steamId || player.username)}`} className="font-semibold text-white hover:text-primary">{player.username}</Link>
                  </td>
                  <td className="px-5 py-4 text-zinc-300">{formatPlaytime(player.playtimeSeconds)}</td>
                  <td className="px-5 py-4 text-zinc-300">{player.kills}</td>
                  <td className="px-5 py-4 text-zinc-300">{player.deaths}</td>
                  <td className="px-5 py-4 text-zinc-300">{player.growth}%</td>
                  <td className="px-5 py-4 text-zinc-300">{player.nest}</td>
                  <td className="px-5 py-4 text-zinc-300">{player.dinosaur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}
