import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-semibold tracking-tight">
        <span className="text-primary">Crack</span>TechInterviews
      </h1>
      <p className="text-lg text-muted-foreground">
        Deep, visual system design interview preparation for senior and staff
        engineers. Coming soon.
      </p>
      <div>
        <ThemeToggle />
      </div>
    </main>
  );
}
