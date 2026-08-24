"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyDocumentPrefs,
  FONT_KEY,
  FONT_STEPS,
  isFontScale,
  isTheme,
  MOTION_KEY,
  nextFontScale,
  THEME_KEY,
  type FontScale,
  type Theme,
} from "@/lib/a11y";

type A11yContextValue = {
  theme: Theme;
  font: FontScale;
  motionPause: boolean;
  setTheme: (theme: Theme) => void;
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
  toggleMotion: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
  announcement: string;
};

const A11yContext = createContext<A11yContextValue | null>(null);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  if (isTheme(stored)) return stored;
  if (window.matchMedia("(prefers-contrast: more)").matches) return "contrast";
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

function readStoredFont(): FontScale {
  if (typeof window === "undefined") return 100;
  const parsed = Number.parseFloat(window.localStorage.getItem(FONT_KEY) ?? "100");
  return isFontScale(parsed) ? parsed : 100;
}

function readStoredMotionPause(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(MOTION_KEY);
  if (stored === "pause") return true;
  if (stored === "play") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function A11yProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [font, setFontState] = useState<FontScale>(100);
  const [motionPause, setMotionPause] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const nextTheme = readStoredTheme();
    const nextFont = readStoredFont();
    const nextPause = readStoredMotionPause();
    setThemeState(nextTheme);
    setFontState(nextFont);
    setMotionPause(nextPause);
    applyDocumentPrefs(nextTheme, nextFont, nextPause);
  }, []);

  const persist = useCallback(
    (nextTheme: Theme, nextFont: FontScale, nextPause: boolean, message: string) => {
      setThemeState(nextTheme);
      setFontState(nextFont);
      setMotionPause(nextPause);
      applyDocumentPrefs(nextTheme, nextFont, nextPause);
      window.localStorage.setItem(THEME_KEY, nextTheme);
      window.localStorage.setItem(FONT_KEY, String(nextFont));
      window.localStorage.setItem(MOTION_KEY, nextPause ? "pause" : "play");
      setAnnouncement(message);
    },
    []
  );

  const setTheme = useCallback(
    (next: Theme) => {
      const labels = { light: "Modo claro", dark: "Modo escuro", contrast: "Alto contraste" };
      persist(next, font, motionPause, `${labels[next]} ativado.`);
    },
    [font, motionPause, persist]
  );

  const increaseFont = useCallback(() => {
    const next = nextFontScale(font, 1);
    persist(theme, next, motionPause, `Texto em ${next} por cento.`);
  }, [font, motionPause, persist, theme]);

  const decreaseFont = useCallback(() => {
    const next = nextFontScale(font, -1);
    persist(theme, next, motionPause, `Texto em ${next} por cento.`);
  }, [font, motionPause, persist, theme]);

  const resetFont = useCallback(() => {
    persist(theme, 100, motionPause, "Tamanho do texto padrão, 100 por cento.");
  }, [motionPause, persist, theme]);

  const toggleMotion = useCallback(() => {
    const next = !motionPause;
    persist(
      theme,
      font,
      next,
      next ? "Animações pausadas." : "Animações retomadas."
    );
  }, [font, motionPause, persist, theme]);

  const value = useMemo<A11yContextValue>(
    () => ({
      theme,
      font,
      motionPause,
      setTheme,
      increaseFont,
      decreaseFont,
      resetFont,
      toggleMotion,
      canIncrease: font < FONT_STEPS[FONT_STEPS.length - 1],
      canDecrease: font > FONT_STEPS[0],
      announcement,
    }),
    [
      announcement,
      decreaseFont,
      font,
      increaseFont,
      motionPause,
      resetFont,
      setTheme,
      theme,
      toggleMotion,
    ]
  );

  return (
    <A11yContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </A11yContext.Provider>
  );
}

export function useA11y() {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error("useA11y precisa estar dentro de A11yProvider");
  }
  return context;
}
