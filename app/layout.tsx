import type { Metadata } from "next";
import { Nunito_Sans, Rubik } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Focus Assistant Mini App",
  description: "Telegram Mini App to pick your assistant plan and pay in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} ${rubik.variable} bg-canvas font-body text-ink antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
