import { siteConfig } from "@/lib/site";

import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Wordmark />
        <p>{siteConfig.description}</p>
      </div>
    </footer>
  );
}
