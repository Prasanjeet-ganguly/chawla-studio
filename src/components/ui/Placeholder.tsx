import type { ReactNode } from 'react';

type PlaceholderProps = {
  children: ReactNode;
  /** Where the studio should go to replace this. */
  source: string;
};

/**
 * Copy the studio still has to write, marked as such on the page.
 *
 * The brief for this site forbids inventing a biography, a location, an award or
 * a client, so anything that would need one is left as a visible, labelled gap
 * with the file to edit printed underneath. Better an honest hole than plausible
 * fiction that nobody remembers to remove.
 */
export function Placeholder({ children, source }: PlaceholderProps) {
  return (
    <div className="border border-dashed border-hairline-strong p-6">
      <p className="eyebrow text-selenium">Placeholder copy</p>
      <div className="mt-4 text-sm text-paper-dim">{children}</div>
      <p className="mt-5 font-mono text-data tracked-wide text-muted">Edit: {source}</p>
    </div>
  );
}
