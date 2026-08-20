"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { AlertTriangle, Loader2, LogIn, Save, Server, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { signInWithEmail, signInWithGoogle, signOutFirebase, firebaseAuth } from "@/lib/firebase/auth-client";
import { initialServerStatus, type ServerStatusDocument } from "@/lib/firebase/server-status-shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

type EditableServerStatus = Omit<ServerStatusDocument, "lastUpdated">;

function toEditable(status: Partial<ServerStatusDocument> | null): EditableServerStatus {
  const editableStatus = { ...(status ?? {}) };
  delete editableStatus.lastUpdated;

  return {
    ...initialServerStatus,
    ...editableStatus
  };
}

export function AdminServerForm({ initialStatus }: { initialStatus: ServerStatusDocument | null }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<EditableServerStatus>(() => toEditable(initialStatus));

  const address = useMemo(() => (form.ip ? `${form.ip}:${form.port}` : `IP pending:${form.port}`), [form.ip, form.port]);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
  }, []);

  function updateField<K extends keyof EditableServerStatus>(key: K, value: EditableServerStatus[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function token() {
    if (!user) {
      throw new Error("Please sign in with an administrator account.");
    }

    return user.getIdToken();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/server-status", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${await token()}`
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update server status.");
      }

      setForm(toEditable(data));
      setMessage("Server status updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to update server status.");
    } finally {
      setSaving(false);
    }
  }

  async function seed() {
    setSeeding(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/server-status", {
        method: "POST",
        headers: {
          authorization: `Bearer ${await token()}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create serverStatus/main.");
      }

      setForm(toEditable(data));
      setMessage("Created Firestore document serverStatus/main.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to create serverStatus/main.");
    } finally {
      setSeeding(false);
    }
  }

  async function emailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await signInWithEmail(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to sign in.");
    }
  }

  if (authLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Checking Firebase Authentication...
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-primary" />
            Firebase admin login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={emailLogin}>
            <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" type="email" />
            <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Sign in</Button>
              <Button type="button" variant="outline" onClick={signInWithGoogle}>Sign in with Google</Button>
            </div>
          </form>
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Signed in as {user.email ?? user.uid}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <StatusBadge status={form.status} />
              <span className="font-mono text-sm text-muted-foreground">{address}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={seed} disabled={seeding}>
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Server className="h-4 w-4" />}
              Create default document
            </Button>
            <Button type="button" variant="ghost" onClick={signOutFirebase}>Sign out</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit BisectHosting server status</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Server name
                <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={form.serverName} onChange={(event) => updateField("serverName", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Status
                <select className="h-11 rounded-md border border-white/10 bg-background px-3" value={form.status} onChange={(event) => updateField("status", event.target.value as EditableServerStatus["status"])}>
                  <option value="online">online</option>
                  <option value="offline">offline</option>
                  <option value="maintenance">maintenance</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                BisectHosting IP address
                <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={form.ip} onChange={(event) => updateField("ip", event.target.value)} placeholder="123.45.67.89" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Port
                <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={form.port} onChange={(event) => updateField("port", Number(event.target.value))} type="number" min={1} max={65535} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Location
                <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={form.location} onChange={(event) => updateField("location", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Online players
                <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={form.onlinePlayers} onChange={(event) => updateField("onlinePlayers", Number(event.target.value))} type="number" min={0} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Maximum players
                <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={form.maxPlayers} onChange={(event) => updateField("maxPlayers", Number(event.target.value))} type="number" min={1} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Version
                <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={form.version} onChange={(event) => updateField("version", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Map
                <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={form.map} onChange={(event) => updateField("map", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Discord invite URL
                <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={form.discordUrl} onChange={(event) => updateField("discordUrl", event.target.value)} placeholder="https://discord.gg/..." />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Discord server ID
                <input className="h-11 rounded-md border border-white/10 bg-background px-3" value={form.discordServerId} onChange={(event) => updateField("discordServerId", event.target.value)} placeholder="792269772473106452" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium">
              Description
              <textarea className="min-h-36 rounded-md border border-white/10 bg-background p-3" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
            </label>

            {error ? (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            ) : null}
            {message ? <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">{message}</div> : null}

            <Button className="w-fit" type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save server status
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
