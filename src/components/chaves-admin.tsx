"use client";

import { useEffect, useState } from "react";
import { Ban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ChavePublica = {
  id: string;
  prefixo: string;
  nome: string;
  email: string;
  projeto: string;
  status: "ativa" | "revogada";
  criadaEm: string;
  ultimoUsoEm: string | null;
  usos: number;
};

function formatWhen(iso: string | null) {
  if (!iso) return "ainda não usada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ChavesAdmin() {
  const [chaves, setChaves] = useState<ChavePublica[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const response = await fetch("/api/chaves");
      if (!response.ok) throw new Error("Não foi possível listar as chaves.");
      const body = (await response.json()) as { data: ChavePublica[] };
      setChaves(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar chaves.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function revogar(id: string) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/chaves/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Não foi possível revogar esta chave.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao revogar.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="font-heading text-xl">Chaves da API</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          O segredo completo só aparece na hora da emissão. Aqui dá para ver o
          prefixo e revogar se vazar.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm"
        >
          {error}
        </p>
      ) : null}

      <p role="status" className="text-sm text-muted-foreground">
        {chaves
          ? `${chaves.length} ${chaves.length === 1 ? "chave" : "chaves"}`
          : "Carregando chaves…"}
      </p>

      {chaves && chaves.length === 0 ? (
        <p className="rounded-2xl border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">
          Ninguém pediu chave ainda.
        </p>
      ) : null}

      <ul className="grid gap-3">
        {(chaves ?? []).map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-sm">{item.prefixo}…</p>
                <Badge variant="outline">
                  {item.status === "ativa" ? "ativa" : "revogada"}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm">
                {item.nome} · {item.email}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.projeto} · {item.usos} usos · último {formatWhen(item.ultimoUsoEm)}
              </p>
            </div>
            {item.status === "ativa" ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={busyId === item.id}
                onClick={() => {
                  if (!window.confirm(`Revogar a chave ${item.prefixo}…? Ela para de funcionar na hora.`)) {
                    return;
                  }
                  void revogar(item.id);
                }}
              >
                <Ban aria-hidden className="size-3.5" />
                Revogar
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
