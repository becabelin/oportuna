"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function scrollToTop() {
  const reduce =
    document.documentElement.classList.contains("motion-pause") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduce ? "instant" : "smooth" });
}

export function HomeLogoLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      className={className}
      aria-label="Trilha da Oportunidade, ir ao topo da página inicial"
      onClick={() => {
        if (pathname === "/") scrollToTop();
      }}
    >
      {children}
    </Link>
  );
}
