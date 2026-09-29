import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { TimeField } from './TimeField';

const MAX_DPR = Math.min(2, window.devicePixelRatio || 1);
const isSmall = () => Math.min(window.innerWidth, window.innerHeight) < 700;

/**
 * The world is one full-screen shader: the showreel, displaced in time.
 * Cheap enough to run everywhere; the PerformanceMonitor only lowers the
 * pixel density if a device struggles.
 */
export function TimeWorld() {
  const [dpr, setDpr] = useState(MAX_DPR);
  const [small] = useState(isSmall);

  return (
    <Canvas className="world-canvas" dpr={dpr} flat gl={{ antialias: false, powerPreference: 'high-performance' }}>
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(MAX_DPR)} />
      <Suspense fallback={null}>
        <TimeField small={small} />
      </Suspense>
    </Canvas>
  );
}
