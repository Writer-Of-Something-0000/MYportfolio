import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { worldState, TIMELINE_START_Z } from '../../scroll/worldState';
import { TIMELINE_END_Z } from '../layout';
import { LENS_R, LENS_Y, LENS_Z } from './Lens';

/**
 * Scroll → camera, in three movements:
 *   A  push-in: from across the room right up to the glass, until the lens
 *      fills the frame and everything is seen refracted through it;
 *   B  through: the camera passes the glass (the lens cuts out), drops onto
 *      the timeline while the screen rises away;
 *   C  flight: skimming the tracks, the playhead a fixed distance ahead.
 */
const PUSH_END = 0.14;
const DESCEND_END = 0.3;
const PLAYHEAD_AHEAD = 3.2;

const LENS = new Vector3(0, LENS_Y, LENS_Z);
const POS_0 = new Vector3(0, LENS_Y + 0.15, 8.5);
const POS_A = new Vector3(0, LENS_Y, LENS_Z + 1.05);
const LOOK_A = new Vector3(0, LENS_Y, LENS_Z - 4);
const POS_1 = new Vector3(0, 0.75, -1.4);
const LOOK_1 = new Vector3(0, -1.15, -10);
const FLIGHT = POS_1.z - (TIMELINE_END_Z + 12);

const pos = new Vector3();
const look = new Vector3();
const smoothLook = new Vector3().copy(LENS);

export function LensCameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const progress = useRef(0);

  useFrame((state, dt) => {
    const aspect = size.width / size.height;
    const fov = aspect < 1 ? 60 : 42;
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    progress.current = MathUtils.damp(progress.current, worldState.scroll, 6, dt);
    const p = progress.current;

    if (p <= PUSH_END) {
      const t = MathUtils.smootherstep(p / PUSH_END, 0, 1);
      worldState.descent = 0;
      pos.lerpVectors(POS_0, POS_A, t);
      look.lerpVectors(LENS, LOOK_A, t);
      // on narrow screens start further back so the whole lens is in frame
      const halfTan = Math.tan(MathUtils.degToRad(fov / 2));
      const needed = (LENS_R * 2 + 1.2) / 2 / (halfTan * Math.min(1, aspect));
      pos.z += Math.max(0, needed - (POS_0.z - LENS_Z)) * (1 - t);
      // compose around the title: shift the whole view (camera and aim together)
      // so the lens sits right of the name on wide screens, above it on tall ones.
      // The shift runs out as the camera closes on the glass.
      const k = 1 - t;
      const sx = aspect < 1 ? 0 : -1.9 * k;
      const sy = aspect < 1 ? -1.4 * k : -0.25 * k;
      pos.x += sx;
      pos.y += sy;
      look.x += sx;
      look.y += sy;
    } else if (p <= DESCEND_END) {
      const t = MathUtils.smootherstep((p - PUSH_END) / (DESCEND_END - PUSH_END), 0, 1);
      worldState.descent = t;
      pos.lerpVectors(POS_A, POS_1, t);
      look.lerpVectors(LOOK_A, LOOK_1, t);
    } else {
      worldState.descent = 1;
      const t = (p - DESCEND_END) / (1 - DESCEND_END);
      pos.set(POS_1.x, POS_1.y, POS_1.z - t * FLIGHT);
      look.set(LOOK_1.x, LOOK_1.y, LOOK_1.z - t * FLIGHT);
    }

    // the camera drifts with the pointer; the lens leans the other way
    pos.x += state.pointer.x * 0.25 * (1 - worldState.descent);
    look.x += state.pointer.x * 0.2;
    look.y += state.pointer.y * 0.15;

    camera.position.copy(pos);
    smoothLook.lerp(look, 1 - Math.exp(-8 * dt));
    camera.lookAt(smoothLook);

    worldState.playheadZ = Math.min(TIMELINE_START_Z, pos.z - PLAYHEAD_AHEAD);
  });

  return null;
}
