import { categoryHref, problemsHref } from "@/lib/content/urls";

export const siteConfig = {
  name: "CrackTechInterviews",
  description:
    "Deep, visual system design interview preparation for senior and staff engineers.",
  nav: [
    { title: "System Design", href: categoryHref("system-design") },
    { title: "Problems", href: problemsHref("system-design") },
    { title: "Concepts", href: "/concepts" },
    { title: "Paths", href: "/paths" },
  ],
} as const;
