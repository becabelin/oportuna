import Link from "next/link";

export function AcessoRestrito() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-sm text-muted-foreground">Uso interno</p>
      <h1 className="mt-4 font-heading text-4xl tracking-tight">Acesso restrito</h1>
      <p className="mt-3 text-muted-foreground">
        Esta tela é só para quem mantém a base. Se você chegou aqui por engano, volte
        ao mural.
      </p>
      <p className="mt-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Voltar ao mural
        </Link>
      </p>
    </div>
  );
}
