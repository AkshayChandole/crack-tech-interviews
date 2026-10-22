import { describe, expect, it } from "vitest";

import {
  difficultyLabel,
  lessonKindLabel,
  readingTimeLabel,
  seniorityLabel,
  statusLabel,
} from "@/lib/content/labels";

describe("content labels", () => {
  it("labels enum values", () => {
    expect(difficultyLabel("intermediate")).toBe("Intermediate");
    expect(lessonKindLabel("building-block")).toBe("Building block");
    expect(statusLabel("in-review")).toBe("In review");
  });

  it("joins seniority levels", () => {
    expect(seniorityLabel(["senior"])).toBe("Senior");
    expect(seniorityLabel(["senior", "staff"])).toBe("Senior · Staff");
  });

  it.each([
    [0, "1 min read"],
    [0.4, "1 min read"],
    [1, "1 min read"],
    [7.6, "8 min read"],
  ])("formats %s minutes as %s", (minutes, label) => {
    expect(readingTimeLabel(minutes)).toBe(label);
  });
});
