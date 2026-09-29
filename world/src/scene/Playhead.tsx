import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, type Group } from 'three';
import { palette } from '../theme/tokens';
import { worldState } from '../scroll/worldState';
import { GROUND_Y, RULER_X, TRACKS_WIDTH } from './layout';

// HDR gold — the only thing in the world bright enough to bloom. Gold means "now".
const GOLD = new Color(palette.gold).multiplyScalar(2.2);
const SPAN = TRACKS_WIDTH / 2 - RULER_X + 0.1;

/** The playhead: a line across every track and a stem + head on the ruler. */
export function Playhead() {
  const group = useRef<Group>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.position.z = worldState.playheadZ;
    // the reel is "stopped" on the title screen; the playhead cuts in once it plays
    g.visible = worldState.descent > 0.15;
  });

  const midX = (RULER_X + TRACKS_WIDTH / 2 + 0.1) / 2;

  return (
    <group ref={group}>
      <mesh position={[midX, GROUND_Y + 0.03, 0]}>
        <boxGeometry args={[SPAN, 0.012, 0.014]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      <mesh position={[RULER_X, GROUND_Y + 0.3, 0]}>
        <boxGeometry args={[0.014, 0.6, 0.014]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      {/* the head, shaped like an editor's: a flat-topped pentagon pointing down */}
      <mesh position={[RULER_X, GROUND_Y + 0.66, 0]} rotation={[0, 0, Math.PI]}>
        <circleGeometry args={[0.1, 5]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
    </group>
  );
}
