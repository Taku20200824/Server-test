import { NextRequest, NextResponse } from "next/server";
import { addSteamPlaytimeSeconds } from "@/lib/firebase/player-profiles";
import { isSteamId } from "@/lib/steam-voice";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const supplied = request.headers.get("authorization");
  const allowedSecrets = [process.env.SERVER_TRACKER_SECRET, process.env.STEAM_VOICE_SECRET].filter(
    (secret): secret is string => Boolean(secret)
  );

  return allowedSecrets.some((secret) => supplied === `Bearer ${secret}`);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { steamId?: unknown; minutes?: unknown; seconds?: unknown; source?: unknown };
  const steamId = String(body.steamId ?? "");
  const seconds = body.seconds === undefined ? Number(body.minutes ?? 0) * 60 : Number(body.seconds ?? 0);
  const source = String(body.source ?? "server-tracker");

  if (!isSteamId(steamId) || !Number.isFinite(seconds) || seconds <= 0) {
    return NextResponse.json({ error: "Invalid steamId or playtime" }, { status: 400 });
  }

  const profile = await addSteamPlaytimeSeconds(steamId, seconds, source);

  return NextResponse.json({ ok: true, profile });
}
