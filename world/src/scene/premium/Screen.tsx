import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { MathUtils, SRGBColorSpace, type Group } from 'three';
import { worldState } from '../../scroll/worldState';
import { GROUND_Y } from '../layout';
import { useShowreel } from '../showreel';

export const SCREEN = { width: 12, height: 6.75, z: -6 };
const BASE_Y = GROUND_Y + SCREEN.height / 2 + 0.35;

/**
 * The showreel on a cinema-sized screen standing on the mirror floor behind
 * the lens. As the camera drops onto the timeline it rises out of frame.
 */
export function Screen() {
  const group = useRef<Group>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.position.y = BASE_Y + MathUtils.smoothstep(worldState.descent, 0.1, 0.9) * 9;
    g.visible = worldState.descent < 0.999;
  });

  const { width: w, height: h } = SCREEN;
  return (
    <group ref={group} position={[0, BASE_Y, SCREEN.z]}>
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[w + 0.16, h + 0.16, 0.08]} />
        <meshStandardMaterial color="#0b0a0f" metalness={0.8} roughness={0.4} />
      </mesh>
      <Suspense fallback={<Suspense fallback={null}><Poster /></Suspense>}>
        <Footage />
      </Suspense>
    </group>
  );
}

// the screen plays a touch under full brightness so the lens stays the brightest thing
const DIM = '#c4c4c4';

function Footage() {
  const texture = useShowreel();
  return (
    <mesh>
      <planeGeometry args={[SCREEN.width, SCREEN.height]} />
      <meshBasicMaterial map={texture} color={DIM} toneMapped={false} />
    </mesh>
  );
}

function Poster() {
  const texture = useTexture('/portfolio-poster.jpg');
  texture.colorSpace = SRGBColorSpace;
  return (
    <mesh>
      <planeGeometry args={[SCREEN.width, SCREEN.height]} />
      <meshBasicMaterial map={texture} color={DIM} toneMapped={false} />
    </mesh>
  );
}
