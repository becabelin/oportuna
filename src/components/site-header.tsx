import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground/15 bg-[color-mix(in_oklch,var(--background),white_35%)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-10 rotate-[-6deg] items-center justify-center rounded-xl border-2 border-foreground bg-primary text-lg font-black text-primary-foreground shadow-[3px_3px_0_0_var(--foreground)]">
            Ó
          </span>
          <span className="font-heading text-2xl leading-none tracking-tight">
            Oportuna
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground/70 hover:text-foreground sm:inline"
          >
            Mural
          </Link>
          <Link
            href="/docs"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground/70 hover:text-foreground sm:inline"
          >
            API
          </Link>
          <Link href="/chave" className={cn(buttonVariants({ size: "sm" }), "ml-1")}>
            Pedir chave
          </Link>
        </nav>
      </div>
    </header>
  );
}
