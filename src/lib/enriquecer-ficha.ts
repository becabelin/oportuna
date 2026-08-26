import * as cheerio from "cheerio";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";

import { fetchPublicPage } from "./coleta";
import { persistNow } from "./persist";
import {
  listFichasPendentesDeLeitura,
  updateOportunidade,
} from "./store";
import { AREAS } from "./taxonomia";
import { tituloForaDoEndereco } from "./triagem";
import type { Modalidade, Nivel, Oportunidade } from "./types";
import { MODALIDADES, NIVEIS } from "./types";

const TEXTO_MAX = 12_000;
const LOTE_PADRAO = 12;
const CONCORRENCIA = 3;

const fichaSchema = z.object({
  titulo: z.string().min(8).max(140),
  subtitulo: z.string().min(20).max(220),
  descricao: z.string().min(80).max(2500),
  organizacao: z.string().min(3).max(160),
  requisitos: z.array(z.string().min(8).max(280)).max(8),
  beneficio: z.string().max(160).nullable(),
  cidade: z.string().max(80).nullable(),
  area: z.enum(AREAS),
  nivel: z.enum(NIVEIS),
  modalidade: z.enum(MODALIDADES),
  vagas: z.number().int().positive().nullable(),
});

export function usaGatewayVercel() {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim() ||
      process.env.VERCEL_ENV
  );
}

export function iaPronta() {
  return Boolean(
    usaGatewayVercel() ||
      process.env.OPENAI_API_KEY?.trim() ||
      process.env.ANTHROPIC_API_KEY?.trim()
  );
}

function modeloLeitura() {
  if (usaGatewayVercel()) {
    return "google/gemini-3.7-flash";
  }
  if (process.env.OPENAI_API_KEY?.trim()) {
    return openai("gpt-5.4-mini");
  }
  return anthropic("claude-sonnet-4.6");
}

function semTravessao(texto: string) {
  return texto.replace(/[\u2013\u2014\u2212]/g, "-").trim();
}

function umaLinha(texto: string) {
  return semTravessao(texto).replace(/\s+/g, " ").trim();
}

function textoDaPagina(html: string) {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, noscript, iframe, svg, form").remove();
  const bloco =
    $("article").first().text() ||
    $("main").first().text() ||
    $("[role='main']").first().text() ||
    $("body").text();
  return bloco.replace(/\s+/g, " ").trim().slice(0, TEXTO_MAX);
}

async function mapPool<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      await fn(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => worker()));
}

export async function lerEdital(item: Oportunidade) {
  let daPagina = "";
  try {
    const pagina = await fetchPublicPage(item.urlInscricao);
    if (/html/i.test(pagina.contentType) || /<html/i.test(pagina.body.slice(0, 400))) {
      daPagina = textoDaPagina(pagina.body);
    }
  } catch {
    daPagina = "";
  }
  const doMural = [
    `Título coletado: ${item.titulo}`,
    `Organização: ${item.organizacao}`,
    item.subtitulo ? `Subtítulo: ${item.subtitulo}` : "",
    `Descrição coletada: ${item.descricao}`,
    item.beneficio ? `Benefício coletado: ${item.beneficio}` : "",
    item.requisitos.length ? `Requisitos coletados: ${item.requisitos.join("; ")}` : "",
    item.cidade ? `Cidade: ${item.cidade}` : "",
    `País: ${item.pais}`,
  ]
    .filter(Boolean)
    .join("\n");
  const edital =
    daPagina.length >= 180
      ? daPagina
      : `${doMural}\n\nTrecho da página oficial:\n${daPagina || "(a página não devolveu texto útil)"}`;

  const { output } = await generateText({
    model: modeloLeitura(),
    output: Output.object({ schema: fichaSchema }),
    system: `Você escreve fichas do mural Trilha da Oportunidade, em português do Brasil.

Regras:
- Use só o que está no texto do edital ou nos dados coletados. Se um dado não aparecer, deixe nulo ou a lista vazia. Não invente valor, prazo, vaga, e-mail ou requisito.
- A primeira frase da descrição diz o que é a oportunidade (tipo, para quem, o que a pessoa vai fazer).
- Depois explique atividades, benefício e como se inscrever, se o texto trouxer isso.
- Título claro, em português. Nada de jargão em inglês se o edital tiver equivalente em português.
- O título é o nome da oportunidade, nunca o endereço da rua, do teatro ou do mapa.
- Área pelo que a pessoa faz, não pelo prédio (Direito num museu = Ciências Humanas).
- Não use travessão. Não escreva como anúncio. Não peça para clicar. Lembre que a inscrição é no site da organização.
- Confirme datas e regras no texto; se o valor da bolsa estiver lá, copie com honestidade.
- Se a página oficial veio vazia, escreva com o que foi coletado e deixe claro que o detalhe está no site da organização.
- Separe a descrição em 2 ou 3 parágrafos.`,
    prompt: `Edital da oportunidade já listada no mural.

Tipo no mural: ${item.tipo}
Título coletado: ${item.titulo}
Organização coletada: ${item.organizacao}
URL: ${item.urlInscricao}

Texto da página oficial:
${edital}`,
  });

  if (!output) {
    throw new Error("A leitura não devolveu uma ficha.");
  }

  return {
    titulo: tituloForaDoEndereco(umaLinha(output.titulo), item.descricao).slice(0, 140),
    subtitulo: umaLinha(output.subtitulo).slice(0, 220),
    descricao: semTravessao(output.descricao).replace(/\n{3,}/g, "\n\n").slice(0, 4000),
    organizacao: umaLinha(output.organizacao).slice(0, 160),
    requisitos: output.requisitos.map((item) => umaLinha(item)).filter(Boolean).slice(0, 8),
    beneficio: output.beneficio ? umaLinha(output.beneficio).slice(0, 160) : null,
    cidade: output.cidade ? umaLinha(output.cidade).slice(0, 80) : item.cidade,
    area: output.area,
    nivel: output.nivel as Nivel,
    modalidade: output.modalidade as Modalidade,
    vagas: output.vagas,
  };
}

export async function enriquecerOportunidade(item: Oportunidade) {
  const ficha = await lerEdital(item);
  return updateOportunidade(item.id, {
    ...ficha,
    enriquecidoEm: new Date().toISOString(),
  });
}

export async function enriquecerFichasPendentes(opcoes: { limit?: number } = {}) {
  const limit = opcoes.limit ?? LOTE_PADRAO;
  const pendentes = listFichasPendentesDeLeitura().slice(0, limit);

  if (pendentes.length === 0) {
    return { total: 0, escritas: 0, erros: [] as Array<{ id: string; erro: string }> };
  }

  if (!iaPronta()) {
    return {
      total: pendentes.length,
      escritas: 0,
      erros: [
        {
          id: "-",
          erro: "Coloque OPENAI_API_KEY, ANTHROPIC_API_KEY ou AI_GATEWAY_API_KEY no .env.local.",
        },
      ],
    };
  }

  let escritas = 0;
  const erros: Array<{ id: string; erro: string }> = [];

  await mapPool(pendentes, CONCORRENCIA, async (item) => {
    try {
      await enriquecerOportunidade(item);
      escritas += 1;
    } catch (error) {
      erros.push({
        id: item.id,
        erro: error instanceof Error ? error.message : "Falha ao ler o edital.",
      });
    }
  });

  persistNow();
  return { total: pendentes.length, escritas, erros };
}
