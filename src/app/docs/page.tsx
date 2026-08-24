import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LIMITES_API } from "@/lib/limites-api";
import { cn } from "@/lib/utils";

import { pageSocial } from "@/lib/site";

export const metadata: Metadata = pageSocial(
  "/docs",
  "Documentação da API",
  "Como pedir uma chave e consultar a base da Trilha da Oportunidade: listar bolsas, eventos, estágios e intercâmbios via REST."
);

const endpoints = [
  {
    method: "POST",
    path: "/api/chaves",
    desc: "Pede uma chave. Corpo: nome, email, projeto. A chave volta uma vez só.",
  },
  {
    method: "GET",
    path: "/api",
    desc: "Índice da API — este não precisa de chave.",
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
  ["q", "Busca em título, subtítulo, organização, descrição, tags e requisitos."],
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
      <p className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-bold">
        REST · precisa de chave
      </p>
      <h1 className="mt-4 font-heading text-4xl tracking-tight sm:text-5xl">API da Trilha</h1>
      <p className="mt-3 text-foreground">
        O mural no site é livre. Para o <em>seu</em> app consultar a base, manda a
        chave no header. CORS liberado. Datas em{" "}
        <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm">AAAA-MM-DD</code>.
        Teto: {LIMITES_API.porMinuto}/min e {LIMITES_API.porDia}/dia por chave.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/chave" className={cn(buttonVariants())}>
          Pedir chave
        </Link>
        <Link href="/api" className={cn(buttonVariants({ variant: "outline" }))}>
          Abrir /api
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Uma chamada</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-foreground p-4 text-sm text-background shadow-none">
          <code>
            {`curl -H "Authorization: Bearer opt_SUA_CHAVE" \\
  "https://SEU_HOST/api/oportunidades?status=abertas&limit=todas"`}
          </code>
        </pre>
        <p className="mt-3 text-sm text-muted-foreground">
          Também vale o header <code className="rounded bg-muted px-1.5 py-0.5">X-Api-Key</code>.
          A resposta vem como{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">{`{ "data": [...], "meta": { total, page, limit, totalPages } }`}</code>.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Custo, sem enrolação</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
          <p>
            Cada GET na API gasta um pouquinho de servidor (função) e de banda. No
            Hobby da Vercel isso é de graça até um volume alto — pensa em centenas
            de milhares de chamadas no mês, não em um app de faculdade.
          </p>
          <p>
            A chave não é para te cobrar. É para um robô não baixar o mural 80 mil
            vezes e queimar o plano. Se um dia o tráfego real crescer, a gente
            aperta o teto ou sobe o plano. Não existe “R$ por bolsa”.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Endpoints</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_28px_rgba(0,26,76,0.07)]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-28">Método</TableHead>
                <TableHead>Caminho</TableHead>
                <TableHead className="hidden sm:table-cell">O que faz</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map((endpoint) => (
                <TableRow key={endpoint.method + endpoint.path}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] font-black tracking-wide">
                      {endpoint.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm">{endpoint.path}</code>
                    <p className="mt-1 text-sm text-muted-foreground sm:hidden">{endpoint.desc}</p>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {endpoint.desc}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Filtros</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/15 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32">Filtro</TableHead>
                <TableHead>Uso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryParams.map(([name, desc]) => (
                <TableRow key={name}>
                  <TableCell>
                    <code className="text-sm">{name}</code>
                  </TableCell>
                  <TableCell className="whitespace-normal text-sm text-muted-foreground">
                    {desc}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Erros</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Sempre no formato{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">{`{ "error": { "code", "message", "details?" } }`}</code>
          . Sem chave: <code>missing_api_key</code> (401). Estourou teto:{" "}
          <code>rate_limited</code> (429). Outros: <code>not_found</code> (404),{" "}
          <code>invalid_json</code> (400), <code>validation_error</code> (422).
        </p>
      </section>
    </div>
  );
}
