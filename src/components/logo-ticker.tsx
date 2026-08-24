import { AREAS, TIPO_LABEL } from "@/lib/taxonomia";
import { TIPOS } from "@/lib/types";

const ITEMS = [
  ...TIPOS.map((tipo) => TIPO_LABEL[tipo]),
  ...AREAS.slice(0, 6),
  "CAPES",
  "CNPq",
  "FAPESP",
];

export function LogoTicker() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <section aria-label="Áreas e tipos no mural" className="border-y border-border bg-background py-5">
      <p className="sr-only">{ITEMS.join(", ")}</p>
      <div className="mx-auto flex w-full max-w-[1200px] items-center gap-8 overflow-hidden px-5 sm:px-8" aria-hidden>
        <p className="shrink-0 text-sm text-muted-foreground">No mural</p>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="logo-ticker flex w-max gap-12 pr-12">
            {loop.map((item, index) => (
              <span key={`${item}-${index}`} className="shrink-0 text-sm font-medium tracking-tight text-muted-foreground contrast:text-white">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
