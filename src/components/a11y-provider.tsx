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
  nextFontScale,
  THEME_KEY,
  type FontScale,
  type Theme,
} from "@/lib/a11y";

type A11yContextValue = {
  theme: Theme;
  font: FontScale;
  setTheme: (theme: Theme) => void;
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
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

export function A11yProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [font, setFontState] = useState<FontScale>(100);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const nextTheme = readStoredTheme();
    const nextFont = readStoredFont();
    setThemeState(nextTheme);
    setFontState(nextFont);
    applyDocumentPrefs(nextTheme, nextFont);
  }, []);

  const persist = useCallback((nextTheme: Theme, nextFont: FontScale, message: string) => {
    setThemeState(nextTheme);
    setFontState(nextFont);
    applyDocumentPrefs(nextTheme, nextFont);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    window.localStorage.setItem(FONT_KEY, String(nextFont));
    setAnnouncement(message);
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      const labels = { light: "Modo claro", dark: "Modo escuro", contrast: "Alto contraste" };
      persist(next, font, `${labels[next]} ativado.`);
    },
    [font, persist]
  );

  const increaseFont = useCallback(() => {
    const next = nextFontScale(font, 1);
    persist(theme, next, `Texto em ${next} por cento.`);
  }, [font, persist, theme]);

  const decreaseFont = useCallback(() => {
    const next = nextFontScale(font, -1);
    persist(theme, next, `Texto em ${next} por cento.`);
  }, [font, persist, theme]);

  const resetFont = useCallback(() => {
    persist(theme, 100, "Tamanho do texto padrão, 100 por cento.");
  }, [persist, theme]);

  const value = useMemo<A11yContextValue>(
    () => ({
      theme,
      font,
      setTheme,
      increaseFont,
      decreaseFont,
      resetFont,
      canIncrease: font < FONT_STEPS[FONT_STEPS.length - 1],
      canDecrease: font > FONT_STEPS[0],
      announcement,
    }),
    [announcement, decreaseFont, font, increaseFont, resetFont, setTheme, theme]
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
