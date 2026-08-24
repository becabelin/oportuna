import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-medium">
          Mural público de bolsas, eventos e editais. Confirme sempre no site oficial.
        </p>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-3 gap-y-1 text-foreground">
          <Link href="/sobre" className="underline decoration-2 underline-offset-4 hover:text-foreground">
            Sobre
          </Link>
          <Link href="/chave" className="font-semibold underline decoration-2 underline-offset-4 hover:text-foreground">
            Pedir chave
          </Link>
          <Link href="/docs" className="underline decoration-2 underline-offset-4 hover:text-foreground">
            API
          </Link>
          <Link href="/feed.xml" className="underline decoration-2 underline-offset-4 hover:text-foreground">
            RSS
          </Link>
          <Link href="/llms.txt" className="underline decoration-2 underline-offset-4 hover:text-foreground">
            llms.txt
          </Link>
          <Link href="/llms-full.txt" className="underline decoration-2 underline-offset-4 hover:text-foreground">
            inventário
          </Link>
        </nav>
      </div>
    </footer>
  );
}
