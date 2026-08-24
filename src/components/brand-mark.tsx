import Image from "next/image";

import { cn } from "@/lib/utils";

export const BRAND_NAVY = "#001A4C";
export const BRAND_STAR = "#FDB409";
export const BRAND_PURPLE = "#5E2EC4";

export function BrandIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-icon-trilha.png"
      alt=""
      width={64}
      height={64}
      className={cn("shrink-0 object-contain", className)}
      aria-hidden
    />
  );
}

export function BrandMark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Image
      src="/logo-trilha-da-oportunidade.png"
      alt="Trilha da Oportunidade"
      width={1536}
      height={1024}
      className={cn(
        "h-auto w-auto object-contain object-left",
        compact ? "max-h-9 max-w-[10.5rem]" : "max-h-11 max-w-[13rem]",
        className
      )}
      priority
    />
  );
}
