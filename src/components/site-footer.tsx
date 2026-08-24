import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { SiteContainer } from "@/components/editorial";
import { HomeLogoLink } from "@/components/home-logo-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-neutral-950 text-white contrast:border-t contrast:border-white contrast:bg-background contrast:text-foreground">
      <SiteContainer className="flex flex-col gap-4 border-b border-white/10 py-10 contrast:border-white sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl font-heading text-xl tracking-tight text-white sm:text-2xl contrast:text-foreground">
          O mural no site é livre. Para o seu app consultar a base, peça uma chave.
        </p>
        <Link
          href="/chave"
          className={cn(
            buttonVariants({ size: "sm" }),
            "min-h-11 shrink-0 rounded-lg bg-white px-5 text-[13px] text-neutral-950 hover:bg-white/90 contrast:border-black contrast:bg-primary contrast:text-primary-foreground"
          )}
        >
          Pedir chave
        </Link>
      </SiteContainer>
      <SiteContainer className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <HomeLogoLink className="inline-flex max-w-full rounded-md">
            <BrandMark tone="onDark" className="max-h-11 max-w-[14rem]" />
          </HomeLogoLink>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70 contrast:text-white">
            Insights, guias e editais para estudar e trabalhar, em português, de graça.
          </p>
        </div>
        <div>
          <p className="text-[13px] font-medium text-white">Menu</p>
          <nav aria-label="Rodapé" className="mt-4 grid gap-1 text-sm text-white/70 contrast:text-white">
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-white">
              Mural
            </Link>
            <Link href="/sobre" className="inline-flex min-h-11 items-center hover:text-white">
              Sobre
            </Link>
            <Link href="/docs" className="inline-flex min-h-11 items-center hover:text-white">
              API
            </Link>
          </nav>
        </div>
        <div>
          <p className="text-[13px] font-medium text-white">Recursos</p>
          <nav aria-label="Recursos" className="mt-4 grid gap-1 text-sm text-white/70 contrast:text-white">
            <Link href="/feed.xml" className="inline-flex min-h-11 items-center hover:text-white">
              RSS
            </Link>
            <Link href="/llms.txt" className="inline-flex min-h-11 items-center hover:text-white">
              llms.txt
            </Link>
            <Link href="/llms-full.txt" className="inline-flex min-h-11 items-center hover:text-white">
              Inventário
            </Link>
          </nav>
        </div>
        <div>
          <p className="text-[13px] font-medium text-white">Conectar</p>
          <nav className="mt-4 grid gap-1 text-sm text-white/70 contrast:text-white" aria-label="Conectar">
            <Link href="/chave" className="inline-flex min-h-11 items-center hover:text-white">
              Pedir chave
            </Link>
            <Link href="/docs" className="inline-flex min-h-11 items-center hover:text-white">
              Documentação
            </Link>
          </nav>
        </div>
      </SiteContainer>
      <SiteContainer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-[12px] text-white/70 contrast:border-white contrast:text-white">
        <p>Confirme sempre no edital oficial.</p>
        <p>© {new Date().getFullYear()} Trilha da Oportunidade</p>
      </SiteContainer>
    </footer>
  );
}
