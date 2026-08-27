import type { Metadata } from "next";

import { AcessoRestrito } from "@/components/acesso-restrito";
import { AdminBaseTabs } from "@/components/admin-base-tabs";
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
    <div className="mx-auto w-full min-w-0 max-w-3xl overflow-x-hidden px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-sm text-muted-foreground">Uso interno</p>
      <h1 className="mt-4 font-heading text-4xl tracking-tight">Manutenção da base</h1>
      <p className="mt-3 text-muted-foreground">
        Quem consome a API não vê esta tela. As fontes alimentam o mural. As chaves
        mostram quem pediu acesso à API.
      </p>
      <AdminBaseTabs />
    </div>
  );
}
