"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { getActiveHref } from "./active-href";

interface NavItem {
  title: string;
  href: string;
}

export function MainNav({
  items,
  className,
  onNavigate,
}: {
  items: readonly NavItem[];
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeHref = getActiveHref(
    pathname,
    items.map((item) => item.href),
  );

  return (
    <nav aria-label="Main" className={className}>
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
