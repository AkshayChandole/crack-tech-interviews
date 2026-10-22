// URL scheme from docs/content-model.md. Modules are deliberately not part of
// URLs, so reorganizing modules never breaks links.

export function categoryHref(categoryId: string): string {
  return `/${categoryId}`;
}

export function lessonHref(lesson: { category: string; id: string }): string {
  return `/${lesson.category}/${lesson.id}`;
}

export function problemsHref(categoryId: string): string {
  return `/${categoryId}/problems`;
}

export function problemHref(problem: { category: string; id: string }): string {
  return `/${problem.category}/problems/${problem.id}`;
}

export function itemHref(item: {
  type: "lesson" | "problem";
  category: string;
  id: string;
}): string {
  return item.type === "lesson" ? lessonHref(item) : problemHref(item);
}

export function conceptHref(conceptId: string): string {
  return `/concepts/${conceptId}`;
}

export function pathHref(pathId: string): string {
  return `/paths/${pathId}`;
}
