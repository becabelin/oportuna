"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, SlidersHorizontal, Sticker, X } from "lucide-react";

import { OpportunityCard } from "@/components/opportunity-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CardSkeletonGrid } from "@/components/page-skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  MURAL_GRID_CLASS,
  MURAL_PAGE_SIZE_MAX,
  muralColumnsFromWidth,
  muralPageSize,
} from "@/lib/mural";
import { MODALIDADE_LABEL, NIVEL_LABEL, TIPO_LABEL } from "@/lib/taxonomia";
import { TIPO_DOT } from "@/lib/tipo-visual";
import type { Oportunidade, PaginaOportunidades, TipoOportunidade } from "@/lib/types";
import { MODALIDADES, NIVEIS, TIPOS } from "@/lib/types";
import { cn } from "@/lib/utils";

type Taxonomia = {
  tipos: { id: TipoOportunidade; label: string; total: number }[];
  areas: { id: string; total: number }[];
  paises: { id: string; total: number }[];
  abertas: number;
  total: number;
};

type CatalogProps = {
  initialResult?: PaginaOportunidades;
  initialTaxonomia?: Taxonomia;
  initialQuery?: string;
  pageSize?: number;
};

function useMuralPageSize() {
  const [size, setSize] = useState(MURAL_PAGE_SIZE_MAX);

  useEffect(() => {
    const update = () => {
      setSize(muralPageSize(muralColumnsFromWidth(window.innerWidth)));
    };
    update();
    const medias = [
      window.matchMedia("(min-width: 1024px)"),
      window.matchMedia("(min-width: 640px)"),
    ];
    for (const media of medias) {
      media.addEventListener("change", update);
    }
    return () => {
      for (const media of medias) {
        media.removeEventListener("change", update);
      }
    };
  }, []);

  return size;
}

function hydrateFromServer(
  initialResult: PaginaOportunidades,
  pageSize: number
): PaginaOportunidades {
  const data = initialResult.data.slice(0, pageSize);
  return {
    ...initialResult,
    data,
    meta: {
      ...initialResult.meta,
      limit: pageSize,
      page: 1,
    },
  };
}

function canHydrateFromServer(
  initialResult: PaginaOportunidades | undefined,
  query: string,
  initialQuery: string | undefined,
  pageSize: number
): initialResult is PaginaOportunidades {
  if (!initialResult) return false;
  if (filterKey(query) !== filterKey(initialQuery ?? "")) return false;
  return (
    pageSize <= initialResult.data.length ||
    initialResult.data.length >= initialResult.meta.total
  );
}

function filterKey(query: string) {
  const params = new URLSearchParams(query);
  params.delete("page");
  params.delete("limit");
  return params.toString();
}

function listQuery(query: string, page: number, pageSize: number) {
  const params = new URLSearchParams(query);
  params.set("limit", String(pageSize));
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  return params.toString();
}

function mergeItems(current: Oportunidade[], incoming: Oportunidade[]) {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !seen.has(item.id))];
}

const selectTriggerClass =
  "h-11 min-h-11 w-full gap-2 rounded-full border border-foreground/50 bg-background px-3.5 py-2.5 pr-3.5 text-sm font-medium hover:border-foreground data-[size=default]:h-11 contrast:border-2 contrast:border-white";

