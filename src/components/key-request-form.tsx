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
      <Card className="border border-border">
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
          A chave só aparece esta vez. Guarde para o app consultar a base. Limite:{" "}
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
          <span role="status" className="sr-only">
            {copied ? "Chave copiada para a área de transferência." : ""}
          </span>
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
        <p className="mt-4 text-sm font-medium text-foreground">Uma chamada, já com a sua chave</p>
        <pre className="overflow-x-auto rounded-xl bg-foreground p-3 text-xs leading-relaxed text-background">
          {result.comoUsar.exemplo.replace(
            "https://SEU_HOST",
            typeof window !== "undefined" ? window.location.origin : ""
          )}
        </pre>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <FieldGroup className="grid gap-4">
      <p id="chave-ajuda" className="text-sm text-foreground">
        Sai na hora. Usamos o email se a chave der problema. Teto por chave:{" "}
        {LIMITES_API.porMinuto}/min e {LIMITES_API.porDia}/dia. Por IP também tem
        teto, para o mural continuar rápido.
      </p>
      <Field>
        <FieldLabel htmlFor="nome">Seu nome</FieldLabel>
        <Input
          id="nome"
          name="name"
          autoComplete="name"
          required
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          aria-describedby={error ? "chave-erro chave-ajuda" : "chave-ajuda"}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={error ? "chave-erro chave-ajuda" : "chave-ajuda"}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="projeto">O que você vai montar?</FieldLabel>
        <Textarea
          id="projeto"
          name="organization"
          autoComplete="organization"
          required
          placeholder="App de bolsas para o centro acadêmico, bot no Discord, TCC…"
          value={projeto}
          onChange={(event) => setProjeto(event.target.value)}
          aria-describedby={error ? "chave-erro chave-ajuda" : "chave-ajuda"}
        />
      </Field>
      {error ? (
        <Alert id="chave-erro" variant="destructive">
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
