'use client';

import { useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getPhoto, thumbUrl } from '@/lib/photos';
import { clamp } from '@/lib/utils';

type DepthFieldProps = {
  /** Photograph ids, nearest first. */
  ids: readonly string[];
};

/**
 * Fixed placements, so the composition is designed rather than random.
 *
 * Weighted to the right and to the top and bottom edges: the wordmark is set
 * left of centre in the DOM above, and a bright frame sliding behind it is the
 * fastest way to make a photograph fight its own title. Nearest first, so the
 * lower device tiers — which take only the first few — still get a composition.
 */
const SLOTS = [
  { x: 2.4, y: 0.95, z: -3.4, tilt: -0.16, scale: 1.35 },
  { x: 3.0, y: -1.35, z: -4.6, tilt: 0.2, scale: 1.5 },
  { x: -3.15, y: 2.0, z: -6.2, tilt: 0.1, scale: 1.75 },
  { x: 1.1, y: 2.35, z: -7.8, tilt: -0.12, scale: 1.9 },
  { x: -3.9, y: -1.9, z: -9.1, tilt: 0.22, scale: 2.1 },
  { x: 4.3, y: 1.2, z: -10.6, tilt: -0.06, scale: 2.3 },
  { x: -1.6, y: -2.6, z: -12.2, tilt: 0.14, scale: 2.5 },
] as const;

/**
 * The aspect the slots above were composed against — a laptop, 16:10ish.
 *
 * The frustum is vertical, so world height is the same on every device but world
 * width follows the aspect ratio. Multiplying x by the ratio of the two keeps
 * each frame at the fraction of the frame width it was placed at, instead of
 * sliding it off the side of a phone. Never above 1: on an ultra-wide display the
 * composition should stay as composed rather than drift out toward the bezels.
 */
const DESIGN_ASPECT = 1.6;

/**
 * The photographs suspended behind the aperture.
 *
 * Real frames from the studio's library, at their real aspect ratios, hung at
 * decreasing depth so the opening looks into a room rather than at a wall. They
 * are unlit (`meshBasicMaterial`) on purpose: a photograph should not pick up a
 * highlight from a lamp that does not exist, and it costs nothing to render.
 * Distance is expressed as fading opacity — the studio's own aerial haze.
 */
export function DepthField({ ids }: DepthFieldProps) {
  const group = useRef<THREE.Group>(null);
  const placed = ids.slice(0, SLOTS.length);
  const textures = useTexture(placed.map((id) => thumbUrl(getPhoto(id))));
  const spread = clamp(useThree((state) => state.viewport.aspect) / DESIGN_ASPECT, 0.28, 1);

  const list = useMemo(
    () => (Array.isArray(textures) ? textures : [textures]) as THREE.Texture[],
    [textures]
  );

  useFrame(({ clock }) => {
    const node = group.current;
    if (!node) return;
    const time = clock.elapsedTime;

    // A slow, unsynchronised bob. Nothing here should read as animation.
    node.children.forEach((child, index) => {
      const slot = SLOTS[index];
      if (!slot) return;
      child.position.y = slot.y + Math.sin(time * 0.24 + index * 1.7) * 0.09;
      child.rotation.z = slot.tilt + Math.sin(time * 0.16 + index) * 0.012;
    });
  });

  return (
    <group ref={group}>
      {placed.map((id, index) => {
        const slot = SLOTS[index];
        const texture = list[index];
        if (!slot || !texture) return null;

        const { aspectRatio } = getPhoto(id);
        const height = slot.scale;
        const width = height * aspectRatio;

        return (
          <mesh
            key={id}
            position={[slot.x * spread, slot.y, slot.z]}
            rotation={[0, 0, slot.tilt]}
          >
            <planeGeometry args={[width, height]} />
            {/* Texture settings are declared, not assigned after the fact: r3f
                writes them through when it applies the props, which keeps the
                loader's cached texture out of our hands. */}
            <meshBasicMaterial
              map={texture}
              map-colorSpace={THREE.SRGBColorSpace}
              map-anisotropy={2}
              transparent
              opacity={Math.max(0.18, 1 + slot.z * 0.075)}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
