"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const options = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

const subscribe = () => () => {};

// The stored theme is only known in the browser; render no selection on the
// server to avoid a hydration mismatch.
function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex rounded-lg border p-0.5 text-sm"
    >
      {options.map((option) => {
        const selected = isClient && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => setTheme(option.value)}
            className={`rounded-md px-3 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
              selected
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
