import { getPlayerProfiles } from "@/lib/firebase/player-profiles";

export type RankPlayer = {
  username: string;
  playtime: number;
  playtimeSeconds: number;
  kills: number;
  deaths: number;
  growth: number;
  nest: number;
  dinosaur: string;
  discord: string;
  avatar: string;
  steamId: string;
};

function scoreRank(player: Pick<RankPlayer, "playtime" | "kills" | "deaths" | "growth" | "nest">) {
  return player.playtime * 10 + player.kills * 25 + player.nest * 15 + player.growth - player.deaths * 5;
}

function isGeneratedSteamName(name: string, steamId: string) {
  return name === steamId || name === `Steam ${steamId.slice(-6)}`;
}

function displayName(username: string, personaName: string, steamId: string, isFallback?: boolean) {
  const name = username || personaName || "";

  if (!name || isFallback || isGeneratedSteamName(name, steamId)) {
    return "Steam linked";
  }

  return name;
}

export async function getFirestoreLeaderboard(): Promise<RankPlayer[]> {
  const profiles = await getPlayerProfiles();
  const players: RankPlayer[] = profiles.map((profile) => ({
    username: displayName(profile.username, profile.personaName, profile.steamId, profile.isFallback),
    playtime: profile.playtimeSeconds / 3600,
    playtimeSeconds: profile.playtimeSeconds,
    kills: profile.kills,
    deaths: profile.deaths,
    growth: profile.growth,
    nest: profile.nest,
    dinosaur: profile.favoriteDinosaur,
    discord: profile.profileUrl,
    avatar: profile.avatarUrl,
    steamId: profile.steamId
  }));

  return players
    .sort((a, b) => scoreRank(b) - scoreRank(a))
    .slice(0, 25);
}

export async function getFirestorePlayer(username: string) {
  const players = await getFirestoreLeaderboard();
  const normalized = username.toLowerCase();

  return players.find((player) => player.username.toLowerCase() === normalized || player.steamId === username);
}
