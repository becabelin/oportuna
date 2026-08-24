"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const HERO_RATE = 0.3;

function motionBlocked() {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("motion-pause") ||
    document.documentElement.classList.contains("contrast")
  );
}

export function HeroMesh({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loadVideo, setLoadVideo] = useState(false);

  useEffect(() => {
    if (motionBlocked()) return;
    const start = () => {
      if (!motionBlocked()) setLoadVideo(true);
    };
    if (typeof window.requestIdleCallback === "function") {
      const idle = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(idle);
    }
    const timeout = window.setTimeout(start, 1200);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !loadVideo) return;
    video.playbackRate = HERO_RATE;
    void video.play().catch(() => undefined);
  }, [loadVideo]);

  return (
    <div
      data-cover="hero"
      className={cn("absolute inset-0 overflow-hidden bg-[#001A4C] contrast:bg-background", className)}
      aria-hidden
    >
      <Image
        src="/hero-poster.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover contrast:hidden"
      />
      {loadVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover contrast:hidden motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          onPlay={(event) => {
            event.currentTarget.playbackRate = HERO_RATE;
          }}
        >
          <source src="/hero-sky.mp4" type="video/mp4" />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-linear-to-r from-[#001A4C]/70 via-[#001A4C]/25 to-transparent contrast:hidden" />
    </div>
  );
}

export function DotGlobe({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-square w-full max-w-md", className)} aria-hidden>
      <div
        className="absolute inset-0 rounded-full opacity-90"
        style={{
          backgroundImage: "radial-gradient(circle, #FDB409 1.2px, transparent 1.4px)",
          backgroundSize: "14px 14px",
          maskImage: "radial-gradient(circle at 50% 50%, black 42%, transparent 68%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 42%, transparent 68%)",
        }}
      />
    </div>
  );
}
