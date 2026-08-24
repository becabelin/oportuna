import type { Metadata } from "next";

import { CreateOpportunityForm } from "@/components/create-opportunity-form";

export const metadata: Metadata = {
  title: "Cadastrar oportunidade",
  description: "Publique um edital de bolsa, evento, curso, estágio ou intercâmbio.",
  robots: { index: false, follow: false },
};

export default function CadastrarPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-bold">
        Novo edital
      </p>
      <h1 className="mt-4 font-heading text-4xl tracking-tight">Cadastrar oportunidade</h1>
      <p className="mt-3 text-muted-foreground">
        Inclusão avulsa na base, para um edital que não veio da coleta automática.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-[0_10px_28px_rgba(0,26,76,0.07)] sm:p-6">
        <CreateOpportunityForm />
      </div>
    </div>
  );
}
