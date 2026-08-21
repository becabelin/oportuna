import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Skeleton className="h-10 w-2/3 max-w-md" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-4 h-6 w-5/6" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <Skeleton className="mt-6 h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
