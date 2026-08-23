import { Suspense } from "react";
import Link from "next/link";

import { OpportunityCatalog } from "@/components/opportunity-catalog";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <section className="relative overflow-hidden rounded-[1.6rem] border-2 border-foreground bg-[color-mix(in_oklch,var(--secondary),white_35%)] px-5 py-8 shadow-[8px_8px_0_0_var(--foreground)] sm:px-10 sm:py-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-1 right-10 hidden h-7 w-24 rotate-12 border border-foreground/10 bg-[#F4E1B5]/80 shadow-sm sm:block"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-6 bottom-6 hidden rotate-6 rounded-md border-2 border-foreground bg-accent px-2 py-1 text-[10px] font-black uppercase sm:block"
        >
          recorte
        </span>
        <p className="inline-block -rotate-2 rounded-md border-2 border-foreground bg-primary px-2 py-0.5 text-xs font-black tracking-wide text-primary-foreground uppercase">
          mural aberto · API com chave
        </p>
        <h1 className="mt-4 max-w-3xl font-heading text-[2.4rem] leading-[1.05] text-balance sm:text-6xl">
          Ache a próxima bolsa como quem folheia um caderno de recortes.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
          A Oportuna junta editais, eventos e programas num só lugar. Você navega
          o mural de graça. Para plugar no app, pede uma chave — assim ninguém
          estoura a base no automático.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/chave" className={cn(buttonVariants({ size: "lg" }))}>
            Quero uma chave
          </Link>
          <Link href="/docs" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Como usar a API
          </Link>
        </div>
      </section>

      <Suspense fallback={<CatalogSkeleton />}>
        <OpportunityCatalog />
      </Suspense>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border-2 border-foreground/20 bg-card p-4 shadow-[4px_4px_0_0_oklch(0.24_0.04_40_/_0.12)]"
        >
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-4 h-6 w-5/6" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <Skeleton className="mt-6 h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
