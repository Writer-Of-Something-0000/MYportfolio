/**
 * The physical layout of the timeline. Time runs along −Z (away from the
 * camera); tracks sit side by side along X, video tracks left, audio right,
 * the way an editor's track headers stack V3 / V2 / V1 / A1 / A2.
 */
import { TIMELINE_START_Z } from '../scroll/worldState';

export const GROUND_Y = -1;

/** how far the timeline runs, in world units (= seconds of "footage") */
export const TIMELINE_LENGTH = 140;
export const TIMELINE_END_Z = TIMELINE_START_Z - TIMELINE_LENGTH;

export type TrackKind = 'video' | 'audio';

export const TRACKS: { name: string; kind: TrackKind }[] = [
  { name: 'V3', kind: 'video' },
  { name: 'V2', kind: 'video' },
  { name: 'V1', kind: 'video' },
  { name: 'A1', kind: 'audio' },
  { name: 'A2', kind: 'audio' },
];

export const TRACK_WIDTH = 0.9;
export const TRACK_GAP = 0.14;
export const TRACKS_WIDTH = TRACKS.length * TRACK_WIDTH + (TRACKS.length - 1) * TRACK_GAP;

/** centre X of track i */
export const trackX = (i: number) =>
  -TRACKS_WIDTH / 2 + TRACK_WIDTH / 2 + i * (TRACK_WIDTH + TRACK_GAP);

/** the time ruler runs along the left edge of the tracks */
export const RULER_X = -TRACKS_WIDTH / 2 - 0.45;

/** the showreel monitor floating above the start of the timeline */
export const MONITOR = {
  position: [0, 2.35, -1.2] as const,
  width: 6.4,
  height: 3.6,
};
