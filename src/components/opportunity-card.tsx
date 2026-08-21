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
  bolsa: "bg-teal-700/10 text-teal-900 border-teal-700/15",
  evento: "bg-amber-600/10 text-amber-950 border-amber-700/15",
  curso: "bg-sky-700/10 text-sky-900 border-sky-700/15",
  estagio: "bg-violet-700/10 text-violet-950 border-violet-700/15",
  intercambio: "bg-rose-700/10 text-rose-950 border-rose-700/15",
  concurso: "bg-stone-700/10 text-stone-900 border-stone-700/15",
};

export function TipoBadge({ tipo }: { tipo: TipoOportunidade }) {
  return (
    <Badge variant="outline" className={cn("border", TIPO_TONE[tipo])}>
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
    <Card className="h-full bg-card/90 transition-shadow hover:shadow-md">
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
