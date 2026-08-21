import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Documentação da API",
  description: "Referência da API REST da Oportuna: listagem, filtros e cadastro de oportunidades.",
};

const endpoints = [
  {
    method: "GET",
    path: "/api",
    desc: "Índice da API, enumerações e resumo das oportunidades carregadas.",
  },
  {
    method: "GET",
    path: "/api/taxonomia",
    desc: "Tipos, áreas, níveis, modalidades e países, cada um com a contagem atual.",
  },
  {
    method: "GET",
    path: "/api/fontes",
    desc: "Lista as URLs monitoradas e o status da última coleta.",
  },
  {
    method: "POST",
    path: "/api/fontes",
    desc: "Adiciona um link e coleta na hora. Corpo: { url, tipo? }.",
  },
  {
    method: "POST",
    path: "/api/fontes/:id/coletar",
    desc: "Roda a coleta de novo numa fonte.",
  },
  {
    method: "GET ou POST",
    path: "/api/coletar",
    desc: "Atualiza todas as fontes. Útil como cron a cada 30 minutos.",
  },
  {
    method: "GET",
    path: "/api/oportunidades",
    desc: "Lista paginada. Aceita filtros por query string.",
  },
  {
    method: "POST",
    path: "/api/oportunidades",
    desc: "Cadastra uma oportunidade. Corpo JSON. Resposta 201 com Location.",
  },
  {
    method: "GET",
    path: "/api/oportunidades/:id",
    desc: "Detalhe de uma oportunidade.",
  },
  {
    method: "PATCH",
    path: "/api/oportunidades/:id",
    desc: "Atualização parcial. Campos omitidos permanecem iguais.",
  },
  {
    method: "DELETE",
    path: "/api/oportunidades/:id",
    desc: "Remove. Resposta 204 sem corpo.",
  },
];

const queryParams = [
  ["q", "Busca em título, organização, descrição, tags e requisitos."],
  ["tipo", "bolsa, evento, curso, estagio, intercambio ou concurso. Vários valores separados por vírgula."],
  ["area", "Ex.: Ciência da Computação, Engenharia, Saúde."],
  ["nivel", "ensino-medio, graduacao, pos-graduacao ou todos."],
  ["modalidade", "presencial, remoto ou hibrido."],
  ["pais", "Brasil, Alemanha, Estados Unidos…"],
  ["status", "abertas (padrão), encerradas ou todas."],
  ["origem", "coleta (veio de um link) ou manual."],
  ["fonteId", "Só oportunidades de uma fonte."],
  ["ordenar", "prazo (padrão), recentes ou titulo."],
  ["page", "Página, a partir de 1."],
  ["limit", "Itens por página (máximo 100, padrão 20)."],
];

const example = `{
  "titulo": "Bolsa de verão em astronomia",
  "tipo": "bolsa",
  "organizacao": "Observatório Nacional",
  "descricao": "Três meses de iniciação científica em astrofísica observacional no Rio de Janeiro.",
  "area": "Ciências Exatas",
  "nivel": "graduacao",
  "modalidade": "presencial",
  "pais": "Brasil",
  "cidade": "Rio de Janeiro",
  "beneficio": "R$ 1.000/mês",
  "prazoInscricao": "2026-10-01",
  "dataInicio": "2027-01-05",
  "dataFim": "2027-03-31",
  "urlInscricao": "https://www.gov.br/observatorio",
  "requisitos": ["Cursando física, astronomia ou afins"],
  "tags": ["astronomia", "verão"],
  "vagas": 12
}`;

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">REST</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight">API Oportuna</h1>
      <p className="mt-3 text-muted-foreground">
        CORS liberado para qualquer origem. JSON em UTF-8. Datas no formato{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">AAAA-MM-DD</code>. O
        fluxo principal é cadastrar fontes (URLs); a coleta periódica preenche o
        catálogo. Os dados ficam em memória neste processo.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/api" className={cn(buttonVariants())}>
          Abrir /api
        </Link>
        <Link href="/api/oportunidades" className={cn(buttonVariants({ variant: "outline" }))}>
          Listar oportunidades
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Endpoints</h2>
        <ul className="mt-4 divide-y rounded-2xl border bg-card/80">
          {endpoints.map((endpoint) => (
            <li key={endpoint.method + endpoint.path} className="grid gap-1 px-4 py-3 sm:grid-cols-[7rem_1fr] sm:items-baseline">
              <span className="font-mono text-xs font-semibold tracking-wide text-primary">
                {endpoint.method}
              </span>
              <div>
                <code className="text-sm">{endpoint.path}</code>
                <p className="mt-1 text-sm text-muted-foreground">{endpoint.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Query de listagem</h2>
        <dl className="mt-4 grid gap-3">
          {queryParams.map(([name, desc]) => (
            <div key={name} className="grid gap-1 sm:grid-cols-[8rem_1fr]">
              <dt>
                <code className="text-sm">{name}</code>
              </dt>
              <dd className="text-sm text-muted-foreground">{desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Exemplo de busca</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl border bg-card p-4 text-sm">
          <code>
            {`curl "http://localhost:3847/api/oportunidades?tipo=bolsa&nivel=pos-graduacao&status=abertas"`}
          </code>
        </pre>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Adicionar uma fonte</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl border bg-card p-4 text-sm leading-relaxed">
          <code>{`curl -X POST http://localhost:3847/api/fontes \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://www.scholars4dev.com/feed/"}'`}</code>
        </pre>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Exemplo de cadastro manual</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl border bg-card p-4 text-sm leading-relaxed">
          <code>{`curl -X POST http://localhost:3847/api/oportunidades \\
  -H "Content-Type: application/json" \\
  -d '${example}'`}</code>
        </pre>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Erros</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Sempre no formato{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">{`{ "error": { "code", "message", "details?" } }`}</code>
          . Códigos: <code>invalid_json</code> (400), <code>not_found</code> (404),{" "}
          <code>validation_error</code> (422).
        </p>
      </section>
    </div>
  );
}
