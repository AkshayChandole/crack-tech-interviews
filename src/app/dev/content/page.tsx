import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { content, itemHref } from "@/lib/content";

export const metadata: Metadata = {
  title: "Content",
  robots: { index: false, follow: false },
};

function StatusBadge({ status }: { status: string }) {
  if (status === "published") return null;
  return (
    <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
      {status}
    </span>
  );
}

export default function ContentPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
        <p className="text-sm text-muted-foreground">
          Development only. Everything the content query layer returns, in
          reading order. Drafts are shown here and hidden in production.
        </p>
      </header>

      {content.getCategories().map((category) => (
        <section key={category.id} className="flex flex-col gap-6">
          <h2 className="text-xl font-medium">{category.title}</h2>

          {content.getModuleTree(category.id).map(({ module, lessons }) => (
            <div key={module.id} className="flex flex-col gap-2">
              <h3 className="font-medium">{module.title}</h3>
              <ol className="flex flex-col gap-1 text-sm">
                {lessons.map((lesson) => {
                  const { previous, next } = content.getLessonNeighbors(
                    category.id,
                    lesson.id,
                  );
                  return (
                    <li key={lesson.id}>
                      <code>{itemHref(lesson)}</code>
                      <StatusBadge status={lesson.status} />
                      <span className="ml-2 text-muted-foreground">
                        {lesson.metadata.readingTime} min · prev:{" "}
                        {previous?.id ?? "none"} · next: {next?.id ?? "none"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Problems</h3>
            <ol className="flex flex-col gap-1 text-sm">
              {content.getProblems(category.id).map((problem) => (
                <li key={problem.id}>
                  <code>{itemHref(problem)}</code>
                  <StatusBadge status={problem.status} />
                  <span className="ml-2 text-muted-foreground">
                    {problem.estimatedInterviewTime} min interview · referenced
                    by:{" "}
                    {content
                      .getBacklinks(problem.id)
                      .map((item) => item.id)
                      .join(", ") || "none"}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-medium">Concepts</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {content.getConcepts().map((concept) => (
            <li key={concept.id}>
              <span className="font-medium">{concept.term}</span>
              <span className="ml-2 text-muted-foreground">
                used by:{" "}
                {content
                  .getItemsForConcept(concept.id)
                  .map((item) => item.id)
                  .join(", ") || "none"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-medium">Paths</h2>
        {content.getPaths().map(({ id }) => {
          const resolved = content.getPath(id);
          if (!resolved) return null;
          return (
            <div key={id} className="text-sm">
              <p className="font-medium">{resolved.path.title}</p>
              {resolved.groups.map((group) => (
                <p key={group.title} className="text-muted-foreground">
                  {group.title}:{" "}
                  {group.items.map((item) => item.id).join(", ") || "none"}
                </p>
              ))}
            </div>
          );
        })}
      </section>
    </div>
  );
}
