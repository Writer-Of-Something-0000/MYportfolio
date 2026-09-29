import { Environment, Lightformer, MeshReflectorMaterial, Sparkles, SpotLight } from '@react-three/drei';
import { palette } from '../../theme/tokens';
import type { Quality } from '../Effects';
import { GROUND_Y } from '../layout';
import { LENS_Y, LENS_Z } from './Lens';

/**
 * The room: a black mirror floor, a procedural studio environment for the
 * glass and metal to reflect (no HDR download — it is built from light cards),
 * and one violet volumetric key light falling on the lens with dust in it.
 */
export function Studio({ quality }: { quality: Quality }) {
  const high = quality === 'high';

  return (
    <>
      {/* reflections only — the background stays black */}
      <Environment resolution={256} frames={1}>
        {/* big overhead softbox */}
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 6, -4]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        {/* violet strip, camera left */}
        <Lightformer form="rect" intensity={4} color={palette.brandLight} position={[-7, 1.5, 1]} rotation-y={Math.PI / 2} scale={[3, 9, 1]} />
        {/* warm rim, camera right */}
        <Lightformer form="rect" intensity={1.6} color={palette.gold} position={[7, 1, 0]} rotation-y={-Math.PI / 2} scale={[1.5, 7, 1]} />
        {/* the screen's glow, behind the lens */}
        <Lightformer form="rect" intensity={1.2} color="#c9b8ff" position={[0, 2.5, -8]} scale={[12, 7, 1]} />
        {/* ring light facing the lens — the signature highlight on the glass */}
        <Lightformer form="ring" intensity={3} color="#ffffff" position={[0, LENS_Y, 9]} scale={2.4} />
      </Environment>

      <SpotLight
        position={[0.6, 7, LENS_Z + 2.5]}
        angle={0.42}
        penumbra={0.7}
        distance={14}
        attenuation={7}
        anglePower={4}
        intensity={45}
        color={palette.brandLight}
        opacity={high ? 0.55 : 0.35}
      />

      <Sparkles
        count={high ? 70 : 30}
        position={[0.3, LENS_Y + 1.2, LENS_Z + 1]}
        scale={[4, 5, 3]}
        size={1.6}
        speed={0.18}
        opacity={0.55}
        color={palette.lilac}
      />

      {/* black mirror floor under the whole timeline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y - 0.005, -60]}>
        <planeGeometry args={[70, 200]} />
        <MeshReflectorMaterial
          blur={[320, 90]}
          resolution={high ? 1024 : 512}
          mixBlur={1}
          mixStrength={42}
          roughness={1}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#07050c"
          metalness={0.7}
          mirror={0}
        />
      </mesh>
    </>
  );
}
