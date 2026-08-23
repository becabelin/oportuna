"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { OpportunityCard } from "@/components/opportunity-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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

function NativeSelect({
  id,
  value,
  onChange,
  children,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-xl border-2 border-foreground/30 bg-background px-2.5 text-sm font-medium outline-none focus-visible:border-foreground focus-visible:ring-3 focus-visible:ring-primary/30"
    >
      {children}
    </select>
  );
}

export function OpportunityCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [result, setResult] = useState<PaginaOportunidades | null>(null);
  const [taxonomia, setTaxonomia] = useState<Taxonomia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    load();
    const onUpdate = () => {
      if (!cancelled) void load();
    };
    window.addEventListener("oportuna:atualizou", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("oportuna:atualizou", onUpdate);
    };
  }, [query]);

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
    const keys = ["q", "tipo", "area", "nivel", "modalidade", "pais", "status", "ordenar", "origem", "fonteId"];
    return keys.filter((key) => {
      const value = searchParams.get(key);
      if (!value) return false;
      if (key === "status" && value === "abertas") return false;
      if (key === "ordenar" && value === "prazo") return false;
      return true;
    }).length;
  }, [searchParams]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedTipo === "" ? "default" : "outline"}
          size="sm"
          onClick={() => updateParams({ tipo: null })}
        >
          Todas
        </Button>
        {TIPOS.map((tipo) => (
          <Button
            key={tipo}
            variant={selectedTipo === tipo ? "default" : "outline"}
            size="sm"
            onClick={() => updateParams({ tipo })}
          >
            {TIPO_LABEL[tipo]}
            {taxonomia ? (
              <span className="text-xs opacity-70">
                {taxonomia.tipos.find((item) => item.id === tipo)?.total ?? 0}
              </span>
            ) : null}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 rounded-2xl border-2 border-foreground/80 bg-card p-4 shadow-[5px_5px_0_0_var(--foreground)] sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="busca">Busca</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="busca"
              defaultValue={searchParams.get("q") ?? ""}
              placeholder="CNPq, mestrado, hackathon…"
              className="pl-8"
              onChange={(event) => {
                const value = event.target.value;
                window.clearTimeout((window as unknown as { __oportunaT?: number }).__oportunaT);
                (window as unknown as { __oportunaT?: number }).__oportunaT = window.setTimeout(
                  () => updateParams({ q: value.trim() || null }),
                  280
                );
              }}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="area">Área</Label>
          <NativeSelect
            id="area"
            value={searchParams.get("area") ?? ""}
            onChange={(value) => updateParams({ area: value || null })}
          >
            <option value="">Todas</option>
            {(taxonomia?.areas ?? []).map((area) => (
              <option key={area.id} value={area.id}>
                {area.id}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="nivel">Nível</Label>
          <NativeSelect
            id="nivel"
            value={searchParams.get("nivel") ?? ""}
            onChange={(value) => updateParams({ nivel: value || null })}
          >
            <option value="">Todos</option>
            {NIVEIS.map((nivel) => (
              <option key={nivel} value={nivel}>
                {NIVEL_LABEL[nivel]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="modalidade">Modalidade</Label>
          <NativeSelect
            id="modalidade"
            value={searchParams.get("modalidade") ?? ""}
            onChange={(value) => updateParams({ modalidade: value || null })}
          >
            <option value="">Todas</option>
            {MODALIDADES.map((modalidade) => (
              <option key={modalidade} value={modalidade}>
                {MODALIDADE_LABEL[modalidade]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pais">País</Label>
          <NativeSelect
            id="pais"
            value={searchParams.get("pais") ?? ""}
            onChange={(value) => updateParams({ pais: value || null })}
          >
            <option value="">Todos</option>
            {(taxonomia?.paises ?? []).map((pais) => (
              <option key={pais.id} value={pais.id}>
                {pais.id}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="status">Prazo</Label>
          <NativeSelect
            id="status"
            value={searchParams.get("status") ?? "abertas"}
            onChange={(value) => updateParams({ status: value === "abertas" ? null : value })}
          >
            <option value="abertas">Inscrições abertas</option>
            <option value="encerradas">Encerradas</option>
            <option value="todas">Todas</option>
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="ordenar">Ordenar</Label>
          <NativeSelect
            id="ordenar"
            value={searchParams.get("ordenar") ?? "prazo"}
            onChange={(value) => updateParams({ ordenar: value === "prazo" ? null : value })}
          >
            <option value="prazo">Prazo mais próximo</option>
            <option value="recentes">Atualizadas recentemente</option>
            <option value="titulo">Título A–Z</option>
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="origem">Origem</Label>
          <NativeSelect
            id="origem"
            value={searchParams.get("origem") ?? ""}
            onChange={(value) => updateParams({ origem: value || null })}
          >
            <option value="">Todas</option>
            <option value="coleta">Coletadas de links</option>
            <option value="manual">Catálogo inicial</option>
          </NativeSelect>
        </div>
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
            <X className="size-3.5" />
            Limpar filtros
          </Button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border-2 border-destructive bg-destructive/10 px-5 py-8 text-center shadow-[5px_5px_0_0_var(--destructive)]">
          <p className="font-medium">Não foi possível carregar as oportunidades.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => router.refresh()}>
            Tentar de novo
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border-2 border-foreground/20 bg-card p-4 shadow-[4px_4px_0_0_oklch(0.24_0.04_40_/_0.12)]">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-4 h-6 w-5/6" />
              <Skeleton className="mt-2 h-4 w-1/2" />
              <Skeleton className="mt-6 h-16 w-full" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && result && result.data.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-foreground/40 bg-card px-6 py-16 text-center shadow-[5px_5px_0_0_oklch(0.24_0.04_40_/_0.08)]">
          <p className="font-heading text-3xl">Nada grudou no mural com esses filtros.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Tente uma busca mais ampla, limpe os filtros ou cadastre um edital que você
            conhece.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.replace(pathname)}>
              Limpar filtros
            </Button>
            <Link href="/cadastrar" className={cn(buttonVariants())}>
              Cadastrar edital
            </Link>
          </div>
        </div>
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

      {result && result.meta.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: result.meta.totalPages }).map((_, index) => {
            const page = index + 1;
            const current = result.meta.page === page;
            return (
              <Button
                key={page}
                size="icon-sm"
                variant={current ? "default" : "outline"}
                className={cn(current && "pointer-events-none")}
                onClick={() => {
                  const next = new URLSearchParams(searchParams.toString());
                  if (page === 1) next.delete("page");
                  else next.set("page", String(page));
                  const qs = next.toString();
                  router.replace(qs ? `${pathname}?${qs}` : pathname);
                }}
              >
                {page}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
