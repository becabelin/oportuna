import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { OpportunityCatalog } from "@/components/opportunity-catalog";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FAQ } from "@/lib/faq";
import { faqSchema, itemListSchema } from "@/lib/schema";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { listOportunidades, taxonomia } from "@/lib/store";
import { TIPO_LABEL } from "@/lib/taxonomia";
import { parseListQuery } from "@/lib/validate";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

function toQuery(raw: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else if (value) {
      params.set(key, value);
    }
  }
  return params;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = toQuery(await searchParams);
  const initialResult = listOportunidades(parseListQuery(params));
  const tax = taxonomia();
  const initialTaxonomia = {
    tipos: tax.tipos.map((item) => ({ ...item, label: TIPO_LABEL[item.id] })),
    areas: tax.areas,
    paises: tax.paises,
    abertas: tax.abertas,
    total: tax.total,
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd data={itemListSchema(initialResult.data)} />
      <JsonLd data={faqSchema(FAQ.map((item) => ({ q: item.q, a: item.a })))} />
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
          A Oportuna junta bolsas, eventos, estágios, intercâmbios e concursos num
          mural público. Você consulta de graça. Quem for plugar num app pede uma
          chave. O prazo que vale é o do edital oficial.
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

      <section aria-labelledby="mural-heading">
        <div className="mb-6">
          <h2 id="mural-heading" className="font-heading text-3xl">
            O mural agora
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Inscrições abertas, com subtítulo para achar rápido. O prazo que vale é o do edital oficial.
          </p>
        </div>
        <Suspense fallback={<CatalogSkeleton />}>
          <OpportunityCatalog
            initialResult={initialResult}
            initialTaxonomia={initialTaxonomia}
            initialQuery={params.toString()}
          />
        </Suspense>
      </section>

      <section aria-labelledby="faq-heading" className="grid gap-4 border-t-2 border-foreground/15 pt-10">
        <h2 id="faq-heading" className="font-heading text-3xl">
          Perguntas que a busca costuma fazer
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border-2 border-foreground/20 bg-card p-4 shadow-[4px_4px_0_0_oklch(0.24_0.04_40_/_0.12)]"
            >
              <dt className="font-heading text-lg">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-foreground/80">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
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
