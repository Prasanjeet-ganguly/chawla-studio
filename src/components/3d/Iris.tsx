'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { lerp } from '@/lib/utils';

/** Blades in the diaphragm. Nine is the classic count on fast primes. */
const BLADES = 9;
/** Outer radius — well past the viewport, so blades read as edge-to-edge. */
const RADIUS = 4.6;
/** Each blade sweeps wider than its share of the circle so they overlap. */
const OVERLAP = 2.15;
/**
 * Blade travel, as a fraction of the *shorter* side of the visible frame.
 *
 * Measured against the frame rather than against RADIUS because the frustum is
 * vertical: a phone held upright sees the same world height as a laptop but less
 * than a third of its width, so a fixed opening that reads as a lens at 16:10
 * sits entirely outside the frame at 9:19.5 and the hero goes black. Tying the
 * travel to whichever side is shorter keeps the nonagon in shot at every aspect
 * ratio, while RADIUS stays fixed so the blades still cover the corners.
 */
const OPEN_SHARE = 0.42;
const SHUT_SHARE = 0.056;

type IrisProps = {
  /** 0 = wide open, 1 = stopped down. Read from a ref so scroll costs no render. */
  openness: React.RefObject<number>;
  segments: number;
};

/**
 * The aperture the whole hero is built around.
 *
 * Nine overlapping blades, each a pie slice pushed outward along its own
 * bisector: at full offset the slices leave a nine-sided opening, and as they
 * slide back in they close over the centre exactly like a real diaphragm. Scroll
 * drives that travel, so leaving the hero stops the lens down.
 *
 * Cheap on purpose — flat shape geometry, one shared material, no shadows, no
 * post-processing. The only per-frame work is nine position writes.
 */
export function Iris({ openness, segments }: IrisProps) {
  const blades = useRef<THREE.Group>(null);

  // The shorter side of the frame at the aperture's own depth, in world units.
  // A primitive, so this only re-renders when the number actually moves.
  const frame = useThree((state) => Math.min(state.viewport.width, state.viewport.height));
  const open = frame * OPEN_SHARE;
  const shut = frame * SHUT_SHARE;

  const geometry = useMemo(() => {
    const half = (Math.PI / BLADES) * OVERLAP;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.absarc(0, 0, RADIUS, -half, half, false);
    shape.lineTo(0, 0);
    return new THREE.ShapeGeometry(shape, segments);
  }, [segments]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        // Graphite, not black: with no environment map a fully metallic blade
        // reflects nothing and disappears into the background. Mostly diffuse
        // with a little sheen is what actually reads as a machined blade.
        color: '#15151c',
        metalness: 0.35,
        roughness: 0.5,
        side: THREE.DoubleSide,
      }),
    []
  );

  // r3f only auto-disposes what it created from JSX, so these two go by hand.
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame((_, delta) => {
    const group = blades.current;
    if (!group) return;

    // f/1.4 leaves a wide opening; f/16 nearly closes it.
    const target = lerp(open, shut, openness.current ?? 0);
    const ease = Math.min(1, delta * 4);

    // Each blade travels along its *own* bisector, which is the x axis inside
    // its rotated parent — so the mesh moves, never the group.
    for (const pivot of group.children) {
      const blade = pivot.children[0];
      if (blade) blade.position.x = lerp(blade.position.x, target, ease);
    }
  });

  return (
    <group ref={blades}>
      {Array.from({ length: BLADES }, (_, index) => (
        <group key={index} rotation={[0, 0, (index / BLADES) * Math.PI * 2]}>
          {/* Stacked in z so overlapping blades never fight for the same pixel,
              and tilted a few degrees about their own axis so each one takes the
              key light differently — coplanar blades read as a single flat
              polygon, which is not what a diaphragm looks like. */}
          <mesh
            geometry={geometry}
            material={material}
            rotation={[0, 0.09, 0]}
            position={[open, 0, index * 0.006]}
          />
        </group>
      ))}
    </group>
  );
}
