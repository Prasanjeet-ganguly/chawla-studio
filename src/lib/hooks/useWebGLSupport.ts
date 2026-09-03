'use client';

import { useEffect, useState } from 'react';

export type WebGLStatus = 'checking' | 'available' | 'unavailable';

/**
 * Probes for a usable WebGL context once, on the client.
 *
 * The hero renders its still fallback while this is `checking`, so a browser
 * without WebGL (or with it blocked) never sees an empty canvas — it simply
 * keeps the photograph it already had.
 */
export function useWebGLSupport(): WebGLStatus {
  const [status, setStatus] = useState<WebGLStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    const probe = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement('canvas');
        const gl =
          canvas.getContext('webgl2') ??
          canvas.getContext('webgl') ??
          canvas.getContext('experimental-webgl');

        if (!gl) {
          setStatus('unavailable');
          return;
        }

        // Release the probe context immediately; the scene creates its own.
        const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
        lose?.loseContext();
        setStatus('available');
      } catch {
        setStatus('unavailable');
      }
    };

    // Defer past first paint so the probe never delays the hero text.
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(probe, { timeout: 400 })
      : window.setTimeout(probe, 120);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback && typeof id === 'number') {
        window.cancelIdleCallback(id);
      } else {
        window.clearTimeout(id as number);
      }
    };
  }, []);

  return status;
}
