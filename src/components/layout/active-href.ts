// The nav item for the current page: the longest href that equals the
// pathname or is a parent segment of it. Longest wins so that
// /system-design/problems/x highlights "Problems", not "System Design".
export function getActiveHref(
  pathname: string,
  hrefs: readonly string[],
): string | undefined {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}
