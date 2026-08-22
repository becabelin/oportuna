import { Suspense } from "react";
import Link from "next/link";

import { OpportunityCatalog } from "@/components/opportunity-catalog";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
      <section className="max-w-3xl">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Base de oportunidades · API REST
        </p>
        <h1 className="mt-2 font-heading text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
          Bolsas, eventos e editais, prontos para o seu app.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A Oportuna mantém uma base atualizada a partir de fontes oficiais. Quem
          implementa a API só consulta: lista, filtra e puxa o detalhe. Ninguém
          precisa mandar link para ver as oportunidades.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/docs" className={cn(buttonVariants())}>
            Usar a API
          </Link>
          <Link href="/api/oportunidades?status=abertas&limit=todas" className={cn(buttonVariants({ variant: "outline" }))}>
            Ver o JSON da base
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
