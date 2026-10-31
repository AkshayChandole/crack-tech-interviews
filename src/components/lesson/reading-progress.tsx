"use client";

import { useEffect, useState } from "react";

import { getReadingProgress } from "./toc";

// Thin bar under the header showing how far through `targetId` the reader is.
// Decorative (the TOC conveys position), so it's hidden from assistive tech.
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = document.getElementById(targetId);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      setProgress(
        getReadingProgress({
          scrollY: window.scrollY,
          elementTop: rect.top + window.scrollY,
          elementHeight: rect.height,
          viewportHeight: window.innerHeight,
        }),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-14 z-40 h-0.5"
    >
      <div
        className="h-full origin-left bg-primary"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
