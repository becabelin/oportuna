"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">Erro</p>
      <h1 className="mt-2 font-heading text-4xl">Algo saiu do trilho.</h1>
      <p className="mt-3 text-muted-foreground">
        Não foi possível carregar esta página. Tente de novo em instantes.
      </p>
      <Button className="mt-6" onClick={reset}>
        Tentar de novo
      </Button>
    </div>
  );
}
