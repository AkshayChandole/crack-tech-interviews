import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names and skips falsy values", () => {
    expect(cn("px-2", false, undefined, "py-1")).toBe("px-2 py-1");
  });

  it("lets later Tailwind classes override conflicting earlier ones", () => {
    expect(cn("px-2 text-muted-foreground", "px-4 text-primary")).toBe(
      "px-4 text-primary",
    );
  });

  // Our token names (text-link, bg-brand-subtle, …) must be treated as colors,
  // not confused with font sizes or other utilities.
  it("keeps a font size and a custom token color together", () => {
    expect(cn("text-sm", "text-link")).toBe("text-sm text-link");
    expect(cn("bg-muted", "bg-brand-subtle")).toBe("bg-brand-subtle");
  });
});
