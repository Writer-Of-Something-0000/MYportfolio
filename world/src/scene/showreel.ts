import { useMemo } from 'react';
import { useVideoTexture } from '@react-three/drei';
import { SRGBColorSpace, type VideoTexture } from 'three';
import { pickShowreel } from './videoSource';

/**
 * The one showreel texture the whole world shares — the Program Monitor plays
 * it and every video clip's filmstrip samples it. drei caches by URL, so every
 * caller gets the same <video> element. Suspends until the video can start.
 */
export function useShowreel(): VideoTexture {
  const src = useMemo(pickShowreel, []);
  const texture = useVideoTexture(src, { muted: true, loop: true, playsInline: true, start: true });
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
