import type { Metadata } from "next";

import { AcessoRestrito } from "@/components/acesso-restrito";
import { ChavesAdmin } from "@/components/chaves-admin";
import { FontesManager } from "@/components/fontes-manager";
import { paginaAdminLiberada } from "@/lib/admin-page";

export const metadata: Metadata = {
  title: "Manutenção da base",
  description: "Fontes internas usadas para atualizar a base de oportunidades.",
  robots: { index: false, follow: false },
};

export default async function FontesPage() {
  if (!(await paginaAdminLiberada())) {
    return <AcessoRestrito />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-sm text-muted-foreground">Uso interno</p>
      <h1 className="mt-4 font-heading text-4xl tracking-tight">Fontes da base</h1>
      <p className="mt-3 text-muted-foreground">
        Quem consome a API não vê esta tela. Aqui a Trilha da Oportunidade atualiza
        o acervo a partir de sites e RSS que nós mesmos acompanhamos.
      </p>
      <div className="mt-8">
        <FontesManager />
      </div>
      <div className="mt-12">
        <ChavesAdmin />
      </div>
    </div>
  );
}
