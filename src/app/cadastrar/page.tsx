import type { Metadata } from "next";

import { CreateOpportunityForm } from "@/components/create-opportunity-form";

export const metadata: Metadata = {
  title: "Cadastrar oportunidade",
  description: "Publique um edital de bolsa, evento, curso, estágio ou intercâmbio.",
};

export default function CadastrarPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">Novo edital</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight">Cadastrar oportunidade</h1>
      <p className="mt-3 text-muted-foreground">
        O cadastro vai para a API em memória deste servidor — útil para testar o{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">POST /api/oportunidades</code>.
        Em produção, ligue um banco.
      </p>
      <div className="mt-8 rounded-2xl border bg-card/80 p-5 sm:p-6">
        <CreateOpportunityForm />
      </div>
    </div>
  );
}
