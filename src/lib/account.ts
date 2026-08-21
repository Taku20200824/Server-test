export type Role = "admin" | "member";

export type Account = {
  uid: string;
  username: string;
  displayName: string;
  role: Role;
};

/**
 * Firebase Auth はメールアドレスでユーザーを識別するため、
 * ローカル版と同じ「ユーザー名」ログインを実現するために内部でメール形式へ変換する。
 * 実際にメールは送られないので、受信可能なドメインは使わない。
 */
export const USERNAME_DOMAIN = "iris-console.local";

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string) {
  return /^[a-z0-9._-]{3,32}$/.test(value);
}

export function usernameToEmail(value: string) {
  return `${normalizeUsername(value)}@${USERNAME_DOMAIN}`;
}

export function emailToUsername(email: string | null | undefined) {
  if (!email) return "";
  return email.replace(`@${USERNAME_DOMAIN}`, "");
}

export function isRole(value: unknown): value is Role {
  return value === "admin" || value === "member";
}
