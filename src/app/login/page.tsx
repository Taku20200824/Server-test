"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { Languages, LogIn, Moon, UserPlus } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import styles from "./LoginPage.module.css";

type Language = "ja" | "en" | "mn";
type Mode = "login" | "create";

const labels = {
  ja: {
    id: "4桁ID",
    name: "名前",
    login: "ログイン",
    create: "アカウント作成",
    title: "IRIS Console",
    subtitle: "Server-test 管理コンソール",
    loginHint: "登録済みの4桁IDでログインします。",
    createHint: "新しい4桁IDと名前でアカウントを作成します。",
    idError: "4桁IDを入力してください",
    nameError: "アカウント作成には名前が必要です",
    missing: "このIDはまだ登録されていません。アカウント作成を選んでください。",
    exists: "このIDはすでに登録済みです。ログインを選んでください。",
    loading: "接続中..."
  },
  en: {
    id: "4-digit ID",
    name: "Name",
    login: "Login",
    create: "Create Account",
    title: "IRIS Console",
    subtitle: "Server-test management console",
    loginHint: "Login with an existing 4-digit ID.",
    createHint: "Create an account with a new 4-digit ID and name.",
    idError: "Enter a 4-digit ID",
    nameError: "Name is required to create an account",
    missing: "This ID is not registered yet. Choose Create Account.",
    exists: "This ID already exists. Choose Login.",
    loading: "Connecting..."
  },
  mn: {
    id: "4 оронтой ID",
    name: "Нэр",
    login: "Нэвтрэх",
    create: "Аккаунт үүсгэх",
    title: "IRIS Console",
    subtitle: "Server-test удирдлагын консол",
    loginHint: "Бүртгэлтэй 4 оронтой ID-гаар нэвтэрнэ.",
    createHint: "Шинэ 4 оронтой ID болон нэрээр аккаунт үүсгэнэ.",
    idError: "4 оронтой ID оруулна уу",
    nameError: "Аккаунт үүсгэхэд нэр шаардлагатай",
    missing: "Энэ ID бүртгэлгүй байна. Аккаунт үүсгэхийг сонгоно уу.",
    exists: "Энэ ID аль хэдийн байна. Нэвтрэхийг сонгоно уу.",
    loading: "Холбогдож байна..."
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("ja");
  const [mode, setMode] = useState<Mode>("login");
  const [dark, setDark] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState("Firebase ready");
  const [busy, setBusy] = useState(false);

  const t = labels[language];

  function nextLanguage() {
    setLanguage((value) => (value === "ja" ? "en" : value === "en" ? "mn" : "ja"));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanId = accountId.replace(/\D/g, "").slice(0, 4);
    const cleanName = displayName.trim();

    if (cleanId.length !== 4) {
      setStatus(t.idError);
      return;
    }
    if (mode === "create" && !cleanName) {
      setStatus(t.nameError);
      return;
    }

    setBusy(true);
    setStatus(t.loading);

    try {
      const credential = await signInAnonymously(auth);
      const accountRef = doc(db, "irisAccounts", cleanId);
      const accountSnapshot = await getDoc(accountRef);

      if (mode === "login") {
        if (!accountSnapshot.exists()) {
          setStatus(t.missing);
          setBusy(false);
          return;
        }

        const data = accountSnapshot.data();
        const name = typeof data.displayName === "string" ? data.displayName : cleanId;
        window.localStorage.setItem("irisAccount", JSON.stringify({ id: cleanId, displayName: name }));
        router.replace("/console");
        return;
      }

      if (accountSnapshot.exists()) {
        setStatus(t.exists);
        setBusy(false);
        return;
      }

      await setDoc(accountRef, {
        displayName: cleanName,
        authUid: credential.user.uid,
        updatedAt: serverTimestamp()
      });

      window.localStorage.setItem("irisAccount", JSON.stringify({ id: cleanId, displayName: cleanName }));
      router.replace("/console");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Firebase error");
      setBusy(false);
    }
  }

  return (
    <main className={dark ? `${styles.page} ${styles.dark}` : styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.brand}>SERVER-TEST</p>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>
          <div className={styles.tools}>
            <button type="button" onClick={nextLanguage} title="language"><Languages size={17} />{language.toUpperCase()}</button>
            <button type="button" onClick={() => setDark((value) => !value)} title="dark mode"><Moon size={17} /></button>
          </div>
        </header>

        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHead}>
            {mode === "login" ? <LogIn size={22} /> : <UserPlus size={22} />}
            <h2>{mode === "login" ? t.login : t.create}</h2>
          </div>

          <div className={styles.modeTabs}>
            <button className={mode === "login" ? styles.activeTab : styles.modeTab} type="button" onClick={() => setMode("login")}><LogIn size={16} />{t.login}</button>
            <button className={mode === "create" ? styles.activeTab : styles.modeTab} type="button" onClick={() => setMode("create")}><UserPlus size={16} />{t.create}</button>
          </div>

          <label>
            {t.id}
            <input value={accountId} inputMode="numeric" maxLength={4} onChange={(event) => setAccountId(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0001" autoFocus />
          </label>

          {mode === "create" && (
            <label>
              {t.name}
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Taku" />
            </label>
          )}

          <button className={styles.primary} disabled={busy} type="submit">
            {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
            {mode === "login" ? t.login : t.create}
          </button>
          <p className={styles.hint}>{mode === "login" ? t.loginHint : t.createHint}</p>
          <p className={styles.status}>{status}</p>
        </form>
      </section>
    </main>
  );
}
