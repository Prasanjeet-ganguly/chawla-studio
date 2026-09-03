'use client';

import { useMemo, useSyncExternalStore } from 'react';

export type DeviceTier = 'low' | 'medium' | 'high';

export type SceneQuality = {
  tier: DeviceTier;
  /** Renderer device pixel ratio ceiling. */
  dpr: [number, number];
  /** Light-particle count. */
  particles: number;
  /** Floating photograph planes in the depth field. */
  frames: number;
  /** Iris blade segments — lower is cheaper geometry. */
  bladeSegments: number;
  antialias: boolean;
};

const QUALITY: Record<DeviceTier, Omit<SceneQuality, 'tier'>> = {
  low: { dpr: [1, 1.25], particles: 90, frames: 3, bladeSegments: 12, antialias: false },
  medium: { dpr: [1, 1.5], particles: 220, frames: 5, bladeSegments: 20, antialias: true },
  high: { dpr: [1, 2], particles: 420, frames: 7, bladeSegments: 32, antialias: true },
};

/**
 * Picks a rendering tier from cheap, widely-supported signals: viewport width,
 * logical core count, device memory and the Save-Data hint. Deliberately
 * conservative — a mis-detected phone should render a lighter scene, not a
 * stuttering one.
 */
function detectTier(): DeviceTier {
  if (typeof window === 'undefined') return 'medium';

  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;

  if (connection?.saveData) return 'low';
  if (width < 768 || cores <= 4 || memory <= 2) return 'low';
  if (width < 1440 || cores <= 8 || memory <= 4) return 'medium';
  return 'high';
}

/** Resize is the only signal here that can change during a session. */
function subscribeToViewport(notify: () => void): () => void {
  window.addEventListener('resize', notify, { passive: true });
  return () => window.removeEventListener('resize', notify);
}

const serverTier = (): DeviceTier => 'medium';

/**
 * Resolves the scene budget for this device. `medium` during SSR, then the
 * detected tier — read as external state, so a rotated tablet or a resized
 * window re-reads it without an effect writing state back into React.
 */
export function useSceneQuality(): SceneQuality {
  const tier = useSyncExternalStore(subscribeToViewport, detectTier, serverTier);
  return useMemo(() => ({ tier, ...QUALITY[tier] }), [tier]);
}
