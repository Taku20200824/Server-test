"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminServerError({ reset }: { reset: () => void }) {
  return (
    <main className="container flex min-h-screen items-center pt-28">
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
        <AlertTriangle className="h-7 w-7 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Could not load admin server status.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Check Firebase Admin environment variables and try again.</p>
        <Button className="mt-5" onClick={reset}>Retry</Button>
      </div>
    </main>
  );
}
