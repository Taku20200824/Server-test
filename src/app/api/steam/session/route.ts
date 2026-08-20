import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fetchSteamPublicProfile, getPlayerProfile, touchSteamPlayerSession, upsertSteamPlayerProfile } from "@/lib/firebase/player-profiles";
import { getServerStatusOrInitial } from "@/lib/firebase/server-status";
import { createSignedMumbleName, readSteamVoiceCookie, steamVoiceCookieName } from "@/lib/steam-voice";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const steamId = readSteamVoiceCookie(cookieStore.get(steamVoiceCookieName)?.value);

  if (!steamId) {
    return NextResponse.json({ authenticated: false });
  }

  const status = await getServerStatusOrInitial();
  const mumbleUrl = status.voiceHost
    ? `mumble://${encodeURIComponent(createSignedMumbleName(steamId))}@${status.voiceHost}:${status.voicePort}`
    : null;

  let profile = await getPlayerProfile(steamId);

  try {
    const publicProfile = await fetchSteamPublicProfile(steamId);
    const updatedProfile = await upsertSteamPlayerProfile(publicProfile);

    if (updatedProfile) {
      profile = updatedProfile;
    } else if (!publicProfile.isFallback || !profile) {
      const playtimeMinutes = profile?.playtimeMinutes ?? 0;
      profile = {
        ...publicProfile,
        username: publicProfile.isFallback ? "Steam linked" : publicProfile.personaName,
        playtimeMinutes,
        playtimeSeconds: profile?.playtimeSeconds ?? playtimeMinutes * 60,
        kills: profile?.kills ?? 0,
        deaths: profile?.deaths ?? 0,
        growth: profile?.growth ?? 0,
        nest: profile?.nest ?? 0,
        favoriteDinosaur: profile?.favoriteDinosaur ?? "Unknown",
        rankScore: profile?.rankScore ?? 0,
        lastSeen: profile?.lastSeen ?? null,
        createdAt: profile?.createdAt ?? null,
        updatedAt: profile?.updatedAt ?? null
      };
    }
  } catch {
    profile = profile ?? null;
  }

  try {
    await touchSteamPlayerSession(steamId, "website-session");
  } catch {
    // Session reads should remain fast even if Firebase Admin is not configured.
  }

  return NextResponse.json({ authenticated: true, steamId, mumbleUrl, profile });
}
