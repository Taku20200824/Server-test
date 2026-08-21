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
  updateDoc
} from "firebase/firestore";
import { onAuthStateChanged, signOut, updatePassword, updateProfile, User } from "firebase/auth";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { BrandMark, LanguageSelect, ThemeToggle, useLanguage, useTheme } from "@/components/Controls";
import { Barcode, code39SvgString } from "@/components/Barcode";
import { auth, db } from "@/lib/firebase";
import { Account, Role, emailToUsername, isRole, roleForId } from "@/lib/account";
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
  ownerName: string;
};

type NoteColor = "lemon" | "mint" | "rose" | "iris";

type StickyNote = {
  id: string;
  body: string;
  color: NoteColor;
  x: number;
  y: number;
  ownerUid: string;
  ownerName: string;
};

const NOTE_COLORS: NoteColor[] = ["lemon", "mint", "rose", "iris"];

const emptyForm = { name: "", kanji: "", katakana: "", address: "" };

function isNoteColor(value: unknown): value is NoteColor {
  return typeof value === "string" && (NOTE_COLORS as string[]).includes(value);
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
    ownerUid: str("ownerUid"),
    ownerName: str("ownerName")
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

  const [cameraOpen, setCameraOpen] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirm, setProfileConfirm] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState<"info" | "error">("info");
  const [busy, setBusy] = useState(false);

  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  const t = labels[language];
  const canEdit = account?.role === "admin";

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

      const username = emailToUsername(user.email);
      let displayName = user.displayName || username;
      // Firestore プロフィールが読めない / 無い場合でも、ID が 9 で始まれば admin として扱う
      let role: Role = roleForId(username);

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

      setAccount({ uid: user.uid, username, displayName, role });
    });
  }, [router]);

  // ログインしたアカウントの表示名を設定フォームの初期値にする
  useEffect(() => {
    if (account) setProfileName(account.displayName);
  }, [account?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- records ---------- */

  useEffect(() => {
    if (!account) return;
    return onSnapshot(
      query(collection(db, "irisRecords"), orderBy("no", "asc")),
      (snapshot) => setRecords(snapshot.docs.map((item) => toRecord(item.id, item.data()))),
      (error) => say(error.message, "error")
    );
  }, [account, say]);

  /* ---------- sticky notes (shared board) ---------- */

  useEffect(() => {
    if (!account) return;
    return onSnapshot(
      query(collection(db, "irisNotes")),
      (snapshot) => {
        setNotes(
          snapshot.docs.map((item) => {
            const data = item.data();
            return {
              id: item.id,
              body: typeof data.body === "string" ? data.body : "",
              color: isNoteColor(data.color) ? data.color : "lemon",
              x: typeof data.x === "number" ? data.x : 40,
              y: typeof data.y === "number" ? data.y : 140,
              ownerUid: typeof data.ownerUid === "string" ? data.ownerUid : "",
              ownerName: typeof data.ownerName === "string" ? data.ownerName : ""
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

  /* ---------- camera scan (ZXing: どのブラウザでも動く) ---------- */

  useEffect(() => {
    if (!cameraOpen) return;

    let cancelled = false;
    let controls: IScannerControls | null = null;
    const reader = new BrowserMultiFormatReader();

    (async () => {
      const video = videoRef.current;
      if (!video) return;
      try {
        controls = await reader.decodeFromVideoDevice(undefined, video, (result, _error, scanControls) => {
          if (!result) return;
          const raw = result.getText();
          const digits = raw.replace(/\D/g, "");
          setBarcode(digits || raw);
          say(t.scanned);
          scanControls.stop();
          if (!cancelled) setCameraOpen(false);
        });
        if (cancelled) controls.stop();
      } catch {
        say(t.cameraDenied, "error");
        if (!cancelled) setCameraOpen(false);
      }
    })();

    return () => {
      cancelled = true;
      if (controls) controls.stop();
    };
  }, [cameraOpen, say, t]);

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

  const nextNo = useMemo(() => records.reduce((max, record) => Math.max(max, record.no), 0) + 1, [records]);

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
    if (!account || !canEdit) return say(t.viewOnlyNotice, "error");

    const cleanBarcode = barcode.replace(/\D/g, "");

    if (!formOpen) {
      if (!cleanBarcode) return say(t.needBarcodeName, "error");
      setFormOpen(true);
      return;
    }

    if (!cleanBarcode || !form.name.trim()) return say(t.needBarcodeName, "error");

    const editing = editingId ? records.find((record) => record.id === editingId) ?? null : null;

    const shared = {
      barcode: cleanBarcode,
      name: form.name.trim(),
      kanji: form.kanji.trim(),
      katakana: form.katakana.trim(),
      address: form.address.trim(),
      updatedAt: serverTimestamp()
    };

    setBusy(true);
    try {
      if (editing) {
        // 登録者情報と NO・追加日時は保持したまま内容だけ更新する
        await updateDoc(doc(db, "irisRecords", editing.id), {
          ...shared,
          no: editing.no,
          ownerUid: editing.ownerUid || account.uid,
          ownerName: editing.ownerName || account.displayName,
          addedDateTime: editing.addedDateTime || nowStamp()
        });
        say(t.updated);
      } else {
        await addDoc(collection(db, "irisRecords"), {
          ...shared,
          no: nextNo,
          ownerUid: account.uid,
          ownerName: account.displayName,
          addedDateTime: nowStamp()
        });
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
    if (!canEdit) return;
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
    if (!canEdit) return;
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

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!account) return;

    const name = profileName.trim();
    if (!name) return say(t.needDisplayName, "error");

    const wantsPasswordChange = profilePassword.length > 0 || profileConfirm.length > 0;
    if (wantsPasswordChange) {
      if (profilePassword.length < 6) return say(t.weakPassword, "error");
      if (profilePassword !== profileConfirm) return say(t.passwordMismatch, "error");
    }

    setProfileBusy(true);
    try {
      if (auth.currentUser && name !== account.displayName) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      await setDoc(
        doc(db, "irisUsers", account.uid),
        { displayName: name, updatedAt: serverTimestamp() },
        { merge: true }
      );
      if (wantsPasswordChange && auth.currentUser) {
        await updatePassword(auth.currentUser, profilePassword);
      }
      setAccount({ ...account, displayName: name });
      setProfilePassword("");
      setProfileConfirm("");
      say(wantsPasswordChange ? t.passwordChanged : t.profileSaved);
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
      if (code.includes("requires-recent-login")) say(t.needRecentLogin, "error");
      else say(error instanceof Error ? error.message : "Firebase error", "error");
    } finally {
      setProfileBusy(false);
    }
  }

  function downloadCsv() {
    const header = [t.colNo, t.colBarcode, t.colName, t.colKanji, t.colKatakana, t.colAddress, t.colAddedAt];
    const rows = filtered.map((record) => {
      const cells = [
        csvCell(String(record.no)),
        // Excel が先頭の 0 を消さないよう文字列として書き出す
        `="${record.barcode.replaceAll('"', "")}"`,
        csvCell(record.name),
        csvCell(record.kanji),
        csvCell(record.katakana),
        csvCell(record.address),
        csvCell(record.addedDateTime)
      ];
      return cells.join(",");
    });
    const csv = "﻿" + [header.map(csvCell).join(","), ...rows].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "iris-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  // バーコードを印刷用シートにして開き、印刷ダイアログから PDF 保存できるようにする
  function printBarcodes() {
    if (filtered.length === 0) return say(t.empty, "error");

    const esc = (value: string) =>
      value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

    const labels = filtered
      .map(
        (record) => `
      <section class="label">
        <div class="meta"><span>ID ${esc(String(record.no))}</span><span>${esc(record.name)}</span></div>
        <div class="barcode">${code39SvgString(record.barcode)}</div>
        <div class="number">${esc(record.barcode)}</div>
      </section>`
      )
      .join("");

    const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>IRIS Barcodes</title><style>
      *{box-sizing:border-box}
      body{margin:0;padding:24px;background:#f7f7f4;color:#111;font-family:Arial,'Helvetica Neue',sans-serif}
      h1{margin:0 0 18px;font-size:22px;letter-spacing:.08em;text-transform:uppercase}
      .sheet{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
      .label{break-inside:avoid;background:#fff;border:1px solid #d8d8d2;border-radius:12px;padding:14px;box-shadow:0 8px 24px #00000014}
      .meta{display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;font-size:12px;font-weight:700;letter-spacing:.06em;color:#666}
      .barcode{display:flex;justify-content:center;padding:10px 6px;background:#fff;border-radius:8px}
      .barcode svg{max-width:100%;height:auto}
      .number{text-align:center;margin-top:8px;font-size:18px;font-weight:800;letter-spacing:.16em}
      @media print{body{background:#fff;padding:10mm}.label{box-shadow:none;border-color:#111}h1{display:none}}
    </style></head><body><h1>IRIS Barcodes</h1><div class="sheet">${labels}</div>
    <script>window.onload=function(){setTimeout(function(){window.print();},250);};</script></body></html>`;

    const win = window.open("", "_blank");
    if (!win) return say(t.popupBlocked, "error");
    win.document.write(html);
    win.document.close();
  }

  function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let field = "";
    let row: string[] = [];
    let inQuotes = false;
    const pushField = () => {
      row.push(field);
      field = "";
    };
    const pushRow = () => {
      pushField();
      rows.push(row);
      row = [];
    };
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (inQuotes) {
        if (char === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        pushField();
      } else if (char === "\n") {
        pushRow();
      } else if (char !== "\r") {
        field += char;
      }
    }
    if (field.length > 0 || row.length > 0) pushRow();
    return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
  }

  async function importCsv(file: File) {
    if (!account || !canEdit) return;
    setBusy(true);
    try {
      const rows = parseCsv((await file.text()).replace(/^﻿/, ""));
      if (rows.length <= 1) return say(t.csvEmpty, "error");

      let no = nextNo;
      let added = 0;
      // 先頭行はヘッダー（NO, バーコード, 名前, 漢字, カタカナ, 住所, 追加日時）
      for (const cols of rows.slice(1)) {
        // ="000001" 形式や余分な文字を除いて数字だけにする
        const barcode = (cols[1] ?? "").replace(/\D/g, "").slice(0, 20);
        const name = (cols[2] ?? "").trim().slice(0, 160);
        if (!barcode || !name) continue;
        await addDoc(collection(db, "irisRecords"), {
          no: no++,
          barcode,
          name,
          kanji: (cols[3] ?? "").trim().slice(0, 160),
          katakana: (cols[4] ?? "").trim().slice(0, 160),
          address: (cols[5] ?? "").trim().slice(0, 300),
          ownerUid: account.uid,
          ownerName: account.displayName,
          addedDateTime: (cols[6] ?? "").trim().slice(0, 40) || nowStamp(),
          updatedAt: serverTimestamp()
        });
        added++;
      }
      setCsvFile(null);
      if (csvInputRef.current) csvInputRef.current.value = "";
      say(`${added} ${t.csvImported}`);
    } catch (error) {
      say(error instanceof Error ? error.message : "CSV error", "error");
    } finally {
      setBusy(false);
    }
  }

  /* ---------- note actions ---------- */

  // 付箋はアカウントごと。誰でも自分の付箋を作成・編集・削除できる。
  async function createNoteAt(clientX: number, clientY: number) {
    if (!account) return;
    const x = Math.max(8, Math.min(window.innerWidth - 232, clientX - 110));
    const y = Math.max(8, Math.min(window.innerHeight - 150, clientY - 20));
    const index = notes.length;
    try {
      await addDoc(collection(db, "irisNotes"), {
        body: "",
        color: NOTE_COLORS[index % NOTE_COLORS.length],
        x,
        y,
        ownerUid: account.uid,
        ownerName: account.displayName,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      say(error instanceof Error ? error.message : "Firestore error", "error");
    }
  }

  function handleBackgroundDouble(event: React.MouseEvent<HTMLElement>) {
    // パネルやコントロール上のダブルクリックは無視し、空白の背景だけで付箋を作る
    const target = event.target as HTMLElement;
    if (
      target.closest(
        ".workspace, .account-panel, .iris-form, .result-panel, .app-header, .iris-note, .note-tip, button, input, textarea, select, a, label, form, table"
      )
    ) {
      return;
    }
    createNoteAt(event.clientX, event.clientY);
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
    try {
      await deleteDoc(doc(db, "irisNotes", id));
    } catch (error) {
      say(error instanceof Error ? error.message : "Firestore error", "error");
    }
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
      <main className="app-shell" onDoubleClick={handleBackgroundDouble}>
        <header className="app-header">
          <div className="brand-lockup">
            <BrandMark small />
            <div>
              <p className="eyebrow">{t.brand}</p>
              <h1 className="gradient-text">{t.appName}</h1>
            </div>
          </div>

          <div className="header-meta">
            <button
              type="button"
              className="user-pill"
              onClick={() => setAccountOpen((open) => !open)}
              aria-expanded={accountOpen}
            >
              <span className="user-name">{account.displayName}</span>
              <span className="role-chip">{account.role === "admin" ? t.roleAdmin : t.roleMember}</span>
            </button>
            <LanguageSelect language={language} onChange={setLanguage} />
            <ThemeToggle dark={dark} onToggle={toggleTheme} t={t} className="" />
            <button type="button" onClick={() => setCameraOpen(true)}>
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
          {accountOpen && (
          <section className="account-panel">
            <div className="result-heading">
              <div>
                <p className="eyebrow">{t.accountSettings}</p>
                <h2>{account.displayName}</h2>
              </div>
              {!canEdit && <span className="view-only-badge">{t.viewOnly}</span>}
            </div>

            <form className="account-form" onSubmit={saveProfile}>
              <label className="account-full">
                {t.displayName}
                <input value={profileName} onChange={(event) => setProfileName(event.target.value)} maxLength={80} />
              </label>
              <label>
                {t.newPassword}
                <input
                  type="password"
                  value={profilePassword}
                  onChange={(event) => setProfilePassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder={t.passwordHint}
                />
              </label>
              <label>
                {t.confirmPassword}
                <input
                  type="password"
                  value={profileConfirm}
                  onChange={(event) => setProfileConfirm(event.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <div className="account-actions">
                <button className="button success" type="submit" disabled={profileBusy}>
                  {t.saveSettings}
                </button>
              </div>
            </form>

            {canEdit && (
              <div className="csv-panel">
                <div>
                  <p className="eyebrow">{t.csvTools}</p>
                  <p className="csv-note">{t.csvNote}</p>
                </div>
                <div className="csv-actions">
                  <button className="button" type="button" onClick={downloadCsv}>
                    {t.downloadCsv}
                  </button>
                  <button className="button" type="button" onClick={printBarcodes}>
                    {t.downloadBarcodes}
                  </button>
                  <button className="button file-button" type="button" onClick={() => csvInputRef.current?.click()}>
                    {csvFile ? csvFile.name : t.chooseCsv}
                  </button>
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    hidden
                    onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)}
                  />
                  <button
                    className="button success"
                    type="button"
                    disabled={!csvFile || busy}
                    onClick={() => csvFile && importCsv(csvFile)}
                  >
                    {t.uploadCsv}
                  </button>
                </div>
              </div>
            )}
          </section>
          )}

          <form className="iris-form" onSubmit={handleRegister}>
            {!canEdit && <p className="view-only-line">{t.viewOnlyNotice}</p>}
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
              {canEdit && (
                <button className="button success" type="submit" disabled={busy}>
                  {editingId ? t.update : t.register}
                </button>
              )}
              <button className="button" type="button" onClick={handleClear}>
                {t.clear}
              </button>
            </div>

            {canEdit && formOpen && (
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
                      {canEdit && <th aria-label={t.colActions} />}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((record) => (
                      <tr
                        key={record.id}
                        className={editingId === record.id ? "is-editable is-editing" : canEdit ? "is-editable" : ""}
                        onDoubleClick={() => startEdit(record)}
                      >
                        <td className="is-mono">{record.no}</td>
                        <td>
                          <div className="barcode-cell">
                            <span className="is-mono">{record.barcode}</span>
                            <Barcode value={record.barcode} />
                          </div>
                        </td>
                        <td>{record.name}</td>
                        <td>{record.kanji}</td>
                        <td>{record.katakana}</td>
                        <td>{record.address}</td>
                        <td className="is-mono">{record.addedDateTime}</td>
                        {canEdit && (
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
                        )}
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
        {notes.map((note, index) => {
          // 共有ボード：誰でも見られるが、編集・削除できるのは所有者だけ
          const mine = note.ownerUid === account.uid;
          return (
            <div
              key={note.id}
              className={`iris-note note-${note.color}${draggingId === note.id ? " is-dragging" : ""}${
                mine ? "" : " is-readonly"
              }`}
              style={
                {
                  left: note.x,
                  top: note.y,
                  "--rot": `${index % 2 === 0 ? -1.8 : 1.5}deg`
                } as React.CSSProperties
              }
              onPointerMove={mine ? onDrag : undefined}
              onPointerUp={mine ? endDrag : undefined}
            >
              <div
                className="note-grip"
                style={{ cursor: mine ? "grab" : "default" }}
                onPointerDown={mine ? (event) => beginDrag(event, note) : undefined}
              >
                {mine ? (
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
                ) : (
                  <span className="note-owner">{note.ownerName}</span>
                )}
                {mine && (
                  <button className="note-close" type="button" aria-label={t.delete} onClick={() => removeNote(note.id)}>
                    ×
                  </button>
                )}
              </div>
              <textarea
                className="note-text"
                value={note.body}
                placeholder={mine ? t.notePlaceholder : ""}
                readOnly={!mine}
                onChange={mine ? (event) => queueNoteSave(note.id, { body: event.target.value }) : undefined}
              />
            </div>
          );
        })}
      </div>

      {notes.length === 0 && <div className="note-tip">{t.noteHint}</div>}

      <button
        className="note-add"
        type="button"
        onClick={() => createNoteAt(window.innerWidth / 2, window.innerHeight / 2)}
      >
        + {t.addNote}
      </button>

      {cameraOpen && (
        <div className="camera-modal" role="dialog" aria-label={t.cameraTitle}>
          <div className="camera-card">
            <div className="camera-head">
              <h2>{t.cameraTitle}</h2>
              <button className="button" type="button" onClick={() => setCameraOpen(false)}>
                {t.cameraClose}
              </button>
            </div>
            <video ref={videoRef} className="camera-video" muted playsInline />
            <p className="camera-hint">{t.cameraScanHint}</p>
          </div>
        </div>
      )}
    </>
  );
}
