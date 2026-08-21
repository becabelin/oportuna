"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiError, Fonte, Oportunidade } from "@/lib/types";

export function AddSourceForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/fontes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const body = (await response.json()) as {
        data?: Fonte;
        oportunidades?: Oportunidade[];
        erro?: string | null;
        error?: ApiError["error"];
      };
      if (!response.ok) {
        setError(body.error?.message ?? "Não foi possível adicionar a fonte.");
        return;
      }
      const total = body.oportunidades?.length ?? 0;
      if (body.erro) {
        setError(`Fonte salva, mas a coleta falhou: ${body.erro}`);
      } else {
        setMessage(
          total === 1
            ? "Fonte adicionada. 1 oportunidade aberta encontrada."
            : `Fonte adicionada. ${total} oportunidades encontradas.`
        );
        setUrl("");
      }
      router.refresh();
      window.dispatchEvent(new Event("oportuna:atualizou"));
    } catch {
      setError("Falha de rede ao coletar a fonte.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "grid gap-2" : "grid gap-3"}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://site-de-bolsas.edu/editais"
            className="h-10 pl-8"
            aria-label="URL da fonte"
          />
        </div>
        <Button type="submit" disabled={pending} className="h-10">
          {pending ? "Coletando…" : "Adicionar e coletar"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
    </form>
  );
}
