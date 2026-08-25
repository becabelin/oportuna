import type { Oportunidade } from "./types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "Data a definir";
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDateShort(iso: string | null): string {
  if (!iso) return "Fluxo contínuo";
  return shortDateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

/** Label curto para cards: deixa claro que a data é o prazo de inscrição. */
export function formatPrazoInscricao(iso: string | null): string {
  if (!iso) return "Inscrições contínuas";
  const days = daysUntil(iso);
  const data = shortDateFormatter.format(new Date(`${iso}T00:00:00Z`));
  if (days < 0) return `Inscrição encerrou em ${data}`;
  if (days === 0) return "Inscrição encerra hoje";
  if (days === 1) return "Inscrição encerra amanhã";
  return `Inscrição até ${data}`;
}

const FUSO_MURAL = "America/Sao_Paulo";

function hojeIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_MURAL,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function daysUntil(iso: string): number {
  const hoje = new Date(`${hojeIso()}T00:00:00Z`);
  const target = new Date(`${iso}T00:00:00Z`);
  return Math.round((target.getTime() - hoje.getTime()) / 86_400_000);
}

export function encerraHoje(prazoInscricao: string | null): boolean {
  if (!prazoInscricao) return false;
  return daysUntil(prazoInscricao) === 0;
}

export function isOpen(oportunidade: Pick<Oportunidade, "prazoInscricao">) {
  if (!oportunidade.prazoInscricao) return true;
  return daysUntil(oportunidade.prazoInscricao) >= 0;
}

export function prazoLabel(prazoInscricao: string | null): {
  text: string;
  tone: "open" | "soon" | "closed" | "rolling";
} {
  if (!prazoInscricao) {
    return { text: "Inscrições contínuas", tone: "rolling" };
  }

  const days = daysUntil(prazoInscricao);
  if (days < 0) {
    return { text: `Encerrado em ${formatDate(prazoInscricao)}`, tone: "closed" };
  }
  if (days === 0) {
    return { text: "Encerra hoje", tone: "soon" };
  }
  if (days === 1) {
    return { text: "Encerra amanhã", tone: "soon" };
  }
  if (days <= 14) {
    return { text: `Encerra em ${days} dias`, tone: "soon" };
  }
  return { text: `Até ${formatDate(prazoInscricao)}`, tone: "open" };
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function capitalizeTag(value: string) {
  const tag = value.trim();
  if (!tag) return tag;
  return tag.charAt(0).toLocaleUpperCase("pt-BR") + tag.slice(1);
}

export function capitalizeTags(values: string[]) {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const value of values) {
    const tag = capitalizeTag(value);
    if (!tag) continue;
    const key = tag.toLocaleLowerCase("pt-BR");
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}
