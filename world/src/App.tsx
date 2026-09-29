import { Canvas } from '@react-three/fiber';
import { FoundationScene } from './scene/FoundationScene';
import { FoundationCheck } from './ui/FoundationCheck';

export default function App() {
  return (
    <>
      <Canvas
        className="world-canvas"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true }}
      >
        <FoundationScene />
      </Canvas>
      <div className="overlay">
        <FoundationCheck />
      </div>
    </>
  );
}
