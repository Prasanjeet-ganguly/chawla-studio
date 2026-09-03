/**
 * The film grain that sits over the whole document.
 *
 * A server component with no props: it is one fixed, non-interactive layer whose
 * texture comes from a CSS custom property (see --grain-image in globals.css),
 * so it ships no JavaScript at all.
 */
export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}
