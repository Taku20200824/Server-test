import type { Metadata } from "next";
import { VoicePageContent } from "@/components/voice-page-content";
import { getServerStatusOrInitial } from "@/lib/firebase/server-status";

export const metadata: Metadata = {
  title: "TAKU Voice",
  description: "Connect to the TAKU's The Isle Mumble voice service."
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function VoicePage() {
  const status = await getServerStatusOrInitial();
  return <VoicePageContent status={status} />;
}

