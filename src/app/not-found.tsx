import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { categoryHref } from "@/lib/content/urls";

// Replaces Next.js's built-in 404 page, whose inline body styles follow the OS
// color scheme and override our theme tokens.
export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 px-6 py-24 sm:py-32">
      <p className="font-mono text-sm font-medium text-primary">404</p>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="text-lg text-muted-foreground">
          This page doesn&apos;t exist or isn&apos;t published yet. Check the
          URL, or start from one of these.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={categoryHref("system-design")}>
            Explore System Design
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
