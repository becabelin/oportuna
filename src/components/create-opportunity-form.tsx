"use client";

import { useState, type FormEvent, type SelectHTMLAttributes } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { capitalizeTag } from "@/lib/format";
import { AREAS, MODALIDADE_LABEL, NIVEL_LABEL, PAISES, TIPO_LABEL } from "@/lib/taxonomia";
import type { ApiError, Oportunidade } from "@/lib/types";
import { MODALIDADES, NIVEIS, TIPOS } from "@/lib/types";

function FieldSelect({
  id,
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function CreateOpportunityForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setDetails({});

    const form = new FormData(event.currentTarget);
    const split = (value: FormDataEntryValue | null) =>
      String(value ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const payload = {
      titulo: String(form.get("titulo") ?? "").trim(),
      tipo: String(form.get("tipo") ?? ""),
      organizacao: String(form.get("organizacao") ?? "").trim(),
      descricao: String(form.get("descricao") ?? "").trim(),
      area: String(form.get("area") ?? ""),
      nivel: String(form.get("nivel") ?? ""),
      modalidade: String(form.get("modalidade") ?? ""),
      pais: String(form.get("pais") ?? ""),
      cidade: String(form.get("cidade") ?? "").trim() || null,
      beneficio: String(form.get("beneficio") ?? "").trim() || null,
      prazoInscricao: String(form.get("prazoInscricao") ?? "") || null,
      dataInicio: String(form.get("dataInicio") ?? "") || null,
      dataFim: String(form.get("dataFim") ?? "") || null,
      urlInscricao: String(form.get("urlInscricao") ?? "").trim(),
      requisitos: split(form.get("requisitos")),
      tags: String(form.get("tags") ?? "")
        .split(",")
        .map((tag) => capitalizeTag(tag))
        .filter(Boolean),
      vagas: form.get("vagas") ? Number(form.get("vagas")) : null,
    };

    try {
      const response = await fetch("/api/oportunidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = (await response.json()) as ApiError;
        setError(body.error.message);
        setDetails(body.error.details ?? {});
        return;
      }
      const body = (await response.json()) as { data: Oportunidade };
      router.push(`/oportunidades/${body.data.id}`);
      router.refresh();
    } catch {
      setError("Não foi possível enviar o cadastro. Tente de novo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {error ? (
        <Alert variant="destructive" className="border-destructive/40">
          <AlertTitle>{error}</AlertTitle>
          {Object.keys(details).length > 0 ? (
            <AlertDescription>
              <ul className="list-disc pl-4">
                {Object.entries(details).map(([field, message]) => (
                  <li key={field}>
                    {field}: {message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          ) : null}
        </Alert>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          name="titulo"
          required
          placeholder="Bolsa de mestrado em inteligência artificial"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldSelect id="tipo" name="tipo" label="Tipo" required defaultValue="bolsa">
          {TIPOS.map((tipo) => (
            <option key={tipo} value={tipo}>
              {TIPO_LABEL[tipo]}
            </option>
          ))}
        </FieldSelect>
        <div className="grid gap-1.5">
          <Label htmlFor="organizacao">Organização</Label>
          <Input id="organizacao" name="organizacao" required placeholder="CAPES, NASA, sua universidade…" />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          name="descricao"
          required
          rows={5}
          placeholder="Quem pode se inscrever, o que a oportunidade oferece e como funciona a seleção."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FieldSelect id="area" name="area" label="Área" required defaultValue="Multidisciplinar">
          {AREAS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </FieldSelect>
        <FieldSelect id="nivel" name="nivel" label="Nível" required defaultValue="graduacao">
          {NIVEIS.map((nivel) => (
            <option key={nivel} value={nivel}>
              {NIVEL_LABEL[nivel]}
            </option>
          ))}
        </FieldSelect>
        <FieldSelect
          id="modalidade"
          name="modalidade"
          label="Modalidade"
          required
          defaultValue="presencial"
        >
          {MODALIDADES.map((modalidade) => (
            <option key={modalidade} value={modalidade}>
              {MODALIDADE_LABEL[modalidade]}
            </option>
          ))}
        </FieldSelect>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FieldSelect id="pais" name="pais" label="País" required defaultValue="Brasil">
          {PAISES.map((pais) => (
            <option key={pais} value={pais}>
              {pais}
            </option>
          ))}
        </FieldSelect>
        <div className="grid gap-1.5">
          <Label htmlFor="cidade">Cidade (opcional)</Label>
          <Input id="cidade" name="cidade" placeholder="São Paulo" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="beneficio">Benefício</Label>
          <Input id="beneficio" name="beneficio" placeholder="R$ 2.100/mês" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="prazoInscricao">Prazo de inscrição</Label>
          <Input id="prazoInscricao" name="prazoInscricao" type="date" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dataInicio">Início</Label>
          <Input id="dataInicio" name="dataInicio" type="date" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dataFim">Término</Label>
          <Input id="dataFim" name="dataFim" type="date" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="urlInscricao">URL de inscrição</Label>
          <Input
            id="urlInscricao"
            name="urlInscricao"
            type="url"
            required
            placeholder="https://"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="vagas">Vagas (opcional)</Label>
          <Input id="vagas" name="vagas" type="number" min={1} placeholder="Ilimitado" />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="requisitos">Requisitos (um por linha)</Label>
        <Textarea id="requisitos" name="requisitos" rows={4} placeholder={"Estar matriculado na graduação\nInglês intermediário"} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
        <Input id="tags" name="tags" placeholder="Mestrado, Pesquisa, Internacional" />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Publicando…" : "Publicar oportunidade"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
