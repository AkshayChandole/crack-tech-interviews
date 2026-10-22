"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const options = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
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
      className="inline-flex gap-0.5 rounded-lg border p-0.5"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const selected = isClient && theme === value;
        return (
          <Button
            key={value}
            variant={selected ? "secondary" : "ghost"}
            size="icon-sm"
            aria-pressed={selected}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            onClick={() => setTheme(value)}
            className={selected ? undefined : "text-muted-foreground"}
          >
            <Icon aria-hidden="true" />
          </Button>
        );
      })}
    </div>
  );
}
