"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { Download, Languages, Moon, Plus, Save, Search, Trash2, UserRound } from "lucide-react";
import { db } from "@/lib/firebase";

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
  updatedAt?: unknown;
};

const labels = {
  ja: {
    account: "アカウント",
    barcode: "バーコード",
    command: "登録 / 更新",
    delete: "削除",
    download: "CSV",
    memo: "付箋メモ",
    name: "名前",
    register: "登録",
    search: "検索",
    subtitle: "Vercelで動くServer-test用コンソール。データはFirebase Firestoreへ保存します。"
  },
  en: {
    account: "Account",
    barcode: "Barcode",
    command: "Save",
    delete: "Delete",
    download: "CSV",
    memo: "Sticky note",
    name: "Name",
    register: "Register",
    search: "Search",
    subtitle: "Server-test console for Vercel. Data is stored in Firebase Firestore."
  },
  mn: {
    account: "Аккаунт",
    barcode: "Баркод",
    command: "Хадгалах",
    delete: "Устгах",
    download: "CSV",
    memo: "Тэмдэглэл",
    name: "Нэр",
    register: "Бүртгэх",
    search: "Хайх",
    subtitle: "Vercel дээр ажиллах Server-test консол. Өгөгдөл Firebase Firestore-д хадгалагдана."
  }
};

const emptyRecord = { barcode: "", name: "", memo: "" };

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function Home() {
  const [language, setLanguage] = useState<keyof typeof labels>("ja");
  const [dark, setDark] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [records, setRecords] = useState<IrisRecord[]>([]);
  const [search, setSearch] = useState("");
  const [recordForm, setRecordForm] = useState(emptyRecord);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("Firebase ready");

  const t = labels[language];

  useEffect(() => {
    const recordsQuery = query(collection(db, "irisRecords"), orderBy("updatedAt", "desc"));
    return onSnapshot(recordsQuery, (snapshot) => {
      setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as IrisRecord));
    });
  }, []);

  useEffect(() => {
    if (!currentAccount) {
      setNote("");
      return;
    }

    return onSnapshot(doc(db, "irisNotes", currentAccount.id), (snapshot) => {
      const data = snapshot.data();
      setNote(typeof data?.body === "string" ? data.body : "");
    });
  }, [currentAccount]);

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return records;

    return records.filter((record) => {
      return [record.barcode, record.name, record.memo, record.ownerId]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [records, search]);

  async function handleAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanId = accountId.replace(/\D/g, "").slice(0, 4);
    if (cleanId.length !== 4 || !displayName.trim()) {
      setStatus("4桁IDと名前を入力してください");
      return;
    }

    const account = { id: cleanId, displayName: displayName.trim() };
    await setDoc(doc(db, "irisAccounts", cleanId), {
      displayName: account.displayName,
      updatedAt: serverTimestamp()
    }, { merge: true });
    setCurrentAccount(account);
    setStatus(`Account ${cleanId} saved`);
  }

  async function handleRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentAccount) {
      setStatus("先にアカウント登録してください");
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
    if (!currentAccount) {
      setStatus("先にアカウント登録してください");
      return;
    }

    await setDoc(doc(db, "irisNotes", currentAccount.id), {
      body: note,
      displayName: currentAccount.displayName,
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

  return (
    <main className={dark ? "theme dark" : "theme"}>
      <section className="shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Server-test</p>
            <h1>IRIS Console</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>
          <div className="toolbar" aria-label="tools">
            <button type="button" title="language" onClick={() => setLanguage(language === "ja" ? "en" : language === "en" ? "mn" : "ja")}>
              <Languages size={18} /> {language.toUpperCase()}
            </button>
            <button type="button" title="dark mode" onClick={() => setDark((value) => !value)}>
              <Moon size={18} />
            </button>
          </div>
        </header>

        <section className="statusline">
          <span>{currentAccount ? `${currentAccount.id} / ${currentAccount.displayName}` : "No account"}</span>
          <span>{status}</span>
        </section>

        <div className="workspace">
          <aside className="panel sidepanel">
            <form onSubmit={handleAccount} className="stack">
              <h2>{t.account}</h2>
              <label>
                4桁ID
                <input value={accountId} inputMode="numeric" maxLength={4} onChange={(event) => setAccountId(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0001" />
              </label>
              <label>
                {t.name}
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Taku" />
              </label>
              <button className="primary" type="submit"><UserRound size={18} />{t.register}</button>
            </form>

            <div className="stack noteArea">
              <h2>{t.memo}</h2>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Memo" />
              <button type="button" onClick={saveNote}><Save size={18} />{t.command}</button>
            </div>
          </aside>

          <section className="panel mainpanel">
            <form className="recordForm" onSubmit={handleRecord}>
              <label>
                {t.barcode}
                <input value={recordForm.barcode} onChange={(event) => setRecordForm((value) => ({ ...value, barcode: event.target.value }))} placeholder="4900000000000" />
              </label>
              <label>
                {t.name}
                <input value={recordForm.name} onChange={(event) => setRecordForm((value) => ({ ...value, name: event.target.value }))} placeholder="Name" />
              </label>
              <label className="wide">
                Memo
                <input value={recordForm.memo} onChange={(event) => setRecordForm((value) => ({ ...value, memo: event.target.value }))} placeholder="Optional" />
              </label>
              <button className="primary" type="submit"><Plus size={18} />{editingId ? t.command : t.register}</button>
            </form>

            <div className="searchbar">
              <Search size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} />
              <button type="button" onClick={downloadCsv}><Download size={18} />{t.download}</button>
            </div>

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>{t.barcode}</th>
                    <th>{t.name}</th>
                    <th>Memo</th>
                    <th>ID</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} onDoubleClick={() => editRecord(record)}>
                      <td>{record.barcode}</td>
                      <td>{record.name}</td>
                      <td>{record.memo}</td>
                      <td>{record.ownerId}</td>
                      <td className="actions">
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
