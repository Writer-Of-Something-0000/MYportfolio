import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import {
  Color, InstancedBufferAttribute, InstancedMesh, Object3D, PlaneGeometry,
} from 'three';
import { palette } from '../theme/tokens';
import { worldState, TIMELINE_START_Z, timecode } from '../scroll/worldState';
import {
  GROUND_Y, RULER_X, TIMELINE_END_Z, TIMELINE_LENGTH, TRACKS, TRACKS_WIDTH, TRACK_WIDTH, trackX,
} from './layout';
import { createClipMaterial, setClipVideo } from './clipMaterial';
import { useShowreel } from './showreel';
import { UI_FONT } from './fonts';

interface Clip {
  track: number;
  /** front edge (nearer the start) — the larger Z */
  z0: number;
  /** back edge — the smaller Z */
  z1: number;
}

/** chapter markers on the ruler, in seconds — later phases add the rest */
const MARKERS: { at: number; name: string }[] = [{ at: 70, name: 'Selected works' }];

// deterministic "random" so the edit looks the same on every visit
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A believable edit: dense V1 and audio beds, sparser overlays on V2/V3. */
function buildEdit(): Clip[] {
  const rand = mulberry32(2023);
  const clips: Clip[] = [];
  TRACKS.forEach((track, i) => {
    const density = track.kind === 'audio' ? 0.9 : [0.4, 0.65, 0.97][i];
    let z = TIMELINE_START_Z - rand() * 2;
    while (z > TIMELINE_END_Z) {
      const len = track.kind === 'audio' ? 3 + rand() * 8 : 1.1 + rand() * 4.2;
      const gap = rand() > density ? 2 + rand() * 6 : 0.04;
      clips.push({ track: i, z0: z, z1: Math.max(TIMELINE_END_Z, z - len) });
      z -= len + gap;
    }
  });
  return clips;
}

const CLIP_WIDTH = TRACK_WIDTH - 0.08;

/**
 * @param beds dark track beds under the clips — off when the timeline lies on
 *             a mirror floor, so the clips reflect in it
 */
