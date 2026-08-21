"use client";

import {
  FormEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
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
  updateDoc,
  where
} from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { BrandMark, LanguageSelect, ThemeToggle, useLanguage, useTheme } from "@/components/Controls";
import { auth, db } from "@/lib/firebase";
import { Account, Role, emailToUsername, isRole } from "@/lib/account";
import { labels } from "@/lib/i18n";

type IrisRecord = {
  id: string;
  no: number;
  barcode: string;
  name: string;
  kanji: string;
  katakana: string;
  address: string;
  addedDateTime: string;
  ownerUid: string;
};

type NoteColor = "lemon" | "mint" | "rose" | "iris";

type StickyNote = {
  id: string;
  body: string;
  color: NoteColor;
  x: number;
  y: number;
};

const NOTE_COLORS: NoteColor[] = ["lemon", "mint", "rose", "iris"];

const emptyForm = { name: "", kanji: "", katakana: "", address: "" };

function isNoteColor(value: unknown): value is NoteColor {
  return typeof value === "string" && (NOTE_COLORS as string[]).includes(value);
}

function pad6(value: number) {
  return String(value).padStart(6, "0");
}

function nowStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(
    d.getSeconds()
  )}`;
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function toRecord(id: string, data: Record<string, unknown>): IrisRecord {
  const str = (key: string) => (typeof data[key] === "string" ? (data[key] as string) : "");
  return {
    id,
    no: typeof data.no === "number" ? data.no : Number(str("barcode")) || 0,
    barcode: str("barcode"),
    name: str("name"),
    kanji: str("kanji"),
    katakana: str("katakana"),
    address: str("address"),
    addedDateTime: str("addedDateTime"),
    ownerUid: str("ownerUid")
  };
}

export default function ConsolePage() {
  const router = useRouter();
  const [language, setLanguage] = useLanguage();
  const [dark, toggleTheme] = useTheme();

  const [account, setAccount] = useState<Account | null>(null);
  const [records, setRecords] = useState<IrisRecord[]>([]);
  const [notes, setNotes] = useState<StickyNote[]>([]);

  const [barcode, setBarcode] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState<"info" | "error">("info");
  const [busy, setBusy] = useState(false);

  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const t = labels[language];

  const say = useCallback((message: string, kind: "info" | "error" = "info") => {
    setStatus(message);
    setStatusKind(kind);
  }, []);

  /* ---------- auth ---------- */

  useEffect(() => {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      let displayName = user.displayName || emailToUsername(user.email);
      let role: Role = "member";

      try {
        const profile = await getDoc(doc(db, "irisUsers", user.uid));
        const data = profile.data();
        if (data) {
          if (typeof data.displayName === "string" && data.displayName) displayName = data.displayName;
          if (isRole(data.role)) role = data.role;
        }
      } catch {
        /* プロフィールが読めなくてもコンソールは表示する */
      }

      setAccount({ uid: user.uid, username: emailToUsername(user.email), displayName, role });
    });
  }, [router]);

  /* ---------- records ---------- */

  useEffect(() => {
    if (!account) return;
    return onSnapshot(
      query(collection(db, "irisRecords"), orderBy("no", "asc")),
      (snapshot) => setRecords(snapshot.docs.map((item) => toRecord(item.id, item.data()))),
      (error) => say(error.message, "error")
    );
  }, [account, say]);

  /* ---------- sticky notes ---------- */

  useEffect(() => {
    if (!account) return;
    return onSnapshot(
      query(collection(db, "irisNotes"), where("ownerUid", "==", account.uid)),
      (snapshot) => {
        setNotes(
          snapshot.docs.map((item) => {
            const data = item.data();
            return {
              id: item.id,
              body: typeof data.body === "string" ? data.body : "",
              color: isNoteColor(data.color) ? data.color : "lemon",
              x: typeof data.x === "number" ? data.x : 40,
              y: typeof data.y === "number" ? data.y : 140
            };
          })
        );
      },
      (error) => say(error.message, "error")
    );
  }, [account, say]);

  useEffect(() => {
    const timers = saveTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  /* ---------- derived ---------- */

  const filtered = useMemo(() => {
    const keyword = barcode.trim().toLowerCase();
    if (!keyword) return records;
    return records.filter((record) =>
      [record.barcode, record.name, record.kanji, record.katakana, record.address]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [records, barcode]);

  /* ---------- record actions ---------- */

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(false);
  }

  function handleSearch() {
    if (!barcode.trim()) {
      say(`${records.length} ${t.recentRecords}`);
      return;
    }
    say(filtered.length === 0 ? t.notFound : `${filtered.length} ${t.matched}`, filtered.length === 0 ? "error" : "info");
  }

  function handleClear() {
    setBarcode("");
    resetForm();
    say(t.cleared);
  }

  async function handleRegister(event?: FormEvent) {
    event?.preventDefault();
    if (!account) return;

    const cleanBarcode = barcode.replace(/\D/g, "");

    if (!formOpen) {
      if (!cleanBarcode) return say(t.needBarcodeName, "error");
      setFormOpen(true);
      return;
    }

    if (!cleanBarcode || !form.name.trim()) return say(t.needBarcodeName, "error");

    const payload = {
      no: Number(cleanBarcode),
      barcode: pad6(Number(cleanBarcode)),
      name: form.name.trim(),
      kanji: form.kanji.trim(),
      katakana: form.katakana.trim(),
      address: form.address.trim(),
      ownerUid: account.uid,
      ownerName: account.displayName,
      addedDateTime: nowStamp(),
      updatedAt: serverTimestamp()
    };

    setBusy(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "irisRecords", editingId), payload);
        say(t.updated);
      } else {
        await addDoc(collection(db, "irisRecords"), payload);
        say(t.registered);
      }
      setBarcode("");
      resetForm();
    } catch (error) {
      say(error instanceof Error ? error.message : "Firestore error", "error");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(record: IrisRecord) {
    setEditingId(record.id);
    setBarcode(record.barcode);
    setForm({
      name: record.name,
      kanji: record.kanji,
      katakana: record.katakana,
      address: record.address
    });
    setFormOpen(true);
  }

  async function removeRecord(record: IrisRecord) {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await deleteDoc(doc(db, "irisRecords", record.id));
      if (editingId === record.id) resetForm();
      say(t.deleted);
    } catch (error) {
      say(error instanceof Error ? error.message : "Firestore error", "error");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  function downloadCsv() {
    const header = [t.colNo, t.colBarcode, t.colName, t.colKanji, t.colKatakana, t.colAddress, t.colAddedAt];
    const rows = filtered.map((record) =>
      [
        String(record.no),
        record.barcode,
        record.name,
        record.kanji,
        record.katakana,
        record.address,
        record.addedDateTime
      ]
        .map(csvCell)
        .join(",")
    );
    const csv = "﻿" + [header.map(csvCell).join(","), ...rows].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "iris-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- note actions ---------- */

  async function addNote() {
    if (!account) return;
    const index = notes.length;
    await addDoc(collection(db, "irisNotes"), {
      body: "",
      color: NOTE_COLORS[index % NOTE_COLORS.length],
      x: 32 + (index % 3) * 26,
      y: 160 + (index % 4) * 42,
      ownerUid: account.uid,
      updatedAt: serverTimestamp()
    });
  }

  function queueNoteSave(id: string, patch: Partial<StickyNote>) {
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, ...patch } : note)));
    clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(() => {
      setDoc(doc(db, "irisNotes", id), { ...patch, updatedAt: serverTimestamp() }, { merge: true }).catch((error) =>
        say(error instanceof Error ? error.message : "Firestore error", "error")
      );
    }, 600);
  }

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>, note: StickyNote) {
    dragRef.current = { id: note.id, dx: event.clientX - note.x, dy: event.clientY - note.y };
    setDraggingId(note.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const x = Math.max(8, Math.min(window.innerWidth - 232, event.clientX - drag.dx));
    const y = Math.max(8, Math.min(window.innerHeight - 150, event.clientY - drag.dy));
    setNotes((current) => current.map((note) => (note.id === drag.id ? { ...note, x, y } : note)));
  }

  function endDrag() {
    const drag = dragRef.current;
    dragRef.current = null;
    setDraggingId(null);
    if (!drag) return;
    const note = notes.find((item) => item.id === drag.id);
    if (note) queueNoteSave(note.id, { x: note.x, y: note.y });
  }

  async function removeNote(id: string) {
    await deleteDoc(doc(db, "irisNotes", id));
  }

  /* ---------- render ---------- */

  if (!account) {
    return (
      <main className="app-shell">
        <p className="status-line">{t.connecting}</p>
      </main>
    );
  }

  return (
    <>
      <main className="app-shell">
        <header className="app-header">
          <div className="brand-lockup">
            <BrandMark small />
            <div>
              <p className="eyebrow">{t.brand}</p>
              <h1 className="gradient-text">{t.appName}</h1>
            </div>
          </div>

          <div className="header-meta">
            <span className="user-pill">
              <span className="user-name">{account.displayName}</span>
              <span className="role-chip">{account.role === "admin" ? t.roleAdmin : t.roleMember}</span>
            </span>
            <LanguageSelect language={language} onChange={setLanguage} />
            <ThemeToggle dark={dark} onToggle={toggleTheme} t={t} className="" />
            <button type="button" onClick={() => say(t.cameraOff, "error")}>
              {t.camera}
            </button>
            <button type="button" onClick={downloadCsv}>
              {t.csv}
            </button>
            <button type="button" onClick={handleLogout}>
              {t.logout}
            </button>
          </div>
        </header>

        <p className="status-line" data-kind={statusKind}>
          {status || `${records.length} ${t.recentRecords}`}
        </p>

        <div className="workspace">
          <form className="iris-form" onSubmit={handleRegister}>
            <input
              className="barcode-input"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              placeholder={t.searchPlaceholder}
              inputMode="numeric"
              aria-label={t.colBarcode}
            />

            <div className="actions">
              <button className="button primary" type="button" onClick={handleSearch}>
                {t.search}
              </button>
              <button className="button success" type="submit" disabled={busy}>
                {editingId ? t.update : t.register}
              </button>
              <button className="button" type="button" onClick={handleClear}>
                {t.clear}
              </button>
            </div>

            {formOpen && (
              <div className="field-grid">
                <label>
                  {t.colName}
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoFocus />
                </label>
                <label>
                  {t.colKanji}
                  <input value={form.kanji} onChange={(event) => setForm({ ...form, kanji: event.target.value })} />
                </label>
                <label>
                  {t.colKatakana}
                  <input value={form.katakana} onChange={(event) => setForm({ ...form, katakana: event.target.value })} />
                </label>
                <label>
                  {t.colAddress}
                  <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
                </label>
              </div>
            )}
          </form>

          <section className="result-panel">
            <div className="result-heading">
              <div>
                <p className="eyebrow">{t.results}</p>
                <h2>{t.resultsTitle}</h2>
              </div>
              <span className="result-mode-badge">
                {filtered.length} {t.recentRecords}
              </span>
            </div>

            {filtered.length === 0 ? (
              <p className="empty-state">{t.empty}</p>
            ) : (
              <div className="table-wrap">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>{t.colNo}</th>
                      <th>{t.colBarcode}</th>
                      <th>{t.colName}</th>
                      <th>{t.colKanji}</th>
                      <th>{t.colKatakana}</th>
                      <th>{t.colAddress}</th>
                      <th>{t.colAddedAt}</th>
                      <th aria-label={t.colActions} />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((record) => (
                      <tr
                        key={record.id}
                        className={editingId === record.id ? "is-editable is-editing" : "is-editable"}
                        onDoubleClick={() => startEdit(record)}
                      >
                        <td className="is-mono">{record.no}</td>
                        <td className="is-mono">{record.barcode}</td>
                        <td>{record.name}</td>
                        <td>{record.kanji}</td>
                        <td>{record.katakana}</td>
                        <td>{record.address}</td>
                        <td className="is-mono">{record.addedDateTime}</td>
                        <td>
                          <div className="row-actions">
                            <button className="mini-edit" type="button" onClick={() => startEdit(record)}>
                              {t.edit}
                            </button>
                            <button className="mini-delete" type="button" onClick={() => removeRecord(record)}>
                              {t.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      <div className="note-layer">
        {notes.map((note, index) => (
          <div
            key={note.id}
            className={`iris-note note-${note.color}${draggingId === note.id ? " is-dragging" : ""}`}
            style={
              {
                left: note.x,
                top: note.y,
                "--rot": `${index % 2 === 0 ? -1.8 : 1.5}deg`
              } as React.CSSProperties
            }
            onPointerMove={onDrag}
            onPointerUp={endDrag}
          >
            <div className="note-grip" onPointerDown={(event) => beginDrag(event, note)}>
              <span className="note-dots">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`note-dot dot-${color}`}
                    type="button"
                    aria-label={color}
                    onClick={() => queueNoteSave(note.id, { color })}
                  />
                ))}
              </span>
              <button className="note-close" type="button" aria-label={t.delete} onClick={() => removeNote(note.id)}>
                ×
              </button>
            </div>
            <textarea
              className="note-text"
              value={note.body}
              placeholder={t.notePlaceholder}
              onChange={(event) => queueNoteSave(note.id, { body: event.target.value })}
            />
          </div>
        ))}
      </div>

      <button className="note-add" type="button" onClick={addNote}>
        + {t.addNote}
      </button>
    </>
  );
}
