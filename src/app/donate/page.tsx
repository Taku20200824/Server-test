import { Crown, Gem, Heart, Server } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirestoreDonationGoal, getFirestoreDonationRewards } from "@/lib/firebase/firestore-data";
import { LocalizedText } from "@/components/localized-text";

const rewardIcons = { Crown, Gem, Server };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DonatePage() {
  const [goal, rewards] = await Promise.all([getFirestoreDonationGoal(), getFirestoreDonationRewards()]);
  const progress = Math.min(100, Math.round((goal.current / Math.max(goal.target, 1)) * 100));

  return (
    <main className="container min-h-screen pt-28 pb-20">
      <SectionHeading eyebrow="Donate" title="Support server operations" description="Transparent donation goals, monthly costs, supporter roles, and future Stripe/PayPal integration." eyebrowKey="nav.donate" titleKey="page.donate.title" descriptionKey="page.donate.description" />
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Heart className="h-7 w-7 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">{goal.label}</div>
              <div className="text-3xl font-bold">{goal.currency}{goal.current} / {goal.currency}{goal.target}</div>
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{goal.description}</p>
        </CardContent>
      </Card>
      <div className="grid gap-5 md:grid-cols-3">
        {rewards.map((reward) => (
          <Card key={reward.title}>
            <CardHeader>
              {(() => {
                const Icon = rewardIcons[reward.icon as keyof typeof rewardIcons] ?? Crown;
                return <Icon className="h-7 w-7 text-primary" />;
              })()}
              <CardTitle>{reward.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{reward.body}</CardContent>
          </Card>
        ))}
      </div>
      <Button className="mt-8" disabled><LocalizedText tKey="cta.paymentsComingSoon" /></Button>
    </main>
  );
}
