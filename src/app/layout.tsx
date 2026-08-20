import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IRIS Server-test",
  description: "Employee registration and user search dashboard for the Server-test repository.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
