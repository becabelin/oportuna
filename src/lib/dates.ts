const MESES: Record<string, number> = {
  janeiro: 1,
  january: 1,
  jan: 1,
  fevereiro: 2,
  february: 2,
  fev: 2,
  feb: 2,
  marco: 3,
  março: 3,
  march: 3,
  mar: 3,
  abril: 4,
  april: 4,
  abr: 4,
  apr: 4,
  maio: 5,
  may: 5,
  junho: 6,
  june: 6,
  jun: 6,
  julho: 7,
  july: 7,
  jul: 7,
  agosto: 8,
  august: 8,
  ago: 8,
  aug: 8,
  setembro: 9,
  september: 9,
  set: 9,
  sep: 9,
  sept: 9,
  outubro: 10,
  october: 10,
  out: 10,
  oct: 10,
  novembro: 11,
  november: 11,
  nov: 11,
  dezembro: 12,
  december: 12,
  dez: 12,
  dec: 12,
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function iso(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2020 || year > 2040) {
    return null;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function extractDates(text: string): string[] {
  const found = new Set<string>();
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const match of text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) {
    const value = iso(Number(match[1]), Number(match[2]), Number(match[3]));
    if (value) found.add(value);
  }

  for (const match of text.matchAll(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/g)) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    let year = Number(match[3]);
    if (year < 100) year += 2000;
    const value = iso(year, month, day);
    if (value) found.add(value);
  }

  const long =
    /\b(\d{1,2})\s+de\s+([A-Za-zçÇáéíóúãõ]+)\s+de\s+(\d{4})\b/gi;
  for (const match of text.matchAll(long)) {
    const month = MESES[match[2].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()];
    if (!month) continue;
    const value = iso(Number(match[3]), month, Number(match[1]));
    if (value) found.add(value);
  }

  const en = /\b([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})\b/g;
  for (const match of normalized.matchAll(en)) {
    const month = MESES[match[1].toLowerCase()];
    if (!month) continue;
    const value = iso(Number(match[3]), month, Number(match[2]));
    if (value) found.add(value);
  }

  const enRev = /\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/g;
  for (const match of normalized.matchAll(enRev)) {
    const month = MESES[match[2].toLowerCase()];
    if (!month) continue;
    const value = iso(Number(match[3]), month, Number(match[1]));
    if (value) found.add(value);
  }

  return [...found].sort();
}

export function pickDeadline(text: string): string | null {
  const dates = extractDates(text);
  if (dates.length === 0) return null;

  const deadlineHint =
    /at[eé]\s+[^\n.]{0,40}|prazo[^\n.]{0,40}|deadline[^\n.]{0,40}|fecha[^\n.]{0,40}|closes?[^\n.]{0,40}|inscri[cç][oõ]es?\s+at[eé]/i;
  const hinted = text.match(deadlineHint)?.[0];
  if (hinted) {
    const fromHint = extractDates(hinted);
    if (fromHint.length > 0) return fromHint[fromHint.length - 1];
  }

  const today = new Date().toISOString().slice(0, 10);
  const future = dates.filter((date) => date >= today);
  if (future.length > 0) return future[0];
  return dates[dates.length - 1];
}
