import { describe, expect, it } from "vitest";

import {
  flattenToc,
  getActiveHeadingId,
  getReadingProgress,
} from "@/components/lesson/toc";

const toc = [
  {
    title: "How it works",
    url: "#how-it-works",
    items: [
      {
        title: "Health checks",
        url: "#health-checks",
        items: [{ title: "Too deep", url: "#too-deep", items: [] }],
      },
    ],
  },
  { title: "Trade-offs", url: "#trade-offs", items: [] },
];

describe("flattenToc", () => {
  it("flattens h2 and h3 headings in document order", () => {
    expect(flattenToc(toc)).toEqual([
      { id: "how-it-works", title: "How it works", depth: 1 },
      { id: "health-checks", title: "Health checks", depth: 2 },
      { id: "trade-offs", title: "Trade-offs", depth: 1 },
    ]);
  });

  it("respects maxDepth", () => {
    expect(flattenToc(toc, 1).map((item) => item.id)).toEqual([
      "how-it-works",
      "trade-offs",
    ]);
  });

  it("handles an empty TOC", () => {
    expect(flattenToc([])).toEqual([]);
  });
});

describe("getActiveHeadingId", () => {
  const headings = (tops: number[]) =>
    tops.map((top, index) => ({ id: `h${index + 1}`, top }));

  it("picks the last heading scrolled above the offset", () => {
    expect(getActiveHeadingId(headings([-500, 80, 400]), 112, false)).toBe(
      "h2",
    );
  });

  it("picks the first heading before any reaches the offset", () => {
    expect(getActiveHeadingId(headings([300, 900]), 112, false)).toBe("h1");
  });

  it("picks the last heading at the bottom of the page", () => {
    expect(getActiveHeadingId(headings([-500, 80, 400]), 112, true)).toBe("h3");
  });

  it("returns undefined without headings", () => {
    expect(getActiveHeadingId([], 112, false)).toBeUndefined();
  });
});

describe("getReadingProgress", () => {
  const article = { elementTop: 200, elementHeight: 3000, viewportHeight: 800 };

  it.each([
    [0, 0],
    [200, 0],
    [1300, 0.5],
    [2400, 1],
    [5000, 1],
  ])("at scrollY %s is %s", (scrollY, expected) => {
    expect(getReadingProgress({ ...article, scrollY })).toBe(expected);
  });

  it("treats content shorter than the viewport as fully read once reached", () => {
    const short = { elementTop: 100, elementHeight: 400, viewportHeight: 800 };
    expect(getReadingProgress({ ...short, scrollY: 0 })).toBe(0);
    expect(getReadingProgress({ ...short, scrollY: 100 })).toBe(1);
  });
});
