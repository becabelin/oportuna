import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const LOGO_FULL_PATH = join(
  process.cwd(),
  "public/logo-trilha-da-oportunidade.png"
);
export const LOGO_ICON_PATH = join(process.cwd(), "public/logo-icon-trilha.png");

export async function logoFullDataUrl() {
  const buf = await readFile(LOGO_FULL_PATH);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

export async function logoIconDataUrl() {
  const buf = await readFile(LOGO_ICON_PATH);
  return `data:image/png;base64,${buf.toString("base64")}`;
}
