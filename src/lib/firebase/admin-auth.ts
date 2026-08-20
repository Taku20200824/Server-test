import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";

function adminEmails() {
  return (process.env.FIREBASE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireFirebaseAdmin(authorizationHeader: string | null) {
  const token = authorizationHeader?.startsWith("Bearer ") ? authorizationHeader.slice(7) : null;

  if (!token) {
    throw new Error("Missing Firebase ID token.");
  }

  const decoded = await getAuth(getFirebaseAdminApp()).verifyIdToken(token);
  const email = decoded.email?.toLowerCase();
  const allowedByClaim = decoded.admin === true;
  const allowedByEmail = email ? adminEmails().includes(email) : false;

  if (!allowedByClaim && !allowedByEmail) {
    throw new Error("Firebase user is not an administrator.");
  }

  return decoded;
}
