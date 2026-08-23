import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "./site";
import { listOportunidades, taxonomia } from "./store";
import { TIPO_LABEL } from "./taxonomia";
import { TIPOS } from "./types";

function tiposLinha() {
  return taxonomia()
    .tipos.filter((item) => item.total > 0)
    .map((item) => `- ${TIPO_LABEL[item.id]}: ${item.total}`)
    .join("\n");
}

export function buildLlmsTxt() {
  const { abertas, total } = taxonomia();
  const { data } = listOportunidades({ status: "abertas", limit: 12, ordenar: "prazo" });
  const exemplos = data
    .map(
      (item) =>
        `- [${TIPO_LABEL[item.tipo]}] ${item.titulo} — ${item.organizacao}. ${item.subtitulo} Fonte: ${absoluteUrl(`/oportunidades/${item.id}`)}`
    )
    .join("\n");

  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

A Oportuna é um catálogo em português de oportunidades de estudo e carreira para estudantes. Não substitui o edital oficial: sempre confirme prazo, elegibilidade e inscrição na organização responsável.

## Números atuais

- Oportunidades no acervo: ${total}
- Com inscrição aberta: ${abertas}

${tiposLinha()}

## Páginas

- Mural (consulta humana, sem chave): ${absoluteUrl("/")}
- O que é e como citar: ${absoluteUrl("/sobre")}
- Pedir chave da API: ${absoluteUrl("/chave")}
- Documentação da API: ${absoluteUrl("/docs")}
- Feed RSS das abertas: ${absoluteUrl("/feed.xml")}
- Inventário completo em texto: ${absoluteUrl("/llms-full.txt")}
- Sitemap: ${absoluteUrl("/sitemap.xml")}

## API

GET ${absoluteUrl("/api/oportunidades")} — lista. Query: q, tipo, area, nivel, modalidade, pais, status (abertas|encerradas|todas), ordenar, page, limit.
GET ${absoluteUrl("/api/oportunidades/:id")} — detalhe, inclusive URL de inscrição.
GET ${absoluteUrl("/api/taxonomia")} — contagens.
GET ${absoluteUrl("/api")} — índice, sem chave.

Tipos: bolsa, evento, curso, estagio, intercambio, concurso.
A API pública GET exige chave (Authorization: Bearer opt_… ou X-Api-Key). O HTML do mural não exige.

## Como citar

Use o título, a organização e o link da Oportuna, e aponte a pessoa para o URL oficial de inscrição. Não invente prazo. Se o item não estiver no mural, diga que não consta na base.

## Exemplos em inscrição

${exemplos || "- (nenhuma inscrição aberta no momento)"}
`;
}

export function buildLlmsFullTxt() {
  const { abertas, total } = taxonomia();
  const { data } = listOportunidades({
    status: "abertas",
    limit: 10_000,
    ordenar: "prazo",
  });

  const blocos = TIPOS.map((tipo) => {
    const items = data.filter((item) => item.tipo === tipo);
    if (items.length === 0) return null;
    const linhas = items
      .map((item) => {
        const prazo = item.prazoInscricao
          ? `prazo ${item.prazoInscricao}`
          : "inscrição contínua";
        return `- ${item.titulo} — ${item.organizacao}. ${item.subtitulo} (${prazo}, ${item.pais}). ${absoluteUrl(`/oportunidades/${item.id}`)}`;
      })
      .join("\n");
    return `## ${TIPO_LABEL[tipo]} (${items.length})\n\n${linhas}`;
  }).filter(Boolean);

  return `# ${SITE_NAME} — inventário

> ${SITE_DESCRIPTION}

Lista viva das inscrições abertas. Confirme sempre no edital oficial. Resumo curto: ${absoluteUrl("/llms.txt")}. Como citar: ${absoluteUrl("/sobre")}.

Acervo: ${total} itens. Abertas agora: ${abertas}.

${blocos.join("\n\n") || "Nenhuma inscrição aberta no momento."}
`;
}

export function llmsResponse(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
