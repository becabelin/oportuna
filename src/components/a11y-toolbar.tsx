"use client";

import { Contrast, Minus, Moon, Pause, Play, Plus, Sun } from "lucide-react";

import { useA11y } from "@/components/a11y-provider";
import { Button } from "@/components/ui/button";
import { THEME_LABEL, type Theme } from "@/lib/a11y";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: THEME_LABEL.light, icon: Sun },
  { id: "dark", label: THEME_LABEL.dark, icon: Moon },
  { id: "contrast", label: THEME_LABEL.contrast, icon: Contrast },
];

const CLUSTER =
  "inline-flex items-center rounded-full border border-foreground/50 p-0.5 contrast:border-2 contrast:border-white";

export function A11yToolbar({ compact = false }: { compact?: boolean }) {
  const {
    theme,
    font,
    motionPause,
    setTheme,
    increaseFont,
    decreaseFont,
    resetFont,
    toggleMotion,
    canIncrease,
    canDecrease,
  } = useA11y();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", compact ? "w-full" : "justify-end")}>
      <div
        role="group"
        aria-label="Aparência"
        className={CLUSTER}
      >
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const pressed = theme === option.id;
          return (
            <Button
              key={option.id}
              type="button"
              variant="ghost"
              size="icon"
              aria-pressed={pressed}
              aria-label={`Aparência: ${option.label}`}
              onClick={() => setTheme(option.id)}
              className={cn(
                "size-11 min-h-11 min-w-11 rounded-full",
                pressed
                  ? "bg-primary text-primary-foreground hover:bg-primary contrast:text-primary-foreground"
                  : "hover:bg-muted/70"
              )}
            >
              <Icon aria-hidden className="size-4" />
              <span className="sr-only">{option.label}</span>
            </Button>
          );
        })}
      </div>
      <div
        role="group"
        aria-label="Tamanho do texto"
        className={CLUSTER}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Diminuir texto"
          disabled={!canDecrease}
          onClick={decreaseFont}
          className="size-11 min-h-11 min-w-11 rounded-full hover:bg-muted/70"
        >
          <Minus aria-hidden className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Tamanho atual ${font} por cento. Clique para voltar ao padrão.`}
          onClick={resetFont}
          className="h-11 min-h-11 min-w-12 rounded-full px-1 text-xs hover:bg-muted/70"
        >
          {font}%
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Aumentar texto"
          disabled={!canIncrease}
          onClick={increaseFont}
          className="size-11 min-h-11 min-w-11 rounded-full hover:bg-muted/70"
        >
          <Plus aria-hidden className="size-4" />
        </Button>
      </div>
      <div className={CLUSTER}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-pressed={motionPause}
          aria-label={motionPause ? "Retomar animações" : "Pausar animações"}
          onClick={toggleMotion}
          className={cn(
            "size-11 min-h-11 min-w-11 rounded-full",
            motionPause
              ? "bg-primary text-primary-foreground hover:bg-primary"
              : "hover:bg-muted/70"
          )}
        >
          {motionPause ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
