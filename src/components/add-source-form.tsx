"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
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
      <Field>
        <FieldLabel htmlFor="fonte-url">URL da fonte</FieldLabel>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Link2 aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fonte-url"
              type="url"
              name="url"
              autoComplete="url"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://site-de-bolsas.edu/editais"
              className="min-w-0 w-full pl-8"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "fonte-erro" : message ? "fonte-ok" : undefined}
            />
          </div>
          <Button type="submit" disabled={pending} className="w-full shrink-0 sm:w-auto">
            {pending ? "Coletando…" : "Adicionar"}
          </Button>
        </div>
      </Field>
      {error ? (
        <p id="fonte-erro" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {message ? (
        <p id="fonte-ok" role="status" className="text-sm font-semibold text-foreground">
          {message}
        </p>
      ) : null}
    </form>
  );
}
