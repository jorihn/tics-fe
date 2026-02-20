"use client";

import { backButton, init, initData, viewport } from "@tma.js/sdk";
import { useEffect, useMemo } from "react";

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  button_color?: string;
  button_text_color?: string;
  hint_color?: string;
  secondary_bg_color?: string;
}

interface TelegramBackButtonController {
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

interface TelegramWebApp {
  themeParams: TelegramThemeParams;
}

interface SdkBackButton {
  hide?: () => void;
  isSupported?: () => boolean;
  mount?: () => void;
  offClick?: (callback: () => void) => void;
  onClick?: (callback: () => void) => void;
  show?: () => void;
  unmount?: () => void;
}

interface SdkInitData {
  restore?: () => void;
  startParam?: () => string | undefined;
  state?: () => {
    startParam?: string;
  };
}

interface SdkViewport {
  expand?: () => void;
  mount?: () => Promise<void> | void;
  requestFullscreen?: (() => Promise<void> | void) & {
    isAvailable?: () => boolean;
  };
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

export function useTelegramWebApp(): TelegramWebAppState {
  const webApp = useMemo<TelegramWebApp | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.Telegram?.WebApp ?? null;
  }, []);

  const sdkBackButton = useMemo<SdkBackButton>(() => backButton as unknown as SdkBackButton, []);

  const sdkInitData = useMemo<SdkInitData>(() => initData as unknown as SdkInitData, []);

  const sdkViewport = useMemo<SdkViewport>(() => viewport as unknown as SdkViewport, []);

  const isTelegram = Boolean(webApp);

  useEffect(() => {
    if (!isTelegram) {
      return;
    }

    init();

    if (typeof sdkInitData.restore === "function") {
      sdkInitData.restore();
    }

    const mountViewport = async () => {
      try {
        if (typeof sdkViewport.mount === "function") {
          await sdkViewport.mount();
        }

        sdkViewport.expand?.();

        if (typeof sdkViewport.requestFullscreen === "function") {
          const canRequestFullscreen = sdkViewport.requestFullscreen.isAvailable?.() ?? true;
          if (canRequestFullscreen) {
            const requestFullscreenResult = sdkViewport.requestFullscreen();
            if (requestFullscreenResult instanceof Promise) {
              await requestFullscreenResult;
            }
          }
        }
      } catch {
        // Ignore viewport/fullscreen failures: expand attempt already made.
      }
    };

    void mountViewport();
  }, [isTelegram, sdkInitData, sdkViewport]);

  const startParam = useMemo(() => {
    if (!isTelegram) {
      return undefined;
    }

    if (typeof sdkInitData.startParam === "function") {
      return sdkInitData.startParam();
    }

    if (typeof sdkInitData.state === "function") {
      return sdkInitData.state()?.startParam;
    }

    return undefined;
  }, [isTelegram, sdkInitData]);

  useEffect(() => {
    if (!isTelegram) {
      return;
    }

    if (typeof sdkBackButton.isSupported === "function" && !sdkBackButton.isSupported()) {
      return;
    }

    sdkBackButton.mount?.();

    return () => {
      sdkBackButton.unmount?.();
    };
  }, [isTelegram, sdkBackButton]);

  const backButtonController = useMemo<TelegramBackButtonController | null>(() => {
    if (!isTelegram) {
      return null;
    }

    if (typeof sdkBackButton.isSupported === "function" && !sdkBackButton.isSupported()) {
      return null;
    }

    return {
      show: () => sdkBackButton.show?.(),
      hide: () => sdkBackButton.hide?.(),
      onClick: (callback: () => void) => {
        sdkBackButton.onClick?.(callback);
      },
      offClick: (callback: () => void) => {
        sdkBackButton.offClick?.(callback);
      },
    };
  }, [isTelegram, sdkBackButton]);

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
    isTelegram,
    backButton: backButtonController,
    startParam,
    theme,
  };
}
