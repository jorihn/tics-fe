"use client";

import { useEffect, useMemo, useState } from "react";

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  button_color?: string;
  button_text_color?: string;
  hint_color?: string;
  secondary_bg_color?: string;
}

interface TelegramWebApp {
  initDataUnsafe?: {
    user?: {
      id?: number;
      first_name?: string;
    };
    start_param?: string;
  };
  themeParams: TelegramThemeParams;
  ready: () => void;
  expand: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export interface TelegramWebAppState {
  isTelegram: boolean;
  webApp: TelegramWebApp | null;
  theme: {
    canvas: string;
    ink: string;
    accent: string;
    accentText: string;
    softBg: string;
  };
}

const FALLBACK_THEME = {
  canvas: "#f8f7f1",
  ink: "#111423",
  accent: "#ff5f2e",
  accentText: "#ffffff",
  softBg: "#fff4ee",
};

export function useTelegramWebApp(): TelegramWebAppState {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const tg = window.Telegram?.WebApp;
    if (!tg) {
      return;
    }

    tg.ready();
    tg.expand();
    setWebApp(tg);
  }, []);

  const theme = useMemo(() => {
    if (!webApp) {
      return FALLBACK_THEME;
    }

    return {
      canvas: webApp.themeParams.bg_color ?? FALLBACK_THEME.canvas,
      ink: webApp.themeParams.text_color ?? FALLBACK_THEME.ink,
      accent: webApp.themeParams.button_color ?? FALLBACK_THEME.accent,
      accentText: webApp.themeParams.button_text_color ?? FALLBACK_THEME.accentText,
      softBg: webApp.themeParams.secondary_bg_color ?? FALLBACK_THEME.softBg,
    };
  }, [webApp]);

  return {
    isTelegram: Boolean(webApp),
    webApp,
    theme,
  };
}
