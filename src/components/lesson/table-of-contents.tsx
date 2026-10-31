"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import type { TocItem } from "./toc";
import { useActiveHeading } from "./use-active-heading";

function TocList({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[];
  activeId?: string;
  onNavigate?: () => void;
}) {
  return (
    <ol className="flex flex-col border-l text-sm">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={onNavigate}
              aria-current={active ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 pr-2 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                item.depth > 1 ? "pl-6" : "pl-3",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.title}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

// Right-hand column on wide screens.
export function TableOfContents({ items }: { items: TocItem[] }) {
  const activeId = useActiveHeading(items.map((item) => item.id));
  if (items.length === 0) return null;
  return (
    <nav aria-labelledby="toc-heading" className="flex flex-col gap-3">
      <h2
        id="toc-heading"
        className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
      >
        On this page
      </h2>
      <TocList items={items} activeId={activeId} />
    </nav>
  );
}

// Sticky collapsible bar on narrower screens, showing the current section.
export function MobileTableOfContents({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  const activeId = useActiveHeading(items.map((item) => item.id));
  if (items.length === 0) return null;
  const activeTitle = items.find((item) => item.id === activeId)?.title;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-14 z-30 -mx-4 border-b bg-background px-4 sm:-mx-6 sm:px-6 xl:hidden"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-toc"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 py-3 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="font-medium">On this page</span>
        {activeTitle && (
          <span className="truncate text-muted-foreground">
            · {activeTitle}
          </span>
        )}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "ml-auto size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div id="mobile-toc" className="max-h-[60svh] overflow-y-auto pb-4">
          <TocList
            items={items}
            activeId={activeId}
            onNavigate={() => setOpen(false)}
          />
        </div>
      )}
    </nav>
  );
}
