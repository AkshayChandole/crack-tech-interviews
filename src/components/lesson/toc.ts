// Pure helpers for the table of contents and reading progress, kept free of
// the DOM so they can be unit tested.

export interface TocEntry {
  title: string;
  url: string;
  items: TocEntry[];
}

export interface TocItem {
  id: string;
  title: string;
  depth: number;
}

// Flattens Velite's nested TOC, keeping headings up to `maxDepth` (1 = h2).
export function flattenToc(entries: TocEntry[], maxDepth = 2): TocItem[] {
  const walk = (list: TocEntry[], depth: number): TocItem[] =>
    depth > maxDepth
      ? []
      : list.flatMap((entry) => [
          { id: entry.url.replace(/^#/, ""), title: entry.title, depth },
          ...walk(entry.items, depth + 1),
        ]);
  return walk(entries, 1);
}

// The section being read: the last heading whose top has scrolled above
// `offset` (px from the viewport top). Before the first heading, that's the
// first one; at the very bottom of the page, the last one, since short final
// sections can never reach the offset.
export function getActiveHeadingId(
  headings: { id: string; top: number }[],
  offset: number,
  atBottom: boolean,
): string | undefined {
  if (headings.length === 0) return undefined;
  if (atBottom) return headings[headings.length - 1].id;
  let active = headings[0].id;
  for (const heading of headings) {
    if (heading.top <= offset) active = heading.id;
    else break;
  }
  return active;
}

// Fraction (0–1) of an element scrolled past: 0 when its top reaches the
// viewport top, 1 when its bottom reaches the viewport bottom.
export function getReadingProgress({
  scrollY,
  elementTop,
  elementHeight,
  viewportHeight,
}: {
  scrollY: number;
  elementTop: number;
  elementHeight: number;
  viewportHeight: number;
}): number {
  const scrollable = elementHeight - viewportHeight;
  if (scrollable <= 0) return scrollY >= elementTop ? 1 : 0;
  return Math.min(1, Math.max(0, (scrollY - elementTop) / scrollable));
}
