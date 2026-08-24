"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Mural" },
  { href: "/sobre", label: "Sobre" },
  { href: "/docs", label: "API" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground/15 bg-[color-mix(in_oklch,var(--background),white_35%)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center"
          aria-label="Trilha da Oportunidade — página inicial"
        >
          <BrandMark />
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
          {NAV.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={item.href} />}
              className="hidden sm:inline-flex"
            >
              {item.label}
            </Button>
          ))}
          <Tooltip>
            <TooltipTrigger
              render={
                <Link href="/chave" className={cn(buttonVariants({ size: "sm" }), "ml-1")} />
              }
            >
              Pedir chave
            </TooltipTrigger>
            <TooltipContent side="bottom">Gera uma chave para a API, de graça</TooltipContent>
          </Tooltip>
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="sm:hidden" aria-label="Abrir menu" />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="border-2 border-foreground">
              <SheetHeader>
                <SheetTitle>
                  <BrandMark compact />
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 px-4">
                {NAV.map((item) => (
                  <SheetClose
                    key={item.href}
                    render={
                      <Link
                        href={item.href}
                        className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-muted"
                      />
                    }
                  >
                    {item.label}
                  </SheetClose>
                ))}
                <Separator className="my-2" />
                <SheetClose
                  render={<Link href="/chave" className={cn(buttonVariants())} />}
                >
                  Pedir chave
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
