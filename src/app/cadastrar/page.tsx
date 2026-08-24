import type { Metadata } from "next";

import { AcessoRestrito } from "@/components/acesso-restrito";
import { CreateOpportunityForm } from "@/components/create-opportunity-form";
import { paginaAdminLiberada } from "@/lib/admin-page";

export const metadata: Metadata = {
  title: "Cadastrar oportunidade",
  description: "Publique um edital de bolsa, evento, curso, estágio ou intercâmbio.",
  robots: { index: false, follow: false },
};

export default async function CadastrarPage() {
  if (!(await paginaAdminLiberada())) {
    return <AcessoRestrito />;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-sm text-muted-foreground">Novo edital</p>
      <h1 className="mt-4 font-heading text-4xl tracking-tight">Cadastrar oportunidade</h1>
      <p className="mt-3 text-muted-foreground">
        Inclusão avulsa na base, para um edital que não veio da coleta automática.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <CreateOpportunityForm />
      </div>
    </div>
  );
}
