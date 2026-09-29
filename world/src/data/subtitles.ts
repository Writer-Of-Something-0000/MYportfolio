/**
 * The About text, cut into subtitles and timed against the timeline the way an
 * .srt file is: each cue is on screen between two timecodes, in seconds.
 * The full, unsplit paragraphs stay in the page for search engines and screen
 * readers (see heroParagraphs in profile.ts).
 */
export interface Cue {
  from: number;
  to: number;
  text: string;
}

const CUE = 9; // seconds each line holds
const GAP = 0.4; // the blank between two lines, as in real subtitles
const FIRST = 6;

export function aboutCues(years: number): Cue[] {
  const lines = [
    'I’m Luka, a post-production specialist.',
    `Over ${years} years in video editing, motion graphics and AI-powered content.`,
    'I cut in Premiere Pro, After Effects, DaVinci Resolve, Illustrator and Photoshop,',
    'plus Lightroom, Sony Vegas Pro, and the AI tools that speed production up.',
    'I love working with Sony cameras, and I’m crazy about drones.',
    'I’ve delivered work across companies and teams:',
    'AI-generated trailers, cinematic short-form and brand commercials.',
  ];
  return lines.map((text, i) => ({
    from: FIRST + i * CUE,
    to: FIRST + (i + 1) * CUE - GAP,
    text,
  }));
}
