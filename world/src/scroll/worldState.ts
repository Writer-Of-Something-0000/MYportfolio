/**
 * Shared, mutable state between the scroll, the 3D scene and the HUD.
 *
 * Deliberately NOT React state: these values change every frame, and routing
 * them through React would re-render the page 60 times a second. Writers and
 * readers poll it from their own animation loops instead.
 */
export const worldState = {
  /** raw page scroll progress, 0 at the top → 1 at the bottom (from Lenis) */
  scroll: 0,
  /** px/frame, signed — used for motion blur-ish accents */
  velocity: 0,
  /** where the playhead currently sits on the timeline, in world units along −Z */
  playheadZ: 0,
  /** 0 while framed on the monitor → 1 once the camera has dropped onto the timeline */
  descent: 0,
  /** set once the world has drawn its first real frame — the loader waits for it */
  ready: false,
};

/** The timeline starts here; the playhead's distance from it is the timecode. */
export const TIMELINE_START_Z = 1;

/** world units the playhead covers per second of "footage" */
export const UNITS_PER_SECOND = 1;

export const FPS = 25;

/** playhead position → seconds into the reel */
export function secondsAt(playheadZ: number): number {
  return Math.max(0, TIMELINE_START_Z - playheadZ) / UNITS_PER_SECOND;
}

/** playhead position → "HH:MM:SS:FF" at 25 fps */
export function timecode(playheadZ: number): string {
  const totalFrames = Math.floor(secondsAt(playheadZ) * FPS);
  const ff = totalFrames % FPS;
  const s = Math.floor(totalFrames / FPS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(ff)}`;
}
