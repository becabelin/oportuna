import { Suspense } from "react";
import Link from "next/link";

import { AddSourceForm } from "@/components/add-source-form";
import { OpportunityCatalog } from "@/components/opportunity-catalog";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
      <section className="max-w-3xl">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Você manda o link. A Oportuna acompanha.
        </p>
        <h1 className="mt-2 font-heading text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
          Fontes de bolsas e editais, sempre atualizadas.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Cole a URL de um site, RSS ou página de editais. A cada 30 minutos a coleta
          roda de novo e o catálogo fica com o que ainda está aberto.
        </p>
        <div className="mt-6 max-w-2xl">
          <AddSourceForm />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/fontes" className={cn(buttonVariants({ variant: "outline" }))}>
            Gerenciar fontes
          </Link>
          <Link href="/docs" className={cn(buttonVariants({ variant: "ghost" }))}>
            API
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-4 h-6 w-5/6" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <Skeleton className="mt-6 h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
