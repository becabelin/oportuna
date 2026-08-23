import type { Metadata } from "next";

import { KeyRequestForm } from "@/components/key-request-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pedir chave da API",
  description:
    "Gere de graça uma chave para consultar bolsas, eventos e editais da Oportuna no seu aplicativo. Teto por chave para não estourar o servidor.",
  alternates: { canonical: "/chave" },
};

export default function ChavePage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div>
        <p className="inline-block -rotate-2 rounded-md border-2 border-foreground bg-accent px-2 py-0.5 text-xs font-black uppercase">
          para quem vai integrar
        </p>
        <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
          Pede a chave, cola no app, puxa o mural.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-foreground/80 sm:text-lg">
          O site continua aberto. A chave é só para chamada de API — o tipo de
          coisa que um bot faria mil vezes. Assim a conta de servidor não some
          no primeiro script maluco.
        </p>
        <div className="mt-6 grid gap-3 text-sm leading-relaxed">
          {[
            ["Não cobra nada agora.", "Cada consulta é um pedacinho de função na Vercel. No plano Hobby isso entra no pacote grátis até o tráfego ficar grande."],
            ["Teto por chave:", "120 chamadas por minuto, 5 mil por dia. Um app de verdade quase não encosta nisso. Um scraper encosta."],
            ["Custo se crescer:", "o que pesa é invocação + banda, não “por bolsa”. Se estourar o grátis, sobe o plano ou a gente coloca um teto mais baixo — não é cobrança por aluno."],
            ["Onde a chave mora:", "no computador, em data/chaves.json. Na Vercel o disco some entre deploys — para produção de verdade ainda precisa de um KV. Enquanto isso, peça de novo se a chave “sumir”."],
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
