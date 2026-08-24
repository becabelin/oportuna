import type { Metadata } from "next";
import Link from "next/link";
import { Sticker } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Empty className="mx-auto min-h-[60vh] w-full max-w-lg flex-1 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Sticker aria-hidden />
        </EmptyMedia>
        <EmptyTitle className="font-heading text-4xl">
          <h1>Essa página não está no mural.</h1>
        </EmptyTitle>
        <EmptyDescription>
          O link pode ter expirado ou o identificador está errado. Volte ao catálogo e busque
          de novo.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/" className={cn(buttonVariants())}>
          Ver oportunidades
        </Link>
      </EmptyContent>
    </Empty>
  );
}
