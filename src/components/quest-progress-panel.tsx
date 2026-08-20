"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Compass, ExternalLink, LogIn, Target, Timer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPlaytime } from "@/lib/format-playtime";
import { getPlayerQuests, getQuestSummary, type PlayerQuest } from "@/lib/quests";
import type { PlayerProfile } from "@/lib/firebase/player-profiles";

type SteamSession =
  | { authenticated: false }
  | { authenticated: true; steamId: string; mumbleUrl: string | null; profile: PlayerProfile | null };

function formatQuestValue(quest: PlayerQuest, value: number) {
  if (quest.metric === "seconds") return formatPlaytime(value);
  if (quest.metric === "growth") return `${value}%`;
  return String(value);
}

export function QuestProgressPanel() {
  const [session, setSession] = useState<SteamSession | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/steam/session", { cache: "no-store" })
      .then((response) => response.json() as Promise<SteamSession>)
      .then((data) => {
        if (mounted) setSession(data);
      })
      .catch(() => {
        if (mounted) setSession({ authenticated: false });
      });

    return () => {
      mounted = false;
    };
  }, []);

  const steamId = session?.authenticated ? session.steamId : null;
  const profile = session?.authenticated ? session.profile : null;
  const quests = getPlayerQuests(profile, steamId);
  const summary = getQuestSummary(quests);

  return (
    <>
      <div className="rounded-lg border border-white/10 bg-black/35 p-4 sm:min-w-[240px]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
          <Trophy className="h-4 w-4" /> Quest progress
        </div>
        <div className="mt-2 font-display text-3xl font-black text-white">
          {summary.completed}/{summary.total}
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${summary.percent}%` }} />
        </div>
      </div>

      {!session ? (
        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm text-zinc-400">Loading quests...</div>
      ) : !session.authenticated ? (
        <div className="mt-6 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-primary"><LogIn className="h-4 w-4" /> Steam required</div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">Sign in with Steam to see your own quest progress and sync playtime from the server.</p>
            </div>
            <Button asChild>
              <a href="/api/steam/login"><LogIn className="h-4 w-4" /> Sign in with Steam</a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-zinc-300">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span>Steam linked: <span className="font-semibold text-white">{profile?.username || profile?.personaName || session.steamId}</span></span>
          <Link href={`/players/${session.steamId}`} className="inline-flex items-center gap-1 text-primary hover:text-white">
            Profile <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quests.map((quest) => {
          const done = quest.current >= quest.target;
          const percent = Math.round((quest.current / quest.target) * 100);

          return (
            <article key={quest.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,.28)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-black/30">
                  {done ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-zinc-500" />}
                </div>
                <span className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs font-bold text-zinc-300">
                  {formatQuestValue(quest, quest.current)} / {formatQuestValue(quest, quest.target)}
                </span>
              </div>
              <h2 className="mt-4 font-display text-xl font-black text-white">{quest.title}</h2>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-zinc-400">{quest.description}</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, percent)}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1"><Target className="h-3.5 w-3.5 text-primary" /> {done ? "Complete" : "In progress"}</span>
                <span className="inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5 text-amber-300" /> {quest.reward}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-black/35 p-5">
        <div className="flex items-start gap-3">
          <Compass className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-zinc-400">
            In-game Evrima zone goals like migration, patrol, sanctuary, and Prime progress are still handled by the game. This page tracks TAKU community quests from the server profile database.
          </p>
        </div>
      </section>
    </>
  );
}
