/**
 * Career timeline — ported from FrontPage/src/app/services/career.ts, typos fixed.
 * Single source for the Experience chapter AND for every "X years" on the site.
 * On the timeline each role becomes a clip whose length is its real duration.
 */

export interface Job {
  title: string;
  org: string;
  type: string;
  /** first day of the month the role started */
  start: Date;
  /** first day of the month it ended; omit for a current role */
  end?: Date;
  location: string;
  locationTag?: string;
  /** a few short contracts have no write-up yet */
  about?: string;
  skills?: string[];
  moreSkills?: number;
}

/** One card / clip group: several roles at one org (Upwork) share an entry. */
export interface TimelineEntry {
  org: string;
  /** newest first */
  roles: Job[];
  start: Date;
  /** undefined while any role is still running */
  end?: Date;
}

// month is 0-indexed: Jan = 0 … Dec = 11
export const jobs: Job[] = [
  {
    title: 'AI Video Editor / Stickmans',
    org: 'Upwork',
    type: 'Part-time',
    start: new Date(2026, 8, 1),
    location: 'United States',
    locationTag: 'hybrid',
  },
  {
    title: 'Cinematic Trailer Editor (DaVinci Resolve)',
    org: 'Upwork',
    type: 'Hourly Contract',
    start: new Date(2026, 7, 1),
    location: 'Belgium',
    locationTag: 'remote',
    about:
      'Editing a series of Hollywood-style military trailers for a Belgian Defence project, covering a military lead-climbing course and mountain parapente operations. Working inside a supplied DaVinci Resolve proxy project — cutting from prepared derush timelines into clean, relinkable edit timelines and delivering horizontal and vertical versions built around speed ramps, impact transitions, AI voiceover, layered sound design, and trailer-style typography.',
    skills: ['DaVinci Resolve', 'Trailer Editing', 'Sound Design'],
    moreSkills: 4,
  },
  {
    title: 'AI Image & Motion Editor',
    org: 'Upwork',
    type: 'Long-term Contract',
    start: new Date(2026, 6, 1),
    location: 'United States',
    locationTag: 'remote',
    about:
      'Working directly with a U.S. client on a long-term hourly contract, producing AI image and motion content with Higgsfield AI. I generate and art-direct stills, animate them into motion clips, and finish the results into delivery-ready assets that match the client’s brief.',
    skills: ['Higgsfield AI', 'AI Image Generation', 'Motion Editing'],
    moreSkills: 3,
  },
  {
    title: 'AI Video Editor / Animator',
    org: 'Upwork',
    type: 'Part-time',
    start: new Date(2026, 7, 1),
    end: new Date(2026, 8, 1),
    location: 'United States',
    locationTag: 'remote',
  },
  {
    title: 'Beta Tester — AI Editing Tools for Adobe Premiere Pro',
    org: 'Upwork',
    type: 'Part-time',
    start: new Date(2026, 7, 1),
    end: new Date(2026, 8, 1),
    location: 'San Francisco, California, United States',
    locationTag: 'hybrid',
    about:
      'Testing new builds of an AI-assisted editing tool inside Adobe Premiere Pro, working with interview-driven footage, B-roll and large volumes of raw material. Ran regression passes over existing workflows and reported bugs, UX friction and behaviour that doesn’t match how an editor actually works, delivering structured feedback through written notes, screen recordings and feedback calls.',
    skills: ['Adobe Premiere Pro', 'QA & Regression Testing', 'UX Feedback'],
    moreSkills: 2,
  },
  {
    title: 'AI Content Creator & Video Editor',
    org: 'Upwork',
    type: 'Contract',
    start: new Date(2026, 7, 1),
    end: new Date(2026, 7, 1),
    location: 'St Gallen, Switzerland',
    locationTag: 'remote',
    about:
      'End-to-end AI video creation and production for YouTube Automation, built around engaging storytelling and high-quality visuals. Generated AI images, visual assets and voiceovers (ElevenLabs, AI image generation), handled full editing, prompt engineering and script writing, and designed custom thumbnails optimised for high CTR.',
    skills: ['AI Content Creation', 'Prompt Engineering', 'Thumbnail Design'],
    moreSkills: 3,
  },
  {
    title: 'Stickman Animation Editor',
    org: 'YouTube Channel',
    type: 'Remote',
    start: new Date(2026, 5, 1),
    location: 'Tbilisi, Georgia',
    locationTag: 'remote',
    about:
      'Turning ready-made voiceovers into long-form YouTube animation: I illustrate stickman frames in Adobe Illustrator and assemble them into hard-cut animation where one frame equals one idea. Episodes run 8–10 minutes, with full creative freedom over visual jokes, pacing, and SFX-driven sound design.',
    skills: ['Adobe Illustrator', 'Hard-cut Animation', 'SFX Design'],
    moreSkills: 3,
  },
  {
    title: 'Generative AI Video Editor',
    org: 'Georgian Ad Company',
    type: 'Full-time',
    start: new Date(2026, 3, 1),
    end: new Date(2026, 6, 1),
    location: 'Tbilisi, Georgia',
    about:
      'Produced AI-generated commercials from 30-second spots up to 8-minute brand films. Generated voiceovers, images, and full video scenes with modern generative AI tools, then edited, graded, and sound-designed them into polished, ready-to-air ads.',
    skills: ['AI Video Generation', 'AI Voice & Image', 'Ad Editing'],
    moreSkills: 4,
  },
  {
    title: 'Visual Story Editor',
    org: 'PlotRoom',
    type: 'Full-time',
    start: new Date(2026, 3, 1),
    end: new Date(2026, 5, 1),
    location: 'London, United Kingdom',
    locationTag: 'remote',
    about:
      'Video Storyteller for a UK-based creative startup, editing talking-head videos into highly engaging content for digital audiences across social media platforms. Managed end-to-end video production, including editing, audio design, and motion storytelling.',
    skills: ['Adobe Premiere Pro', 'Talking-head Editing', 'Audio Design'],
    moreSkills: 4,
  },
  {
    title: 'Visual Story Editor',
    org: 'TalesBox',
    type: 'Full-time',
    start: new Date(2025, 10, 1),
    end: new Date(2026, 3, 1),
    location: 'London, United Kingdom',
    locationTag: 'remote',
    about:
      'Worked as a Video Storyteller for a UK-based creative startup, producing highly engaging content for digital audiences across social media platforms. Managed end-to-end video production, including editing, audio design, and motion storytelling.',
    skills: ['Adobe Premiere Pro', 'Video Storytelling', 'Audio Design'],
    moreSkills: 4,
  },
  {
    title: 'Visual Director (Post & Production)',
    org: 'Freelance',
    type: 'Project-based',
    start: new Date(2023, 7, 1),
    location: 'Tbilisi, Georgia',
    locationTag: 'on-site',
    about:
      'Filmed construction processes for U.S. clients under short-term contract projects, managing end-to-end production including script development, copywriting, audio design, and professional color correction using Drone & Canon cameras and gimbal stabilization.',
    skills: ['Video Production', 'Color Grading', 'Video Storytelling'],
    moreSkills: 5,
  },
].sort((a, b) => b.start.getTime() - a.start.getTime()); // newest first