function FilterSelect({
  id,
  value,
  onValueChange,
  items,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next ?? "all")}
      items={items}
    >
      <SelectTrigger id={id} className={selectTriggerClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start" className="max-h-72">
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OpportunityCatalog({
  initialResult,
  initialTaxonomia,
  initialQuery,
  pageSize: pageSizeProp,
}: CatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const autoPageSize = useMuralPageSize();
  const pageSize = pageSizeProp ?? autoPageSize;

  const [result, setResult] = useState<PaginaOportunidades | null>(() =>
    initialResult ? hydrateFromServer(initialResult, pageSize) : null
  );
  const [items, setItems] = useState<Oportunidade[]>(() =>
    initialResult ? initialResult.data.slice(0, pageSize) : []
  );
  const [taxonomia, setTaxonomia] = useState<Taxonomia | null>(initialTaxonomia ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialResult);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const query = searchParams.toString();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [listRes, taxRes] = await Promise.all([
          fetch(`/api/oportunidades?${listQuery(query, 1, pageSize)}`),
          fetch("/api/taxonomia"),
        ]);
        if (!listRes.ok) throw new Error("Falha ao listar oportunidades.");
        if (!taxRes.ok) throw new Error("Falha ao carregar filtros.");
        const listJson = (await listRes.json()) as PaginaOportunidades;
        const taxJson = (await taxRes.json()) as { data: Taxonomia };
        if (!cancelled) {
          setResult(listJson);
          setItems(listJson.data);
          setTaxonomia(taxJson.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro inesperado.");
          setResult(null);
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (canHydrateFromServer(initialResult, query, initialQuery, pageSize)) {
      const hydrated = hydrateFromServer(initialResult, pageSize);
      setResult(hydrated);
      setItems(hydrated.data);
      if (initialTaxonomia) setTaxonomia(initialTaxonomia);
      setLoading(false);
      setError(null);
    } else {
      void load();
    }

    const onUpdate = () => {
      if (!cancelled) void load();
    };
    window.addEventListener("oportuna:atualizou", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("oportuna:atualizou", onUpdate);
    };
  }, [query, initialQuery, initialResult, initialTaxonomia, pageSize]);

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const selectedTipo = searchParams.get("tipo") ?? "";
  const activeFilters = useMemo(() => {
    const keys = ["q", "tipo", "area", "nivel", "modalidade", "pais", "status", "ordenar", "fonteId"];
    return keys.filter((key) => {
      const value = searchParams.get(key);
      if (!value) return false;
      if (key === "status" && value === "abertas") return false;
      if (key === "ordenar" && value === "prazo") return false;
      return true;
    }).length;
  }, [searchParams]);

  const filterFields = (idPrefix: string) => (
    <FieldGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-area`}>Área</FieldLabel>
        <FilterSelect
          id={`${idPrefix}-area`}
          value={searchParams.get("area") ?? "all"}
          onValueChange={(value) => updateParams({ area: value === "all" ? null : value })}
          items={[
            { value: "all", label: "Todas" },
            ...(taxonomia?.areas ?? []).map((area) => ({ value: area.id, label: area.id })),
          ]}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-nivel`}>Nível</FieldLabel>
        <FilterSelect
          id={`${idPrefix}-nivel`}
          value={searchParams.get("nivel") ?? "all"}
          onValueChange={(value) => updateParams({ nivel: value === "all" ? null : value })}
          items={[
            { value: "all", label: "Todos" },
            ...NIVEIS.map((nivel) => ({ value: nivel, label: NIVEL_LABEL[nivel] })),
          ]}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-modalidade`}>Modalidade</FieldLabel>
        <FilterSelect
          id={`${idPrefix}-modalidade`}
          value={searchParams.get("modalidade") ?? "all"}
          onValueChange={(value) =>
            updateParams({ modalidade: value === "all" ? null : value })
          }
          items={[
            { value: "all", label: "Todas" },
            ...MODALIDADES.map((modalidade) => ({
              value: modalidade,
              label: MODALIDADE_LABEL[modalidade],
            })),
          ]}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-pais`}>País</FieldLabel>
        <FilterSelect
          id={`${idPrefix}-pais`}
          value={searchParams.get("pais") ?? "all"}
          onValueChange={(value) => updateParams({ pais: value === "all" ? null : value })}
          items={[
            { value: "all", label: "Todos" },
            ...(taxonomia?.paises ?? []).map((pais) => ({ value: pais.id, label: pais.id })),
          ]}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-prazo`}>Prazo</FieldLabel>
        <FilterSelect
          id={`${idPrefix}-prazo`}
          value={searchParams.get("status") ?? "abertas"}
          onValueChange={(value) =>
            updateParams({ status: value === "abertas" ? null : value })
          }
          items={[
            { value: "abertas", label: "Inscrições abertas" },
            { value: "encerradas", label: "Encerradas" },
            { value: "todas", label: "Todas" },
          ]}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-ordenar`}>Ordenar</FieldLabel>
        <FilterSelect
          id={`${idPrefix}-ordenar`}
          value={searchParams.get("ordenar") ?? "prazo"}
          onValueChange={(value) =>
            updateParams({ ordenar: value === "prazo" ? null : value })
          }
          items={[
            { value: "prazo", label: "Prazo mais próximo" },
            { value: "recentes", label: "Atualizadas recentemente" },
            { value: "titulo", label: "Título A–Z" },
          ]}
        />
      </Field>
    </FieldGroup>
  );

  const hasMore = Boolean(result && items.length < result.meta.total);

  async function loadMore() {
    if (!result || loadingMore || items.length >= result.meta.total) return;
    const nextPage = Math.floor(items.length / pageSize) + 1;
    setLoadingMore(true);
    setError(null);
    try {
      const listRes = await fetch(`/api/oportunidades?${listQuery(query, nextPage, pageSize)}`);
      if (!listRes.ok) throw new Error("Falha ao listar oportunidades.");
      const listJson = (await listRes.json()) as PaginaOportunidades;
      setResult(listJson);
      setItems((current) => mergeItems(current, listJson.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoadingMore(false);
    }
  }

  const tipoChipClass =
    "min-h-11 rounded-full border border-foreground/50 bg-transparent px-3 font-medium text-muted-foreground hover:border-foreground hover:bg-muted/60 data-[pressed]:border-foreground data-[pressed]:bg-foreground data-[pressed]:text-background data-[pressed]:hover:bg-foreground contrast:border-2 contrast:border-white";

  return (
    <div className="flex flex-col gap-6">
      <ToggleGroup
        multiple={false}
        aria-label="Tipo de oportunidade"
        value={selectedTipo ? [selectedTipo] : ["todas"]}
        onValueChange={(groupValue) => {
          const next = Array.isArray(groupValue) ? groupValue[0] : groupValue;
          if (!next || next === "todas") updateParams({ tipo: null });
          else updateParams({ tipo: next });
        }}
        variant="default"
        size="sm"
        spacing={2}
        className="flex w-full flex-wrap justify-start"
      >
        <ToggleGroupItem value="todas" className={tipoChipClass}>
          Todas
        </ToggleGroupItem>
        {TIPOS.map((tipo) => (
          <ToggleGroupItem key={tipo} value={tipo} className={tipoChipClass}>
            <span
              className={cn(
                "size-2 shrink-0 rounded-full group-data-[pressed]/toggle:ring-2 group-data-[pressed]/toggle:ring-background",
                TIPO_DOT[tipo]
              )}
              aria-hidden
            />
            {TIPO_LABEL[tipo]}
            {taxonomia ? (
              <Badge variant="secondary" className="ml-1 h-5 rounded-md px-1.5 text-xs">
                {taxonomia.tipos.find((item) => item.id === tipo)?.total ?? 0}
              </Badge>
            ) : null}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field className="flex-1">
          <FieldLabel htmlFor="busca">Busca</FieldLabel>
          <InputGroup className="h-11 min-h-11 rounded-full border border-foreground/50 bg-background shadow-none hover:border-foreground has-[[data-slot=input-group-control]:focus-visible]:border-foreground contrast:border-2 contrast:border-white">
            <InputGroupAddon>
              <Search aria-hidden />
            </InputGroupAddon>
            <InputGroupInput
              id="busca"
              defaultValue={searchParams.get("q") ?? ""}
              placeholder="CNPq, mestrado, hackathon…"
              aria-describedby="busca-ajuda"
              onChange={(event) => {
                const value = event.target.value;
                window.clearTimeout((window as unknown as { __oportunaT?: number }).__oportunaT);
                (window as unknown as { __oportunaT?: number }).__oportunaT = window.setTimeout(
                  () => updateParams({ q: value.trim() || null }),
                  280
                );
              }}
            />
          </InputGroup>
          <p id="busca-ajuda" className="sr-only">
            Busca por título, organização, área ou palavras do edital. O prazo que vale é o do site oficial.
          </p>
        </Field>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal aria-hidden />
                Filtros
                {activeFilters > 0 ? (
                  <Badge variant="secondary" className="h-5 px-1.5">
                    {activeFilters}
                  </Badge>
                ) : null}
              </Button>
            }
          />
          <SheetContent side="bottom" className="gap-0 rounded-t-3xl border border-border">
            <SheetHeader className="border-b border-border">
              <SheetTitle className="font-heading text-2xl">Filtros do mural</SheetTitle>
              <SheetDescription>
                Área, prazo, país e ordem. Cada ficha leva ao resumo e à inscrição.
              </SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto p-4">{filterFields("filtro-mobile")}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden p-1 lg:block">
        {filterFields("filtro")}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-muted-foreground">
          {loading
            ? "Carregando oportunidades…"
            : result
              ? items.length < result.meta.total
                ? `${items.length} de ${result.meta.total} ${result.meta.total === 1 ? "oportunidade" : "oportunidades"}`
                : `${result.meta.total} ${result.meta.total === 1 ? "oportunidade" : "oportunidades"}`
              : null}
        </p>
        {activeFilters > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.replace(pathname, { scroll: false })}
          >
            <X aria-hidden />
            Limpar filtros
          </Button>
        ) : null}
      </div>

      {error ? (
        <Alert
          variant="destructive"
          className="border border-destructive shadow-none"
        >
          <Filter aria-hidden />
          <AlertTitle>Não foi possível carregar as oportunidades.</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button className="mt-3 w-fit" onClick={() => router.refresh()}>
            Tentar de novo
          </Button>
        </Alert>
      ) : null}

      {loading ? <CardSkeletonGrid count={pageSize} /> : null}

      {!loading && result && items.length === 0 ? (
        <Empty className="rounded-2xl border border-dashed border-border bg-card py-16 shadow-none">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sticker aria-hidden />
            </EmptyMedia>
            <EmptyTitle className="font-heading text-3xl">
              Nada grudou no mural com esses filtros.
            </EmptyTitle>
            <EmptyDescription>
              Tente uma busca mais ampla, limpe os filtros ou cadastre um edital que você
              conhece.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Button variant="outline" onClick={() => router.replace(pathname)}>
              Limpar filtros
            </Button>
            <Link href="/cadastrar" className={cn(buttonVariants())}>
              Cadastrar edital
            </Link>
          </EmptyContent>
        </Empty>
      ) : null}

      {!loading && items.length > 0 ? (
        <ul className={MURAL_GRID_CLASS}>
          {items.map((item: Oportunidade) => (
            <li key={item.id} className="h-full">
              <OpportunityCard item={item} size="compact" />
            </li>
          ))}
        </ul>
      ) : null}

      {!loading && hasMore ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            aria-busy={loadingMore}
          >
            {loadingMore ? "Carregando…" : "Ver mais"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
