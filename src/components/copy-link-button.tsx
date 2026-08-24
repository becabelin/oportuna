"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className="inline-flex">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copiar}
        className="rounded-full px-5"
      >
        {copied ? "Copiado" : "Copiar link"}
      </Button>
      <span role="status" className="sr-only">
        {copied ? "Link copiado para a área de transferência." : ""}
      </span>
    </span>
  );
}
