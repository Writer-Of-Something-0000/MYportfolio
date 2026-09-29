import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { palette } from '../theme/tokens';

/**
 * Phase 0 stand-in: just enough world to prove the stack renders the palette —
 * a few glass track lanes running into the fog and the gold playhead crossing
 * them. Phase 1 replaces this with the real Intro scene.
 */
const LANES = 4;

export function FoundationScene() {
  const world = useRef<Group>(null);

  // a slow drift so it reads as a place, not a still image
  useFrame(({ clock }) => {
    if (!world.current) return;
    const t = clock.getElapsedTime();
    world.current.rotation.y = Math.sin(t * 0.15) * 0.12;
    world.current.position.x = Math.sin(t * 0.1) * 0.4;
  });

  return (
    <>
      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.bg, 6, 26]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 4]} intensity={30} color={palette.brandLight} />

      <group ref={world} rotation={[-0.35, 0, 0]}>
        {Array.from({ length: LANES }, (_, i) => (
          <mesh key={i} position={[0, -1.2 - i * 0.55, -8]}>
            <boxGeometry args={[40, 0.08, 0.42]} />
            <meshStandardMaterial
              color={i % 2 ? palette.brand : palette.bgRaised}
              emissive={palette.brand}
              emissiveIntensity={i % 2 ? 0.6 : 0.15}
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
        ))}

        {/* the playhead */}
        <mesh position={[0, -2, -8]}>
          <boxGeometry args={[0.04, 3.2, 0.04]} />
          <meshBasicMaterial color={palette.gold} />
        </mesh>
        <mesh position={[0, -0.35, -8]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.18, 0.18, 0.04]} />
          <meshBasicMaterial color={palette.gold} />
        </mesh>
      </group>
    </>
  );
}
