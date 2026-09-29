import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export type Quality = 'high' | 'low';

/**
 * Film finish, kept to what a graded frame actually has: bloom that only the
 * gold playhead is bright enough to trigger, grain, and a soft vignette.
 * 'low' drops the grain.
 */
export function Effects({ quality }: { quality: Quality }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={1} intensity={0.8} radius={0.6} />
      <Noise
        premultiply
        blendFunction={BlendFunction.OVERLAY}
        opacity={quality === 'high' ? 0.45 : 0}
      />
      <Vignette offset={0.3} darkness={0.7} />
    </EffectComposer>
  );
}
