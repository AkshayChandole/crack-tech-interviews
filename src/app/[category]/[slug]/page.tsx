import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonPager } from "@/components/lesson/lesson-pager";
import { LessonSidebar } from "@/components/lesson/lesson-sidebar";
import { LessonsDrawer } from "@/components/lesson/lessons-drawer";
import { MDXContent } from "@/components/mdx/mdx-content";
import {
  categoryHref,
  content,
  difficultyLabel,
  lessonKindLabel,
  readingTimeLabel,
  seniorityLabel,
  statusLabel,
} from "@/lib/content";

export function generateStaticParams() {
  const params = content.getCategories().flatMap((category) =>
    content.getLessons(category.id).map((lesson) => ({
      category: category.id,
      slug: lesson.id,
    })),
  );
  // Cache Components requires at least one param. When no lesson is visible
  // (e.g. only drafts in production), prerender a placeholder that 404s.
  return params.length > 0
    ? params
    : [{ category: "system-design", slug: "no-lessons" }];
}

async function getLessonFromParams(
  params: PageProps<"/[category]/[slug]">["params"],
) {
  const { category, slug } = await params;
  return content.getLesson(category, slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/[category]/[slug]">): Promise<Metadata> {
  const lesson = await getLessonFromParams(params);
  if (!lesson) return { title: "Page not found" };
  return { title: lesson.title, description: lesson.summary };
}

export default async function LessonPage({
  params,
}: PageProps<"/[category]/[slug]">) {
  const lesson = await getLessonFromParams(params);
  if (!lesson) notFound();

  const category = content.getCategory(lesson.category);
  const lessonModule = content.getModule(lesson.module);
  const tree = content.getModuleTree(lesson.category);
  const { previous, next } = content.getLessonNeighbors(
    lesson.category,
    lesson.id,
  );
  const sidebar = <LessonSidebar tree={tree} currentLessonId={lesson.id} />;

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Sticky below the 3.5rem header; scrolls on its own when long. */}
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] overflow-y-auto py-10 lg:block">
        {sidebar}
      </aside>

      <article className="mx-auto w-full max-w-3xl py-10 sm:py-14">
        <div className="mb-6 lg:hidden">
          <LessonsDrawer title={category?.title ?? "Lessons"}>
            {sidebar}
          </LessonsDrawer>
        </div>
        <header className="flex flex-col gap-4 border-b pb-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href={categoryHref(lesson.category)}
                  className="hover:text-foreground"
                >
                  {category?.title}
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li>{lessonModule?.title}</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="text-lg text-muted-foreground">{lesson.summary}</p>
          </div>

          <ul className="flex flex-wrap items-center gap-2 text-sm">
            {lesson.status !== "published" && (
              <li className="rounded-md bg-brand-subtle px-2 py-0.5 font-medium text-brand-subtle-foreground">
                {statusLabel(lesson.status)}
              </li>
            )}
            <li className="rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground">
              {lessonKindLabel(lesson.kind)}
            </li>
            <li className="rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground">
              {difficultyLabel(lesson.difficulty)}
            </li>
            <li className="rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground">
              {seniorityLabel(lesson.seniority)}
            </li>
            <li className="text-muted-foreground">
              {readingTimeLabel(lesson.metadata.readingTime)}
            </li>
          </ul>
        </header>

        <div className="prose prose-lg mt-8 max-w-none prose-tokens prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none">
          <MDXContent code={lesson.body} />
        </div>

        <LessonPager previous={previous} next={next} />
      </article>
    </div>
  );
}
