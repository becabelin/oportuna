import Link from "next/link";

import { CategoryMeta } from "@/components/editorial";
import { formatPrazoInscricao } from "@/lib/format";
import { TIPO_LABEL } from "@/lib/taxonomia";
import { TIPO_DOT } from "@/lib/tipo-visual";
import { gerarResumoCard } from "@/lib/triagem";
import type { Oportunidade, TipoOportunidade } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TipoBadge({ tipo }: { tipo: TipoOportunidade }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span className={cn("size-1.5 rounded-full", TIPO_DOT[tipo])} aria-hidden />
      {TIPO_LABEL[tipo]}
    </span>
  );
}

export function PrazoBadge({ prazoInscricao }: { prazoInscricao: string | null }) {
  return (
    <span className="text-sm text-muted-foreground">
      {prazoInscricao ? (
        <time dateTime={prazoInscricao}>{formatPrazoInscricao(prazoInscricao)}</time>
      ) : (
        formatPrazoInscricao(null)
      )}
    </span>
  );
}

export function FeaturedMiniCard({ item }: { item: Oportunidade }) {
  const resumo = gerarResumoCard(item);
  return (
    <Link
      href={`/oportunidades/${item.id}`}
      data-hover-lift
      className="group w-full max-w-[22rem] rounded-xl border border-transparent bg-white p-4 shadow-[0_12px_40px_rgba(0,20,80,0.18)] transition-transform duration-200 ease-out hover:-translate-y-1.5 focus-visible:ring-3 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-card dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)] contrast:border-white contrast:bg-background contrast:shadow-none"
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {TIPO_LABEL[item.tipo]} · Mais recente
      </p>
      <h2 className="mt-1.5 line-clamp-2 font-heading text-[0.95rem] leading-[1.4] text-foreground transition-colors group-hover:underline contrast:group-hover:text-primary">
        {item.titulo}
      </h2>
      {resumo ? (
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">{resumo}</p>
      ) : null}
    </Link>
  );
}

export function OpportunityCard({
  item,
  size = "pick",
}: {
  item: Oportunidade;
  size?: "pick" | "compact" | "related";
}) {
  const resumo = gerarResumoCard(item);
  return (
    <article className="h-full">
      <Link
        href={`/oportunidades/${item.id}`}
        className={cn(
          "group flex h-full flex-col rounded-2xl border border-border bg-card shadow-none transition-colors",
          "hover:border-foreground/20",
          "focus-visible:ring-3 focus-visible:ring-ring",
          "contrast:border-white contrast:hover:border-white",
          size === "related" ? "p-4" : "p-5 sm:p-6"
        )}
      >
        <CategoryMeta tipo={item.tipo} prazoInscricao={item.prazoInscricao} className="text-sm" />
        <h3
          className={cn(
            "mt-2 font-heading tracking-tight text-foreground transition-colors duration-200 group-hover:underline contrast:group-hover:text-primary",
            size === "compact"
              ? "line-clamp-2 text-[1.05rem] sm:text-[1.15rem]"
              : "line-clamp-3 text-[1.35rem] sm:text-[1.5rem]",
            "leading-[1.4]"
          )}
        >
          {item.titulo}
        </h3>
        {resumo ? (
          <p
            className={cn(
              "mt-2 leading-relaxed text-muted-foreground",
              size === "pick" ? "line-clamp-3 text-[15px]" : "line-clamp-2 text-sm"
            )}
          >
            {resumo}
          </p>
        ) : null}
      </Link>
    </article>
  );
}
