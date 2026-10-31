import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { lessonHref, type ModuleWithLessons } from "@/lib/content";
import { cn } from "@/lib/utils";

// Module tree for a category. The current lesson's module starts expanded;
// <details> keeps expand/collapse working without client JavaScript.
export function LessonSidebar({
  tree,
  currentLessonId,
}: {
  tree: ModuleWithLessons[];
  currentLessonId: string;
}) {
  return (
    <nav aria-label="Lessons" className="flex flex-col gap-1 text-sm">
      {tree.map(({ module: mod, lessons }) => {
        const isCurrentModule = lessons.some(
          (lesson) => lesson.id === currentLessonId,
        );
        return (
          <details key={mod.id} open={isCurrentModule} className="group">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-2 py-1.5 font-medium text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
              <ChevronRight
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
              />
              {mod.title}
            </summary>
            <ol className="mt-1 mb-2 ml-[1.1rem] flex flex-col border-l">
              {lessons.map((lesson) => {
                const isCurrent = lesson.id === currentLessonId;
                return (
                  <li key={lesson.id}>
                    <Link
                      href={lessonHref(lesson)}
                      aria-current={isCurrent ? "page" : undefined}
                      className={cn(
                        "-ml-px block border-l py-1.5 pr-2 pl-3 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isCurrent
                          ? "border-primary font-medium text-primary"
                          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      {lesson.title}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </details>
        );
      })}
    </nav>
  );
}
