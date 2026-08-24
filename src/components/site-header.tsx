"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { A11yToolbar } from "@/components/a11y-toolbar";
import { BrandMark } from "@/components/brand-mark";
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

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center rounded-md"
          aria-label="Trilha da Oportunidade — página inicial"
        >
          <BrandMark />
        </Link>
        <nav aria-label="Principal" className="flex flex-wrap items-center justify-end gap-2">
          {NAV.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={item.href} />}
              className="hidden min-h-11 sm:inline-flex"
            >
              {item.label}
            </Button>
          ))}
          <div className="hidden lg:block">
            <A11yToolbar />
          </div>
          <Link
            href="/chave"
            className={cn(buttonVariants({ size: "sm" }), "min-h-11")}
          >
            Pedir chave
          </Link>
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="min-h-11 min-w-11 lg:hidden"
                  aria-label="Abrir menu e opções de acessibilidade"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="border border-border">
              <SheetHeader>
                <SheetTitle>
                  <BrandMark compact />
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 px-4" aria-label="Menu">
                {NAV.map((item) => (
                  <SheetClose
                    key={item.href}
                    render={
                      <Link
                        href={item.href}
                        className="rounded-xl px-3 py-3 text-base font-semibold hover:bg-muted"
                      />
                    }
                  >
                    {item.label}
                  </SheetClose>
                ))}
                <Separator className="my-2" />
                <SheetClose
                  render={<Link href="/chave" className={cn(buttonVariants(), "min-h-11")} />}
                >
                  Pedir chave
                </SheetClose>
              </nav>
              <div className="mt-6 px-4">
                <p className="mb-2 font-heading text-sm font-bold">Acessibilidade</p>
                <A11yToolbar compact />
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
