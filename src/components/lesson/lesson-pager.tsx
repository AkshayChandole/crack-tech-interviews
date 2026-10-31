import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { lessonHref } from "@/lib/content";
import { cn } from "@/lib/utils";

interface PagerLesson {
  id: string;
  title: string;
  category: string;
}

function PagerLink({
  lesson,
  direction,
}: {
  lesson: PagerLesson;
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";
  return (
    <Link
      href={lessonHref(lesson)}
      rel={isNext ? "next" : "prev"}
      className={cn(
        "group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        isNext && "items-end text-right sm:col-start-2",
      )}
    >
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        {!isNext && <ArrowLeft aria-hidden="true" className="size-4" />}
        {isNext ? "Next" : "Previous"}
        {isNext && <ArrowRight aria-hidden="true" className="size-4" />}
      </span>
      <span className="font-medium group-hover:text-primary">
        {lesson.title}
      </span>
    </Link>
  );
}

export function LessonPager({
  previous,
  next,
}: {
  previous?: PagerLesson;
  next?: PagerLesson;
}) {
  if (!previous && !next) return null;
  return (
    <nav
      aria-label="Previous and next lessons"
      className="mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2"
    >
      {previous && <PagerLink lesson={previous} direction="previous" />}
      {next && <PagerLink lesson={next} direction="next" />}
    </nav>
  );
}
