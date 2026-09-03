'use client';

import { Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { DepthField } from './DepthField';
import { Iris } from './Iris';
import { Motes } from './Motes';
import { usePointer, type Pointer } from '@/lib/hooks/usePointer';
import { useSceneQuality } from '@/lib/hooks/useSceneQuality';
import { lerp } from '@/lib/utils';

type IrisSceneProps = {
  /** Photograph ids to hang in the depth field, nearest first. */
  ids: readonly string[];
  /** 0 = wide open, 1 = stopped down. Driven by hero scroll. */
  openness: React.RefObject<number>;
  /** False parks the render loop — offscreen or hidden tab. */
  active: boolean;
  /** Called if the GPU drops the context, so the hero can show the still. */
  onContextLost: () => void;
};

/** How far the camera leans toward the pointer, in world units. */
const LEAN = { x: 0.5, y: 0.32 };

/**
 * Reports a lost GPU context upward.
 *
 * A driver reset, a backgrounded mobile tab or a machine waking from sleep can
 * take the context away at any moment; the canvas then holds whatever was in the
 * buffer, which is worse than no canvas at all. Preventing the default keeps
 * three.js quiet while React swaps in the photograph.
 */
function ContextGuard({ onLost }: { onLost: () => void }) {
  const canvas = useThree((state) => state.gl.domElement);

  useEffect(() => {
    const handle = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener('webglcontextlost', handle);
    return () => canvas.removeEventListener('webglcontextlost', handle);
  }, [canvas, onLost]);

  return null;
}

/**
 * Moves the camera a few centimetres toward the pointer.
 *
 * Small on purpose: enough that the lens feels like an object in space, not
 * enough to make anyone seasick. The pointer ref is empty on touch devices and
 * under reduced motion, so this settles to dead centre and stays there.
 */
function CameraRig({ pointer }: { pointer: React.RefObject<Pointer> }) {
  useFrame(({ camera }, delta) => {
    const { x, y } = pointer.current;
    const ease = Math.min(1, delta * 1.8);
    camera.position.x = lerp(camera.position.x, x * LEAN.x, ease);
    camera.position.y = lerp(camera.position.y, -y * LEAN.y, ease);
    camera.lookAt(0, 0, -4);
  });
  return null;
}

/**
 * The hero's virtual photography environment: an aperture, photographs
 * suspended behind it, and dust in the light.
 *
 * Dynamically imported by <Hero> only once WebGL has been confirmed and motion
 * has not been waved off, so three.js is absent from the initial bundle. Quality
 * is per-device, and the loop is parked whenever the hero is out of view.
 */
export default function IrisScene({ ids, openness, active, onContextLost }: IrisSceneProps) {
  const quality = useSceneQuality();
  const pointer = usePointer();

  return (
    <Canvas
      flat
      dpr={quality.dpr}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: quality.antialias, powerPreference: 'high-performance' }}
      camera={{ fov: 42, near: 0.1, far: 40, position: [0, 0, 6.4] }}
      // The canvas is scenery; everything readable is in the DOM above it.
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#08080a']} />
      <fog attach="fog" args={['#08080a', 7, 20]} />

      {/* A warm key from the upper right, a selenium bounce from below left —
          the two-light setup the site's palette is built on. */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 5, 4]} intensity={1.5} color="#fff2e2" />
      <pointLight position={[-4.5, -3, 2.5]} intensity={14} distance={12} color="#a87e92" />

      <CameraRig pointer={pointer} />
      <ContextGuard onLost={onContextLost} />

      <Suspense fallback={null}>
        <DepthField ids={ids.slice(0, quality.frames)} />
      </Suspense>

      <Motes count={quality.particles} />
      <Iris openness={openness} segments={quality.bladeSegments} />
    </Canvas>
  );
}
