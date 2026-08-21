"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Download, LogOut, Plus, ScanLine, Search, Trash2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import styles from "./ConsolePage.module.css";

type Language = "ja" | "en" | "mn";
type Profile = { username: string; role?: string };
type NameRecord = {
  id: string;
  no: number;
  barcode: string;
  name: string;
  kanji: string;
  kana: string;
  address: string;
  ownerUid: string;
  ownerName: string;
  addedAtText: string;
};
type StickyNote = { id: string; body: string; color: string; x: number; y: number; ownerUid: string };

const labels = {
  ja: { title: "名前マネージャー", search: "検索", register: "登録", clear: "クリア", result: "バーコード結果", recent: "5 最近のレコード", scan: "カメラスキャン", csv: "CSV", logout: "ログアウト", addNote: "+ 付箋を追加", edit: "編集", delete: "削除", admin: "管理者" },
  en: { title: "Name Manager", search: "Search", register: "Register", clear: "Clear", result: "Barcode Results", recent: "5 Recent Records", scan: "Camera Scan", csv: "CSV", logout: "Logout", addNote: "+ Add note", edit: "Edit", delete: "Delete", admin: "Admin" },
  mn: { title: "Нэрийн менежер", search: "Хайх", register: "Бүртгэх", clear: "Цэвэрлэх", result: "Баркод үр дүн", recent: "Сүүлийн 5 бичлэг", scan: "Камер унших", csv: "CSV", logout: "Гарах", addNote: "+ Наалт нэмэх", edit: "Засах", delete: "Устгах", admin: "Админ" }
};

const noteColors = ["#fff48f", "#a8f0d0", "#ffb6cb", "#9b95ff"];
const emptyForm = { barcode: "", name: "", kanji: "", kana: "", address: "" };

function dateText(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate() as Date;
    return date.toLocaleString("ja-JP", { hour12: false });
  }
  return "";
}

