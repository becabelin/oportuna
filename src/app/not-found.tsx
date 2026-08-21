import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">404</p>
      <h1 className="mt-2 font-heading text-4xl">Esse edital não está no catálogo.</h1>
      <p className="mt-3 text-muted-foreground">
        O link pode ter expirado ou o identificador está errado. Volte ao catálogo e busque
        de novo.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-6")}>
        Ver oportunidades
      </Link>
    </div>
  );
}
