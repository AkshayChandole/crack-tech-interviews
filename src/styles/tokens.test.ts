import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");

function parseBlock(selector: string): Record<string, string> {
  const block = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1];
  if (!block) throw new Error(`No ${selector} block in tokens.css`);
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/gi)].map((m) => [
      m[1],
      m[2],
    ]),
  );
}

// WCAG 2.1 relative luminance and contrast ratio.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const diagramRoles = [
  "client",
  "service",
  "database",
  "cache",
  "queue",
  "external",
];

// [foreground, background]: text must reach 4.5:1 (WCAG AA, normal text).
const textPairs: [string, string][] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary", "background"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["muted-foreground", "background"],
  ["muted-foreground", "muted"],
  ["accent-foreground", "accent"],
  ["destructive", "background"],
  ["link", "background"],
  ["brand-subtle-foreground", "brand-subtle"],
  ...diagramRoles.map((role): [string, string] => [
    `diagram-${role}`,
    `diagram-${role}-subtle`,
  ]),
];

// Non-text UI (focus rings, animated flow) must reach 3:1 (WCAG 1.4.11).
const uiPairs: [string, string][] = [
  ["ring", "background"],
  ["diagram-flow", "background"],
];

const themes = { light: parseBlock(":root"), dark: parseBlock("\\.dark") };

describe.each(Object.entries(themes))("%s theme", (_, tokens) => {
  it.each(textPairs)("%s on %s meets 4.5:1", (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(uiPairs)("%s on %s meets 3:1", (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(3);
  });
});

describe("token sets", () => {
  it("define the same tokens in light and dark", () => {
    expect(Object.keys(themes.dark).sort()).toEqual(
      Object.keys(themes.light).sort(),
    );
  });
});
