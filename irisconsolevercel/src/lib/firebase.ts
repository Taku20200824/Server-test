import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAo3w64EElNUR-usHXoIQF-KomKtO6ykII",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "server-test-ef8cb.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "server-test-ef8cb",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "server-test-ef8cb.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "104577412937",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:104577412937:web:b5842a5022610cd74e7498"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
