import Link from "next/link";
import {
  CalendarClock,
  Globe2,
  MapPin,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prazoLabel, capitalizeTag } from "@/lib/format";
import { MODALIDADE_LABEL, NIVEL_LABEL, TIPO_LABEL } from "@/lib/taxonomia";
import type { Oportunidade, TipoOportunidade } from "@/lib/types";
import { cn } from "@/lib/utils";

const TIPO_TONE: Record<TipoOportunidade, string> = {
  bolsa: "border-[#001A4C] bg-primary text-primary-foreground",
  evento: "border-transparent bg-accent text-accent-foreground",
  curso: "border-[#001A4C] bg-secondary text-secondary-foreground",
  estagio: "border-transparent bg-[#001A4C] text-white",
  intercambio: "border-transparent bg-accent text-accent-foreground",
  concurso: "border-[#001A4C] bg-primary text-primary-foreground",
};

export function TipoBadge({ tipo }: { tipo: TipoOportunidade }) {
  return (
    <Badge variant="outline" className={cn("border-2 font-black", TIPO_TONE[tipo])}>
      {TIPO_LABEL[tipo]}
    </Badge>
  );
}

export function PrazoBadge({ prazoInscricao }: { prazoInscricao: string | null }) {
  const prazo = prazoLabel(prazoInscricao);
  const tone =
    prazo.tone === "soon"
      ? "bg-card text-destructive border-destructive"
      : prazo.tone === "closed"
        ? "bg-muted text-muted-foreground"
        : "bg-primary text-primary-foreground border-foreground";
  return (
    <Badge variant="outline" className={cn("border", tone)}>
      {prazoInscricao ? <time dateTime={prazoInscricao}>{prazo.text}</time> : prazo.text}
    </Badge>
  );
}

export function OpportunityCard({ item }: { item: Oportunidade }) {
  const local = [item.cidade, item.pais].filter(Boolean).join(" · ");

  return (
    <article className="h-full">
    <Card className="h-full bg-card transition-shadow hover:shadow-[0_12px_36px_rgba(0,26,76,0.1)]">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <TipoBadge tipo={item.tipo} />
          <PrazoBadge prazoInscricao={item.prazoInscricao} />
        </div>
        <CardTitle className="text-lg leading-snug">
          <Link
            href={`/oportunidades/${item.id}`}
            className="hover:underline hover:underline-offset-4"
          >
            <h3 className="font-heading text-lg leading-snug">{item.titulo}</h3>
          </Link>
        </CardTitle>
        <p className="text-sm leading-snug text-foreground">{item.subtitulo}</p>
        <CardDescription className="line-clamp-1">{item.organizacao}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {item.descricao}
        </p>
        <ul className="mt-auto grid gap-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <Wallet className="size-3.5 shrink-0" />
            {item.beneficio ?? "Benefício não informado"}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0" />
            {local} · {MODALIDADE_LABEL[item.modalidade]}
          </li>
          <li className="flex items-center gap-2">
            <Globe2 className="size-3.5 shrink-0" />
            {item.area} · {NIVEL_LABEL[item.nivel]}
          </li>
        </ul>
      </CardContent>
      <CardFooter className="justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-3.5" />
          {item.tags.slice(0, 2).map(capitalizeTag).join(" · ") || "Sem tags"}
        </span>
        <Button variant="link" size="sm" nativeButton={false} render={<Link href={`/oportunidades/${item.id}`} />} className="h-auto px-0">
          Ver edital
        </Button>
      </CardFooter>
    </Card>
    </article>
  );
}
