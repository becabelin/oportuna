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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MODALIDADE_LABEL, NIVEL_LABEL, TIPO_LABEL } from "@/lib/taxonomia";
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
};

const selectTriggerClass =
  "h-11 min-h-11 w-full gap-2 rounded-xl border border-border/40 bg-background px-3.5 py-2.5 pr-3.5 text-base font-medium data-[size=default]:h-11";

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
}: CatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [result, setResult] = useState<PaginaOportunidades | null>(initialResult ?? null);
  const [taxonomia, setTaxonomia] = useState<Taxonomia | null>(initialTaxonomia ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialResult);
  const [sheetOpen, setSheetOpen] = useState(false);

  const query = searchParams.toString();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [listRes, taxRes] = await Promise.all([
          fetch(`/api/oportunidades?${query}`),
          fetch("/api/taxonomia"),
        ]);
        if (!listRes.ok) throw new Error("Falha ao listar oportunidades.");
        if (!taxRes.ok) throw new Error("Falha ao carregar filtros.");
        const listJson = (await listRes.json()) as PaginaOportunidades;
        const taxJson = (await taxRes.json()) as { data: Taxonomia };
        if (!cancelled) {
          setResult(listJson);
          setTaxonomia(taxJson.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro inesperado.");
          setResult(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (!(initialResult && query === (initialQuery ?? ""))) {
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
  }, [query, initialQuery, initialResult]);

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

  const filterFields = (
    <FieldGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field>
        <FieldLabel htmlFor="filtro-area">Área</FieldLabel>
        <FilterSelect
          id="filtro-area"
          value={searchParams.get("area") ?? "all"}
          onValueChange={(value) => updateParams({ area: value === "all" ? null : value })}
          items={[
            { value: "all", label: "Todas" },
            ...(taxonomia?.areas ?? []).map((area) => ({ value: area.id, label: area.id })),
          ]}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="filtro-nivel">Nível</FieldLabel>
        <FilterSelect
          id="filtro-nivel"
          value={searchParams.get("nivel") ?? "all"}
          onValueChange={(value) => updateParams({ nivel: value === "all" ? null : value })}
          items={[
            { value: "all", label: "Todos" },
            ...NIVEIS.map((nivel) => ({ value: nivel, label: NIVEL_LABEL[nivel] })),
          ]}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="filtro-modalidade">Modalidade</FieldLabel>
        <FilterSelect
          id="filtro-modalidade"
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
        <FieldLabel htmlFor="filtro-pais">País</FieldLabel>
        <FilterSelect
          id="filtro-pais"
          value={searchParams.get("pais") ?? "all"}
          onValueChange={(value) => updateParams({ pais: value === "all" ? null : value })}
          items={[
            { value: "all", label: "Todos" },
            ...(taxonomia?.paises ?? []).map((pais) => ({ value: pais.id, label: pais.id })),
          ]}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="filtro-prazo">Prazo</FieldLabel>
        <FilterSelect
          id="filtro-prazo"
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
        <FieldLabel htmlFor="filtro-ordenar">Ordenar</FieldLabel>
        <FilterSelect
          id="filtro-ordenar"
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

  const totalPages = result?.meta.totalPages ?? 1;
  const currentPage = result?.meta.page ?? 1;

  function pageHref(page: number) {
    const next = new URLSearchParams(searchParams.toString());
    if (page <= 1) next.delete("page");
    else next.set("page", String(page));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="flex flex-col gap-6">
      <ToggleGroup
        multiple={false}
        value={selectedTipo ? [selectedTipo] : ["todas"]}
        onValueChange={(groupValue) => {
          const next = groupValue[0];
          if (!next || next === "todas") updateParams({ tipo: null });
          else updateParams({ tipo: next });
        }}
        variant="outline"
        size="sm"
        spacing={2}
        className="flex w-full flex-wrap justify-start"
      >
        <ToggleGroupItem
          value="todas"
          className="min-h-11 rounded-xl border border-border px-3 font-bold data-[pressed]:bg-primary data-[pressed]:text-primary-foreground"
        >
          Todas
        </ToggleGroupItem>
        {TIPOS.map((tipo) => (
          <ToggleGroupItem
            key={tipo}
            value={tipo}
            className="min-h-11 rounded-xl border border-border px-3 font-bold data-[pressed]:bg-primary data-[pressed]:text-primary-foreground"
          >
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
          <InputGroup className="h-11 min-h-11 rounded-xl border border-border bg-background shadow-none">
            <InputGroupAddon>
              <Search aria-hidden />
            </InputGroupAddon>
            <InputGroupInput
              id="busca"
              defaultValue={searchParams.get("q") ?? ""}
              placeholder="CNPq, mestrado, hackathon…"
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
            <SheetHeader className="border-b-2 border-foreground/10">
              <SheetTitle className="font-heading text-2xl">Filtros do mural</SheetTitle>
              <SheetDescription>
                Área, prazo, país e ordem. O que vale no edital oficial continua valendo.
              </SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto p-4">{filterFields}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden rounded-2xl border border-border bg-card p-4 shadow-[0_10px_28px_rgba(0,26,76,0.07)] lg:block">
        {filterFields}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Carregando oportunidades…"
            : result
              ? `${result.meta.total} ${result.meta.total === 1 ? "oportunidade" : "oportunidades"}`
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

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border/20 bg-card p-4 shadow-none"
            >
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-4 h-6 w-5/6" />
              <Skeleton className="mt-2 h-4 w-1/2" />
              <Skeleton className="mt-6 h-16 w-full" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && result && result.data.length === 0 ? (
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

      {!loading && result && result.data.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((item: Oportunidade) => (
            <li key={item.id}>
              <OpportunityCard item={item} />
            </li>
          ))}
        </ul>
      ) : null}

      {result && totalPages > 1 ? (
        <>
          <Separator className="bg-foreground/20" />
          <Pagination>
            <PaginationContent>
              {currentPage > 1 ? (
                <PaginationItem>
                  <PaginationPrevious href={pageHref(currentPage - 1)} text="Anterior" />
                </PaginationItem>
              ) : null}
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink href={pageHref(page)} isActive={currentPage === page}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {currentPage < totalPages ? (
                <PaginationItem>
                  <PaginationNext href={pageHref(currentPage + 1)} text="Próxima" />
                </PaginationItem>
              ) : null}
            </PaginationContent>
          </Pagination>
        </>
      ) : null}
    </div>
  );
}
