import { describe, expect, it } from "vitest";

import {
  categoryHref,
  conceptHref,
  itemHref,
  lessonHref,
  pathHref,
  problemHref,
  problemsHref,
} from "@/lib/content/urls";

describe("content URLs", () => {
  it("builds the URL scheme from the content model", () => {
    expect(categoryHref("system-design")).toBe("/system-design");
    expect(lessonHref({ category: "system-design", id: "sharding" })).toBe(
      "/system-design/sharding",
    );
    expect(problemsHref("system-design")).toBe("/system-design/problems");
    expect(
      problemHref({ category: "system-design", id: "url-shortener" }),
    ).toBe("/system-design/problems/url-shortener");
    expect(conceptHref("consistent-hashing")).toBe(
      "/concepts/consistent-hashing",
    );
    expect(pathHref("staff-loop-4-weeks")).toBe("/paths/staff-loop-4-weeks");
  });

  it("picks the lesson or problem URL by type", () => {
    expect(
      itemHref({ type: "lesson", category: "system-design", id: "sharding" }),
    ).toBe("/system-design/sharding");
    expect(
      itemHref({ type: "problem", category: "system-design", id: "chat" }),
    ).toBe("/system-design/problems/chat");
  });
});
