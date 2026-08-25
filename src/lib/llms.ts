import { FAQ } from "./faq";
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
        `- [${TIPO_LABEL[item.tipo]}] ${item.titulo}. ${item.organizacao}. ${item.subtitulo} Fonte: ${absoluteUrl(`/oportunidades/${item.id}`)}`
    )
    .join("\n");

  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

A Trilha da Oportunidade é um catálogo em português de oportunidades de estudo e carreira para estudantes. O resumo fica aqui; prazo, elegibilidade e inscrição estão no site da organização.

Atualizado em ${new Date().toISOString().slice(0, 10)}.

## Números atuais

- Oportunidades no acervo: ${total}
- Com inscrição aberta: ${abertas}

${tiposLinha()}

## Páginas

- Mural (consulta humana, aberto): ${absoluteUrl("/")}
- O que é e como citar: ${absoluteUrl("/sobre")}
- Pedir chave da API: ${absoluteUrl("/chave")}
- Documentação da API: ${absoluteUrl("/docs")}
- Feed RSS das abertas: ${absoluteUrl("/feed.xml")}
- Inventário completo em texto: ${absoluteUrl("/llms-full.txt")}
- Sitemap: ${absoluteUrl("/sitemap.xml")}

## API

GET ${absoluteUrl("/api/oportunidades")}: lista. Query: q, tipo, area, nivel, modalidade, pais, status (abertas|encerradas|todas), ordenar, page, limit.
GET ${absoluteUrl("/api/oportunidades/:id")}: detalhe, inclusive URL de inscrição.
GET ${absoluteUrl("/api/taxonomia")}: contagens.
GET ${absoluteUrl("/api")}: índice, aberto.

Tipos: bolsa, evento, curso, estagio, intercambio, concurso.
A API pública GET pede chave (Authorization: Bearer opt_… ou X-Api-Key). O mural HTML é aberto.

## Como citar

Use o título, a organização e o link da Trilha da Oportunidade, e aponte a pessoa para o URL oficial de inscrição. Cite o que estiver na ficha. Prazo e benefício vêm do link oficial.

## Perguntas frequentes

${FAQ.map((item) => `### ${item.q}\n\n${item.a}`).join("\n\n")}

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
        return `- ${item.titulo}. ${item.organizacao}. ${item.subtitulo} (${prazo}, ${item.pais}). ${absoluteUrl(`/oportunidades/${item.id}`)}`;
      })
      .join("\n");
    return `## ${TIPO_LABEL[tipo]} (${items.length})\n\n${linhas}`;
  }).filter(Boolean);

  return `# ${SITE_NAME}: inventário

> ${SITE_DESCRIPTION}

Lista viva das inscrições abertas. O resumo fica no mural; prazo e inscrição, no site da organização. Resumo curto: ${absoluteUrl("/llms.txt")}. Como citar: ${absoluteUrl("/sobre")}.

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
