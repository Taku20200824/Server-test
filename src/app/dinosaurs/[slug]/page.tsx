import { notFound } from "next/navigation";
import { DinosaurProfile } from "@/components/dinosaur-profile";
import { getFirestoreDinosaur, getFirestoreDinosaurs } from "@/lib/firebase/firestore-data";

export async function generateStaticParams() {
  const dinosaurs = await getFirestoreDinosaurs();
  return dinosaurs.map((dino) => ({ slug: dino.slug }));
}

type DinosaurPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: DinosaurPageProps) {
  const { slug } = await params;
  const dino = await getFirestoreDinosaur(slug);
  return {
    title: dino ? dino.name : "Dinosaur"
  };
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DinosaurPage({ params }: DinosaurPageProps) {
  const { slug } = await params;
  const dino = await getFirestoreDinosaur(slug);

  if (!dino) {
    notFound();
  }

  return <DinosaurProfile dinosaur={dino} />;
}
