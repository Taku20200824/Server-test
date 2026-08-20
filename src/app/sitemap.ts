import type { MetadataRoute } from "next";
import { navItems, siteConfig } from "@/data/site";
import { getFirestoreDinosaurs } from "@/lib/firebase/firestore-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dinosaurs = await getFirestoreDinosaurs();
  const routes = [
    ...navItems.map((item) => item.href),
    "/gallery",
    "/staff",
    "/contact",
    ...dinosaurs.map((dino) => `/dinosaurs/${dino.slug}`)
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7
  }));
}
