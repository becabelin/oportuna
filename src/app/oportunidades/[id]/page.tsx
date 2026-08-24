import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Calendar, MapPin, Wallet } from "lucide-react";

import { JsonLd } from "@/components/json-ld";
import { PrazoBadge, TipoBadge } from "@/components/opportunity-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, capitalizeTag } from "@/lib/format";
import { breadcrumbSchema, opportunitySchema } from "@/lib/schema";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { getOportunidade } from "@/lib/store";
import { MODALIDADE_LABEL, NIVEL_LABEL, TIPO_LABEL } from "@/lib/taxonomia";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

export default async function OpportunityPage({ params }: PageProps) {
  const { id } = await params;
  const item = getOportunidade(id);
  if (!item) notFound();

  const local = [item.cidade, item.pais].filter(Boolean).join(" · ");

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Mural", path: "/" },
          { name: item.titulo, path: `/oportunidades/${item.id}` },
        ])}
      />
      <JsonLd data={opportunitySchema(item)} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Mural</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{item.organizacao}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-4 flex flex-wrap gap-2">
        <TipoBadge tipo={item.tipo} />
        <PrazoBadge prazoInscricao={item.prazoInscricao} />
      </div>

      <h1 className="mt-4 font-heading text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
        {item.titulo}
      </h1>
      <p className="mt-3 text-lg leading-snug text-foreground">{item.subtitulo}</p>
      <p className="mt-2 text-muted-foreground">{item.organizacao}</p>

      <Card className="mt-8">
      <CardContent className="pt-(--card-spacing)">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Wallet className="size-3.5" />
            Benefício
          </dt>
          <dd className="mt-1 text-sm">{item.beneficio ?? "Não informado"}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <MapPin className="size-3.5" />
            Onde
          </dt>
          <dd className="mt-1 text-sm">
            {local} · {MODALIDADE_LABEL[item.modalidade]}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Calendar className="size-3.5" />
            Inscrições
          </dt>
          <dd className="mt-1 text-sm">
            {item.prazoInscricao ? (
              <>
                até{" "}
                <time dateTime={item.prazoInscricao}>{formatDate(item.prazoInscricao)}</time>
              </>
            ) : (
              "fluxo contínuo"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Perfil
          </dt>
          <dd className="mt-1 text-sm">
            {item.area} · {NIVEL_LABEL[item.nivel]}
            {item.vagas ? ` · ${item.vagas} vagas` : ""}
          </dd>
        </div>
        {item.dataInicio ? (
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Início
            </dt>
            <dd className="mt-1 text-sm">{formatDate(item.dataInicio)}</dd>
          </div>
        ) : null}
        {item.dataFim ? (
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Término
            </dt>
            <dd className="mt-1 text-sm">{formatDate(item.dataFim)}</dd>
          </div>
        ) : null}
      </dl>
      </CardContent>
      </Card>

      <Separator className="my-8 bg-foreground/15" />

      <div className="space-y-4 text-[17px] leading-relaxed">
        <p>{item.descricao}</p>
      </div>

      {item.requisitos.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-heading text-2xl">Requisitos</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
            {item.requisitos.map((requisito) => (
              <li key={requisito}>{requisito}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {item.tags.length > 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          {item.tags.map((tag) => `#${capitalizeTag(tag).replaceAll(" ", "")}`).join("  ")}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-2">
        <a
          href={item.urlInscricao}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants())}
        >
          Ir para a inscrição
          <ArrowUpRight className="size-4" />
        </a>
        <Link href="/chave" className={cn(buttonVariants({ variant: "outline" }))}>
          JSON via API (precisa de chave)
        </Link>
        {item.fonteId ? (
          <Link href={`/?fonteId=${item.fonteId}`} className={cn(buttonVariants({ variant: "ghost" }))}>
            Outras desta fonte
          </Link>
        ) : null}
      </div>
    </article>
  );
}
