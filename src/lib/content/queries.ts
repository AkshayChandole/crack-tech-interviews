import type {
  Category,
  Concept,
  Lesson,
  Module,
  Path,
  Problem,
} from "#site/content";

// Pure query functions over validated content. src/lib/content/index.ts binds
// them to the generated Velite data; tests bind them to fixtures.

export type Item = Lesson | Problem;

export interface ContentSource {
  lessons: Lesson[];
  problems: Problem[];
  concepts: Concept[];
  paths: Path[];
  modules: Module[];
  categories: Category[];
}

export interface QueryOptions {
  // Show drafts and in-review items (development and preview deployments).
  includeDrafts: boolean;
}

export interface ModuleWithLessons {
  module: Module;
  lessons: Lesson[];
}

export interface PathWithItems {
  path: Path;
  groups: { title: string; items: Item[] }[];
}

export function createContentQueries(
  source: ContentSource,
  { includeDrafts }: QueryOptions,
) {
  const isVisible = (item: Item) =>
    includeDrafts || item.status === "published";

  const lessonsById = new Map(source.lessons.map((l) => [l.id, l]));
  const problemsById = new Map(source.problems.map((p) => [p.id, p]));
  const modulesById = new Map(source.modules.map((m) => [m.id, m]));
  const categoriesById = new Map<string, Category>(
    source.categories.map((c) => [c.id, c]),
  );
  const conceptsById = new Map(source.concepts.map((c) => [c.id, c]));
  const pathsById = new Map(source.paths.map((p) => [p.id, p]));

  // Lessons and problems share one id namespace (enforced by validate.ts).
  const getItem = (id: string): Item | undefined => {
    const item = lessonsById.get(id) ?? problemsById.get(id);
    return item && isVisible(item) ? item : undefined;
  };

  // Resolves ids in order, dropping hidden or unknown ones.
  const getItems = (ids: string[]): Item[] =>
    ids.flatMap((id) => getItem(id) ?? []);

  const getModuleTree = (categoryId: string): ModuleWithLessons[] =>
    (categoriesById.get(categoryId)?.modules ?? []).flatMap((moduleId) => {
      const mod = modulesById.get(moduleId);
      if (!mod) return [];
      const lessons = mod.items.flatMap((id) => {
        const lesson = lessonsById.get(id);
        return lesson && isVisible(lesson) ? [lesson] : [];
      });
      // Modules with no visible lessons are hidden entirely.
      return lessons.length > 0 ? [{ module: mod, lessons }] : [];
    });

  // All visible lessons of a category in reading order.
  const getLessons = (categoryId: string): Lesson[] =>
    getModuleTree(categoryId).flatMap(({ lessons }) => lessons);

  const getProblems = (categoryId: string): Problem[] =>
    (categoriesById.get(categoryId)?.problems ?? []).flatMap((id) => {
      const problem = problemsById.get(id);
      return problem && isVisible(problem) ? [problem] : [];
    });

  return {
    getCategories: (): Category[] => source.categories,
    getCategory: (id: string): Category | undefined => categoriesById.get(id),

    getModuleTree,
    getLessons,
    getProblems,

    getLesson: (categoryId: string, id: string): Lesson | undefined => {
      const lesson = lessonsById.get(id);
      return lesson && lesson.category === categoryId && isVisible(lesson)
        ? lesson
        : undefined;
    },

    getProblem: (categoryId: string, id: string): Problem | undefined => {
      const problem = problemsById.get(id);
      return problem && problem.category === categoryId && isVisible(problem)
        ? problem
        : undefined;
    },

    getItem,
    getItems,

    // Previous and next lesson in reading order, across module boundaries.
    getLessonNeighbors: (categoryId: string, id: string) => {
      const lessons = getLessons(categoryId);
      const index = lessons.findIndex((lesson) => lesson.id === id);
      return {
        previous: index > 0 ? lessons[index - 1] : undefined,
        next:
          index >= 0 && index < lessons.length - 1
            ? lessons[index + 1]
            : undefined,
      };
    },

    // Visible items that list `id` as a prerequisite or related item.
    getBacklinks: (id: string): Item[] =>
      [...source.lessons, ...source.problems].filter(
        (item) =>
          isVisible(item) &&
          (item.prerequisites.includes(id) || item.related.includes(id)),
      ),

    getConcepts: (): Concept[] =>
      [...source.concepts].sort((a, b) => a.term.localeCompare(b.term)),
    getConcept: (id: string): Concept | undefined => conceptsById.get(id),

    // Visible items that reference a concept.
    getItemsForConcept: (conceptId: string): Item[] =>
      [...source.lessons, ...source.problems].filter(
        (item) => isVisible(item) && item.concepts.includes(conceptId),
      ),

    getPaths: (): Path[] => source.paths,
    getPath: (id: string): PathWithItems | undefined => {
      const path = pathsById.get(id);
      if (!path) return undefined;
      return {
        path,
        groups: path.groups.map((group) => ({
          title: group.title,
          items: getItems(group.items),
        })),
      };
    },
  };
}

export type ContentQueries = ReturnType<typeof createContentQueries>;
