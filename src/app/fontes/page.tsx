import type { Metadata } from "next";

import { FontesManager } from "@/components/fontes-manager";

export const metadata: Metadata = {
  title: "Manutenção da base",
  description: "Fontes internas usadas para atualizar a base de oportunidades.",
};

export default function FontesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="inline-block rotate-1 rounded-md border-2 border-foreground bg-accent px-2 py-0.5 text-xs font-black uppercase">
        Uso interno
      </p>
      <h1 className="mt-4 font-heading text-4xl tracking-tight">Fontes da base</h1>
      <p className="mt-3 text-muted-foreground">
        Quem consome a API não vê esta tela. Aqui a Oportuna atualiza o acervo a
        partir de sites e RSS que nós mesmos acompanhamos.
      </p>
      <div className="mt-8">
        <FontesManager />
      </div>
    </div>
  );
}
