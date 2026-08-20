import { createHmac, timingSafeEqual } from "node:crypto";

export const steamVoiceCookieName = "taku-steam-voice";

const steamIdPattern = /^7656119\d{10}$/;

function getSecret() {
  const secret = process.env.STEAM_VOICE_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("STEAM_VOICE_SECRET must contain at least 32 characters");
  }

  return secret;
}

function signature(purpose: string, value: string) {
  return createHmac("sha256", getSecret()).update(`${purpose}:${value}`).digest("hex");
}

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isSteamId(value: string) {
  return steamIdPattern.test(value);
}

export function steamIdFromClaimedId(claimedId: string) {
  const match = claimedId.match(/^https:\/\/steamcommunity\.com\/openid\/id\/(7656119\d{10})\/?$/);
  return match?.[1] ?? null;
}

export function createSteamVoiceCookie(steamId: string) {
  if (!isSteamId(steamId)) {
    throw new Error("Invalid SteamID64");
  }

  return `${steamId}.${signature("session", steamId)}`;
}

export function readSteamVoiceCookie(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [steamId, suppliedSignature, ...rest] = value.split(".");
  if (rest.length || !steamId || !suppliedSignature || !isSteamId(steamId)) {
    return null;
  }

  return secureEqual(suppliedSignature, signature("session", steamId)) ? steamId : null;
}

export function createSignedMumbleName(steamId: string) {
  if (!isSteamId(steamId)) {
    throw new Error("Invalid SteamID64");
  }

  return `taku_${steamId}_${signature("mumble", steamId).slice(0, 32)}`;
}

export function getPublicOrigin(requestUrl: string) {
  const configured = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
  return configured || new URL(requestUrl).origin;
}
