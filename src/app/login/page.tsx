"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { BadgeCheck, Languages, LogIn, Moon, ShieldCheck, UserPlus } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import styles from "./LoginPage.module.css";

type Language = "ja" | "en" | "mn";
type Mode = "login" | "create";
type StatusKind = "info" | "error";

const labels = {
  ja: {
    id: "4桁ID",
    name: "名前",
    login: "ログイン",
    create: "アカウント作成",
    title: "IRIS Console",
    subtitle: "Server-test 管理コンソール",
    eyebrow: "SECURE OPERATIONS",
    heroTitle: "Work data, barcode records, and memos in one clean console.",
    heroText: "Firebaseでユーザーデータを保存し、Vercel上で軽く動くIRIS Consoleです。",
    loginHint: "登録済みの4桁IDでログインします。",
    createHint: "新しい4桁IDと名前でアカウントを作成します。",
    idError: "4桁IDを入力してください",
    nameError: "アカウント作成には名前が必要です",
    missing: "このIDはまだ登録されていません。アカウント作成を選んでください。",
    exists: "このIDはすでに登録済みです。ログインを選んでください。",
    loading: "接続中...",
    ready: "Firebase ready",
    authSetup: "Firebase Authentication がまだ有効化されていません。Firebase Console > Authentication > Sign-in method で Anonymous を有効にしてください。",
    authDenied: "Anonymous login が無効です。Firebase Authentication の Sign-in method で Anonymous を有効にしてください。"
  },
  en: {
    id: "4-digit ID",
    name: "Name",
    login: "Login",
    create: "Create Account",
    title: "IRIS Console",
    subtitle: "Server-test management console",
    eyebrow: "SECURE OPERATIONS",
    heroTitle: "Work data, barcode records, and memos in one clean console.",
    heroText: "IRIS Console runs on Vercel and keeps user data in Firebase.",
    loginHint: "Login with an existing 4-digit ID.",
    createHint: "Create an account with a new 4-digit ID and name.",
    idError: "Enter a 4-digit ID",
    nameError: "Name is required to create an account",
    missing: "This ID is not registered yet. Choose Create Account.",
    exists: "This ID already exists. Choose Login.",
    loading: "Connecting...",
    ready: "Firebase ready",
    authSetup: "Firebase Authentication is not enabled yet. Open Firebase Console > Authentication > Sign-in method and enable Anonymous.",
    authDenied: "Anonymous login is disabled. Enable Anonymous in Firebase Authentication > Sign-in method."
  },
  mn: {
    id: "4 оронтой ID",
    name: "Нэр",
    login: "Нэвтрэх",
    create: "Аккаунт үүсгэх",
    title: "IRIS Console",
    subtitle: "Server-test удирдлагын консол",
    eyebrow: "SECURE OPERATIONS",
    heroTitle: "Ажлын data, баркод, тэмдэглэл бүгд нэг цэвэр console дотор.",
    heroText: "Vercel дээр хурдан ажиллаж, хэрэглэгчийн data-г Firebase-д хадгална.",
    loginHint: "Бүртгэлтэй 4 оронтой ID-гаар нэвтэрнэ.",
    createHint: "Шинэ 4 оронтой ID болон нэрээр аккаунт үүсгэнэ.",
    idError: "4 оронтой ID оруулна уу",
    nameError: "Аккаунт үүсгэхэд нэр шаардлагатай",
    missing: "Энэ ID бүртгэлгүй байна. Аккаунт үүсгэхийг сонгоно уу.",
    exists: "Энэ ID аль хэдийн байна. Нэвтрэхийг сонгоно уу.",
    loading: "Холбогдож байна...",
    ready: "Firebase ready",
    authSetup: "Firebase Authentication идэвхгүй байна. Firebase Console > Authentication > Sign-in method хэсгээс Anonymous-г асаана уу.",
    authDenied: "Anonymous login унтраалттай байна. Firebase Authentication > Sign-in method дээр Anonymous-г enable хийнэ үү."
  }
};

function getFirebaseMessage(error: unknown, t: typeof labels[Language]) {
  const message = error instanceof Error ? error.message : "Firebase error";
  if (message.includes("auth/configuration-not-found")) return t.authSetup;
  if (message.includes("auth/operation-not-allowed")) return t.authDenied;
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("ja");
  const [mode, setMode] = useState<Mode>("login");
  const [dark, setDark] = useState(true);
  const [accountId, setAccountId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState(labels.ja.ready);
  const [statusKind, setStatusKind] = useState<StatusKind>("info");
  const [busy, setBusy] = useState(false);

  const t = labels[language];

  function nextLanguage() {
    setLanguage((value) => {
      const next = value === "ja" ? "en" : value === "en" ? "mn" : "ja";
      setStatus(labels[next].ready);
      setStatusKind("info");
      return next;
    });
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setStatus(labels[language].ready);
    setStatusKind("info");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanId = accountId.replace(/\D/g, "").slice(0, 4);
    const cleanName = displayName.trim();

    if (cleanId.length !== 4) {
      setStatus(t.idError);
      setStatusKind("error");
      return;
    }
    if (mode === "create" && !cleanName) {
      setStatus(t.nameError);
      setStatusKind("error");
      return;
    }

    setBusy(true);
    setStatus(t.loading);
    setStatusKind("info");

    try {
      const credential = await signInAnonymously(auth);
      const accountRef = doc(db, "irisAccounts", cleanId);
      const accountSnapshot = await getDoc(accountRef);

      if (mode === "login") {
        if (!accountSnapshot.exists()) {
          setStatus(t.missing);
          setStatusKind("error");
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
        setStatusKind("error");
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
      setStatus(getFirebaseMessage(error, t));
      setStatusKind("error");
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
          </div>
          <div className={styles.tools}>
            <button type="button" onClick={nextLanguage} title="language"><Languages size={17} />{language.toUpperCase()}</button>
            <button type="button" onClick={() => setDark((value) => !value)} title="theme"><Moon size={17} /></button>
          </div>
        </header>

        <div className={styles.stage}>
          <section className={styles.heroPanel}>
            <p className={styles.eyebrow}>{t.eyebrow}</p>
            <h2>{t.heroTitle}</h2>
            <p>{t.heroText}</p>
            <div className={styles.metrics}>
              <span><BadgeCheck size={17} />Firebase</span>
              <span><ShieldCheck size={17} />Vercel</span>
              <span>4ID</span>
            </div>
          </section>

          <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.cardHead}>
              <div className={styles.iconBox}>{mode === "login" ? <LogIn size={22} /> : <UserPlus size={22} />}</div>
              <div>
                <p>{t.subtitle}</p>
                <h2>{mode === "login" ? t.login : t.create}</h2>
              </div>
            </div>

            <div className={styles.modeTabs}>
              <button className={mode === "login" ? styles.activeTab : styles.modeTab} type="button" onClick={() => switchMode("login")}><LogIn size={16} />{t.login}</button>
              <button className={mode === "create" ? styles.activeTab : styles.modeTab} type="button" onClick={() => switchMode("create")}><UserPlus size={16} />{t.create}</button>
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
            <p className={statusKind === "error" ? styles.errorStatus : styles.status}>{status}</p>
          </form>
        </div>
      </section>
    </main>
  );
}
