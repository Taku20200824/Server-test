import { NextResponse } from "next/server";
import { getServerStatus } from "@/lib/integrations/server-status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await getServerStatus());
}
