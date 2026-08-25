import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { DotGlobe, HeroMesh } from "@/components/cover-field";
import { FaqAccordion } from "@/components/faq-accordion";
import { FeaturedMiniCard, OpportunityCard } from "@/components/opportunity-card";
import { JsonLd } from "@/components/json-ld";
import { LogoTicker } from "@/components/logo-ticker";
import { OpportunityCatalog } from "@/components/opportunity-catalog";
import { Reveal } from "@/components/reveal";
import { SectionHeading, SiteContainer } from "@/components/editorial";
import { CardSkeletonGrid } from "@/components/page-skeleton";
import { FAQ } from "@/lib/faq";
import { MURAL_PAGE_SIZE_MAX } from "@/lib/mural";
import { faqSchema, itemListSchema } from "@/lib/schema";
import { pageSocial, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import { listOportunidades, taxonomia } from "@/lib/store";
import { TIPO_LABEL } from "@/lib/taxonomia";
import { parseListQuery } from "@/lib/validate";

export const revalidate = 300;

export const metadata: Metadata = {
  ...pageSocial("/", SITE_TITLE, SITE_DESCRIPTION),
  title: { absolute: SITE_TITLE },
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
  const filtros = parseListQuery(params);
  const initialResult = listOportunidades({
    ...filtros,
    page: 1,
    limit: MURAL_PAGE_SIZE_MAX,
  });
  const tax = taxonomia();
  const initialTaxonomia = {
    tipos: tax.tipos.map((item) => ({ ...item, label: TIPO_LABEL[item.id] })),
    areas: tax.areas,
    paises: tax.paises,
    abertas: tax.abertas,
    total: tax.total,
  };
  const featured = initialResult.data[0];
  const picks = initialResult.data.slice(0, 3);

  return (
    <div className="flex flex-col bg-background">
      <JsonLd data={itemListSchema(initialResult.data)} />
      <JsonLd data={faqSchema(FAQ.map((item) => ({ q: item.q, a: item.a })))} />

      <section className="relative isolate min-h-[28rem] overflow-hidden sm:min-h-[32rem] lg:min-h-[36rem]">
        <HeroMesh />
        <SiteContainer className="relative flex min-h-[28rem] flex-col justify-between gap-10 py-12 sm:min-h-[32rem] sm:py-16 lg:min-h-[36rem] lg:py-20">
          <Reveal eager className="max-w-xl">
            <h1 className="font-heading text-[2.6rem] leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-[3.4rem]">
              Bolsas, eventos e editais numa trilha só
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white sm:text-lg">
              Um mural público de bolsas, eventos, cursos, estágios, intercâmbios e
              concursos. Leia o resumo aqui e siga para a inscrição no site da
              organização.
            </p>
          </Reveal>
          {featured ? (
            <Reveal eager delay={140} className="flex justify-end">
              <FeaturedMiniCard item={featured} />
            </Reveal>
          ) : null}
        </SiteContainer>
      </section>

      <Reveal>
        <LogoTicker />
      </Reveal>

      <SiteContainer className="py-14 sm:py-16">
        <Reveal as="section" aria-labelledby="o-que-e-heading" className="grid items-start gap-6 border-b border-border pb-14 sm:gap-8 sm:pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <h2
            id="o-que-e-heading"
            className="font-heading text-[1.85rem] leading-[1.12] tracking-tight text-balance sm:text-[2.35rem]"
          >
            Um mural com as chamadas abertas, prontas para você ler.
          </h2>
          <div>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              A Trilha junta chamadas reais, com inscrição, prazo ou vaga, num
              catálogo em português e de graça. Você lê o resumo aqui e se
              inscreve no site da organização.
            </p>
            <Link
              href="/sobre"
              className="mt-4 inline-flex min-h-11 items-center text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Como a Trilha funciona →
            </Link>
          </div>
        </Reveal>

        {picks.length > 0 ? (
          <Reveal as="section" aria-labelledby="destaques-heading" className="pt-14 sm:pt-16">
            <SectionHeading
              id="destaques-heading"
              title="Destaques"
              href="#mural"
              action="Ver o mural"
              description="Três aberturas para começar. O mural completo, com filtro por tipo, vem em seguida."
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map((item) => (
                <OpportunityCard key={item.id} item={item} size="pick" />
              ))}
            </div>
          </Reveal>
        ) : null}
      </SiteContainer>

      <SiteContainer className="border-t border-border py-14 sm:py-16">
        <Reveal as="section" aria-labelledby="mural-heading" id="mural">
          <SectionHeading
            id="mural-heading"
            title="O mural agora"
            href="/docs"
            action="Como usar a API"
              description="Filtre por tipo ou busque por nome. Cada card abre o resumo e o caminho para a inscrição."
          />
            <Suspense fallback={<CardSkeletonGrid count={MURAL_PAGE_SIZE_MAX} />}>
            <OpportunityCatalog
              initialResult={initialResult}
              initialTaxonomia={initialTaxonomia}
              initialQuery={params.toString()}
            />
          </Suspense>
        </Reveal>
      </SiteContainer>

      <section
        id="sobre-a-criadora"
        className="border-t-4 border-[#FDB409] bg-linear-to-r from-[#001A4C] via-[#001A4C] to-[#5E2EC4] contrast:border-y contrast:border-white contrast:bg-background"
      >
        <SiteContainer className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal as="figure">
            <blockquote className="font-heading text-3xl leading-[1.2] tracking-tight text-white text-balance sm:text-[2.6rem]">
              Decidi criar a Trilha da Oportunidade para isso chegar em mais pessoas.
            </blockquote>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg contrast:text-white">
              Bolsas, eventos e editais num mural público, em português e de graça.
              Você lê o resumo aqui e segue para a inscrição no site da organização.
            </p>
            <figcaption className="mt-8 flex items-center gap-3 text-sm text-white">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-[#FDB409] contrast:border-white">
                <Image
                  src="/rebeca-sousa.jpg"
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover object-[center_18%]"
                />
              </span>
              <span>
                Rebeca Sousa
                <span className="mt-0.5 block text-[#FDB409] contrast:text-white">
                  criadora da Trilha da Oportunidade
                </span>
              </span>
            </figcaption>
          </Reveal>
          <Reveal delay={120} className="flex justify-center lg:justify-end">
            <DotGlobe />
          </Reveal>
        </SiteContainer>
      </section>

      <SiteContainer className="py-14 sm:py-16">
        <Reveal as="section" aria-labelledby="faq-heading">
          <SectionHeading id="faq-heading" title="Perguntas frequentes" />
          <FaqAccordion />
        </Reveal>
      </SiteContainer>
    </div>
  );
}

