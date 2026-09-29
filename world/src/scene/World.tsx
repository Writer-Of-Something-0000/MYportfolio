import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { palette } from '../theme/tokens';
import { CameraRig } from './CameraRig';
import { Effects, type Quality } from './Effects';
import { Playhead } from './Playhead';
import { ProgramMonitor } from './ProgramMonitor';
import { Timeline } from './Timeline';

const MAX_DPR = Math.min(2, window.devicePixelRatio || 1);

/**
 * The whole 3D world, fixed behind the page. Full 3D on every device, but the
 * PerformanceMonitor trades resolution and grain for frame rate when a device
 * can't keep up — the world itself stays the same.
 */
export function World() {
  const [dpr, setDpr] = useState(MAX_DPR);
  const [quality, setQuality] = useState<Quality>('high');

  return (
    <Canvas
      className="world-canvas"
      dpr={dpr}
      camera={{ position: [0, 2.35, 7.8], fov: 45, near: 0.1, far: 80 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setQuality('low');
        }}
        onIncline={() => setDpr(MAX_DPR)}
      />

      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.bg, 6, 30]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 4]} intensity={0.6} />

      <ProgramMonitor />
      <Timeline />
      <Playhead />
      <CameraRig />
      <Effects quality={quality} />
    </Canvas>
  );
}
