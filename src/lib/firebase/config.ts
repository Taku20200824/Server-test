export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyAPUmy82ASU4TseDkINDSQSk0RiwvBhLIM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "taku-f8db6.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "taku-f8db6",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "taku-f8db6.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1062178841013",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:1062178841013:web:41b52d2b4f4eef9ed239fc"
};

export const firestoreDatabaseId = "(default)";
