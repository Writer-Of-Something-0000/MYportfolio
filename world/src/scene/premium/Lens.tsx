import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import { DoubleSide, MathUtils, type Group } from 'three';
import { palette } from '../../theme/tokens';
import type { Quality } from '../Effects';

export const LENS_Y = 1.1;
export const LENS_Z = 0;
/** radius of the glass element — the barrel sits just outside it */
export const LENS_R = 1.55;

/**
 * The hero object: a cinema lens the size of a room, floating in front of the
 * showreel. Real refraction (transmission + chromatic aberration) bends the
 * footage behind it; the barrel is dark anodised metal with a violet band and a
 * thin gold index ring. It leans toward the pointer and breathes on its own.
 * When the camera pushes through the glass the lens is cut out of the frame.
 */
export function Lens({ quality }: { quality: Quality }) {
  const group = useRef<Group>(null);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const rx = -state.pointer.y * 0.28 + Math.sin(t * 0.37) * 0.05;
    const ry = state.pointer.x * 0.4 + Math.sin(t * 0.29) * 0.07;
    g.rotation.x = MathUtils.damp(g.rotation.x, rx, 2.5, dt);
    g.rotation.y = MathUtils.damp(g.rotation.y, ry, 2.5, dt);
    g.position.y = LENS_Y + Math.sin(t * 0.8) * 0.05;
    // a cut, not a dissolve: the moment the camera reaches the glass it is gone
    g.visible = state.camera.position.z > LENS_Z + 0.5;
  });

  const high = quality === 'high';

  return (
    <group ref={group} position={[0, LENS_Y, LENS_Z]}>
      {/* biconvex front element */}
      <mesh scale={[LENS_R, LENS_R, 0.42]}>
        <sphereGeometry args={[1, 96, 64]} />
        <MeshTransmissionMaterial
          samples={high ? 8 : 4}
          resolution={high ? 1024 : 512}
          transmission={1}
          thickness={1.4}
          roughness={0.02}
          ior={1.5}
          chromaticAberration={0.14}
          anisotropicBlur={0.06}
          distortion={0.12}
          distortionScale={0.35}
          temporalDistortion={0.05}
          backside
          backsideThickness={0.5}
          color="#f6f2ff"
          attenuationColor={palette.brandLight}
          attenuationDistance={8}
        />
      </mesh>

      {/* front bezel */}
      <mesh position={[0, 0, 0.02]}>
        <torusGeometry args={[LENS_R + 0.12, 0.1, 32, 180]} />
        <meshStandardMaterial color="#15121b" metalness={1} roughness={0.22} />
      </mesh>

      {/* gold index ring — the one warm line on the lens */}
      <mesh position={[0, 0, -0.1]}>
        <torusGeometry args={[LENS_R + 0.2, 0.018, 16, 180]} />
        <meshStandardMaterial color={palette.gold} metalness={1} roughness={0.3} />
      </mesh>

      {/* barrel */}
      <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[LENS_R + 0.18, LENS_R + 0.18, 0.7, 128, 1, true]} />
        <meshStandardMaterial color="#0c0a10" metalness={1} roughness={0.3} side={DoubleSide} />
      </mesh>

      {/* violet anodised band */}
      <mesh position={[0, 0, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[LENS_R + 0.2, LENS_R + 0.2, 0.12, 128, 1, true]} />
        <meshStandardMaterial color={palette.brand} metalness={0.85} roughness={0.35} side={DoubleSide} />
      </mesh>

      {/* knurled focus ring — faceted so the ribs catch the light */}
      <mesh position={[0, 0, -0.72]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[LENS_R + 0.26, LENS_R + 0.26, 0.34, 96, 1, true]} />
        <meshStandardMaterial color="#101014" metalness={0.9} roughness={0.45} flatShading side={DoubleSide} />
      </mesh>
    </group>
  );
}
