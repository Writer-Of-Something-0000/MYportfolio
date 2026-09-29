import { Color, ShaderMaterial, UniformsLib, UniformsUtils, type Texture } from 'three';
import { palette } from '../theme/tokens';

/**
 * One material for every clip on the timeline, instanced.
 *
 *   video clips → a filmstrip of upright frames sampled from the live showreel,
 *                 violet-tinted and dim until the playhead crosses them;
 *   audio clips → a waveform drawn in lilac on dark violet.
 *
 * Per-instance attributes: aLen (clip length, world units), aKind (0 video,
 * 1 audio), aColor (label colour, linear), aLit (0/1 under the playhead),
 * aSeed (varies the waveform).
 */
const vertexShader = /* glsl */ `
  attribute float aLen;
  attribute float aKind;
  attribute vec3 aColor;
  attribute float aLit;
  attribute float aSeed;

  varying vec2 vUv;
  varying float vLen;
  varying float vKind;
  varying vec3 vColor;
  varying float vLit;
  varying float vSeed;

  #include <common>
  #include <fog_pars_vertex>

  void main() {
    vUv = uv;
    vLen = aLen;
    vKind = aKind;
    vColor = aColor;
    vLit = aLit;
    vSeed = aSeed;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uVideo;
  uniform float uHasVideo;
  uniform float uWidth;
  uniform vec3 uEdgeIdle;
  uniform vec3 uEdgeLit;
  uniform vec3 uWave;

  varying vec2 vUv;
  varying float vLen;
  varying float vKind;
  varying vec3 vColor;
  varying float vLit;
  varying float vSeed;

  #include <common>
  #include <fog_pars_fragment>

  float hash1(float n) { return fract(sin(n) * 43758.5453); }
  float noise1(float x) {
    float i = floor(x);
    float f = fract(x);
    return mix(hash1(i), hash1(i + 1.0), f * f * (3.0 - 2.0 * f));
  }

  void main() {
    // position on the clip's surface in world units
    float across = vUv.x * uWidth;
    float along = vUv.y * vLen;
    float edge = min(min(across, uWidth - across), min(along, vLen - along));
    vec3 col;

    if (vKind < 0.5) {
      // ── video: filmstrip of 16:9 frames running away from the camera
      float margin = 0.05;
      float pitch = (uWidth - 2.0 * margin) * 0.5625 + 0.035;
      float fu = (across - margin) / (uWidth - 2.0 * margin);
      float fv = (mod(along, pitch) - 0.0175) / (pitch - 0.035);
      col = vColor * mix(0.32, 0.55, vLit);
      if (fu > 0.0 && fu < 1.0 && fv > 0.0 && fv < 1.0) {
        vec3 frame = uHasVideo > 0.5 ? texture2D(uVideo, vec2(fu, fv)).rgb : vColor;
        float lum = dot(frame, vec3(0.2126, 0.7152, 0.0722));
        // idle frames are violet monochrome; the one under the playhead plays in full colour
        vec3 tinted = vColor * (0.25 + lum * 1.6);
        col = mix(tinted * 0.6, frame, vLit);
      }
    } else {
      // ── audio: mirrored waveform bars
      float fromCentre = abs(vUv.x - 0.5) * 2.0;
      float t = along * 9.0 + vSeed * 97.0;
      float amp = 0.12 + 0.8 * pow(noise1(t) * (0.55 + 0.45 * noise1(t * 0.21 + 3.0)), 0.8);
      float bar = step(0.3, fract(along * 26.0));
      col = vColor * mix(0.2, 0.3, vLit);
      if (fromCentre < amp && bar > 0.5) col = uWave * mix(0.4, 1.0, vLit);
    }

    // hairline clip border, brighter on the clip being played
    float line = 1.0 - smoothstep(0.012, 0.022, edge);
    col = mix(col, mix(uEdgeIdle, uEdgeLit, vLit), line);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export function createClipMaterial(width: number): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    fog: true,
    toneMapped: false,
    uniforms: UniformsUtils.merge([
      UniformsLib.fog,
      {
        uVideo: { value: null },
        uHasVideo: { value: 0 },
        uWidth: { value: width },
        uEdgeIdle: { value: new Color(palette.brand).multiplyScalar(0.9) },
        uEdgeLit: { value: new Color(palette.brandLight) },
        uWave: { value: new Color(palette.lilac) },
      },
    ]),
  });
}

export function setClipVideo(material: ShaderMaterial, texture: Texture | null): void {
  material.uniforms.uVideo.value = texture;
  material.uniforms.uHasVideo.value = texture ? 1 : 0;
}
