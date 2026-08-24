import type { Metadata } from "next";
import { pageSocial } from "@/lib/site";

import { KeyRequestForm } from "@/components/key-request-form";
import { Card, CardContent } from "@/components/ui/card";
import { LIMITES_API, LIMITES_IP } from "@/lib/limites-api";

export const metadata: Metadata = pageSocial(
  "/chave",
  "Pedir chave da API",
  "Gere de graça uma chave para consultar bolsas, eventos e editais da Trilha da Oportunidade no seu aplicativo. Teto por chave para não estourar o servidor."
);

export default function ChavePage() {
  return (
    <div className="mx-auto grid w-full max-w-[1120px] gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div>
        <p className="text-sm text-muted-foreground">
          para quem vai integrar
        </p>
        <h1 className="mt-4 font-heading text-4xl leading-[1.1] tracking-tight sm:text-5xl">
          Pede a chave, cola no app, puxa o mural.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-foreground sm:text-lg">
          O site continua aberto. A chave é só para chamada de API, o tipo de
          coisa que um bot faria mil vezes. Assim a conta de servidor não some
          no primeiro script maluco.
        </p>
        <div className="mt-6 grid gap-3 text-sm leading-relaxed">
          {[
            ["Não cobra nada agora.", "Cada consulta é um pedacinho de função na Vercel. No plano Hobby isso entra no pacote grátis até o tráfego ficar grande."],
            ["Teto por chave:", `${LIMITES_API.porMinuto} chamadas por minuto, ${LIMITES_API.porDia.toLocaleString("pt-BR")} por dia. Um app de verdade quase não encosta nisso. Um scraper encosta.`],
            ["Teto por IP:", `${LIMITES_IP.porMinuto}/min e ${LIMITES_IP.porDia.toLocaleString("pt-BR")}/dia, mesmo no mural. Assim ninguém fura a fila forjando a origem do site.`],
            ["Custo se crescer:", "o que pesa é invocação + banda, não “por bolsa”. Se estourar o grátis, sobe o plano ou a gente coloca um teto mais baixo. Não é cobrança por aluno."],
            ["Onde a chave mora:", "só o hash fica guardado. Em disco local, em data/chaves.json; na Vercel, no Redis (Upstash). O texto opt_… aparece uma vez. Se vazar, revogue em /fontes."],
          ].map(([title, body]) => (
            <Card key={title} size="sm">
              <CardContent>
                <p>
                  <strong>{title}</strong> {body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <KeyRequestForm />
    </div>
  );
}
