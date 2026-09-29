/**
 * Shaders for the Time Displacement field.
 *
 * capture   copies the current showreel frame into one layer of a ring buffer
 *           (a texture array), gamma-encoded so 8 bits hold the darks.
 * trail     a ping-pong map of "how far back in time" each point is pushed by
 *           the pointer; it diffuses a little and heals back to zero.
 * display   for every pixel picks a moment from the ring buffer — the pattern
 *           of the current chapter plus the pointer's trail decides how far
 *           back — splits R/G/B across slightly different moments, then grades
 *           the result into the palette.
 */

export const quadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const captureFragment = /* glsl */ `
  uniform sampler2D uVideo;
  uniform vec2 uCover;
  varying vec2 vUv;
  void main() {
    // store only the part of the frame the screen shows, at the screen's shape,
    // so the buffer's pixels are spent where they're seen
    vec3 c = texture2D(uVideo, (vUv - 0.5) * uCover + 0.5).rgb;
    gl_FragColor = vec4(pow(max(c, 0.0), vec3(1.0 / 2.2)), 1.0);
  }
`;

export const trailFragment = /* glsl */ `
  uniform sampler2D uPrev;
  uniform vec2 uPointer;
  uniform float uForce;
  uniform float uAspect;
  uniform float uDecay;
  uniform float uRadius;
  uniform vec2 uTexel;
  varying vec2 vUv;

  void main() {
    // a touch of diffusion so a stroke softens like ink in water
    float c = texture2D(uPrev, vUv).r * 0.6
      + 0.1 * (texture2D(uPrev, vUv + vec2(uTexel.x, 0.0)).r
             + texture2D(uPrev, vUv - vec2(uTexel.x, 0.0)).r
             + texture2D(uPrev, vUv + vec2(0.0, uTexel.y)).r
             + texture2D(uPrev, vUv - vec2(0.0, uTexel.y)).r);
    c *= uDecay;

    vec2 d = vUv - uPointer;
    d.x *= uAspect;
    c += exp(-dot(d, d) / uRadius) * uForce;

    gl_FragColor = vec4(min(c, 1.0), 0.0, 0.0, 1.0);
  }
`;

export const displayFragment = /* glsl */ `
  uniform sampler2DArray uHistory;
  uniform sampler2D uTrail;
  uniform float uHead;
  uniform float uDepth;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uMode;
  uniform float uAmount;
  uniform vec3 uShadow;
  uniform vec3 uHigh;
  uniform float uWarp;
  varying vec2 vUv;

  // the frame "delay" of the way back into the buffer (0 = now, 1 = oldest),
  // blended between neighbouring layers so time flows instead of stepping
  vec3 momentAt(vec2 uv, float delay) {
    float d = clamp(delay, 0.0, 1.0) * (uDepth - 2.0);
    float f = floor(d);
    float a = mod(uHead - f + uDepth, uDepth);
    float b = mod(uHead - f - 1.0 + uDepth, uDepth);
    vec3 ca = texture(uHistory, vec3(uv, a)).rgb;
    vec3 cb = texture(uHistory, vec3(uv, b)).rgb;
    return mix(ca, cb, fract(d));
  }

  // how far back each point of the screen looks, per chapter:
  //   0  stargate — the centre is now, the edges are the past
  //   1  slit-scan — the screen's X axis becomes the timeline
  //   2  tide — slow waves of time rolling up the frame
  float pattern(vec2 p) {
    float stargate = smoothstep(0.08, 1.0, length(p));
    float slit = clamp(vUv.x * 1.05 - 0.02, 0.0, 1.0);
    float tide = 0.5 + 0.5 * sin(p.y * 6.0 - uTime * 0.7 + sin(p.x * 2.5 + uTime * 0.35) * 1.6);
    float ab = mix(stargate, slit, clamp(uMode, 0.0, 1.0));
    return mix(ab, tide, clamp(uMode - 1.0, 0.0, 1.0));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);

    // the pointer's trail is also a lens: its slope bends the image like liquid glass
    vec2 tx = vec2(1.5 / 256.0, 0.0);
    float trail = texture2D(uTrail, vUv).r;
    vec2 slope = vec2(
      texture2D(uTrail, vUv + tx.xy).r - texture2D(uTrail, vUv - tx.xy).r,
      texture2D(uTrail, vUv + tx.yx).r - texture2D(uTrail, vUv - tx.yx).r
    );
    vec2 uv = vUv - slope * 0.35;

    float delay = pattern(p) * uAmount + trail * 0.9;

    // temporal chromatic aberration: each channel from a slightly different moment
    float spread = 0.03 + trail * 0.07;
    vec3 col = vec3(
      momentAt(uv, delay - spread).r,
      momentAt(uv, delay).g,
      momentAt(uv, delay + spread).b
    );

    // warp: scrolling fast streaks the frame toward the centre, each step further
    // back in time — hyperspace, but through the reel's own past
    if (uWarp > 0.01) {
      vec2 toCentre = (vec2(0.5) - uv);
      vec3 streak = vec3(0.0);
      for (int i = 1; i <= 6; i++) {
        float k = float(i) / 6.0;
        streak += momentAt(uv + toCentre * k * 0.22 * uWarp, delay + k * 0.35 * uWarp);
      }
      col = mix(col, streak / 6.0, clamp(uWarp, 0.0, 0.85));
    }

    // grade: shadows lean into the brand violet, highlights stay clean;
    // gold appears only where the visitor is bending time
    float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(col, uShadow * (0.25 + l), 0.45 * (1.0 - smoothstep(0.05, 0.55, l)));
    col += uHigh * smoothstep(0.15, 0.8, trail) * 0.18;

    // lens falloff and film grain
    col *= mix(0.28, 1.0, smoothstep(1.25, 0.3, length(p)));
    col += (hash(vUv * uRes + fract(uTime) * 91.0) - 0.5) * 0.05;

    gl_FragColor = vec4(col, 1.0);
  }
`;
