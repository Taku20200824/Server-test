"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { BrandMark, LanguageSelect, ThemeToggle, useLanguage, useTheme } from "@/components/Controls";
import { auth, db } from "@/lib/firebase";
import { isValidUsername, normalizeUsername, roleForId, usernameToEmail } from "@/lib/account";
import { LabelSet, labels } from "@/lib/i18n";

type Mode = "login" | "signup";

function authMessage(error: unknown, t: LabelSet) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";

  if (code.includes("configuration-not-found") || code.includes("operation-not-allowed")) return t.authSetup;
  if (code.includes("email-already-in-use")) return t.userExists;
  if (code.includes("weak-password")) return t.weakPassword;
  if (
    code.includes("invalid-credential") ||
    code.includes("wrong-password") ||
    code.includes("user-not-found") ||
    code.includes("invalid-email")
  ) {
    return t.wrongCredentials;
  }
  return error instanceof Error ? error.message : "Firebase error";
}

export default function LoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useLanguage();
  const [dark, toggleTheme] = useTheme();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [note, setNote] = useState("");
  const [noteKind, setNoteKind] = useState<"info" | "error">("info");
  const [busy, setBusy] = useState(false);

  const t = labels[language];

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/console");
    });
  }, [router]);

  function fail(message: string) {
    setNote(message);
    setNoteKind("error");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanUsername = normalizeUsername(username);
    const cleanDisplayName = displayName.trim();

    if (!isValidUsername(cleanUsername)) return fail(t.needUsername);
    if (password.length < 6) return fail(t.needPassword);
    if (mode === "signup" && !cleanDisplayName) return fail(t.needDisplayName);

    setBusy(true);
    setNote(t.connecting);
    setNoteKind("info");

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, usernameToEmail(cleanUsername), password);
        router.replace("/console");
        return;
      }

      const credential = await createUserWithEmailAndPassword(auth, usernameToEmail(cleanUsername), password);
      await updateProfile(credential.user, { displayName: cleanDisplayName });
      await setDoc(doc(db, "irisUsers", credential.user.uid), {
        username: cleanUsername,
        displayName: cleanDisplayName,
        role: roleForId(cleanUsername),
        updatedAt: serverTimestamp()
      });
      router.replace("/console");
    } catch (error) {
      fail(authMessage(error, t));
      setBusy(false);
    }
  }

  return (
    <main className="login-shell">
      <div className="login-controls">
        <LanguageSelect language={language} onChange={setLanguage} />
        <ThemeToggle dark={dark} onToggle={toggleTheme} t={t} />
      </div>

      <section className="login-card">
        <BrandMark />
        <p className="eyebrow">{t.brand}</p>
        <h1 className="gradient-text">{mode === "login" ? t.loginTitle : t.signupTitle}</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            {t.username}
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              inputMode="numeric"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
            />
          </label>

          <label>
            {t.password}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          {mode === "signup" && (
            <label>
              {t.displayName}
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </label>
          )}

          <button className="button primary" type="submit" disabled={busy}>
            {mode === "login" ? t.loginAction : t.signupAction}
          </button>

          <button
            className="button"
            type="button"
            disabled={busy}
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setNote("");
              setNoteKind("info");
            }}
          >
            {mode === "login" ? t.signupAction : t.backToLogin}
          </button>

          <p className="login-note" data-kind={noteKind}>
            {note || (mode === "login" ? t.loginHint : t.signupHint)}
          </p>
        </form>
      </section>

      <div className="cmdk-hint" aria-hidden>
        <span>Ctrl</span>
        <span>K</span>
      </div>
    </main>
  );
}
