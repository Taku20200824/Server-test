import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LocalizedText } from "@/components/localized-text";

export default function ContactPage() {
  return (
    <main className="container min-h-screen pt-28 pb-20">
      <SectionHeading eyebrow="Contact" title="Support, reports, and appeals" description="One route for support forms, bug reports, player reports, and ban appeals." eyebrowKey="nav.contact" titleKey="page.contact.title" descriptionKey="page.contact.description" />
      <Card>
        <CardContent className="p-6">
          <form className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Request Type
                <select className="h-11 rounded-md border border-white/10 bg-background px-3">
                  <option>Support Form</option>
                  <option>Bug Report</option>
                  <option>Player Report</option>
                  <option>Appeal Ban</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Discord Username
                <input className="h-11 rounded-md border border-white/10 bg-background px-3" placeholder="@username" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium">
              Subject
              <input className="h-11 rounded-md border border-white/10 bg-background px-3" placeholder="Brief summary" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Details
              <textarea className="min-h-40 rounded-md border border-white/10 bg-background p-3" placeholder="Include time, players, clips, screenshots, and server context." />
            </label>
            <Button className="w-fit" type="button"><LocalizedText tKey="cta.submitTicket" /></Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
