import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_LOCKUP_PATH = join(process.cwd(), "public/og-lockup.png");

export async function ogLockupDataUrl() {
  const buf = await readFile(OG_LOCKUP_PATH);
  return `data:image/png;base64,${buf.toString("base64")}`;
}
