import { SectionHeading } from "@/components/section-heading";
import { AdminServerForm } from "@/components/admin-server-form";
import { getServerStatusDocument } from "@/lib/firebase/server-status";

export default async function AdminServerPage() {
  const status = await getServerStatusDocument();

  return (
    <main className="container min-h-screen pt-28 pb-20">
      <SectionHeading
        eyebrow="Firebase Admin"
        title="BisectHosting server status"
        description="Edit the public serverStatus/main document stored in Firebase Firestore. The Isle itself continues to run on BisectHosting."
      />
      <AdminServerForm initialStatus={status} />
    </main>
  );
}
