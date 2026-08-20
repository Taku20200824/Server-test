import { NextResponse } from "next/server";
import { fetchSteamPublicProfile, upsertSteamPlayerProfile } from "@/lib/firebase/player-profiles";
import {
  createSteamVoiceCookie,
  getPublicOrigin,
  steamIdFromClaimedId,
  steamVoiceCookieName
} from "@/lib/steam-voice";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = getPublicOrigin(request.url);
  const expectedReturnTo = `${origin}/api/steam/callback`;
  const failureUrl = new URL("/voice?steam=failed", origin);
  const params = requestUrl.searchParams;

  if (params.get("openid.mode") !== "id_res" || params.get("openid.return_to") !== expectedReturnTo) {
    return NextResponse.redirect(failureUrl);
  }

  const claimedId = params.get("openid.claimed_id") ?? "";
  const steamId = steamIdFromClaimedId(claimedId);

  if (!steamId || params.get("openid.identity") !== claimedId) {
    return NextResponse.redirect(failureUrl);
  }

  const verificationParams = new URLSearchParams();
  params.forEach((value, key) => {
    if (key.startsWith("openid.")) {
      verificationParams.set(key, value);
    }
  });
  verificationParams.set("openid.mode", "check_authentication");

  const verification = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: verificationParams.toString(),
    cache: "no-store"
  });
  const verificationBody = await verification.text();

  if (!verification.ok || !/(^|\n)is_valid:true(\n|$)/.test(verificationBody)) {
    return NextResponse.redirect(failureUrl);
  }

  try {
    const profile = await fetchSteamPublicProfile(steamId);
    await upsertSteamPlayerProfile(profile);
  } catch {
    // Login still succeeds if Firebase Admin or Steam profile fetch is unavailable.
  }

  const response = NextResponse.redirect(new URL("/voice?steam=connected", origin));
  response.cookies.set(steamVoiceCookieName, createSteamVoiceCookie(steamId), {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}