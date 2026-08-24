import Image from "next/image";

import { cn } from "@/lib/utils";

export const BRAND_NAVY = "#001A4C";
export const BRAND_STAR = "#FDB409";
export const BRAND_PURPLE = "#5E2EC4";

const LOCKUP = { width: 2048, height: 768 } as const;

export function BrandIcon({ className }: { className?: string }) {
  const frame = cn("shrink-0 object-contain", className);
  return (
    <>
      <Image
        src="/logo-icon-trilha.svg"
        alt=""
        width={512}
        height={512}
        sizes="40px"
        className={cn(frame, "dark:hidden contrast:hidden")}
        unoptimized
        aria-hidden
      />
      <Image
        src="/logo-icon-trilha-escuro.svg"
        alt=""
        width={512}
        height={512}
        sizes="40px"
        className={cn(frame, "hidden dark:block contrast:block")}
        unoptimized
        aria-hidden
      />
    </>
  );
}

export function BrandMark({
  className,
  compact = false,
  tone = "auto",
}: {
  className?: string;
  compact?: boolean;
  tone?: "auto" | "onDark" | "onLight";
}) {
  const frame = cn(
    "h-auto w-auto object-contain object-left",
    compact ? "max-h-8 max-w-[10rem]" : "max-h-10 max-w-[12.5rem]",
    className
  );
  const sizes = compact ? "10rem" : "14rem";
  const lightClass =
    tone === "onDark"
      ? "hidden"
      : tone === "onLight"
        ? "block"
        : "dark:hidden contrast:hidden";
  const darkClass =
    tone === "onLight"
      ? "hidden"
      : tone === "onDark"
        ? "block"
        : "hidden dark:block contrast:block";
  return (
    <>
      <Image
        src="/logo-trilha-da-oportunidade.svg"
        alt="Trilha da Oportunidade"
        width={LOCKUP.width}
        height={LOCKUP.height}
        sizes={sizes}
        className={cn(frame, lightClass)}
        unoptimized
        priority={tone !== "onDark"}
      />
      <Image
        src="/logo-trilha-da-oportunidade-escuro.svg"
        alt={tone === "onDark" ? "Trilha da Oportunidade" : ""}
        width={LOCKUP.width}
        height={LOCKUP.height}
        sizes={sizes}
        className={cn(frame, darkClass)}
        unoptimized
        aria-hidden={tone !== "onDark"}
      />
    </>
  );
}
