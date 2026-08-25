import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, organizationSchema } from "@/lib/schema";
import { pageSocial, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = pageSocial(
  "/sobre",
  "O que é a Trilha da Oportunidade",
  "A Trilha da Oportunidade reúne bolsas, eventos, cursos, estágios, intercâmbios e concursos num mural público. O site é de graça. Quem integra um app pede uma chave."
);

export default function SobrePage() {
  return (
    <article className="mx-auto w-full max-w-[720px] px-5 py-12 sm:px-8 sm:py-16">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Mural", path: "/" },
          { name: "Sobre", path: "/sobre" },
        ])}
      />
      <JsonLd data={{ "@context": "https://schema.org", ...organizationSchema() }} />
      <p className="text-sm text-muted-foreground">
        para quem cita, busca ou integra
      </p>
      <h1 className="mt-4 font-heading text-4xl leading-[1.1] tracking-tight sm:text-5xl">
        Um mural com as chamadas abertas, prontas para você ler.
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-foreground">
        A {SITE_NAME} é um catálogo em português de oportunidades de estudo e
        carreira: bolsas, eventos, cursos com inscrição, estágios, intercâmbios e
        concursos. Pessoas navegam de graça. Aplicativos pedem uma chave e consultam
        a API.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">O que entra na base</h2>
        <p className="leading-relaxed text-foreground">
          Chamadas com inscrição, prazo, bolsa ou vaga. A coleta lê páginas e RSS
          de fontes acompanhadas e deixa no mural o que parece edital de verdade.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">Como se inscrever</h2>
        <p className="leading-relaxed text-foreground">
          Cada ficha aponta o site da organização. Lá você confirma prazo,
          elegibilidade e envia a inscrição.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">Como citar</h2>
        <p className="leading-relaxed text-foreground">
          Use o título, a organização responsável e o endereço desta página da
          oportunidade. Encaminhe a pessoa ao link oficial para prazo e benefício.
        </p>
        <p className="leading-relaxed text-foreground">
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
        <p className="leading-relaxed text-foreground">
          <Link href="/chave" className="font-semibold underline decoration-2 underline-offset-4">
            Peça uma chave
          </Link>{" "}
          e siga a{" "}
          <Link href="/docs" className="font-semibold underline decoration-2 underline-offset-4">
            documentação
          </Link>
          . O mural no site é aberto. A chave vale para o app consultar a API.
        </p>
      </section>
    </article>
  );
}
