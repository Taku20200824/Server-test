import { NextResponse } from "next/server";
import { getPublicOrigin, steamVoiceCookieName } from "@/lib/steam-voice";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = getPublicOrigin(request.url);
  const response = NextResponse.redirect(new URL("/leaderboard", origin));

  response.cookies.set(steamVoiceCookieName, "", {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return response;
}
