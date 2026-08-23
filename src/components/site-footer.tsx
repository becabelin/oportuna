import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-foreground/15 bg-[color-mix(in_oklch,var(--secondary),white_55%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-medium">
          Um mural de bolsas, eventos e editais — com chave para o seu app puxar a
          base.
        </p>
        <p className="text-foreground/70">
          <Link href="/chave" className="font-semibold underline decoration-2 underline-offset-4 hover:text-foreground">
            Pedir chave
          </Link>
          {" · "}
          <Link href="/docs" className="underline decoration-2 underline-offset-4 hover:text-foreground">
            docs
          </Link>
        </p>
      </div>
    </footer>
  );
}
