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

export default function NotFound() {
  return (
    <Empty className="mx-auto min-h-[60vh] w-full max-w-lg flex-1 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Sticker />
        </EmptyMedia>
        <EmptyTitle className="font-heading text-4xl">Essa página não está no mural.</EmptyTitle>
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
