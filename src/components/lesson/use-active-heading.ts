"use client";

import { useEffect, useState } from "react";

import { getActiveHeadingId } from "./toc";

// Below the sticky header (3.5rem) plus the mobile "On this page" bar.
export const HEADING_OFFSET = 112;

export function useActiveHeading(ids: string[]): string | undefined {
  const [activeId, setActiveId] = useState<string>();
  const key = ids.join(" ");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const headings = key.split(" ").flatMap((id) => {
        const element = document.getElementById(id);
        return element
          ? [{ id, top: element.getBoundingClientRect().top }]
          : [];
      });
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      setActiveId(getActiveHeadingId(headings, HEADING_OFFSET, atBottom));
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
  }, [key]);

  return activeId;
}
