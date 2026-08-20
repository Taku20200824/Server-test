"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "@/lib/firebase/config";

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);
