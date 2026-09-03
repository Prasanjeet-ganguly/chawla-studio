'use client';

import { useEffect, useRef } from 'react';
import { useIsTouch, useReducedMotion } from './useMediaQuery';

export type Pointer = { x: number; y: number };

/**
 * Pointer position as −1 → 1 from the centre of the viewport, in a ref.
 *
 * Deliberately never triggers a render: the 3D camera and the philosophy words
 * sample it inside their own animation frames. On touch devices and under
 * `prefers-reduced-motion` it stays at the origin and no listener is attached,
 * so nothing depends on hovering.
 */
export function usePointer(): React.RefObject<Pointer> {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const touch = useIsTouch();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (touch || reduced) {
      pointer.current = { x: 0, y: 0 };
      return;
    }

    const onMove = (event: PointerEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [touch, reduced]);

  return pointer;
}
