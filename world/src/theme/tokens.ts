/**
 * The palette carried over from the original site — the one thing (with the
 * content) that survives the redesign unchanged. Both the CSS (via the custom
 * properties applyTokens() writes) and the Three.js scene read these values, so
 * a colour is changed in exactly one place.
 */
export const palette = {
  /** the void everything floats in */
  bg: '#000000',
  /** the old hero backdrop, one step up from black */
  bgRaised: '#0e0e0e',
  /** brand purple: tracks, hard shadows, active states */
  brand: '#4904a2',
  /** lighter purple: active clip, focus, dots */
  brandLight: '#7d3cf0',
  /** saturated purple used for glow and fire */
  glow: '#9000ff',
  /** chat and icon accents */
  lilac: '#b98cff',
  /** playhead, timecode, stars */
  gold: '#ffd700',
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.55)',
  /** frosted glass fill + edge from the original .nb-card */
  glass: 'rgba(255, 255, 255, 0.04)',
  glassEdge: 'rgba(255, 255, 255, 0.14)',
} as const;

export type PaletteKey = keyof typeof palette;

export const fonts = {
  /** pixel display face — titles, timecode */
  display: '"Jersey 10", sans-serif',
  /** body copy */
  body: '"Nunito Sans", sans-serif',
} as const;

/** camelCase key → --kebab-case custom property on :root */
export function applyTokens(root: HTMLElement = document.documentElement): void {
  for (const [key, value] of Object.entries(palette)) {
    root.style.setProperty(`--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, value);
  }
  root.style.setProperty('--font-display', fonts.display);
  root.style.setProperty('--font-body', fonts.body);
}
