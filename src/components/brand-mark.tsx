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
      width={256}
      height={256}
      sizes="40px"
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
  const frame = cn(
    "h-auto w-auto object-contain object-left",
    compact ? "max-h-9 max-w-[10.5rem]" : "max-h-11 max-w-[13rem]",
    className
  );
  const sizes = compact ? "10.5rem" : "13rem";
  return (
    <>
      <Image
        src="/logo-trilha-da-oportunidade.png"
        alt="Trilha da Oportunidade"
        width={640}
        height={427}
        sizes={sizes}
        className={cn(frame, "dark:hidden contrast:hidden")}
        priority
      />
      <Image
        src="/logo-trilha-da-oportunidade-escuro.png"
        alt=""
        width={640}
        height={427}
        sizes={sizes}
        className={cn(frame, "hidden dark:block contrast:block")}
        aria-hidden
      />
    </>
  );
}
