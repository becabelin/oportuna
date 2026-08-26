/** Linhas cheias no mural da home, antes de “Ver mais”. */
export const MURAL_ROWS = 5;
export const MURAL_COLS_MAX = 3;
export const MURAL_PAGE_SIZE_MAX = MURAL_ROWS * MURAL_COLS_MAX;

export const MURAL_GRID_CLASS =
  "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

/** Mesmos cortes do grid Tailwind: 1 / 2 / 3 colunas. */
export function muralColumnsFromWidth(width: number): 1 | 2 | 3 {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export function muralPageSize(columns: number) {
  return columns * MURAL_ROWS;
}
