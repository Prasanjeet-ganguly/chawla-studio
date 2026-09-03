'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type MotesProps = { count: number };

const SPREAD = { x: 14, y: 9, z: 12 };

/** Deterministic pseudo-random, so the field looks the same on every visit. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** A soft round dot, drawn once into a 32px canvas rather than downloaded. */
function dotTexture(): THREE.Texture {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.35)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Dust in the light path.
 *
 * The oldest trick in a photograph of a lens: specks catching the key light.
 * They rise slowly and wrap at the top, which reads as air rather than as
 * particles. Additive blending with no depth write keeps them from punching
 * holes in the photographs behind.
 */
export function Motes({ count }: MotesProps) {
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const random = seeded(20240309);
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = (random() - 0.5) * SPREAD.x;
      array[i * 3 + 1] = (random() - 0.5) * SPREAD.y;
      array[i * 3 + 2] = -random() * SPREAD.z;
    }
    return array;
  }, [count]);

  const texture = useMemo(() => dotTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, delta) => {
    const geometry = points.current?.geometry;
    if (!geometry) return;

    const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    const rise = delta * 0.075;

    for (let i = 1; i < array.length; i += 3) {
      array[i] = (array[i] ?? 0) + rise;
      if ((array[i] ?? 0) > SPREAD.y / 2) array[i] = -SPREAD.y / 2;
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.055}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#e6dcd2"
      />
    </points>
  );
}
