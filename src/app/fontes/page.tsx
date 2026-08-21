import type { Metadata } from "next";

import { FontesManager } from "@/components/fontes-manager";

export const metadata: Metadata = {
  title: "Fontes",
  description: "Cole links de bolsas e editais. A Oportuna coleta e mantém o que ainda está aberto.",
};

export default function FontesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">
        Monitoramento
      </p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight">Fontes</h1>
      <p className="mt-3 text-muted-foreground">
        Você manda o link. A cada 30 minutos — ou quando clicar em atualizar — a
        Oportuna busca de novo e fica só com oportunidades ainda abertas.
      </p>
      <div className="mt-8">
        <FontesManager />
      </div>
    </div>
  );
}
