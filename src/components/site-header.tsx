import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 4.5h9.5A3.5 3.5 0 0 1 18 8v12.5H8.5A3.5 3.5 0 0 1 5 17V4.5Z" />
              <path d="M18 8h1.5A1.5 1.5 0 0 1 21 9.5V20a1 1 0 0 1-1 1h-2" />
            </svg>
          </span>
          <span className="font-heading text-xl tracking-tight">Oportuna</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            Catálogo
          </Link>
          <Link
            href="/fontes"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            Fontes
          </Link>
          <Link
            href="/docs"
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            API
          </Link>
          <Link
            href="/fontes"
            className={cn(buttonVariants({ size: "sm" }), "ml-1")}
          >
            Adicionar fonte
          </Link>
        </nav>
      </div>
    </header>
  );
}
