import Link from "next/link";
import {
  CalendarClock,
  Globe2,
  MapPin,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prazoLabel } from "@/lib/format";
import { MODALIDADE_LABEL, NIVEL_LABEL, TIPO_LABEL } from "@/lib/taxonomia";
import type { Oportunidade, TipoOportunidade } from "@/lib/types";
import { cn } from "@/lib/utils";

const TIPO_TONE: Record<TipoOportunidade, string> = {
  bolsa: "-rotate-2 border-foreground bg-[#F7C948] text-foreground",
  evento: "rotate-2 border-foreground bg-primary text-primary-foreground",
  curso: "-rotate-1 border-foreground bg-[#7BDFF2] text-foreground",
  estagio: "rotate-1 border-foreground bg-[#C4B5FD] text-foreground",
  intercambio: "-rotate-2 border-foreground bg-[#FB7185] text-foreground",
  concurso: "rotate-2 border-foreground bg-[#86EFAC] text-foreground",
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
      ? "bg-destructive/10 text-destructive border-destructive/15"
      : prazo.tone === "closed"
        ? "bg-muted text-muted-foreground"
        : "bg-primary/8 text-primary border-primary/15";
  return (
    <Badge variant="outline" className={cn("border", tone)}>
      {prazo.text}
    </Badge>
  );
}

export function OpportunityCard({ item }: { item: Oportunidade }) {
  const local = [item.cidade, item.pais].filter(Boolean).join(" · ");

  return (
    <Card className="h-full bg-card transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <TipoBadge tipo={item.tipo} />
          <PrazoBadge prazoInscricao={item.prazoInscricao} />
          {item.origem === "coleta" ? (
            <Badge variant="outline" className="border-primary/20 text-primary">
              coletada
            </Badge>
          ) : null}
        </div>
        <CardTitle className="text-lg leading-snug">
          <Link
            href={`/oportunidades/${item.id}`}
            className="hover:underline hover:underline-offset-4"
          >
            {item.titulo}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-1">{item.organizacao}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
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
          {item.tags.slice(0, 2).join(" · ") || "Sem tags"}
        </span>
        <Link
          href={`/oportunidades/${item.id}`}
          className="font-medium text-primary hover:underline"
        >
          Ver edital
        </Link>
      </CardFooter>
    </Card>
  );
}
