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

function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00Z`);
  return Math.round((target.getTime() - todayUtc().getTime()) / 86_400_000);
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