/** Roles grouped by org, newest activity first — built once, never rebuilt. */
export const timeline: TimelineEntry[] = (() => {
  const byOrg = new Map<string, Job[]>();
  for (const job of jobs) {
    const key = job.org.toLowerCase();
    byOrg.set(key, [...(byOrg.get(key) ?? []), job]);
  }
  return [...byOrg.values()]
    .map((roles): TimelineEntry => {
      const sorted = [...roles].sort((a, b) => b.start.getTime() - a.start.getTime());
      const start = sorted.reduce((min, r) => (r.start < min ? r.start : min), sorted[0].start);
      const ongoing = sorted.some((r) => !r.end);
      const end = ongoing
        ? undefined
        : sorted.reduce((max, r) => (r.end! > max ? r.end! : max), sorted[0].end!);
      return { org: sorted[0].org, roles: sorted, start, end };
    })
    .sort((a, b) => b.roles[0].start.getTime() - a.roles[0].start.getTime());
})();

/** When the career began — the left edge of the whole timeline. */
export const careerStart: Date = jobs.reduce(
  (min, j) => (j.start < min ? j.start : min),
  jobs[0].start,
);

/**
 * Years of experience, counted from the first role to today and rounded UP to
 * the next whole year (3 yrs + 1 day → 4) — the number the old site showed.
 */
export function totalYears(now: Date = new Date()): number {
  let years = now.getFullYear() - careerStart.getFullYear();
  const beforeAnniversary =
    now.getMonth() < careerStart.getMonth() ||
    (now.getMonth() === careerStart.getMonth() && now.getDate() < careerStart.getDate());
  if (beforeAnniversary) years--;
  const onAnniversary =
    now.getMonth() === careerStart.getMonth() && now.getDate() === careerStart.getDate();
  return Math.max(1, onAnniversary ? years : years + 1);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Jun 2026" */
export function monthLabel(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Aug 2026 – Sep 2026", "Aug 2026 – present", or "Aug 2026" for a single month */
export function rangeLabel(span: { start: Date; end?: Date }): string {
  if (!span.end) return `${monthLabel(span.start)} – present`;
  const from = monthLabel(span.start);
  const to = monthLabel(span.end);
  return from === to ? from : `${from} – ${to}`;
}

/** live tenure, inclusive of both months: "3 mos", "2 yrs 11 mos" */
export function durationLabel(span: { start: Date; end?: Date }, now: Date = new Date()): string {
  const end = span.end ?? now;
  const months = Math.max(
    1,
    (end.getFullYear() - span.start.getFullYear()) * 12 + (end.getMonth() - span.start.getMonth()) + 1,
  );
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (rem) parts.push(`${rem} mo${rem > 1 ? 's' : ''}`);
  return parts.join(' ');
}
