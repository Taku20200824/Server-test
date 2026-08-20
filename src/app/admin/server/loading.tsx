import { Loader2 } from "lucide-react";

export default function AdminServerLoading() {
  return (
    <main className="container flex min-h-screen items-center pt-28">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading Firebase server status...
      </div>
    </main>
  );
}
