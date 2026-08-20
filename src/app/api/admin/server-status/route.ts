import { NextResponse } from "next/server";
import { requireFirebaseAdmin } from "@/lib/firebase/admin-auth";
import { getServerStatusOrInitial, seedServerStatusDocument, updateServerStatusDocument } from "@/lib/firebase/server-status";

export async function GET() {
  return NextResponse.json(await getServerStatusOrInitial());
}

export async function POST(request: Request) {
  try {
    await requireFirebaseAdmin(request.headers.get("authorization"));
    await seedServerStatusDocument();

    return NextResponse.json(await getServerStatusOrInitial());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to seed server status." }, { status: 403 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireFirebaseAdmin(request.headers.get("authorization"));
    const body = await request.json();
    const status = await updateServerStatusDocument(body);

    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update server status.";
    const status = message.includes("administrator") || message.includes("token") ? 403 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
