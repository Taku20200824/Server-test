import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASIA JP,MNG,KR Test | The Isle Community",
  description: "The Isle Asia community server hub with Firebase-ready live content.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
