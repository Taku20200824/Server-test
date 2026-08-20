import { MapPageContent } from "@/components/map-page-content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function MapPage() {
  return <MapPageContent />;
}
