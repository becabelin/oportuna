import type { TipoOportunidade } from "./types";

export const TIPO_DOT: Record<TipoOportunidade, string> = {
  bolsa: "bg-primary",
  evento: "bg-accent",
  curso: "bg-[#2291E0] contrast:bg-accent",
  estagio: "bg-foreground",
  intercambio: "bg-[#5E2EC4] dark:bg-[#c9b8ff] contrast:bg-accent",
  concurso: "bg-[#C45C00] contrast:bg-primary",
};
