import { Play, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { getFirestoreGallery } from "@/lib/firebase/firestore-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function GalleryPage() {
  const gallery = await getFirestoreGallery();

  return (
    <main className="container min-h-screen pt-28 pb-20">
      <SectionHeading eyebrow="Gallery" title="Screenshots, videos, and creations" eyebrowKey="nav.gallery" titleKey="page.gallery.title" />
      <div className="grid gap-5 md:grid-cols-3">
        {gallery.map((item) => (
          <Card key={item.title} className="overflow-hidden">
            <div className="relative">
              <img src={item.image} alt="" className="h-64 w-full object-cover" />
              <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur">
                {item.type}
              </div>
              {item.type === "Video" ? <Play className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-white" /> : <Sparkles className="absolute bottom-4 right-4 h-6 w-6 text-primary" />}
            </div>
            <CardContent className="p-5 font-semibold">{item.title}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
