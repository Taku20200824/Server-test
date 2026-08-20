import type { PlayerProfile } from "@/lib/firebase/player-profiles";

export type PlayerQuest = {
  id: string;
  title: string;
  description: string;
  metric: string;
  current: number;
  target: number;
  reward: string;
};

function clampProgress(current: number, target: number) {
  return Math.max(0, Math.min(target, Math.floor(current)));
}

export function getPlayerQuests(profile: PlayerProfile | null, steamId: string | null): PlayerQuest[] {
  const playtimeSeconds = profile?.playtimeSeconds ?? (profile?.playtimeMinutes ?? 0) * 60;
  const kills = profile?.kills ?? 0;
  const nest = profile?.nest ?? 0;
  const growth = profile?.growth ?? 0;
  const linked = steamId || profile?.steamId ? 1 : 0;

  return [
    {
      id: "steam-link",
      title: "Link Steam",
      description: "Connect your Steam profile so server progress can be tracked.",
      metric: "linked",
      current: linked,
      target: 1,
      reward: "Quest access"
    },
    {
      id: "first-survival",
      title: "First Survival Run",
      description: "Survive on the server for 30 minutes.",
      metric: "seconds",
      current: clampProgress(playtimeSeconds, 30 * 60),
      target: 30 * 60,
      reward: "+30 rank score"
    },
    {
      id: "pack-session",
      title: "Pack Session",
      description: "Play for 1 hour with your linked profile.",
      metric: "seconds",
      current: clampProgress(playtimeSeconds, 60 * 60),
      target: 60 * 60,
      reward: "+60 rank score"
    },
    {
      id: "island-regular",
      title: "Island Regular",
      description: "Build 2 hours of tracked playtime.",
      metric: "seconds",
      current: clampProgress(playtimeSeconds, 2 * 60 * 60),
      target: 2 * 60 * 60,
      reward: "+120 rank score"
    },
    {
      id: "first-hunt",
      title: "First Hunt",
      description: "Record your first kill on the community profile.",
      metric: "kills",
      current: clampProgress(kills, 1),
      target: 1,
      reward: "Hunter badge ready"
    },
    {
      id: "nest-helper",
      title: "Nest Helper",
      description: "Record one nest success for the community.",
      metric: "nest",
      current: clampProgress(nest, 1),
      target: 1,
      reward: "Nest badge ready"
    },
    {
      id: "full-growth",
      title: "Reach Full Growth",
      description: "Track a profile at 100% growth.",
      metric: "growth",
      current: clampProgress(growth, 100),
      target: 100,
      reward: "Survivor badge ready"
    }
  ];
}

export function getQuestSummary(quests: PlayerQuest[]) {
  const completed = quests.filter((quest) => quest.current >= quest.target).length;

  return {
    completed,
    total: quests.length,
    percent: quests.length ? Math.round((completed / quests.length) * 100) : 0
  };
}
