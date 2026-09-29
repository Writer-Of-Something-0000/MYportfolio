import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, useTexture } from '@react-three/drei';
import { MathUtils, SRGBColorSpace, type Group } from 'three';
import { worldState } from '../scroll/worldState';
import { MONITOR } from './layout';
import { useShowreel } from './showreel';

/**
 * The Program Monitor: the showreel on a plain, thin-bezelled screen floating
 * over the head of the timeline. No glow — the footage is the point.
 * The poster shows until the video can play.
 */
export function ProgramMonitor() {
  const { width: w, height: h } = MONITOR;
  const group = useRef<Group>(null);

  // as the camera drops onto the timeline the monitor lifts out of frame, so the
  // camera never slides underneath it and sees the screen edge-on
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const lift = MathUtils.smoothstep(worldState.descent, 0.15, 0.85);
    g.position.y = MONITOR.position[1] + lift * 6;
    g.visible = worldState.descent < 0.999;
  });

  return (
    <group ref={group} position={MONITOR.position as unknown as [number, number, number]}>
      <RoundedBox args={[w + 0.12, h + 0.12, 0.1]} radius={0.03} position={[0, 0, -0.06]}>
        <meshStandardMaterial color="#111016" metalness={0.5} roughness={0.45} />
      </RoundedBox>
      <Suspense fallback={<Suspense fallback={null}><Poster /></Suspense>}>
        <Screen />
      </Suspense>
    </group>
  );
}

function Screen() {
  const texture = useShowreel();
  return (
    <mesh position={[0, 0, 0.002]}>
      <planeGeometry args={[MONITOR.width, MONITOR.height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Poster() {
  const texture = useTexture('/portfolio-poster.jpg');
  texture.colorSpace = SRGBColorSpace;
  return (
    <mesh position={[0, 0, 0.002]}>
      <planeGeometry args={[MONITOR.width, MONITOR.height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
