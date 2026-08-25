import type { ReactNode } from "react";

import { SiteContainer } from "@/components/editorial";
import { Skeleton } from "@/components/ui/skeleton";
import { MURAL_GRID_CLASS, MURAL_PAGE_SIZE_MAX } from "@/lib/mural";
import { cn } from "@/lib/utils";

function Status({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-2.5 rounded-2xl border border-border bg-card p-5 sm:p-6 contrast:border-white",
        className
      )}
    >
      <Skeleton className="h-3 w-2/5" />
      <Skeleton className="h-6 w-11/12" />
      <Skeleton className="h-6 w-[72%]" />
      <Skeleton className="mt-1 h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

export function CardSkeletonGrid({
  count = MURAL_PAGE_SIZE_MAX,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn(MURAL_GRID_CLASS, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function MuralSkeleton() {
  return (
    <Status label="Carregando o mural.">
      <section className="relative min-h-[22rem] overflow-hidden bg-muted sm:min-h-[28rem] lg:min-h-[32rem] contrast:bg-black">
        <div className="absolute inset-0 bg-foreground/5 backdrop-blur-xl contrast:hidden" />
        <SiteContainer className="relative flex min-h-[22rem] flex-col justify-between gap-10 py-12 sm:min-h-[28rem] sm:py-16 lg:min-h-[32rem] lg:py-20">
          <div className="max-w-xl">
            <Skeleton className="h-10 w-11/12 sm:h-14" />
            <Skeleton className="mt-3 h-10 w-4/5 sm:h-14" />
            <Skeleton className="mt-6 h-4 w-full max-w-md" />
            <Skeleton className="mt-2 h-4 w-3/4 max-w-sm" />
          </div>
          <div className="flex justify-end">
            <div className="w-full max-w-[22rem] rounded-xl border border-border/40 bg-card/70 p-4 backdrop-blur-sm contrast:border-white contrast:bg-background">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-2 h-5 w-11/12" />
              <Skeleton className="mt-2 h-5 w-2/3" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-4/5" />
            </div>
          </div>
        </SiteContainer>
      </section>

      <SiteContainer className="py-14 sm:py-16">
        <div className="grid items-start gap-6 border-b border-border pb-14 sm:gap-8 sm:pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 contrast:border-white">
          <Skeleton className="h-10 w-4/5 sm:h-12" />
          <div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-11/12" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        </div>

        <div className="pt-14 sm:pt-16">
          <Skeleton className="mb-8 h-8 w-40" />
          <CardSkeletonGrid count={8} />
        </div>
      </SiteContainer>
    </Status>
  );
}

export function ArticleSkeleton() {
  return (
    <Status label="Carregando o edital.">
      <article className="mx-auto w-full max-w-[1080px] px-5 py-10 sm:px-8 sm:py-14">
        <Skeleton className="h-4 w-48" />
        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
          <div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="mt-5 h-12 w-full sm:h-14" />
            <Skeleton className="mt-3 h-12 w-4/5 sm:h-14" />
            <Skeleton className="mt-5 h-5 w-full max-w-xl" />
            <Skeleton className="mt-2 h-5 w-2/3 max-w-lg" />
            <div className="mt-8 flex justify-between border-b border-border pb-8 contrast:border-white">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-5 w-3/4" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-12 h-8 w-40" />
            <Skeleton className="mt-5 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-2 h-4 w-11/12" />
          </div>
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 contrast:border-white">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-3 h-4 w-5/6" />
              <Skeleton className="mt-3 h-4 w-2/3" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-8 h-3 w-24" />
            </div>
          </div>
        </div>
      </article>
    </Status>
  );
}

export function PageSkeleton() {
  return (
    <Status label="Carregando a página.">
      <div className="mx-auto w-full max-w-[720px] px-5 py-12 sm:px-8 sm:py-16">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-4 h-12 w-full sm:h-14" />
        <Skeleton className="mt-3 h-12 w-4/5 sm:h-14" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-11/12" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <Skeleton className="mt-10 h-8 w-48" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
        <Skeleton className="mt-10 h-8 w-40" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
      </div>
    </Status>
  );
}
