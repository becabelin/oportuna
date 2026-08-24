"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { A11yToolbar } from "@/components/a11y-toolbar";
import { BrandIcon } from "@/components/brand-mark";
import { SiteContainer } from "@/components/editorial";
import { HomeLogoLink } from "@/components/home-logo-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Mural" },
  { href: "/sobre", label: "Sobre" },
  { href: "/docs", label: "API" },
];

function isCurrent(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/oportunidades");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const chaveAtual = pathname === "/chave" || pathname.startsWith("/chave/");
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <SiteContainer className="flex items-center justify-between gap-4 py-3.5">
        <HomeLogoLink className="flex items-center rounded-md">
          <BrandIcon className="size-9" />
        </HomeLogoLink>
        <div className="flex items-center gap-1 sm:gap-5">
          <nav aria-label="Principal" className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => {
              const current = isCurrent(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center text-sm transition-colors",
                    current
                      ? "font-semibold text-foreground underline decoration-2 underline-offset-8 decoration-foreground dark:decoration-[#FDB409] contrast:decoration-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden lg:block">
            <A11yToolbar />
          </div>
          <Link
            href="/chave"
            aria-current={chaveAtual ? "page" : undefined}
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden min-h-11 rounded-lg bg-neutral-950 px-4 text-sm text-white hover:bg-neutral-800 sm:inline-flex",
              chaveAtual &&
                "ring-2 ring-foreground ring-offset-2 ring-offset-background contrast:ring-white"
            )}
          >
            Pedir chave
          </Link>
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11 lg:hidden"
                  aria-label="Abrir menu e opções de acessibilidade"
                />
              }
            >
              <Menu aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" className="border-l border-border">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <BrandIcon className="size-8" />
                  <span className="font-heading text-lg">Trilha</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 px-4" aria-label="Menu">
                {NAV.map((item) => {
                  const current = isCurrent(item.href, pathname);
                  return (
                    <SheetClose
                      key={item.href}
                      render={
                        <Link
                          href={item.href}
                          aria-current={current ? "page" : undefined}
                          className={cn(
                            "rounded-xl px-3 py-3 text-base",
                            current
                              ? "bg-muted font-semibold text-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        />
                      }
                    >
                      {item.label}
                    </SheetClose>
                  );
                })}
                <Separator className="my-2" />
                <SheetClose
                  render={
                    <Link
                      href="/chave"
                      aria-current={chaveAtual ? "page" : undefined}
                      className={cn(
                        buttonVariants(),
                        "min-h-11",
                        chaveAtual &&
                          "ring-2 ring-foreground ring-offset-2 ring-offset-background contrast:ring-white"
                      )}
                    />
                  }
                >
                  Pedir chave
                </SheetClose>
              </nav>
              <div className="mt-6 px-4">
                <p className="mb-2 text-sm text-muted-foreground">Acessibilidade</p>
                <A11yToolbar compact />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </SiteContainer>
    </header>
  );
}
