"use client";

import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
      <Card className="border border-border shadow-[0_12px_32px_rgba(0,26,76,0.08)]">
        <CardHeader>
          <p className="w-fit rounded-full bg-secondary px-2 py-0.5 text-xs font-bold">
            chave na mão
          </p>
          <CardTitle className="font-heading text-2xl">
            Guarde isso agora, {result.nome.split(" ")[0]}.
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
        <p className="text-sm text-foreground">
          A chave só aparece esta vez. Sem ela o app não consulta a base. Limite:{" "}
          {result.limites.porMinuto} chamadas/minuto e {result.limites.porDia}/dia.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-border/20 bg-muted p-3 text-sm break-all">
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
        <pre className="overflow-x-auto rounded-xl bg-foreground p-3 text-xs leading-relaxed text-background">
          {result.comoUsar.exemplo.replace("https://SEU_HOST", typeof window !== "undefined" ? window.location.origin : "")}
        </pre>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border border-border bg-card p-5 sm:p-6 sm:p-6">
      <FieldGroup className="grid gap-4">
      <p className="text-sm text-foreground">
        Sai na hora. Sem fila. Usamos o email só se a chave der problema — não tem
        newsletter escondida. Teto atual: {LIMITES_API.porMinuto}/min e{" "}
        {LIMITES_API.porDia}/dia.
      </p>
      <Field>
        <FieldLabel htmlFor="nome">Seu nome</FieldLabel>
        <Input id="nome" required value={nome} onChange={(event) => setNome(event.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="projeto">O que você vai montar?</FieldLabel>
        <Textarea
          id="projeto"
          required
          placeholder="App de bolsas para o centro acadêmico, bot no Discord, TCC…"
          value={projeto}
          onChange={(event) => setProjeto(event.target.value)}
        />
      </Field>
      {error ? (
        <Alert variant="destructive" className="border-2">
          <AlertTitle>Não rolou</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Carimbando…" : "Pedir minha chave"}
      </Button>
      </FieldGroup>
    </form>
  );
}
