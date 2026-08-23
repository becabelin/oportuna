import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Calendar, MapPin, Wallet } from "lucide-react";

import { PrazoBadge, TipoBadge } from "@/components/opportunity-card";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getOportunidade } from "@/lib/store";
import { MODALIDADE_LABEL, NIVEL_LABEL } from "@/lib/taxonomia";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getOportunidade(id);
  if (!item) return { title: "Oportunidade não encontrada" };
  return {
    title: item.titulo,
    description: item.subtitulo || item.descricao,
  };
}

export default async function OpportunityPage({ params }: PageProps) {
  const { id } = await params;
  const item = getOportunidade(id);
  if (!item) notFound();

  const local = [item.cidade, item.pais].filter(Boolean).join(" · ");

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="font-semibold underline decoration-2 underline-offset-4 hover:text-foreground">
          Mural
        </Link>
        <span className="px-2">/</span>
        {item.organizacao}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <TipoBadge tipo={item.tipo} />
        <PrazoBadge prazoInscricao={item.prazoInscricao} />
      </div>

      <h1 className="mt-4 font-heading text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
        {item.titulo}
      </h1>
      <p className="mt-3 text-lg leading-snug text-foreground/85">{item.subtitulo}</p>
      <p className="mt-2 text-muted-foreground">{item.organizacao}</p>

      <dl className="mt-8 grid gap-4 rounded-2xl border-2 border-foreground bg-card p-5 shadow-[6px_6px_0_0_var(--foreground)] sm:grid-cols-2">
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
            {item.prazoInscricao ? `até ${formatDate(item.prazoInscricao)}` : "fluxo contínuo"}
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

      <div className="mt-8 space-y-4 text-[17px] leading-relaxed">
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
          {item.tags.map((tag) => `#${tag.replaceAll(" ", "")}`).join("  ")}
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