export function Timeline({ beds = true }: { beds?: boolean }) {
  const bedDepth = TIMELINE_LENGTH + 4;
  const bedZ = TIMELINE_START_Z - TIMELINE_LENGTH / 2;

  return (
    <group>
      {beds &&
        TRACKS.map((t, i) => (
          <mesh key={t.name} position={[trackX(i), GROUND_Y, bedZ]}>
            <boxGeometry args={[TRACK_WIDTH, 0.02, bedDepth]} />
            <meshBasicMaterial color={t.kind === 'video' ? '#0a0710' : '#070609'} />
          </mesh>
        ))}

      <Clips />
      <Ruler />

      {/* track headers, where an editor would look for them: at the head of each track */}
      {TRACKS.map((t, i) => (
        <Text
          key={t.name}
          font={UI_FONT}
          fontSize={0.2}
          color="#8a8494"
          anchorX="center"
          anchorY="middle"
          position={[trackX(i), GROUND_Y + 0.02, TIMELINE_START_Z + 0.45]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {t.name}
        </Text>
      ))}

      {MARKERS.map((m) => (
        <Marker key={m.name} at={m.at} name={m.name} />
      ))}

      {/* the edge of the track stack */}
      <mesh position={[TRACKS_WIDTH / 2 + 0.06, GROUND_Y + 0.01, bedZ]}>
        <boxGeometry args={[0.01, 0.01, bedDepth]} />
        <meshBasicMaterial color={palette.brand} />
      </mesh>
    </group>
  );
}

/** Every clip in one draw call; the shader does filmstrips, waveforms and borders. */
function Clips() {
  const clips = useMemo(buildEdit, []);
  const material = useMemo(() => createClipMaterial(CLIP_WIDTH), []);
  const mesh = useRef<InstancedMesh>(null);

  const geometry = useMemo(() => {
    const g = new PlaneGeometry(1, 1);
    const n = clips.length;
    const len = new Float32Array(n);
    const kind = new Float32Array(n);
    const color = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const violet = new Color(palette.brand);
    clips.forEach((c, i) => {
      len[i] = c.z0 - c.z1;
      kind[i] = TRACKS[c.track].kind === 'audio' ? 1 : 0;
      violet.toArray(color, i * 3);
      seed[i] = i * 0.618;
    });
    g.setAttribute('aLen', new InstancedBufferAttribute(len, 1));
    g.setAttribute('aKind', new InstancedBufferAttribute(kind, 1));
    g.setAttribute('aColor', new InstancedBufferAttribute(color, 3));
    g.setAttribute('aLit', new InstancedBufferAttribute(new Float32Array(n), 1));
    g.setAttribute('aSeed', new InstancedBufferAttribute(seed, 1));
    return g;
  }, [clips]);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const m = mesh.current!;
    clips.forEach((c, i) => {
      const len = c.z0 - c.z1;
      dummy.position.set(trackX(c.track), GROUND_Y + 0.015, (c.z0 + c.z1) / 2);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(CLIP_WIDTH, Math.max(0.05, len - 0.03), 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [clips]);

  // the clip under the playhead switches on — a cut, not a fade
  useFrame(() => {
    const lit = geometry.getAttribute('aLit') as InstancedBufferAttribute;
    const p = worldState.playheadZ;
    let changed = false;
    clips.forEach((c, i) => {
      const on = p <= c.z0 && p >= c.z1 ? 1 : 0;
      if (lit.array[i] !== on) {
        lit.array[i] = on;
        changed = true;
      }
    });
    if (changed) lit.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={mesh}
        args={[geometry, material, clips.length]}
        frustumCulled={false}
      />
      {/* the filmstrips pick up the showreel once it can play */}
      <Suspense fallback={null}>
        <FeedShowreel material={material} />
      </Suspense>
    </>
  );
}

function FeedShowreel({ material }: { material: ReturnType<typeof createClipMaterial> }) {
  const texture = useShowreel();
  useEffect(() => {
    setClipVideo(material, texture);
    return () => setClipVideo(material, null);
  }, [material, texture]);
  return null;
}

/** A tick per second, a long one every five, and a timecode on every long one. */
function Ruler() {
  const count = Math.floor(TIMELINE_LENGTH) + 1;
  const ticks = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    for (let s = 0; s < count; s++) {
      const major = s % 5 === 0;
      dummy.position.set(RULER_X + (major ? 0 : 0.09), GROUND_Y + 0.01, TIMELINE_START_Z - s);
      dummy.scale.set(major ? 0.36 : 0.18, 0.01, 0.02);
      dummy.updateMatrix();
      ticks.current!.setMatrixAt(s, dummy.matrix);
    }
    ticks.current!.instanceMatrix.needsUpdate = true;
  }, [count]);

  const labels = Array.from({ length: Math.floor(TIMELINE_LENGTH / 5) + 1 }, (_, i) => i * 5);

  return (
    <group>
      <instancedMesh ref={ticks} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#6f6a78" />
      </instancedMesh>
      {labels.map((s) => (
        <Text
          key={s}
          font={UI_FONT}
          fontSize={0.1}
          color="#6f6a78"
          anchorX="right"
          anchorY="middle"
          position={[RULER_X - 0.24, GROUND_Y + 0.01, TIMELINE_START_Z - s]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {timecode(TIMELINE_START_Z - s)}
        </Text>
      ))}
    </group>
  );
}

/** An NLE marker: a violet flag on the ruler with its name beside it. */
function Marker({ at, name }: { at: number; name: string }) {
  const z = TIMELINE_START_Z - at;
  return (
    <group position={[RULER_X, GROUND_Y, z]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <planeGeometry args={[0.18, 0.18]} />
        <meshBasicMaterial color={palette.brandLight} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.012, 0.6, 0.012]} />
        <meshBasicMaterial color={palette.brandLight} />
      </mesh>
      <Text
        font={UI_FONT}
        fontSize={0.2}
        color={palette.text}
        anchorX="left"
        anchorY="middle"
        position={[0.12, 0.55, 0]}
      >
        {name}
      </Text>
    </group>
  );
}
