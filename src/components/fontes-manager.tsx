"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Trash2 } from "lucide-react";

import { AddSourceForm } from "@/components/add-source-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Fonte } from "@/lib/types";

function formatWhen(iso: string | null) {
  if (!iso) return "ainda não puxada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function FontesManager() {
  const [fontes, setFontes] = useState<Fonte[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [coletandoTodas, setColetandoTodas] = useState(false);

  async function load() {
    setError(null);
    try {
      const response = await fetch("/api/fontes");
      if (!response.ok) throw new Error("Não foi possível listar as fontes.");
      const body = (await response.json()) as { data: Fonte[] };
      setFontes(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar fontes.");
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/fontes")
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível listar as fontes.");
        return (await response.json()) as { data: Fonte[] };
      })
      .then((body) => {
        if (!cancelled) setFontes(body.data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar fontes.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function coletar(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/fontes/${id}/coletar`, { method: "POST" });
      await load();
      window.dispatchEvent(new Event("oportuna:atualizou"));
    } finally {
      setBusyId(null);
    }
  }

  async function coletarTodas() {
    setColetandoTodas(true);
    try {
      await fetch("/api/coletar", { method: "POST" });
      await load();
      window.dispatchEvent(new Event("oportuna:atualizou"));
    } finally {
      setColetandoTodas(false);
    }
  }

  async function remover(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/fontes/${id}`, { method: "DELETE" });
      await load();
      window.dispatchEvent(new Event("oportuna:atualizou"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-8">
      <div className="rounded-2xl border bg-card/80 p-5">
        <h2 className="font-heading text-xl">Incluir fonte na base</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          RSS e páginas de editais que a Trilha da Oportunidade passa a monitorar. Não aparece para
          quem só consome a API.
        </p>
        <AddSourceForm />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {fontes
            ? `${fontes.length} ${fontes.length === 1 ? "fonte" : "fontes"} monitoradas`
            : "Carregando fontes…"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void coletarTodas()}
          disabled={coletandoTodas}
        >
          <RefreshCw className={coletandoTodas ? "size-3.5 animate-spin" : "size-3.5"} />
          Atualizar todas agora
        </Button>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {fontes && fontes.length === 0 ? (
        <p className="rounded-2xl border border-dashed px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhuma fonte ainda. Inclua um RSS ou página de editais acima.
        </p>
      ) : null}

      <ul className="grid gap-3">
        {(fontes ?? []).map((fonte) => (
          <li
            key={fonte.id}
            className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{fonte.titulo || new URL(fonte.url).hostname}</p>
                <Badge variant="outline">
                  {fonte.status === "ok"
                    ? "atualizada"
                    : fonte.status === "erro"
                      ? "erro"
                      : "na fila"}
                </Badge>
              </div>
              <a
                href={fonte.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block truncate text-sm text-muted-foreground hover:text-foreground"
              >
                {fonte.url}
              </a>
              <p className="mt-1 text-xs text-muted-foreground">
                {fonte.itensAbertos} abertas · última coleta {formatWhen(fonte.ultimaColeta)}
                {fonte.erro ? ` · ${fonte.erro}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/?fonteId=${fonte.id}`}>
                <Button variant="outline" size="sm">
                  Ver no catálogo
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                disabled={busyId === fonte.id}
                onClick={() => void coletar(fonte.id)}
              >
                <RefreshCw className="size-3.5" />
                Coletar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={busyId === fonte.id}
                onClick={() => void remover(fonte.id)}
              >
                <Trash2 className="size-3.5" />
                Remover
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
