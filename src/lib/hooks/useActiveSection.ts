'use client';

import { useEffect, useState } from 'react';
import { sectionIds, type SectionId } from '@/lib/site.config';

/**
 * The section currently under the reading line, for the nav's active indicator.
 *
 * Uses one IntersectionObserver with a band across the middle of the viewport
 * rather than a scroll listener, so it costs nothing while the page is idle.
 * When several sections overlap the band the last one in document order wins,
 * which matches how a reader perceives "where am I".
 */
export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>(sectionIds[0]);

  useEffect(() => {
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Last section in document order that is still in the band.
        for (let i = sectionIds.length - 1; i >= 0; i -= 1) {
          const id = sectionIds[i]!;
          if (visible.has(id)) {
            setActive(id);
            return;
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return active;
}
