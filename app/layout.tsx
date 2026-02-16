import type { Metadata } from "next";
import { Exo_2, Orbitron } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
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
      <body className={`${exo2.variable} ${orbitron.variable} bg-canvas font-body text-ink antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
