import { NextResponse } from "next/server";
import { getSiteTextOverrides } from "@/lib/firebase/site-texts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await getSiteTextOverrides());
}
