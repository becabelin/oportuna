import type { Metadata } from "next";
import { pageSocial } from "@/lib/site";

import { KeyRequestForm } from "@/components/key-request-form";
import { Card, CardContent } from "@/components/ui/card";
import { LIMITES_API, LIMITES_IP } from "@/lib/limites-api";

export const metadata: Metadata = pageSocial(
  "/chave",
  "Pedir chave da API",
  "Gere de graça uma chave para consultar bolsas, eventos e editais da Trilha da Oportunidade no seu aplicativo."
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
          O mural no site continua aberto. A chave libera a API para o seu app
          consultar a base, com um teto que protege o servidor.
        </p>
        <div className="mt-6 grid gap-3 text-sm leading-relaxed">
          {[
            ["Grátis para começar.", "Cada consulta é um pedacinho de função na Vercel. No plano Hobby isso entra no pacote até o tráfego crescer."],
            ["Teto por chave:", `${LIMITES_API.porMinuto} chamadas por minuto, ${LIMITES_API.porDia.toLocaleString("pt-BR")} por dia. Cabe um app de verdade.`],
            ["Teto por IP:", `${LIMITES_IP.porMinuto}/min e ${LIMITES_IP.porDia.toLocaleString("pt-BR")}/dia, inclusive no mural, para a fila continuar justa.`],
            ["Custo se crescer:", "O que pesa é invocação e banda. Se o tráfego crescer, sobe o plano ou aperta o teto. A chave continua sendo o acesso à base."],
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
