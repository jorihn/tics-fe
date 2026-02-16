"use client";

import { useEffect } from "react";
import { useTelegramWebApp } from "@/lib/telegram";
import { trackEvent } from "@/lib/tracking";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isTelegram, theme, webApp } = useTelegramWebApp();

  useEffect(() => {
    trackEvent("open_miniapp", { telegram: isTelegram });

    if (webApp?.initDataUnsafe?.start_param) {
      trackEvent("entered_start", { start_param: webApp.initDataUnsafe.start_param });
    }
  }, [isTelegram, webApp]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--canvas", theme.canvas);
    root.style.setProperty("--ink", theme.ink);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-soft", theme.softBg);
    root.style.setProperty("--border-tone", "rgba(17, 20, 35, 0.15)");
  }, [theme]);

  return <div className="mx-auto min-h-screen w-full max-w-[520px] px-4 pb-28 pt-5 sm:px-6">{children}</div>;
}
