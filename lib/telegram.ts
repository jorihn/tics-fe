"use client";

import { backButton, init, initData, miniApp, themeParams, viewport } from "@tma.js/sdk";
import { useEffect, useMemo, useState } from "react";

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  button_color?: string;
  button_text_color?: string;
  hint_color?: string;
  secondary_bg_color?: string;
}

interface SdkMiniApp {
  mount?: () => void;
  ready?: () => void;
}

interface SdkThemeParams {
  mount?: () => void;
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
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [startParam, setStartParam] = useState<string | undefined>(undefined);

  const sdkBackButton = useMemo<SdkBackButton>(() => backButton as unknown as SdkBackButton, []);

  const sdkInitData = useMemo<SdkInitData>(() => initData as unknown as SdkInitData, []);

  const sdkViewport = useMemo<SdkViewport>(() => viewport as unknown as SdkViewport, []);

  const sdkMiniApp = useMemo<SdkMiniApp>(() => miniApp as unknown as SdkMiniApp, []);

  const sdkThemeParams = useMemo<SdkThemeParams>(() => themeParams as unknown as SdkThemeParams, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let isActive = true;
    let attempts = 0;
    const maxAttempts = 20;

    const captureWebApp = () => {
      if (!isActive) {
        return;
      }

      const currentWebApp = window.Telegram?.WebApp ?? null;
      if (currentWebApp) {
        setWebApp(currentWebApp);
        return;
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        window.setTimeout(captureWebApp, 150);
      }
    };

    captureWebApp();

    return () => {
      isActive = false;
    };
  }, []);

  const isTelegram = Boolean(webApp);

  useEffect(() => {
    if (!isTelegram) {
      return;
    }

    init();

    sdkThemeParams.mount?.();
    sdkMiniApp.mount?.();
    sdkMiniApp.ready?.();

    if (typeof sdkInitData.restore === "function") {
      sdkInitData.restore();
    }

    const resolveStartParam = async () => {
      const nextStartParam = typeof sdkInitData.startParam === "function"
        ? sdkInitData.startParam()
        : sdkInitData.state?.()?.startParam;

      setStartParam(nextStartParam);
    };

    void resolveStartParam();

    const mountViewport = async () => {
      let isMounted = false;

      try {
        if (typeof sdkViewport.mount === "function") {
          await sdkViewport.mount();
          isMounted = true;
        }

        try {
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
          // Ignore fullscreen failures: expand() already attempted.
        }
      } catch {
        if (!isMounted) {
          // Fallback for clients where viewport.mount() is unstable.
          sdkViewport.expand?.();
        }
      }
    };

    void mountViewport();
  }, [isTelegram, sdkInitData, sdkMiniApp, sdkThemeParams, sdkViewport]);

  useEffect(() => {
    if (!isTelegram) {
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
