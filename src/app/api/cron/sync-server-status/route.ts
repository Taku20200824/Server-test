import { NextRequest, NextResponse } from "next/server";
import { syncServerStatusToFirebase } from "@/lib/integrations/server-status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return true;
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await syncServerStatusToFirebase();

  return NextResponse.json({ ok: true, status });
}
