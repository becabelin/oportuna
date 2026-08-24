import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_NAVY = "#001A4C";
export const OG_GOLD = "#FDB409";
export const OG_WHITE = "#FFFFFF";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_LOCKUP_SIZE = { width: 1200, height: 429 } as const;

const FONTS_DIR = join(process.cwd(), "src/assets/fonts");

export async function loadOgFonts() {
  try {
    const [semibold, bold] = await Promise.all([
      readFile(join(FONTS_DIR, "fredoka-600.ttf")),
      readFile(join(FONTS_DIR, "fredoka-700.ttf")),
    ]);
    return [
      {
        name: "Fredoka",
        data: semibold,
        weight: 600 as const,
        style: "normal" as const,
      },
      {
        name: "Fredoka",
        data: bold,
        weight: 700 as const,
        style: "normal" as const,
      },
    ];
  } catch {
    return [];
  }
}
