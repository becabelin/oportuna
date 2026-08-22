import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Documentação da API",
  description: "Como puxar a base de oportunidades da Oportuna no seu aplicativo.",
};

const endpoints = [
  {
    method: "GET",
    path: "/api",
    desc: "Índice, enumerações e um resumo de quantas oportunidades existem na base.",
  },
  {
    method: "GET",
    path: "/api/taxonomia",
    desc: "Tipos, áreas, níveis, modalidades e países, cada um com a contagem atual.",
  },
  {
    method: "GET",
    path: "/api/oportunidades",
    desc: "Lista a base. Sem filtro devolve as inscrições ainda abertas. Use limit=todas para puxar tudo de uma vez.",
  },
  {
    method: "GET",
    path: "/api/oportunidades/:id",
    desc: "Detalhe de uma oportunidade, incluindo URL de inscrição.",
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
  ["ordenar", "prazo (padrão), recentes ou titulo."],
  ["page", "Página, a partir de 1."],
  ["limit", "Itens por página (padrão 50, máximo 10000). Use todas para o acervo inteiro."],
];

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">REST</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight">API Oportuna</h1>
      <p className="mt-3 text-muted-foreground">
        A base já vem preenchida. Nós coletamos editais em fontes oficiais e
        atualizamos o acervo. O seu app só autentica com HTTP: um GET devolve as
        oportunidades. CORS liberado. Datas em{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">AAAA-MM-DD</code>.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/api" className={cn(buttonVariants())}>
          Abrir /api
        </Link>
        <Link
          href="/api/oportunidades?status=abertas&limit=todas"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Puxar a base (JSON)
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Puxar todas as oportunidades</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl border bg-card p-4 text-sm">
          <code>
            {`curl "http://127.0.0.1:3847/api/oportunidades?status=abertas&limit=todas"`}
          </code>
        </pre>
        <p className="mt-3 text-sm text-muted-foreground">
          A resposta vem como{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">{`{ "data": [...], "meta": { total, page, limit, totalPages } }`}</code>
          . Cada item tem título, tipo, organização, prazo, URL de inscrição e o
          restante dos campos da base.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Endpoints públicos</h2>
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
        <h2 className="font-heading text-2xl">Filtros</h2>
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
        <h2 className="font-heading text-2xl">Exemplos</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl border bg-card p-4 text-sm leading-relaxed">
          <code>
            {`# Só bolsas ainda abertas
curl "http://127.0.0.1:3847/api/oportunidades?tipo=bolsa&status=abertas"

# Detalhe
curl "http://127.0.0.1:3847/api/oportunidades/pibic-cnpq-2026"`}
          </code>
        </pre>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Erros</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Sempre no formato{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">{`{ "error": { "code", "message", "details?" } }`}</code>
          . Códigos: <code>not_found</code> (404), <code>invalid_json</code> (400),{" "}
          <code>validation_error</code> (422).
        </p>
      </section>
    </div>
  );
}
