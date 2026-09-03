/**
 * First thing in the tab order: a jump past the header straight into the page.
 *
 * Off-screen until focused rather than hidden, so a keyboard visitor can always
 * reach it and a screen reader always announces it.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="absolute left-4 top-4 z-[80] -translate-y-24 bg-paper px-5 py-3 text-label tracked text-ink transition-transform duration-300 focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  );
}
