import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { AgXToneMapping } from 'three';
import { palette } from '../../theme/tokens';
import { Effects, type Quality } from '../Effects';
import { Playhead } from '../Playhead';
import { Timeline } from '../Timeline';
import { Lens } from './Lens';
import { LensCameraRig } from './LensCameraRig';
import { Screen } from './Screen';
import { Studio } from './Studio';

const MAX_DPR = Math.min(2, window.devicePixelRatio || 1);

/**
 * "The Lens": a black studio with a mirror floor, the showreel on a cinema
 * screen, and a room-sized glass lens floating in front of it. Scrolling pushes
 * the camera through the glass and down onto the timeline.
 * Full 3D everywhere; the PerformanceMonitor lowers resolution and the glass /
 * reflection quality when a device can't hold the frame rate.
 */
export function PremiumWorld() {
  const [dpr, setDpr] = useState(MAX_DPR);
  const [quality, setQuality] = useState<Quality>('high');

  return (
    <Canvas
      className="world-canvas"
      dpr={dpr}
      camera={{ position: [0, 1.25, 8.5], fov: 42, near: 0.1, far: 90 }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: AgXToneMapping }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setQuality('low');
        }}
        onIncline={() => setDpr(MAX_DPR)}
      />

      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.bg, 9, 34]} />
      <ambientLight intensity={0.15} />

      <Studio quality={quality} />
      <Screen />
      <Lens quality={quality} />
      <Timeline beds={false} />
      <Playhead />
      <LensCameraRig />
      <Effects quality={quality} />
    </Canvas>
  );
}
