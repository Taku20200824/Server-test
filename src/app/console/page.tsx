"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, signOut, User } from "firebase/auth";
import { Download, Languages, LogOut, Moon, Plus, Save, Search, ScanLine, Sun, Trash2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import styles from "./ConsolePage.module.css";

type Language = "ja" | "en" | "mn";

type Account = {
  id: string;
  displayName: string;
};

type IrisRecord = {
  id: string;
  barcode: string;
  name: string;
  memo: string;
  ownerId: string;
  authUid?: string;
};

type Announcement = {
  title: string;
  body: string;
  date: string;
};

const labels = {
  ja: {
    account: "アカウント",
    barcode: "バーコード",
    command: "登録 / 更新",
    download: "CSV",
    empty: "データがありません",
    logout: "ログアウト",
    memo: "付箋メモ",
    name: "名前",
    register: "登録",
    scan: "読取",
    search: "検索",
    subtitle: "Server-test 管理コンソール"
  },
  en: {
    account: "Account",
    barcode: "Barcode",
    command: "Save",
    download: "CSV",
    empty: "No data",
    logout: "Logout",
    memo: "Sticky note",
    name: "Name",
    register: "Register",
    scan: "Scan",
    search: "Search",
    subtitle: "Server-test management console"
  },
  mn: {
    account: "Аккаунт",
    barcode: "Баркод",
    command: "Хадгалах",
    download: "CSV",
    empty: "Өгөгдөл алга",
    logout: "Гарах",
    memo: "Тэмдэглэл",
    name: "Нэр",
    register: "Бүртгэх",
    scan: "Унших",
    search: "Хайх",
    subtitle: "Server-test удирдлагын консол"
  }
};

const emptyRecord = { barcode: "", name: "", memo: "" };

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function readStoredAccount(): Account | null {
  try {
    const raw = window.localStorage.getItem("irisAccount");
    if (!raw) return null;
    const data = JSON.parse(raw) as Account;
    if (!/^\d{4}$/.test(data.id) || !data.displayName) return null;
    return data;
  } catch {
    return null;
  }
}

function getFirebaseAuthStatus(error: unknown) {
  const message = error instanceof Error ? error.message : "Firebase auth error";
  if (message.includes("auth/configuration-not-found")) {
    return "Firebase Authentication is not enabled. Enable Anonymous sign-in in Firebase Console.";
  }
  if (message.includes("auth/operation-not-allowed")) {
    return "Anonymous sign-in is disabled in Firebase Authentication.";
  }
  return message;
}

export default function ConsolePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("ja");
  const [dark, setDark] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [records, setRecords] = useState<IrisRecord[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [search, setSearch] = useState("");
  const [recordForm, setRecordForm] = useState(emptyRecord);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("Firebase ready");

  const t = labels[language];

  useEffect(() => {
    const account = readStoredAccount();
    if (!account) {
      router.replace("/login");
      return;
    }
    setCurrentAccount(account);

    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        return;
      }
      try {
        const credential = await signInAnonymously(auth);
        setFirebaseUser(credential.user);
      } catch (error) {
        setStatus(getFirebaseAuthStatus(error));
      }
    });
  }, [router]);

  useEffect(() => {
    if (!firebaseUser) return;
    const recordsQuery = query(collection(db, "irisRecords"), orderBy("updatedAt", "desc"));
    return onSnapshot(recordsQuery, (snapshot) => {
      setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as IrisRecord));
    }, (error) => setStatus(error.message));
  }, [firebaseUser]);

  useEffect(() => {
    if (!firebaseUser) return;
    return onSnapshot(doc(db, "announcements", "server-ready"), (snapshot) => {
      const data = snapshot.data();
      if (!data) {
        setAnnouncement(null);
        return;
      }
      setAnnouncement({
        title: typeof data.title === "string" ? data.title : "Server ready",
        body: typeof data.body === "string" ? data.body : "",
        date: typeof data.date === "string" ? data.date : ""
      });
    }, (error) => setStatus(error.message));
  }, [firebaseUser]);

  useEffect(() => {
    if (!currentAccount || !firebaseUser) return;
    return onSnapshot(doc(db, "irisNotes", currentAccount.id), (snapshot) => {
      const data = snapshot.data();
      setNote(typeof data?.body === "string" ? data.body : "");
    }, (error) => setStatus(error.message));
  }, [currentAccount, firebaseUser]);

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return records;
    return records.filter((record) => [record.barcode, record.name, record.memo, record.ownerId].join(" ").toLowerCase().includes(keyword));
  }, [records, search]);

  async function handleRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentAccount || !firebaseUser) {
      setStatus("先にログインしてください");
      return;
    }
    if (!recordForm.barcode.trim() || !recordForm.name.trim()) {
      setStatus("バーコードと名前を入力してください");
      return;
    }

    const payload = {
      barcode: recordForm.barcode.trim(),
      name: recordForm.name.trim(),
      memo: recordForm.memo.trim(),
      ownerId: currentAccount.id,
      authUid: firebaseUser.uid,
      updatedAt: serverTimestamp()
    };

    if (editingId) {
      await updateDoc(doc(db, "irisRecords", editingId), payload);
      setStatus("Record updated");
    } else {
      await addDoc(collection(db, "irisRecords"), payload);
      setStatus("Record registered");
    }

    setRecordForm(emptyRecord);
    setEditingId(null);
  }

  async function saveNote() {
    if (!currentAccount || !firebaseUser) {
      setStatus("先にログインしてください");
      return;
    }

    await setDoc(doc(db, "irisNotes", currentAccount.id), {
      body: note,
      displayName: currentAccount.displayName,
      authUid: firebaseUser.uid,
      updatedAt: serverTimestamp()
    }, { merge: true });
    setStatus("Note saved");
  }

  function editRecord(record: IrisRecord) {
    setEditingId(record.id);
    setRecordForm({ barcode: record.barcode, name: record.name, memo: record.memo });
  }

  async function removeRecord(id: string) {
    await deleteDoc(doc(db, "irisRecords", id));
    if (editingId === id) {
      setEditingId(null);
      setRecordForm(emptyRecord);
    }
    setStatus("Record deleted");
  }

  async function handleLogout() {
    window.localStorage.removeItem("irisAccount");
    await signOut(auth);
    router.replace("/login");
  }

  function downloadCsv() {
    const header = ["barcode", "name", "memo", "ownerId"];
    const rows = records.map((record) => [record.barcode, record.name, record.memo, record.ownerId].map(csvEscape).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "server-test-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleScanPlaceholder() {
    setStatus("Camera scan is not enabled in this Vercel version. Please enter the barcode manually.");
  }

  if (!currentAccount) {
    return <main className={styles.loading}>Loading...</main>;
  }

  return (
    <main className={dark ? `${styles.page} ${styles.dark}` : styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.brand}>SERVER-TEST</p>
            <h1>IRIS Console</h1>
            <p>{t.subtitle}</p>
          </div>
          <div className={styles.tools}>
            <button type="button" onClick={() => setLanguage(language === "ja" ? "en" : language === "en" ? "mn" : "ja")} title="language"><Languages size={22} />{language.toUpperCase()}</button>
            <button type="button" onClick={() => setDark((value) => !value)} title="theme">{dark ? <Sun size={22} /> : <Moon size={22} />}</button>
            <button className={styles.logoutButton} type="button" onClick={handleLogout}><LogOut size={22} />{t.logout}</button>
          </div>
        </header>

        <section className={styles.statusline}>
          <span>{currentAccount.id} / {currentAccount.displayName}</span>
          <span>{status}</span>
        </section>

        {announcement && (
          <section className={styles.announcement}>
            <div>
              <p className={styles.announcementDate}>{announcement.date}</p>
              <h2>{announcement.title}</h2>
            </div>
            <p>{announcement.body}</p>
          </section>
        )}

        <div className={styles.workspace}>
          <aside className={styles.sidepanel}>
            <div className={styles.accountBox}>
              <h2>{t.account}</h2>
              <p className={styles.accountId}>{currentAccount.id}</p>
              <p className={styles.accountName}>{currentAccount.displayName}</p>
            </div>

            <div className={styles.noteArea}>
              <h2>{t.memo}</h2>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Memo" />
              <button type="button" onClick={saveNote}><Save size={22} />{t.command}</button>
            </div>
          </aside>

          <section className={styles.mainpanel}>
            <form className={styles.recordForm} onSubmit={handleRecord}>
              <label>{t.barcode}<input value={recordForm.barcode} onChange={(event) => setRecordForm((value) => ({ ...value, barcode: event.target.value }))} placeholder="4900000000000" /></label>
              <label>{t.name}<input value={recordForm.name} onChange={(event) => setRecordForm((value) => ({ ...value, name: event.target.value }))} placeholder="Name" /></label>
              <label>Memo<input value={recordForm.memo} onChange={(event) => setRecordForm((value) => ({ ...value, memo: event.target.value }))} placeholder="Optional" /></label>
              <button className={styles.primary} type="submit"><Plus size={22} />{editingId ? t.command : t.register}</button>
            </form>

            <div className={styles.searchbar}>
              <Search size={23} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} />
              <button type="button" onClick={handleScanPlaceholder}><ScanLine size={22} />{t.scan}</button>
              <button type="button" onClick={downloadCsv}><Download size={22} />{t.download}</button>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>{t.barcode}</th><th>{t.name}</th><th>Memo</th><th>ID</th><th></th></tr></thead>
                <tbody>
                  {filteredRecords.length === 0 && <tr><td className={styles.emptyCell} colSpan={5}>{t.empty}</td></tr>}
                  {filteredRecords.map((record) => (
                    <tr key={record.id} onDoubleClick={() => editRecord(record)}>
                      <td>{record.barcode}</td><td>{record.name}</td><td>{record.memo}</td><td>{record.ownerId}</td>
                      <td className={styles.actions}>
                        <button type="button" onClick={() => editRecord(record)}><Save size={16} /></button>
                        <button type="button" onClick={() => removeRecord(record.id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
