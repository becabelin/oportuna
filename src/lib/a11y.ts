export const THEMES = ["light", "dark", "contrast"] as const;
export type Theme = (typeof THEMES)[number];

export const FONT_STEPS = [87.5, 100, 112.5, 125, 150, 175] as const;
export type FontScale = (typeof FONT_STEPS)[number];

export const THEME_KEY = "trilha-theme";
export const FONT_KEY = "trilha-font";
export const MOTION_KEY = "trilha-motion";

export const THEME_LABEL: Record<Theme, string> = {
  light: "Claro",
  dark: "Escuro",
  contrast: "Contraste",
};

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "contrast";
}

export function isFontScale(value: number): value is FontScale {
  return (FONT_STEPS as readonly number[]).includes(value);
}

export function nextFontScale(current: FontScale, direction: 1 | -1): FontScale {
  const index = FONT_STEPS.indexOf(current);
  const next = Math.min(FONT_STEPS.length - 1, Math.max(0, index + direction));
  return FONT_STEPS[next];
}

export function applyDocumentPrefs(theme: Theme, font: FontScale, motionPause = false) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.font = String(font);
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("contrast", theme === "contrast");
  root.classList.toggle("motion-pause", motionPause);
  root.style.setProperty("--font-scale", `${font}%`);
  root.style.colorScheme = theme === "light" ? "light" : "dark";
}

export const PREFS_BOOTSTRAP = `(function(){try{var r=document.documentElement;var t=localStorage.getItem("trilha-theme");if(t!=="light"&&t!=="dark"&&t!=="contrast"){if(window.matchMedia("(prefers-contrast: more)").matches)t="contrast";else t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}r.dataset.theme=t;r.classList.toggle("dark",t==="dark");r.classList.toggle("contrast",t==="contrast");r.style.colorScheme=t==="light"?"light":"dark";var f=parseFloat(localStorage.getItem("trilha-font")||"100");if(!(f>=87.5&&f<=175))f=100;r.dataset.font=String(f);r.style.setProperty("--font-scale",f+"%");var m=localStorage.getItem("trilha-motion");if(m!=="pause"&&m!=="play"){m=window.matchMedia("(prefers-reduced-motion: reduce)").matches?"pause":"play";}r.classList.toggle("motion-pause",m==="pause");}catch(e){}})();`;
