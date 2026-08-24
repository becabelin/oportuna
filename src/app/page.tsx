import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { FaqAccordion } from "@/components/faq-accordion";
import { JsonLd } from "@/components/json-ld";
import { OpportunityCatalog } from "@/components/opportunity-catalog";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FAQ } from "@/lib/faq";
import { faqSchema, itemListSchema } from "@/lib/schema";
import { pageSocial, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { listOportunidades, taxonomia } from "@/lib/store";
import { TIPO_LABEL } from "@/lib/taxonomia";
import { parseListQuery } from "@/lib/validate";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  ...pageSocial("/", `${SITE_NAME} — ${SITE_TAGLINE}`, SITE_DESCRIPTION),
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
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
      <section className="rounded-[2rem] bg-secondary px-5 py-10 sm:px-12 sm:py-14">
        <p className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
          mural aberto · API com chave
        </p>
        <h1 className="mt-5 max-w-3xl font-heading text-4xl leading-[1.1] text-balance sm:text-6xl">
          Bolsas, eventos e editais numa trilha só.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
          Mestrado, editais abertos, olimpíadas e programas para jovens em todas
          as áreas — humanas, exatas, saúde, negócios e mais, não só tecnologia.
          Consulte de graça. Para plugar no app, peça uma chave. O prazo que vale
          é o do edital oficial.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
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
        <FaqAccordion />
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
          className="rounded-2xl border border-border/20 bg-card p-4 shadow-none"
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
