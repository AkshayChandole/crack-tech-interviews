import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrackTechInterviews",
  description:
    "Deep, visual system design interview preparation for senior and staff engineers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
