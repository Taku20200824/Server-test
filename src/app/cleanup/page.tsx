"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, writeBatch } from "firebase/firestore";
import { BrandMark, LanguageSelect, ThemeToggle, useLanguage, useTheme } from "@/components/Controls";
import { auth, db } from "@/lib/firebase";
import { isRole, Role } from "@/lib/account";
import { labels } from "@/lib/i18n";

const LEGACY_COLLECTIONS = [
  "announcements",
  "events",
  "features",
  "gallery",
  "irisAccounts",
  "mapMarkers",
  "rules",
  "scores",
  "serverStatus",
  "siteText",
  "staff"
];

export default function CleanupPage() {
  const router = useRouter();
  const [language, setLanguage] = useLanguage();
  const [dark, toggleTheme] = useTheme();
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState("Checking admin account...");
  const [busy, setBusy] = useState(false);

  const t = labels[language];

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        router.replace("/login");
        return;
      }

      setUser(nextUser);
      try {
        const profile = await getDoc(doc(db, "irisUsers", nextUser.uid));
        const data = profile.data();
        const nextRole = data && isRole(data.role) ? data.role : null;
        setRole(nextRole);
        setStatus(nextRole === "admin" ? "Ready. Admin cleanup is available." : "Admin ID is required.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to read admin profile.");
      }
    });
  }, [router]);

  async function cleanup() {
    if (!user || role !== "admin") return;
    if (!window.confirm("Delete old THE-ISLE / unused Firestore data?")) return;

    setBusy(true);
    let deleted = 0;

    try {
      for (const collectionName of LEGACY_COLLECTIONS) {
        const snapshot = await getDocs(collection(db, collectionName));
        for (let index = 0; index < snapshot.docs.length; index += 450) {
          const batch = writeBatch(db);
          const chunk = snapshot.docs.slice(index, index + 450);
          chunk.forEach((item) => batch.delete(item.ref));
          if (chunk.length > 0) {
            await batch.commit();
            deleted += chunk.length;
          }
        }
      }
      setStatus(`Cleanup complete. Deleted ${deleted} legacy documents.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Cleanup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <BrandMark small />
          <div>
            <p className="eyebrow">{t.brand}</p>
            <h1 className="gradient-text">Firestore Cleanup</h1>
          </div>
        </div>
        <div className="header-meta">
          <LanguageSelect language={language} onChange={setLanguage} />
          <ThemeToggle dark={dark} onToggle={toggleTheme} t={t} className="" />
          <button type="button" onClick={() => router.push("/console")}>Console</button>
        </div>
      </header>

      <section className="result-panel" style={{ margin: "48px auto", maxWidth: 920 }}>
        <div className="result-heading">
          <div>
            <p className="eyebrow">ADMIN ONLY</p>
            <h2>Delete unused Firebase data</h2>
          </div>
          <span className="role-chip">{role || "checking"}</span>
        </div>

        <p className="status-line" data-kind={role === "admin" ? "info" : "error"}>{status}</p>
        <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
          This deletes legacy collections only: {LEGACY_COLLECTIONS.join(", ")}. It keeps irisUsers, irisRecords and irisNotes.
        </p>

        <button className="button primary" type="button" disabled={busy || role !== "admin"} onClick={cleanup}>
          {busy ? "Cleaning..." : "Run cleanup"}
        </button>
      </section>
    </main>
  );
}
