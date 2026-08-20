import { getServerSession } from "next-auth";
import Link from "next/link";
import { Lock, Shield } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminModules } from "@/data/site";

export default async function AdminDashboardPage() {
  if (process.env.GITHUB_PAGES === "true") {
    return (
      <main className="container min-h-screen pt-28 pb-20">
        <SectionHeading eyebrow="Admin" title="Community operations dashboard" description="Static GitHub Pages preview. Deploy to Vercel to enable Discord OAuth, Prisma writes, and protected admin actions." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {adminModules.map((module) => (
            <Card key={module}>
              <CardHeader>
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>{module}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Preview-ready module for future CRUD tables, webhooks, API sync jobs, and audit logging.</CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  const session = await getServerSession(authOptions);
  const allowed = session?.user?.role === "OWNER" || session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  if (!allowed) {
    return (
      <main className="container flex min-h-screen items-center justify-center pt-20">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Lock className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 text-2xl font-bold">Authentication required</h1>
            <p className="mt-2 text-sm text-muted-foreground">Admin dashboard access is protected by Discord OAuth and role-based authorization.</p>
            <Button className="mt-5" asChild>
              <Link href="/api/auth/signin">Sign in with Discord</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container min-h-screen pt-28 pb-20">
      <SectionHeading eyebrow="Admin" title="Community operations dashboard" description="Protected tools for live server administration and editorial workflows." />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {adminModules.map((module) => (
          <Card key={module}>
            <CardHeader>
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>{module}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Ready for CRUD tables, webhooks, API sync jobs, and audit logging.</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