function csvEscape(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function ConsolePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [language, setLanguage] = useState<Language>("ja");
  const [dark, setDark] = useState(false);
  const [records, setRecords] = useState<NameRecord[]>([]);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const t = labels[language];
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("irisLanguage") as Language | null;
    const savedTheme = window.localStorage.getItem("irisTheme");
    if (savedLanguage && savedLanguage in labels) setLanguage(savedLanguage);
    if (savedTheme) setDark(savedTheme === "dark");
  }, []);

  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    if (!nextUser) {
      router.replace("/login");
      return;
    }
    setUser(nextUser);
    const profileRef = doc(db, "irisUsers", nextUser.uid);
    const snapshot = await getDoc(profileRef);
    const data = snapshot.data();
    const username = typeof data?.username === "string" ? data.username : nextUser.displayName || "user";
    const role = typeof data?.role === "string" ? data.role : "user";
    setProfile({ username, role });
    await setDoc(profileRef, { username, email: nextUser.email, role, updatedAt: serverTimestamp() }, { merge: true });
  }), [router]);

  useEffect(() => {
    if (!user) return;
    const recordsQuery = query(collection(db, "irisRecords"), orderBy("addedAt", "desc"));
    return onSnapshot(recordsQuery, (snapshot) => {
      setRecords(snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          no: typeof data.no === "number" ? data.no : 0,
          barcode: typeof data.barcode === "string" ? data.barcode : "",
          name: typeof data.name === "string" ? data.name : "",
          kanji: typeof data.kanji === "string" ? data.kanji : "",
          kana: typeof data.kana === "string" ? data.kana : "",
          address: typeof data.address === "string" ? data.address : "",
          ownerUid: typeof data.ownerUid === "string" ? data.ownerUid : "",
          ownerName: typeof data.ownerName === "string" ? data.ownerName : "",
          addedAtText: dateText(data.addedAt)
        };
      }));
    }, (error) => setStatus(error.message));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const notesQuery = query(collection(db, "irisStickyNotes"), orderBy("updatedAt", "desc"));
    return onSnapshot(notesQuery, (snapshot) => {
      setNotes(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as StickyNote));
    }, (error) => setStatus(error.message));
  }, [user]);

  const filteredRecords = useMemo(() => {
    const keyword = barcodeInput.trim().toLowerCase();
    const source = keyword ? records.filter((record) => [record.barcode, record.name, record.kanji, record.kana, record.address].join(" ").toLowerCase().includes(keyword)) : records;
    return source.slice(0, 5);
  }, [records, barcodeInput]);

  function changeLanguage(value: Language) {
    setLanguage(value);
    window.localStorage.setItem("irisLanguage", value);
  }

  function toggleTheme() {
    setDark((value) => {
      const next = !value;
      window.localStorage.setItem("irisTheme", next ? "dark" : "light");
      return next;
    });
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !profile) return;
    const cleanBarcode = (form.barcode || barcodeInput).trim();
    if (!cleanBarcode) {
      setStatus("Barcode required");
      return;
    }
    const payload = {
      no: Number(cleanBarcode.replace(/\D/g, "")) || records.length + 1,
      barcode: cleanBarcode,
      name: form.name.trim() || profile.username,
      kanji: form.kanji.trim(),
      kana: form.kana.trim(),
      address: form.address.trim(),
      ownerUid: user.uid,
      ownerName: profile.username,
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    if (editingId) {
      await updateDoc(doc(db, "irisRecords", editingId), payload);
    } else {
      await addDoc(collection(db, "irisRecords"), payload);
    }
    setForm(emptyForm);
    setEditingId(null);
    setStatus("Saved");
  }

  function editRecord(record: NameRecord) {
    setEditingId(record.id);
    setBarcodeInput(record.barcode);
    setForm({ barcode: record.barcode, name: record.name, kanji: record.kanji, kana: record.kana, address: record.address });
  }

  async function removeRecord(record: NameRecord) {
    if (!user || (!isAdmin && record.ownerUid !== user.uid)) return;
    await deleteDoc(doc(db, "irisRecords", record.id));
  }

  function clearForm() {
    setBarcodeInput("");
    setForm(emptyForm);
    setEditingId(null);
  }

  async function addNote() {
    if (!user) return;
    await addDoc(collection(db, "irisStickyNotes"), { body: "", color: noteColors[0], x: 60, y: 520, ownerUid: user.uid, updatedAt: serverTimestamp() });
  }

  async function updateNote(note: StickyNote, patch: Partial<StickyNote>) {
    if (!user || (!isAdmin && note.ownerUid !== user.uid)) return;
    await updateDoc(doc(db, "irisStickyNotes", note.id), { ...patch, updatedAt: serverTimestamp() });
  }

  async function deleteNote(note: StickyNote) {
    if (!user || (!isAdmin && note.ownerUid !== user.uid)) return;
    await deleteDoc(doc(db, "irisStickyNotes", note.id));
  }

  function downloadCsv() {
    const header = ["NO", "バーコード", "名前", "漢字", "カタカナ", "住所", "追加日時"];
    const rows = records.map((record) => [record.no, record.barcode, record.name, record.kanji, record.kana, record.address, record.addedAtText].map(csvEscape).join(","));
    const blob = new Blob(["\uFEFF" + [header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "iris-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  if (!user || !profile) return <main className={styles.loading}>Loading...</main>;

  return (
    <main className={dark ? `${styles.page} ${styles.dark}` : styles.page}>
      <header className={styles.header}>
        <div className={styles.logo} />
        <div>
          <p>IRIS CONSOLE</p>
          <h1>{t.title}</h1>
        </div>
      </header>

      <nav className={styles.toolbar}>
        <span className={styles.userPill}>{profile.username}{isAdmin && <b>{t.admin}</b>}</span>
        <button onClick={() => changeLanguage(language === "ja" ? "en" : language === "en" ? "mn" : "ja")}>{language === "ja" ? "日本語" : language === "en" ? "English" : "Монгол"}</button>
        <button onClick={toggleTheme}>{dark ? "ライトモード" : "ダークモード"}</button>
        <button onClick={() => setStatus("Camera scan is not enabled yet.")}><ScanLine size={18} />{t.scan}</button>
        <button onClick={downloadCsv}><Download size={18} />{t.csv}</button>
        <button onClick={handleLogout}><LogOut size={18} />{t.logout}</button>
      </nav>

      <p className={styles.recent}>{t.recent}</p>

      <form className={styles.searchCard} onSubmit={handleRegister}>
        <input value={barcodeInput} onChange={(event) => { setBarcodeInput(event.target.value); setForm((value) => ({ ...value, barcode: event.target.value })); }} placeholder="000001" />
        <div className={styles.actionRow}>
          <button type="button"><Search size={18} />{t.search}</button>
          <button className={styles.greenButton} type="submit"><Plus size={18} />{t.register}</button>
          <button type="button" onClick={clearForm}>{t.clear}</button>
        </div>
        <div className={styles.detailGrid}>
          <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} placeholder="名前" />
          <input value={form.kanji} onChange={(event) => setForm((value) => ({ ...value, kanji: event.target.value }))} placeholder="漢字" />
          <input value={form.kana} onChange={(event) => setForm((value) => ({ ...value, kana: event.target.value }))} placeholder="カタカナ" />
          <input value={form.address} onChange={(event) => setForm((value) => ({ ...value, address: event.target.value }))} placeholder="住所" />
        </div>
      </form>

      <section className={styles.resultPanel}>
        <div className={styles.resultHead}>
          <div><p>結果</p><h2>{t.result}</h2></div>
          <span>{t.recent}</span>
        </div>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>NO</th><th>バーコード</th><th>名前</th><th>漢字</th><th>カタカナ</th><th>住所</th><th>追加日時</th><th>操作</th></tr></thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.no}</td><td>{record.barcode}</td><td>{record.name}</td><td>{record.kanji}</td><td>{record.kana}</td><td>{record.address}</td><td>{record.addedAtText}</td>
                  <td className={styles.actions}><button onClick={() => editRecord(record)}>{t.edit}</button><button onClick={() => removeRecord(record)}><Trash2 size={15} />{t.delete}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {notes.map((note) => (
        <article className={styles.note} draggable key={note.id} style={{ background: note.color, left: note.x, top: note.y }} onDragEnd={(event) => updateNote(note, { x: event.clientX, y: event.clientY })}>
          <div className={styles.noteDots}>{noteColors.map((color) => <button key={color} style={{ background: color }} onClick={() => updateNote(note, { color })} />)}<button onClick={() => deleteNote(note)}>×</button></div>
          <textarea value={note.body} onChange={(event) => updateNote(note, { body: event.target.value })} placeholder="memo" />
        </article>
      ))}
      <button className={styles.addNote} onClick={addNote}>{t.addNote}</button>
      <p className={styles.status}>{status}</p>
    </main>
  );
}
