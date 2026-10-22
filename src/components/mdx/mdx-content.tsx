import * as runtime from "react/jsx-runtime";
import type { MDXComponents } from "mdx/types";

// Velite compiles MDX to a function body (see s.mdx() in velite.config.ts)
// that expects the JSX runtime as its argument and returns the module.
function getMDXContent(code: string) {
  const fn = new Function(code);
  return fn({ ...runtime }).default as (props: {
    components?: MDXComponents;
  }) => React.ReactNode;
}

export function MDXContent({
  code,
  components,
}: {
  code: string;
  components?: MDXComponents;
}) {
  return getMDXContent(code)({ components });
}
