"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { Search, UserPlus } from "lucide-react";
import { db } from "@/lib/firebase-client";

type Employee = {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  role: string;
  email: string;
};

const emptyForm = {
  employeeId: "",
  name: "",
  department: "",
  role: "",
  email: "",
};

export function EmployeeFirebasePanel() {
  const [form, setForm] = useState(emptyForm);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!db) return;

    const employeesQuery = query(collection(db, "employees"), orderBy("createdAt", "desc"));
    return onSnapshot(employeesQuery, (snapshot) => {
      setEmployees(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Employee)));
    });
  }, []);

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return employees;

    return employees.filter((employee) =>
      [employee.employeeId, employee.name, employee.department, employee.role, employee.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [employees, search]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!db) {
      setMessage("Firebase config is missing.");
      return;
    }

    if (!form.employeeId.trim() || !form.name.trim()) {
      setMessage("Employee ID and name are required.");
      return;
    }

    await addDoc(collection(db, "employees"), {
      employeeId: form.employeeId.trim(),
      name: form.name.trim(),
      department: form.department.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      createdAt: serverTimestamp(),
    });

    setForm(emptyForm);
    setMessage("Saved to Firebase employees.");
  }

  return (
    <section className="firebasePanel" aria-label="Firebase employee registration">
      <form className="registerForm" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow"><UserPlus size={16} /> Firebase Register</p>
          <h2>社員登録はFirestoreへ保存</h2>
        </div>
        <div className="formGrid">
          <input aria-label="Employee ID" placeholder="Employee ID" value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} />
          <input aria-label="Name" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input aria-label="Department" placeholder="Department" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
          <input aria-label="Role" placeholder="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
          <input aria-label="Email" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <button type="submit">Register</button>
        </div>
        {message ? <p className="formMessage">{message}</p> : null}
      </form>

      <div className="userDataPanel">
        <div className="searchHeader">
          <div>
            <p className="eyebrow"><Search size={16} /> Firebase User Data</p>
            <h2>ユーザーデータ検索</h2>
          </div>
          <input aria-label="Search employees" placeholder="Search user data" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="employeeList">
          {filteredEmployees.map((employee) => (
            <article className="employeeRow" key={employee.id}>
              <strong>{employee.name || "No name"}</strong>
              <span>{employee.employeeId}</span>
              <span>{employee.department || "Department unset"}</span>
              <span>{employee.role || "Role unset"}</span>
              <span>{employee.email || "Email unset"}</span>
            </article>
          ))}
          {!filteredEmployees.length ? <p className="emptyState">No Firebase user data yet.</p> : null}
        </div>
      </div>
    </section>
  );
}
