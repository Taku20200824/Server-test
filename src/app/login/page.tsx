"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import styles from "./LoginPage.module.css";

type Language = "ja" | "en" | "mn";
type Mode = "login" | "create";
type StatusKind = "info" | "error";

const labels = {
  ja: {
    language: "日本語",
    light: "ライトモード",
    dark: "ダークモード",
    title: "ログイン",
    brand: "IRIS CONSOLE",
    username: "ユーザー名",
    password: "パスワード",
    login: "ログイン",
    create: "アカウント作成",
    loginHint: "登録済みのユーザー名とパスワードでログインします。",
    createHint: "ユーザー名とパスワードで新しいアカウントを作成します。",
    missing: "ユーザー名とパスワードを入力してください。",
    shortPassword: "パスワードは6文字以上にしてください。",
    loading: "接続中...",
    ready: "CtrlK",
    authSetup: "Firebase Authentication の Email/Password を有効にしてください。",
    authDenied: "Email/Password ログインが無効です。Firebase Console で有効にしてください。"
  },
  en: {
    language: "English",
    light: "Light mode",
    dark: "Dark mode",
    title: "Login",
    brand: "IRIS CONSOLE",
    username: "Username",
    password: "Password",
    login: "Login",
    create: "Create Account",
    loginHint: "Login with a registered username and password.",
    createHint: "Create a new account with username and password.",
    missing: "Enter username and password.",
    shortPassword: "Password must be at least 6 characters.",
    loading: "Connecting...",
    ready: "CtrlK",
    authSetup: "Enable Firebase Authentication Email/Password.",
    authDenied: "Email/Password login is disabled in Firebase Console."
  },
  mn: {
    language: "Монгол",
    light: "Цайвар горим",
    dark: "Харанхуй горим",
    title: "Нэвтрэх",
    brand: "IRIS CONSOLE",
    username: "Хэрэглэгчийн нэр",
    password: "Нууц үг",
    login: "Нэвтрэх",
    create: "Аккаунт үүсгэх",
    loginHint: "Бүртгэлтэй нэр, нууц үгээр нэвтэрнэ.",
    createHint: "Нэр, нууц үгээр шинэ аккаунт үүсгэнэ.",
    missing: "Нэр болон нууц үгээ оруулна уу.",
    shortPassword: "Нууц үг 6-аас дээш тэмдэгт байх ёстой.",
    loading: "Холбогдож байна...",
    ready: "CtrlK",
    authSetup: "Firebase Authentication Email/Password-г асаана уу.",
    authDenied: "Email/Password login Firebase Console дээр унтраалттай байна."
  }
};

type LabelSet = typeof labels.ja;

function emailForUsername(username: string) {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return `${clean}@iris-console.local`;
}

function getFirebaseMessage(error: unknown, t: LabelSet) {
  const message = error instanceof Error ? error.message : "Firebase error";
  if (message.includes("auth/configuration-not-found")) return t.authSetup;
  if (message.includes("auth/operation-not-allowed")) return t.authDenied;
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("ja");
  const [mode, setMode] = useState<Mode>("login");
  const [dark, setDark] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(labels.ja.ready);
  const [statusKind, setStatusKind] = useState<StatusKind>("info");
  const [busy, setBusy] = useState(false);

  const t = labels[language];

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("irisLanguage") as Language | null;
    const savedTheme = window.localStorage.getItem("irisTheme");
    if (savedLanguage && savedLanguage in labels) setLanguage(savedLanguage);
    if (savedTheme) setDark(savedTheme === "dark");
  }, []);

  function changeLanguage(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as Language;
    setLanguage(next);
    setStatus(labels[next].ready);
    window.localStorage.setItem("irisLanguage", next);
  }

  function toggleTheme() {
    setDark((value) => {
      const next = !value;
      window.localStorage.setItem("irisTheme", next ? "dark" : "light");
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setStatus(t.missing);
      setStatusKind("error");
      return;
    }
    if (password.length < 6) {
      setStatus(t.shortPassword);
      setStatusKind("error");
      return;
    }

    setBusy(true);
    setStatus(t.loading);
    setStatusKind("info");

    try {
      const email = emailForUsername(cleanUsername);
      const credential = mode === "login"
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      if (mode === "create") {
        await updateProfile(credential.user, { displayName: cleanUsername });
        await setDoc(doc(db, "irisUsers", credential.user.uid), {
          username: cleanUsername,
          email,
          role: "user",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        await setDoc(doc(db, "irisUsers", credential.user.uid), {
          username: credential.user.displayName || cleanUsername,
          email,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      router.replace("/console");
    } catch (error) {
      setStatus(getFirebaseMessage(error, t));
      setStatusKind("error");
      setBusy(false);
    }
  }

  return (
    <main className={dark ? `${styles.page} ${styles.dark}` : styles.page}>
      <div className={styles.toolbar}>
        <select value={language} onChange={changeLanguage} aria-label="language">
          <option value="ja">日本語</option>
          <option value="en">English</option>
          <option value="mn">Монгол</option>
        </select>
        <button type="button" onClick={toggleTheme}>{dark ? t.light : t.dark}</button>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.logo} />
        <p className={styles.brand}>{t.brand}</p>
        <h1>{t.title}</h1>

        <label>
          {t.username}
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" autoFocus />
        </label>
        <label>
          {t.password}
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>

        <button className={styles.primary} disabled={busy} type="submit">{mode === "login" ? t.login : t.create}</button>
        <button className={styles.secondary} disabled={busy} type="button" onClick={() => setMode(mode === "login" ? "create" : "login")}>{mode === "login" ? t.create : t.login}</button>
        <p className={styles.hint}>{mode === "login" ? t.loginHint : t.createHint}</p>
        <p className={statusKind === "error" ? styles.errorStatus : styles.status}>{status}</p>
      </form>
    </main>
  );
}
