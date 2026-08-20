import { SectionHeading } from "@/components/section-heading";
import { RulesContent } from "@/components/rules-content";
import { getFirestoreRules } from "@/lib/firebase/firestore-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function RulesPage() {
  const rules = await getFirestoreRules();

  return (
    <main className="container min-h-screen pt-28 pb-20">
      <SectionHeading eyebrow="Rules" title="Clear rules, consistent enforcement" description="A beautiful rulebook for survival, PvP, chat, exploit policy, and punishments." eyebrowKey="nav.rules" titleKey="page.rules.title" descriptionKey="page.rules.description" />
      <RulesContent rules={rules} />
    </main>
  );
}
