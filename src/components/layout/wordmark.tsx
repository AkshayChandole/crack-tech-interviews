import Link from "next/link";

export function Wordmark() {
  return (
    <Link
      href="/"
      className="rounded-md text-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span className="text-primary">Crack</span>TechInterviews
    </Link>
  );
}
