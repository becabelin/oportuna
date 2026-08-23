"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LIMITES_API } from "@/lib/limites-api";

type Resultado = {
  chave: string;
  nome: string;
  projeto: string;
  limites: { porMinuto: number; porDia: number };
  comoUsar: { header: string; exemplo: string };
};

export function KeyRequestForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [projeto, setProjeto] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Resultado | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/chaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, projeto }),
      });
      const json = (await response.json()) as { data?: Resultado; error?: { message: string } };
      if (!response.ok || !json.data) {
        throw new Error(json.error?.message ?? "Não deu para emitir a chave.");
      }
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border-2 border-foreground bg-card p-5 shadow-[6px_6px_0_0_var(--foreground)] sm:p-6">
        <p className="inline-block -rotate-1 rounded-md border-2 border-foreground bg-secondary px-2 py-0.5 text-xs font-black uppercase">
          chave na mão
        </p>
        <h2 className="mt-3 font-heading text-2xl">Guarde isso agora, {result.nome.split(" ")[0]}.</h2>
        <p className="mt-2 text-sm text-foreground/80">
          A chave só aparece esta vez. Sem ela o app não consulta a base. Limite:{" "}
          {result.limites.porMinuto} chamadas/minuto e {result.limites.porDia}/dia.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl border-2 border-foreground/20 bg-muted p-3 text-sm break-all">
          {result.chave}
        </pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(result.chave);
              setCopied(true);
            }}
          >
            {copied ? "Copiada" : "Copiar chave"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setResult(null);
              setCopied(false);
            }}
          >
            Pedir outra
          </Button>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-foreground p-3 text-xs leading-relaxed text-background">
          {result.comoUsar.exemplo.replace("https://SEU_HOST", typeof window !== "undefined" ? window.location.origin : "")}
        </pre>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border-2 border-foreground bg-card p-5 shadow-[6px_6px_0_0_var(--foreground)] sm:p-6">
      <p className="text-sm text-foreground/75">
        Sai na hora. Sem fila. Usamos o email só se a chave der problema — não tem
        newsletter escondida. Teto atual: {LIMITES_API.porMinuto}/min e{" "}
        {LIMITES_API.porDia}/dia.
      </p>
      <div className="grid gap-1.5">
        <Label htmlFor="nome">Seu nome</Label>
        <Input id="nome" required value={nome} onChange={(event) => setNome(event.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="projeto">O que você vai montar?</Label>
        <Textarea
          id="projeto"
          required
          placeholder="App de bolsas para o centro acadêmico, bot no Discord, TCC…"
          value={projeto}
          onChange={(event) => setProjeto(event.target.value)}
        />
      </div>
      {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Carimbando…" : "Pedir minha chave"}
      </Button>
    </form>
  );
}
