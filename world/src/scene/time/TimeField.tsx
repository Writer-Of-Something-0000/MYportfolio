import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Color, HalfFloatType, LinearFilter, Mesh, OrthographicCamera, PlaneGeometry, Scene,
  ShaderMaterial, Vector2, WebGLArrayRenderTarget, WebGLRenderTarget,
} from 'three';
import { palette } from '../../theme/tokens';
import { worldState, TIMELINE_START_Z } from '../../scroll/worldState';
import { useShowreel } from '../showreel';
import { captureFragment, displayFragment, quadVertex, trailFragment } from './shaders';

/** seconds of "reel" the whole page scroll spans — drives the timecode and subtitles */
export const REEL_SECONDS = 140;
const CAPTURE_HZ = 30;
const VIDEO_ASPECT = 16 / 9;

function quad(material: ShaderMaterial) {
  const scene = new Scene();
  scene.add(new Mesh(new PlaneGeometry(2, 2), material));
  return scene;
}

function srgb(hex: string) {
  return new Color(hex).convertLinearToSRGB();
}

/**
 * Time Displacement, live: the showreel is written into a ring buffer of past
 * frames, and every pixel on screen shows a different moment from it.
 * All the rendering happens here by hand (priority 1 takes over R3F's loop).
 */
export function TimeField({ small }: { small: boolean }) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const video = useShowreel();

  // The buffer holds what the screen shows, in the screen's shape: its long side
  // is fixed, the other follows the aspect (bucketed so a resize doesn't
  // rebuild it every pixel). Lighter on small screens: fewer, smaller frames.
  const aspect = Math.round((size.width / size.height) * 10) / 10;
  const LONG = small ? 560 : 864;
  const W = aspect >= 1 ? LONG : Math.round(LONG * aspect);
  const H = aspect >= 1 ? Math.round(LONG / aspect) : LONG;
  const DEPTH = small ? 36 : 48;
  // the slice of the 16:9 video that covers this screen
  const cover = new Vector2(
    aspect < VIDEO_ASPECT ? aspect / VIDEO_ASPECT : 1,
    aspect < VIDEO_ASPECT ? 1 : VIDEO_ASPECT / aspect,
  );

  const kit = useMemo(() => {
    const cam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const history = new WebGLArrayRenderTarget(W, H, DEPTH, { depthBuffer: false });
    history.texture.minFilter = LinearFilter;
    history.texture.magFilter = LinearFilter;
    history.texture.generateMipmaps = false;

    const trailOpts = { type: HalfFloatType, depthBuffer: false, minFilter: LinearFilter, magFilter: LinearFilter };
    const trails = [new WebGLRenderTarget(256, 256, trailOpts), new WebGLRenderTarget(256, 256, trailOpts)];

    const capture = new ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: captureFragment,
      uniforms: { uVideo: { value: null }, uCover: { value: cover } },
      depthTest: false,
      depthWrite: false,
    });
    const trail = new ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: trailFragment,
      uniforms: {
        uPrev: { value: null },
        uPointer: { value: new Vector2(0.5, 0.5) },
        uForce: { value: 0 },
        uAspect: { value: 1 },
        uDecay: { value: 0.982 },
        uRadius: { value: 0.01 },
        uTexel: { value: new Vector2(1 / 256, 1 / 256) },
      },
      depthTest: false,
      depthWrite: false,
    });
    const display = new ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: displayFragment,
      uniforms: {
        uHistory: { value: history.texture },
        uTrail: { value: null },
        uHead: { value: 0 },
        uDepth: { value: DEPTH },
        uRes: { value: new Vector2(1, 1) },
        uTime: { value: 0 },
        uMode: { value: 0 },
        uAmount: { value: 0.6 },
        uShadow: { value: srgb(palette.brand) },
        uHigh: { value: srgb(palette.gold) },
        uWarp: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    });

    return {
      cam, history, trails, capture, trail, display,
      captureScene: quad(capture), trailScene: quad(trail), displayScene: quad(display),
      head: 0, filled: false, sinceCapture: 1, ping: 0, warp: 0,
    };
  }, [W, H, DEPTH, aspect]);

  useEffect(
    () => () => {
      kit.history.dispose();
      kit.trails.forEach((t) => t.dispose());
      kit.capture.dispose();
      kit.trail.dispose();
      kit.display.dispose();
    },
    [kit],
  );

  // the pointer lives on the page (the canvas sits under the HTML), so listen on window
  const pointer = useMemo(() => ({ x: 0.5, y: 0.5, px: 0.5, py: 0.5, lastMove: -10 }), []);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.x = e.clientX / window.innerWidth;
      pointer.y = 1 - e.clientY / window.innerHeight;
      pointer.lastMove = performance.now() / 1000;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [pointer]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    kit.capture.uniforms.uVideo.value = video;

    // 1 — write the newest frame into the ring buffer
    kit.sinceCapture += dt;
    if (kit.sinceCapture >= 1 / CAPTURE_HZ || !kit.filled) {
      kit.sinceCapture = 0;
      kit.head = (kit.head + 1) % DEPTH;
      const layers = kit.filled ? [kit.head] : Array.from({ length: DEPTH }, (_, i) => i);
      for (const layer of layers) {
        gl.setRenderTarget(kit.history, layer);
        gl.render(kit.captureScene, kit.cam);
      }
      kit.filled = true;
      worldState.ready = true;
    }

    // 2 — the pointer's trail; when nobody touches the screen a ghost keeps drawing
    const now = performance.now() / 1000;
    let x = pointer.x;
    let y = pointer.y;
    if (now - pointer.lastMove > 2.5) {
      x = 0.5 + Math.sin(t * 0.53) * 0.32 + Math.sin(t * 1.3) * 0.06;
      y = 0.5 + Math.sin(t * 0.71 + 1.2) * 0.26;
    }
    const speed = Math.hypot(x - pointer.px, y - pointer.py);
    pointer.px = x;
    pointer.py = y;
    const u = kit.trail.uniforms;
    u.uPrev.value = kit.trails[kit.ping].texture;
    u.uPointer.value.set(x, y);
    u.uForce.value = Math.min(1, speed * 45);
    u.uAspect.value = size.width / size.height;
    kit.ping = 1 - kit.ping;
    gl.setRenderTarget(kit.trails[kit.ping]);
    gl.render(kit.trailScene, kit.cam);

    // 3 — the frame the visitor sees
    const d = kit.display.uniforms;
    d.uTrail.value = kit.trails[kit.ping].texture;
    d.uHead.value = kit.head;
    d.uTime.value = t;
    d.uRes.value.set(size.width, size.height);

    // scroll morphs the way time bends: stargate → timeline → tide
    const s = worldState.scroll;
    const mode = smooth(0.1, 0.32, s) + smooth(0.55, 0.78, s);
    d.uMode.value = mode;
    d.uAmount.value = 0.55 + 0.35 * smooth(0.05, 0.3, s);
    // scroll speed → warp, rising fast and settling slowly
    const target = Math.min(1, Math.abs(worldState.velocity) / 60);
    kit.warp += (target - kit.warp) * (1 - Math.exp(-(target > kit.warp ? 10 : 2.5) * dt));
    d.uWarp.value = kit.warp;

    gl.setRenderTarget(null);
    gl.render(kit.displayScene, kit.cam);

    // the scroll is the playhead: timecode and subtitles read it from here
    worldState.playheadZ = TIMELINE_START_Z - s * REEL_SECONDS;
  }, 1);

  return null;
}

function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
