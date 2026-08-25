import type { ReactNode } from "react";
import Link from "next/link";

import { encerraHoje, formatPrazoInscricao } from "@/lib/format";
import { TIPO_LABEL } from "@/lib/taxonomia";
import { TIPO_DOT } from "@/lib/tipo-visual";
import type { TipoOportunidade } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PrazoTexto({
  prazoInscricao,
  className,
}: {
  prazoInscricao: string | null;
  className?: string;
}) {
  const urgente = encerraHoje(prazoInscricao);
  const classes = cn(className, urgente && "font-medium text-destructive");
  const texto = formatPrazoInscricao(prazoInscricao);
  if (!prazoInscricao) {
    return <span className={classes}>{texto}</span>;
  }
  return (
    <time dateTime={prazoInscricao} className={classes}>
      {texto}
    </time>
  );
}

export function CategoryMeta({
  tipo,
  prazoInscricao,
  className,
}: {
  tipo: TipoOportunidade;
  prazoInscricao: string | null;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-2 text-sm text-muted-foreground",
        className
      )}
    >
      <span className="inline-flex items-center gap-2">
        <span
          className={cn("size-2 shrink-0 rounded-full", TIPO_DOT[tipo])}
          aria-hidden
        />
        {TIPO_LABEL[tipo]}
      </span>
      <span aria-hidden>·</span>
      <PrazoTexto prazoInscricao={prazoInscricao} />
    </p>
  );
}

export function SectionHeading({
  id,
  title,
  href,
  action,
  description,
}: {
  id?: string;
  title: string;
  href?: string;
  action?: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id={id} className="font-heading text-[1.75rem] leading-none tracking-tight sm:text-[2rem]">
          {title}
        </h2>
        {href && action ? (
          <Link
            href={href}
            className="inline-flex min-h-11 items-center text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {action} →
          </Link>
        ) : null}
      </div>
      {description ? (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function SiteContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}
