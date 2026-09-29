/**
 * Hand-listed videos that the channel scan can't find.
 *
 * The Projects grid is built from the uploads playlist of the @lukagengashvili
 * channel, read with a plain API key — which only ever sees videos published
 * there. Work edited FOR a client lives on that client's own channel, so it is
 * invisible to the scan even though it is perfectly public.
 *
 * Listing such a video here embeds the client's published video by id. Nothing is
 * re-uploaded and no second copy appears anywhere; the site simply points at the
 * real thing. Metadata is written out below rather than fetched, so these entries
 * cost no API quota and still show up if the key ever stops working.
 *
 * To add one: copy the id out of the watch link
 * (youtube.com/watch?v=dQw4w9WgXcQ → 'dQw4w9WgXcQ') and fill in the rest. The
 * tags drive the category filter, exactly like the hashtags on an own upload.
 */
export interface FeaturedWork {
  /** the part after "watch?v=" */
  youtubeId: string;
  title: string;
  /** feeds the category filter — 'stickman' puts it under 2D Stickman */
  tags: string[];
  /** '169' for landscape, '916' for vertical */
  orientation: '169' | '916';
  /** "8:42", "1:02:30" or "45s" — decides Long vs Short */
  duration: string;
  /** "2026-06" or "2026-06-14", for date sorting */
  published: string;
}

export const FEATURED_WORKS: FeaturedWork[] = [
  // {
  //   youtubeId: 'dQw4w9WgXcQ',
  //   title: 'Stickman Episode 12 — The Meeting',
  //   tags: ['stickman', 'illustrator', 'sfxdesign'],
  //   orientation: '169',
  //   duration: '9:14',
  //   published: '2026-06',
  // },
];

/** "8:42" → 522, "1:02:30" → 3750, "45s" → 45 */
export function durationToSeconds(duration: string): number {
  const bare = duration.trim().replace(/s$/i, '');
  const parts = bare.split(':').map((p) => parseInt(p, 10) || 0);
  // reduce right-to-left so m:ss and h:mm:ss both work
  return parts.reduce((total, part) => total * 60 + part, 0);
}

/** "2026-06" → ms timestamp; a bare month counts as its 1st */
export function publishedToTimestamp(published: string): number {
  const full = /^\d{4}-\d{2}$/.test(published.trim()) ? `${published.trim()}-01` : published.trim();
  return Date.parse(full) || 0;
}
