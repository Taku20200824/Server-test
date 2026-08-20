"use client";

import { useEffect, useState } from "react";
import { ExternalLink, LogIn, LogOut, Timer, Trophy, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPlaytime } from "@/lib/format-playtime";
import type { PlayerProfile } from "@/lib/firebase/player-profiles";

type SteamSession =
  | { authenticated: false }
  | { authenticated: true; steamId: string; mumbleUrl: string | null; profile: PlayerProfile | null };

function getDisplayName(profile: PlayerProfile | null, steamId: string) {
  const name = profile?.username || profile?.personaName || "";
  const fallbackName = `Steam ${steamId.slice(-6)}`;

  if (!name || name === steamId || name === fallbackName || profile?.isFallback) {
    return "Steam linked";
  }

  return name;
}

function getPlaytimeSeconds(profile: PlayerProfile | null) {
  return profile?.playtimeSeconds ?? (profile?.playtimeMinutes ?? 0) * 60;
}

export function SteamRankPanel() {
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

  if (!session) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[.04] p-5 text-sm text-zinc-400">
        Loading Steam rank...
      </div>
    );
  }

  if (!session.authenticated) {
    return (
      <div className="rounded-lg border border-white/10 bg-gradient-to-br from-cyan-300/20 via-sky-300/8 to-white/[.03] p-5 shadow-[0_20px_70px_rgba(0,0,0,.28)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
              <Trophy className="h-4 w-4" /> Steam rank
            </div>
            <h2 className="mt-2 font-display text-2xl font-black text-white">Link Steam to join the ranking</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Steam login creates your public player profile. Playtime can be synced by the server tracker once your SteamID is linked.</p>
          </div>
          <Button asChild className="shrink-0">
            <a href="/api/steam/login">
              <LogIn className="h-4 w-4" />
              Sign in with Steam
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const profile = session.profile;
  const displayName = getDisplayName(profile, session.steamId);
  const playtime = formatPlaytime(getPlaytimeSeconds(profile));

  return (
    <div className="rounded-lg border border-white/10 bg-gradient-to-br from-emerald-300/20 via-teal-300/8 to-white/[.03] p-5 shadow-[0_20px_70px_rgba(0,0,0,.28)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img src={profile?.avatarUrl || `https://api.dicebear.com/9.x/shapes/svg?seed=${session.steamId}`} alt="" className="h-16 w-16 rounded-md border border-white/10 bg-black/30 p-1" />
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
              <UserRound className="h-4 w-4" /> Steam linked
            </div>
            <h2 className="mt-1 break-words font-display text-2xl font-black text-white">{displayName}</h2>
            <p className="mt-1 text-xs text-zinc-500">SteamID {session.steamId}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
          <div className="rounded-md border border-white/10 bg-black/25 p-3">
            <Timer className="h-4 w-4 text-cyan-300" />
            <div className="mt-2 text-lg font-black text-white">{playtime}</div>
            <div className="text-xs text-zinc-500">Playtime</div>
          </div>
          <a href={profile?.profileUrl || `https://steamcommunity.com/profiles/${session.steamId}`} target="_blank" rel="noreferrer" className="rounded-md border border-white/10 bg-black/25 p-3 transition hover:bg-white/[.06]">
            <ExternalLink className="h-4 w-4 text-primary" />
            <div className="mt-2 text-sm font-bold text-white">Steam</div>
            <div className="text-xs text-zinc-500">Open profile</div>
          </a>
          <a href="/api/steam/logout" className="rounded-md border border-white/10 bg-black/25 p-3 transition hover:bg-white/[.06]">
            <LogOut className="h-4 w-4 text-zinc-300" />
            <div className="mt-2 text-sm font-bold text-white">Logout</div>
            <div className="text-xs text-zinc-500">Switch user</div>
          </a>
        </div>
      </div>
    </div>
  );
}
