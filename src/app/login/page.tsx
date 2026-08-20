"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { Languages, LogIn, Moon, UserPlus } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import styles from "./LoginPage.module.css";

type Language = "ja" | "en" | "mn";

const labels = {
  ja: {
    id: "4桁ID",
    name: "名前",
    login: "ログイン",
    register: "新規登録",
    title: "IRIS Console",
    subtitle: "Server-test 管理コンソール",
    hint: "既存ユーザーは4桁IDだけでログインできます。新規登録は名前も入力してください。",
    idError: "4桁IDを入力してください",
    nameError: "新規登録には名前が必要です",
    loading: "接続中..."
  },
  en: {
    id: "4-digit ID",
    name: "Name",
    login: "Login",
    register: "Register",
    title: "IRIS Console",
    subtitle: "Server-test management console",
    hint: "Existing users can login with the 4-digit ID. New users also need a name.",
    idError: "Enter a 4-digit ID",
    nameError: "Name is required for registration",
    loading: "Connecting..."
  },
  mn: {
    id: "4 оронтой ID",
    name: "Нэр",
    login: "Нэвтрэх",
    register: "Бүртгэх",
    title: "IRIS Console",
    subtitle: "Server-test удирдлагын консол",
    hint: "Бүртгэлтэй хэрэглэгч 4 оронтой ID-гаар нэвтэрнэ. Шинэ хэрэглэгч нэрээ оруулна.",
    idError: "4 оронтой ID оруулна уу",
    nameError: "Шинэ бүртгэлд нэр шаардлагатай",
    loading: "Холбогдож байна..."
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("ja");
  const [dark, setDark] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState("Firebase ready");
  const [busy, setBusy] = useState(false);

  const t = labels[language];

  function nextLanguage() {
    setLanguage((value) => (value === "ja" ? "en" : value === "en" ? "mn" : "ja"));
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanId = accountId.replace(/\D/g, "").slice(0, 4);
    if (cleanId.length !== 4) {
      setStatus(t.idError);
      return;
    }

    setBusy(true);
    setStatus(t.loading);

    try {
      const credential = await signInAnonymously(auth);
      const accountRef = doc(db, "irisAccounts", cleanId);
      const accountSnapshot = await getDoc(accountRef);
      const existingName = accountSnapshot.exists() ? accountSnapshot.data().displayName : "";
      const name = (displayName.trim() || existingName || "").trim();

      if (!name) {
        setStatus(t.nameError);
        setBusy(false);
        return;
      }

      await setDoc(accountRef, {
        displayName: name,
        authUid: credential.user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });

      window.localStorage.setItem("irisAccount", JSON.stringify({ id: cleanId, displayName: name }));
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

        <form className={styles.card} onSubmit={handleLogin}>
          <div className={styles.cardHead}>
            <LogIn size={22} />
            <h2>{t.login}</h2>
          </div>
          <label>
            {t.id}
            <input value={accountId} inputMode="numeric" maxLength={4} onChange={(event) => setAccountId(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0001" autoFocus />
          </label>
          <label>
            {t.name}
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Taku" />
          </label>
          <button className={styles.primary} disabled={busy} type="submit"><UserPlus size={18} />{displayName.trim() ? t.register : t.login}</button>
          <p className={styles.hint}>{t.hint}</p>
          <p className={styles.status}>{status}</p>
        </form>
      </section>
    </main>
  );
}
