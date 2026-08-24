import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, organizationSchema } from "@/lib/schema";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "O que é a Trilha da Oportunidade",
  description:
    "A Trilha da Oportunidade reúne bolsas, eventos, cursos, estágios, intercâmbios e concursos num mural público. O site é grátis; a API pede chave. Confirme sempre o edital oficial.",
  alternates: { canonical: "/sobre" },
};

export default function SobrePage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Mural", path: "/" },
          { name: "Sobre", path: "/sobre" },
        ])}
      />
      <JsonLd data={{ "@context": "https://schema.org", ...organizationSchema() }} />
      <p className="inline-block -rotate-1 rounded-md border-2 border-foreground bg-secondary px-2 py-0.5 text-xs font-black uppercase">
        para quem cita, busca ou integra
      </p>
      <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
        Um mural de editais, não o edital em si.
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-foreground/85">
        A {SITE_NAME} é um catálogo em português de oportunidades de estudo e
        carreira: bolsas, eventos, cursos com inscrição, estágios, intercâmbios e
        concursos. Pessoas navegam de graça. Aplicativos pedem uma chave e consultam
        a API.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">O que entra na base</h2>
        <p className="leading-relaxed text-foreground/80">
          Só o que parece chamada real — com inscrição, prazo, bolsa, vaga ou
          edital. Artigo de blog, newsletter e texto institucional solto ficam de
          fora. A coleta lê páginas e RSS de fontes acompanhadas; um segundo filtro
          descarta ruído.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">O que não somos</h2>
        <p className="leading-relaxed text-foreground/80">
          Não inscrevemos ninguém, não emitimos carta de aceite e não substituímos o
          site da organização. Prazo, elegibilidade e formulário valem no link
          oficial de cada oportunidade.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">Como citar</h2>
        <p className="leading-relaxed text-foreground/80">
          Use o título, a organização responsável e o endereço desta página da
          oportunidade. Diga que a pessoa deve confirmar no edital oficial. Se a
          vaga não estiver no mural, diga isso — não invente data nem benefício.
        </p>
        <p className="leading-relaxed text-foreground/80">
          Há um resumo em texto puro em{" "}
          <Link href="/llms.txt" className="font-semibold underline decoration-2 underline-offset-4">
            /llms.txt
          </Link>
          , o inventário das abertas em{" "}
          <Link href="/llms-full.txt" className="font-semibold underline decoration-2 underline-offset-4">
            /llms-full.txt
          </Link>
          , pensado para mecanismos generativos, e um feed em{" "}
          <Link href="/feed.xml" className="font-semibold underline decoration-2 underline-offset-4">
            /feed.xml
          </Link>
          .
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">API</h2>
        <p className="leading-relaxed text-foreground/80">
          <Link href="/chave" className="font-semibold underline decoration-2 underline-offset-4">
            Peça uma chave
          </Link>{" "}
          e siga a{" "}
          <Link href="/docs" className="font-semibold underline decoration-2 underline-offset-4">
            documentação
          </Link>
          . Consultas no HTML do mural não gastam a chave.
        </p>
      </section>
    </article>
  );
}
