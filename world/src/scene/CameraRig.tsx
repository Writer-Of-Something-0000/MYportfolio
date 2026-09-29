import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { worldState, TIMELINE_START_Z } from '../scroll/worldState';
import { MONITOR, TIMELINE_END_Z } from './layout';

/**
 * Scroll → camera. Two stages:
 *   A (scroll 0 → DESCEND_END): framed on the Program Monitor, then tilting down
 *     and dropping onto the timeline — the reel "starts playing".
 *   B (DESCEND_END → 1): skimming the timeline at a steady speed; the playhead
 *     rides a fixed distance ahead and its distance from the start is the timecode.
 */
const DESCEND_END = 0.28;
const PLAYHEAD_AHEAD = 3.2;

const monitorZ = MONITOR.position[2];
const monitorY = MONITOR.position[1];

// stage A endpoints
const POS_0 = new Vector3(0, monitorY, monitorZ + 9);
const LOOK_0 = new Vector3(0, monitorY, monitorZ);
const POS_1 = new Vector3(0, 0.75, 0.6);
const LOOK_1 = new Vector3(0, -1.15, -8);

// stage B covers the rest of the timeline, leaving a little tail at the end
const FLIGHT = POS_1.z - (TIMELINE_END_Z + 12);

const pos = new Vector3();
const look = new Vector3();
const smoothLook = new Vector3().copy(LOOK_0);

export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const progress = useRef(0);

  useFrame((state, dt) => {
    const aspect = size.width / size.height;

    // portrait screens get a wider lens so the monitor still fits edge to edge
    const fov = aspect < 1 ? 62 : 45;
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    // Lenis already eases the scroll; this just removes the last bit of stepping
    progress.current = MathUtils.damp(progress.current, worldState.scroll, 6, dt);
    const p = progress.current;

    if (p <= DESCEND_END) {
      const t = MathUtils.smootherstep(p / DESCEND_END, 0, 1);
      worldState.descent = t;
      pos.lerpVectors(POS_0, POS_1, t);
      look.lerpVectors(LOOK_0, LOOK_1, t);
      // aim a little below the screen so it sits high in frame, leaving the
      // lower third for the title — more so on tall portrait screens
      look.y -= (aspect < 1 ? 1.5 : 0.7) * (1 - t);

      // pull back on narrow screens until the whole monitor is in frame,
      // fading the correction out as the camera leaves the monitor
      const halfTan = Math.tan(MathUtils.degToRad(fov / 2));
      const needed = (MONITOR.width + 0.6) / 2 / (halfTan * aspect);
      const extra = Math.max(0, needed - (POS_0.z - monitorZ));
      pos.z += extra * (1 - t);
    } else {
      worldState.descent = 1;
      const t = (p - DESCEND_END) / (1 - DESCEND_END);
      pos.set(POS_1.x, POS_1.y, POS_1.z - t * FLIGHT);
      look.set(LOOK_1.x, LOOK_1.y, LOOK_1.z - t * FLIGHT);
    }

    // a touch of parallax from the pointer (desktop); zero on touch screens
    look.x += state.pointer.x * 0.35;
    look.y += state.pointer.y * 0.2;

    camera.position.copy(pos);
    smoothLook.lerp(look, 1 - Math.exp(-8 * dt));
    camera.lookAt(smoothLook);

    worldState.playheadZ = Math.min(TIMELINE_START_Z, pos.z - PLAYHEAD_AHEAD);
  });

  return null;
}
