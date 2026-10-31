"use client";

import { usePathname } from "next/navigation";
import { ListTree } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Mobile container for the lesson sidebar. Keyed by pathname so the drawer
// closes after navigating to another lesson.
export function LessonsDrawer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Sheet key={pathname}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <ListTree aria-hidden="true" />
          Lessons
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="sr-only">
            Lessons in this category
          </SheetDescription>
        </SheetHeader>
        <div className="px-2 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
