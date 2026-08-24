"use client";

import { Contrast, Minus, Moon, Plus, Sun } from "lucide-react";

import { useA11y } from "@/components/a11y-provider";
import { Button } from "@/components/ui/button";
import { THEME_LABEL, type Theme } from "@/lib/a11y";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: THEME_LABEL.light, icon: Sun },
  { id: "dark", label: THEME_LABEL.dark, icon: Moon },
  { id: "contrast", label: THEME_LABEL.contrast, icon: Contrast },
];

export function A11yToolbar({ compact = false }: { compact?: boolean }) {
  const { theme, font, setTheme, increaseFont, decreaseFont, resetFont, canIncrease, canDecrease } =
    useA11y();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", compact ? "w-full" : "justify-end")}>
      <div
        role="group"
        aria-label="Aparência"
        className="flex items-center rounded-xl border-2 border-foreground bg-card p-0.5 shadow-[2px_2px_0_0_var(--foreground)]"
      >
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const pressed = theme === option.id;
          return (
            <Button
              key={option.id}
              type="button"
              variant={pressed ? "default" : "ghost"}
              size="icon"
              aria-pressed={pressed}
              aria-label={`Aparência: ${option.label}`}
              title={option.label}
              onClick={() => setTheme(option.id)}
              className={cn(
                "size-11 min-h-11 min-w-11 shadow-none",
                pressed ? "border-foreground" : "border-transparent"
              )}
            >
              <Icon aria-hidden className="size-5" />
              <span className="sr-only">{option.label}</span>
            </Button>
          );
        })}
      </div>
      <div
        role="group"
        aria-label="Tamanho do texto"
        className="flex items-center rounded-xl border-2 border-foreground bg-card p-0.5 shadow-[2px_2px_0_0_var(--foreground)]"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Diminuir texto"
          title="Diminuir texto"
          disabled={!canDecrease}
          onClick={decreaseFont}
          className="size-11 min-h-11 min-w-11 shadow-none"
        >
          <Minus aria-hidden className="size-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Tamanho atual ${font} por cento. Clique para voltar ao padrão.`}
          title="Voltar ao tamanho padrão"
          onClick={resetFont}
          className="h-11 min-h-11 min-w-14 px-2 font-heading text-sm shadow-none"
        >
          {font}%
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Aumentar texto"
          title="Aumentar texto"
          disabled={!canIncrease}
          onClick={increaseFont}
          className="size-11 min-h-11 min-w-11 shadow-none"
        >
          <Plus aria-hidden className="size-5" />
        </Button>
      </div>
    </div>
  );
}
