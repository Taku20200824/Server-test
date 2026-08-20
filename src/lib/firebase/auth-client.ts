"use client";

import { GoogleAuthProvider, getAuth, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase/client";

export const firebaseAuth = getAuth(firebaseApp);

export async function signInWithGoogle() {
  return signInWithPopup(firebaseAuth, new GoogleAuthProvider());
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signOutFirebase() {
  return signOut(firebaseAuth);
}
