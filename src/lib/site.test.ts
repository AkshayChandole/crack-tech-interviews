import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/site";

describe("siteConfig", () => {
  it("has a name", () => {
    expect(siteConfig.name).toBe("CrackTechInterviews");
  });

  // Search engines truncate meta descriptions at roughly 160 characters.
  it("keeps the description within 160 characters", () => {
    expect(siteConfig.description.length).toBeGreaterThan(0);
    expect(siteConfig.description.length).toBeLessThanOrEqual(160);
  });
});
