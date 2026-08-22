import type { Modalidade, Nivel, TipoOportunidade } from "./types";

export const TIPO_LABEL: Record<TipoOportunidade, string> = {
  bolsa: "Bolsa",
  evento: "Evento",
  curso: "Curso",
  estagio: "Estágio",
  intercambio: "Intercâmbio",
  concurso: "Concurso",
};

export const NIVEL_LABEL: Record<Nivel, string> = {
  "ensino-medio": "Ensino médio",
  graduacao: "Graduação",
  "pos-graduacao": "Pós-graduação",
  todos: "Todos os níveis",
};

export const MODALIDADE_LABEL: Record<Modalidade, string> = {
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
};

export const AREAS = [
  "Ciência da Computação",
  "Engenharia",
  "Saúde",
  "Ciências Humanas",
  "Ciências Exatas",
  "Negócios",
  "Artes e Design",
  "UX e Produto",
  "Meio Ambiente",
  "Multidisciplinar",
] as const;

export const PAISES = [
  "Brasil",
  "Alemanha",
  "Estados Unidos",
  "Reino Unido",
  "França",
  "Portugal",
  "União Europeia",
  "Internacional",
] as const;
