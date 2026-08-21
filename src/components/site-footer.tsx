import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Cole um link de edital. A Oportuna busca o que ainda está aberto.</p>
        <p>
          REST em{" "}
          <Link href="/api" className="underline-offset-4 hover:text-foreground hover:underline">
            /api
          </Link>{" "}
          · documentação em{" "}
          <Link href="/docs" className="underline-offset-4 hover:text-foreground hover:underline">
            /docs
          </Link>
        </p>
      </div>
    </footer>
  );
}
