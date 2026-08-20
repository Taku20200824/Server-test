import { NextResponse } from "next/server";
import { getPublicOrigin } from "@/lib/steam-voice";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = getPublicOrigin(request.url);
  const returnTo = `${origin}/api/steam/callback`;
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": `${origin}/`,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
  });

  return NextResponse.redirect(`https://steamcommunity.com/openid/login?${params.toString()}`);
}
