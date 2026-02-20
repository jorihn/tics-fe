"use client";

import {
  backButton,
  init,
  initData,
  miniApp,
  themeParams,
  viewport,
} from "@tma.js/sdk";
import { useEffect, useMemo, useState } from "react";

interface TelegramBackButtonController {
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

export interface TelegramWebAppState {
  isTelegram: boolean;
  backButton: TelegramBackButtonController | null;
  startParam: string | undefined;
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

// Detect Telegram environment from URL hash (tgWebAppData / tgWebAppVersion)
// which Telegram always injects, even without the legacy script tag.
function detectTelegramEnv(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const hash = window.location.hash;
  return hash.includes("tgWebAppData") || hash.includes("tgWebAppVersion");
}

export function useTelegramWebApp(): TelegramWebAppState {
  const [sdkState, setSdkState] = useState<{
    ready: boolean;
    startParam: string | undefined;
  }>({ ready: false, startParam: undefined });

  // --- 1) Single async bootstrap: init → mount → expand → back button ---
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!detectTelegramEnv()) {
      console.log("[TG] Not running inside Telegram, skipping SDK init.");
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      // 1a) init SDK
      try {
        init();
        console.log("[TG] SDK init() OK");
      } catch (err) {
        console.warn("[TG] SDK init() failed:", err);
        return;
      }

      // 1b) Mount themeParams (must come before miniApp.mount per docs)
      try { themeParams.mount(); } catch { /* ignore */ }
      try { miniApp.mount(); } catch { /* ignore */ }
      try { (miniApp as unknown as { ready: () => void }).ready(); } catch { /* ignore */ }
      console.log("[TG] miniApp mounted + ready");

      // 1c) Restore initData so startParam is accessible
      try { initData.restore(); } catch { /* ignore */ }

      let sp: string | undefined;
      try {
        sp = (initData as unknown as { startParam?: () => string | undefined }).startParam?.();
        console.log("[TG] startParam from SDK:", sp);
      } catch {
        console.warn("[TG] Could not read startParam from SDK");
      }

      // 1d) Mount viewport then expand (no fullscreen)
      try {
        await viewport.mount();
        console.log("[TG] viewport.mount() OK");
      } catch (err) {
        console.warn("[TG] viewport.mount() failed:", err);
      }

      try {
        viewport.expand();
        console.log("[TG] viewport.expand() OK");
      } catch (err) {
        console.warn("[TG] viewport.expand() failed:", err);
      }

      // 1e) Mount back button
      try {
        backButton.mount();
        console.log("[TG] backButton.mount() OK");
      } catch (err) {
        console.warn("[TG] backButton.mount() failed:", err);
      }

      // 1f) Commit state (after await → safe from set-state-in-effect lint)
      if (!cancelled) {
        setSdkState({ ready: true, startParam: sp });
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
      try { backButton.unmount(); } catch { /* ignore */ }
    };
  }, []);

  const { ready, startParam } = sdkState;

  // --- 2) Back button controller ---
  const backButtonController = useMemo<TelegramBackButtonController | null>(() => {
    if (!ready) {
      return null;
    }

    return {
      show: () => { try { backButton.show(); } catch { /* ignore */ } },
      hide: () => { try { backButton.hide(); } catch { /* ignore */ } },
      onClick: (cb: () => void) => { try { backButton.onClick(cb); } catch { /* ignore */ } },
      offClick: (cb: () => void) => { try { backButton.offClick(cb); } catch { /* ignore */ } },
    };
  }, [ready]);

  // --- 3) Theme (from SDK themeParams after mount) ---
  const theme = useMemo(() => {
    if (!ready) {
      return FALLBACK_THEME;
    }

    try {
      const tp = themeParams as unknown as {
        bgColor?: () => string | undefined;
        textColor?: () => string | undefined;
        buttonColor?: () => string | undefined;
        buttonTextColor?: () => string | undefined;
        secondaryBgColor?: () => string | undefined;
      };

      return {
        canvas: tp.bgColor?.() ?? FALLBACK_THEME.canvas,
        ink: tp.textColor?.() ?? FALLBACK_THEME.ink,
        accent: tp.buttonColor?.() ?? FALLBACK_THEME.accent,
        accentText: tp.buttonTextColor?.() ?? FALLBACK_THEME.accentText,
        softBg: tp.secondaryBgColor?.() ?? FALLBACK_THEME.softBg,
      };
    } catch {
      return FALLBACK_THEME;
    }
  }, [ready]);

  return {
    isTelegram: ready,
    backButton: backButtonController,
    startParam,
    theme,
  };
}
