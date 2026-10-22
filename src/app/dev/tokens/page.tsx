import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Design tokens",
  robots: { index: false, follow: false },
};

// Tailwind only generates classes it can see, so class names are written out.
const surfaces = [
  { name: "background", className: "bg-background text-foreground" },
  { name: "card", className: "bg-card text-card-foreground" },
  { name: "primary", className: "bg-primary text-primary-foreground" },
  { name: "secondary", className: "bg-secondary text-secondary-foreground" },
  { name: "muted", className: "bg-muted text-muted-foreground" },
  { name: "accent", className: "bg-accent text-accent-foreground" },
  {
    name: "brand-subtle",
    className: "bg-brand-subtle text-brand-subtle-foreground",
  },
];

const diagramRoles = [
  {
    name: "Client",
    className:
      "border-diagram-client bg-diagram-client-subtle text-diagram-client",
  },
  {
    name: "Service",
    className:
      "border-diagram-service bg-diagram-service-subtle text-diagram-service",
  },
  {
    name: "Database",
    className:
      "border-diagram-database bg-diagram-database-subtle text-diagram-database",
  },
  {
    name: "Cache",
    className:
      "border-diagram-cache bg-diagram-cache-subtle text-diagram-cache",
  },
  {
    name: "Queue",
    className:
      "border-diagram-queue bg-diagram-queue-subtle text-diagram-queue",
  },
  {
    name: "External",
    className:
      "border-dashed border-diagram-external bg-diagram-external-subtle text-diagram-external",
  },
];

const buttonVariants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

export default function DesignTokensPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Design tokens
          </h1>
          <p className="text-sm text-muted-foreground">
            Development only. Not available in production builds.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Typography</h2>
        <p className="font-sans text-lg">
          Geist Sans: The quick brown fox jumps over the lazy dog.
        </p>
        <p className="font-mono">
          Geist Mono: 10M DAU × 20 req/day ≈ 2,300 QPS
        </p>
        <p>
          Body text with an{" "}
          <a href="#" className="text-link underline underline-offset-4">
            inline link
          </a>{" "}
          and <span className="text-destructive">destructive text</span>.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Surfaces</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {surfaces.map((surface) => (
            <div
              key={surface.name}
              className={`rounded-lg border p-4 text-sm ${surface.className}`}
            >
              {surface.name}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="w-fit rounded-md border bg-background px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Tab to me to see the focus ring
        </button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Buttons</h2>
        <div className="flex flex-wrap items-center gap-2">
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
          <Button disabled>disabled</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Diagram palette</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {diagramRoles.map((role) => (
            <div
              key={role.name}
              className={`rounded-lg border-2 p-4 text-sm font-medium ${role.className}`}
            >
              {role.name}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>Active flow</span>
          <span className="h-0.5 flex-1 bg-diagram-flow" />
          <span className="size-3 rounded-full bg-diagram-flow" />
        </div>
      </section>
    </div>
  );
}
