export type Role = "admin" | "customer";

export type Account = {
  uid: string;
  username: string;
  displayName: string;
  role: Role;
};

/**
 * Firebase Auth はメールアドレスでユーザーを識別するため、
 * 画面では ID を入力し、内部だけメール形式へ変換する。
 * 実際にメールは送られないので、受信可能なドメインは使わない。
 */
export const USERNAME_DOMAIN = "iris-console.local";

export function normalizeUsername(value: string) {
  return value.trim().replace(/\D/g, "");
}

export function isValidUsername(value: string) {
  return /^[0-9]{1,20}$/.test(value);
}

export function roleForId(value: string): Role {
  return normalizeUsername(value).startsWith("9") ? "admin" : "customer";
}

export function usernameToEmail(value: string) {
  return `${normalizeUsername(value)}@${USERNAME_DOMAIN}`;
}

export function emailToUsername(email: string | null | undefined) {
  if (!email) return "";
  return email.replace(`@${USERNAME_DOMAIN}`, "");
}

export function isRole(value: unknown): value is Role {
  return value === "admin" || value === "customer";
}
