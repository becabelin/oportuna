export const TIPOS = [
  "bolsa",
  "evento",
  "curso",
  "estagio",
  "intercambio",
  "concurso",
] as const;

export const NIVEIS = [
  "ensino-medio",
  "graduacao",
  "pos-graduacao",
  "todos",
] as const;

export const MODALIDADES = ["presencial", "remoto", "hibrido"] as const;

export type TipoOportunidade = (typeof TIPOS)[number];
export type Nivel = (typeof NIVEIS)[number];
export type Modalidade = (typeof MODALIDADES)[number];

export type OrigemOportunidade = "manual" | "coleta";

export type Oportunidade = {
  id: string;
  titulo: string;
  subtitulo: string;
  tipo: TipoOportunidade;
  organizacao: string;
  descricao: string;
  area: string;
  nivel: Nivel;
  modalidade: Modalidade;
  pais: string;
  cidade: string | null;
  beneficio: string | null;
  prazoInscricao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  urlInscricao: string;
  imagemUrl: string | null;
  requisitos: string[];
  tags: string[];
  vagas: number | null;
  origem: OrigemOportunidade;
  fonteId: string | null;
  fonteUrl: string | null;
  enriquecidoEm?: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type FonteStatus = "pendente" | "ok" | "erro";

export type Fonte = {
  id: string;
  url: string;
  titulo: string | null;
  tipoSugerido: TipoOportunidade | null;
  areaSugerida: string | null;
  status: FonteStatus;
  ultimaColeta: string | null;
  itensEncontrados: number;
  itensAbertos: number;
  erro: string | null;
  criadaEm: string;
};

export type NovaOportunidade = Omit<
  Oportunidade,
  "id" | "criadoEm" | "atualizadoEm"
>;

export type FiltrosOportunidade = {
  q?: string;
  tipo?: TipoOportunidade | TipoOportunidade[];
  area?: string;
  nivel?: Nivel;
  modalidade?: Modalidade;
  pais?: string;
  status?: "abertas" | "encerradas" | "todas";
  ordenar?: "prazo" | "recentes" | "titulo";
  fonteId?: string;
  origem?: OrigemOportunidade;
  page?: number;
  limit?: number;
};

export type PaginaOportunidades = {
  data: Oportunidade[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
};
