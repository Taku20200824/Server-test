import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="font-display text-5xl font-black">404</h1>
      <p className="mt-3 text-muted-foreground">This migration route does not exist.</p>
      <Button asChild className="mt-6">
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
