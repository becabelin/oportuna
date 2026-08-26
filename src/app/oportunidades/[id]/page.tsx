import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { CopyLinkButton } from "@/components/copy-link-button";
import { JsonLd } from "@/components/json-ld";
import { OpportunityCard } from "@/components/opportunity-card";
import { PrazoTexto, SectionHeading } from "@/components/editorial";
import { buttonVariants } from "@/components/ui/button";
import { encerraHoje, formatDate, formatDateShort } from "@/lib/format";
import { subtituloVisivel } from "@/lib/triagem";
import { breadcrumbSchema, opportunitySchema } from "@/lib/schema";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { getOportunidade, listOportunidades } from "@/lib/store";
import { MODALIDADE_LABEL, NIVEL_LABEL, TIPO_LABEL } from "@/lib/taxonomia";
import type { Oportunidade } from "@/lib/types";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

type TocItem = { id: string; label: string };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getOportunidade(id);
  if (!item) return { title: "Oportunidade não encontrada", robots: { index: false } };
  const description = item.subtitulo || item.descricao;
  const url = absoluteUrl(`/oportunidades/${item.id}`);
  return {
    title: item.titulo,
    description,
    keywords: [TIPO_LABEL[item.tipo], item.organizacao, item.area, item.pais, ...item.tags],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "pt_BR",
      siteName: SITE_NAME,
      title: item.titulo,
      description,
      url,
      modifiedTime: item.atualizadoEm,
      publishedTime: item.criadoEm,
    },
    twitter: {
      card: "summary_large_image",
      title: item.titulo,
      description,
    },
  };
}

function minutosLeitura(...textos: string[]) {
  const palavras = textos.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 180));
}

function paragrafos(texto: string) {
  const partes = texto
    .split(/\n{2,}/)
    .map((parte) => parte.trim())
    .filter(Boolean);
  return partes.length > 0 ? partes : [texto];
}

function dataMeta(item: Oportunidade) {
  return item.prazoInscricao ?? item.criadoEm.slice(0, 10);
}

function relacionados(item: Oportunidade) {
  const mesmoTipo = listOportunidades({
    tipo: item.tipo,
    status: "abertas",
    limit: 8,
    ordenar: "prazo",
  }).data.filter((outro) => outro.id !== item.id);
  if (mesmoTipo.length >= 3) return mesmoTipo.slice(0, 3);
  const extra = listOportunidades({
    status: "abertas",
    limit: 12,
    ordenar: "prazo",
  }).data.filter(
    (outro) => outro.id !== item.id && !mesmoTipo.some((igual) => igual.id === outro.id)
  );
  return [...mesmoTipo, ...extra].slice(0, 3);
}

function ArticleToc({ items, minutos }: { items: TocItem[]; minutos: number }) {
  return (
    <nav
      aria-label="Nesta página"
      className="rounded-2xl border border-border bg-card p-5 shadow-none contrast:border-white sm:p-6"
    >
      <p className="text-sm font-medium text-foreground">Neste edital</p>
      <ol className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-sm leading-snug text-muted-foreground no-underline transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-sm text-muted-foreground">{minutos} min de leitura</p>
    </nav>
  );
}

function InscricaoCta({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants(), "h-auto min-h-11 w-full whitespace-normal")}
    >
      Ir para a inscrição
      <ArrowUpRight className="size-4" aria-hidden />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}

