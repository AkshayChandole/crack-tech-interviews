import { describe, expect, it } from "vitest";

import { getActiveHref } from "@/components/layout/active-href";
import { siteConfig } from "@/lib/site";

const hrefs = siteConfig.nav.map((item) => item.href);

describe("getActiveHref", () => {
  it.each([
    ["/system-design", "/system-design"],
    ["/system-design/load-balancing", "/system-design"],
    ["/system-design/problems", "/system-design/problems"],
    ["/system-design/problems/url-shortener", "/system-design/problems"],
    ["/concepts/health-check", "/concepts"],
    ["/paths", "/paths"],
  ])("highlights the right item on %s", (pathname, expected) => {
    expect(getActiveHref(pathname, hrefs)).toBe(expected);
  });

  it.each(["/", "/about", "/dev/tokens"])(
    "highlights nothing on %s",
    (pathname) => {
      expect(getActiveHref(pathname, hrefs)).toBeUndefined();
    },
  );

  it("matches whole path segments only", () => {
    expect(getActiveHref("/pathsfinder", hrefs)).toBeUndefined();
    expect(getActiveHref("/system-designs", hrefs)).toBeUndefined();
  });
});
