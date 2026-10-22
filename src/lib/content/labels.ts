// Human-readable labels for content metadata enums.

const difficultyLabels = {
  foundational: "Foundational",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

const seniorityLabels = { senior: "Senior", staff: "Staff" } as const;

const lessonKindLabels = {
  concept: "Concept",
  "building-block": "Building block",
  pattern: "Pattern",
} as const;

const statusLabels = {
  draft: "Draft",
  "in-review": "In review",
  published: "Published",
} as const;

export function difficultyLabel(value: keyof typeof difficultyLabels) {
  return difficultyLabels[value];
}

export function seniorityLabel(values: (keyof typeof seniorityLabels)[]) {
  return values.map((value) => seniorityLabels[value]).join(" · ");
}

export function lessonKindLabel(value: keyof typeof lessonKindLabels) {
  return lessonKindLabels[value];
}

export function statusLabel(value: keyof typeof statusLabels) {
  return statusLabels[value];
}

export function readingTimeLabel(minutes: number) {
  return `${Math.max(1, Math.round(minutes))} min read`;
}
