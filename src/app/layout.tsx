import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IRIS Console | Server-test",
  description: "Server-test Vercel console backed by Firebase"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
