/**
 * Picks the showreel file the way the old index.html did:
 *   AV1-capable browsers → .webm tiers; Safari (no AV1) → H.264 .mp4 tiers.
 *   data-saver / 2g → smallest, 3g → mid, otherwise full.
 * The generic 'video/webm' check is not enough — Safari answers "maybe", picks
 * the AV1 webm and then fails to decode it.
 */
export function pickShowreel(): string {
  const av1 = document.createElement('video').canPlayType('video/webm; codecs="av01.0.08M.08"');
  const files = av1
    ? { full: '/portfolio.webm', mid: '/smallsizeportfolio.webm', low: '/smallestportfolio.webm' }
    : { full: '/portfolio.mp4', mid: '/smallsizeportfolio.mp4', low: '/smallestportfolio.mp4' };

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  const type = conn?.effectiveType ?? '';
  if (conn?.saveData || /(^|-)2g$/.test(type)) return files.low;
  if (type === '3g') return files.mid;
  return files.full;
}