export default async function OpportunityPage({ params }: PageProps) {
  const { id } = await params;
  const item = getOportunidade(id);
  if (!item) notFound();

  const local = [item.cidade, item.pais].filter(Boolean).join(" · ");
  const toc: TocItem[] = [
    { id: "fatos", label: "O que você precisa saber" },
    { id: "descricao", label: "Descrição" },
    ...(item.requisitos.length > 0 ? [{ id: "requisitos", label: "Requisitos" }] : []),
    { id: "inscricao", label: "Inscrição" },
  ];
  const minutos = minutosLeitura(item.descricao, item.requisitos.join(" "));
  const mais = relacionados(item);
  const data = dataMeta(item);

  return (
    <article className="mx-auto w-full max-w-[1080px] px-5 py-10 sm:px-8 sm:py-14">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Mural", path: "/" },
          { name: item.titulo, path: `/oportunidades/${item.id}` },
        ])}
      />
      <JsonLd data={opportunitySchema(item)} />

      <nav aria-label="Localização" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="underline-offset-4 hover:text-foreground hover:underline">
              Mural
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <span aria-current="page">{item.titulo}</span>
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-12 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
        <div>
          <div className="flex items-center justify-between gap-4 text-[13px] text-muted-foreground">
            <span>{TIPO_LABEL[item.tipo]}</span>
            {encerraHoje(item.prazoInscricao) ? (
              <PrazoTexto prazoInscricao={item.prazoInscricao} />
            ) : (
              <time dateTime={data}>{formatDateShort(data)}</time>
            )}
          </div>

          <h1 className="mt-5 font-heading text-[2.15rem] leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.15rem]">
            {item.titulo}
          </h1>
          {subtituloVisivel(item) ? (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {item.subtitulo}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-8 contrast:border-white">
            <p className="min-w-0 truncate text-sm">{item.organizacao}</p>
            <CopyLinkButton />
          </div>

          <div className="lg:hidden">
            <div className="grid gap-4 border-b border-border py-8 contrast:border-white">
              <ArticleToc items={toc} minutos={minutos} />
              <InscricaoCta href={item.urlInscricao} />
            </div>
          </div>

          <div className="mt-10 divide-y divide-foreground/30 contrast:divide-white">
          <section id="fatos" className="scroll-mt-28 pb-10">
            <h2 className="font-heading text-2xl sm:text-[1.75rem]">O que você precisa saber</h2>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Benefício</dt>
                <dd className="mt-1 text-base">{item.beneficio ?? "Não informado"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Onde</dt>
                <dd className="mt-1 text-base">
                  {local} · {MODALIDADE_LABEL[item.modalidade]}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Inscrições</dt>
                <dd className="mt-1 text-base">
                  <PrazoTexto prazoInscricao={item.prazoInscricao} />
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Perfil</dt>
                <dd className="mt-1 text-base">
                  {item.area} · {NIVEL_LABEL[item.nivel]}
                  {item.vagas ? ` · ${item.vagas} ${item.vagas === 1 ? "vaga" : "vagas"}` : ""}
                </dd>
              </div>
              {item.fonteId?.startsWith("fapesp") ? (
                <div>
                  <dt className="text-sm text-muted-foreground">O que é</dt>
                  <dd className="mt-1 text-base">
                    Bolsa de pesquisa da FAPESP. A seleção acontece na
                    instituição do projeto.
                  </dd>
                </div>
              ) : null}
              {item.dataInicio ? (
                <div>
                  <dt className="text-sm text-muted-foreground">Início</dt>
                  <dd className="mt-1 text-base">{formatDate(item.dataInicio)}</dd>
                </div>
              ) : null}
              {item.dataFim ? (
                <div>
                  <dt className="text-sm text-muted-foreground">Término</dt>
                  <dd className="mt-1 text-base">{formatDate(item.dataFim)}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section id="descricao" className="max-w-[40rem] scroll-mt-28 space-y-5 py-10 text-[17px] leading-[1.75] sm:text-lg">
            <h2 className="font-heading text-2xl sm:text-[1.75rem]">Descrição</h2>
            {paragrafos(item.descricao).map((paragrafo, index) => (
              <p key={index}>{paragrafo}</p>
            ))}
          </section>

          {item.requisitos.length > 0 ? (
            <section id="requisitos" className="scroll-mt-28 py-10">
              <h2 className="font-heading text-2xl sm:text-[1.75rem]">Requisitos</h2>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-[17px] leading-relaxed sm:text-lg">
                {item.requisitos.map((requisito) => (
                  <li key={requisito}>{requisito}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section id="inscricao" className="scroll-mt-28 py-10">
            <h2 className="font-heading text-2xl sm:text-[1.75rem]">Inscrição</h2>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              O site da organização tem o formulário, as datas e as regras. Siga
              para a inscrição por lá.
            </p>
            <div className="mt-6">
              <a
                href={item.urlInscricao}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants())}
              >
                Ir para a inscrição
                <ArrowUpRight className="size-4" aria-hidden />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </div>
          </section>

          <p className="py-8 text-sm text-muted-foreground">
            Publicado em{" "}
            <time dateTime={item.criadoEm}>{formatDate(item.criadoEm.slice(0, 10))}</time>
          </p>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 grid gap-4">
            <ArticleToc items={toc} minutos={minutos} />
            <InscricaoCta href={item.urlInscricao} />
          </div>
        </aside>
      </div>

      {mais.length > 0 ? (
        <section className="mt-20 border-t border-border pt-12 contrast:border-white sm:mt-24">
          <SectionHeading title="Mais para explorar" href="/" action="Ver mural" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mais.map((outro) => (
              <OpportunityCard key={outro.id} item={outro} size="related" />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
