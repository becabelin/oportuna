"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type RevealTag = "div" | "section" | "article" | "figure";

function motionBlocked() {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("contrast") ||
    document.documentElement.classList.contains("motion-pause")
  );
}

export function Reveal({
  as: Tag = "div",
  children,
  className,
  delay = 0,
  eager = false,
  ...rest
}: {
  as?: RevealTag;
  children: ReactNode;
  className?: string;
  delay?: number;
  eager?: boolean;
} & Omit<HTMLAttributes<HTMLElement>, "style">) {
  const ref = useRef<HTMLElement | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (motionBlocked()) return;
    if (eager) {
      setAnimate(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          io.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  return (
    <Tag
      ref={ref as never}
      {...rest}
      className={cn("reveal", eager && "reveal-eager", animate && "did-animate", className)}
      style={
        delay
          ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties)
          : undefined
      }
    >
      {children}
    </Tag>
  );
}
