import { Injectable } from '@angular/core';

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
  about: string;
  skills: string[];
  moreSkills?: number;
}

/**
 * Single source of truth for the career timeline: the Experience cards render
 * `jobs`, and anywhere the site says "X years of experience" reads `totalYears`
 * so the number can never drift out of sync with the roles below.
 */
@Injectable({ providedIn: 'root' })
export class CareerService {
  // month is 0-indexed: Jan = 0 … Dec = 11
  readonly jobs: Job[] = [
    {
      title: 'Cinematic Trailer Editor (DaVinci Resolve)',
      org: 'Upwork',
      type: 'Hourly Contract',
      start: new Date(2026, 7, 1), // Aug 2026
      location: 'Belgium',
      locationTag: 'remote',
      about:
        'Editing a series of Hollywood-style military trailers for a Belgian Defence project, covering a military lead-climbing course and mountain parapente operations. Working inside a supplied DaVinci Resolve proxy project — cutting from prepared derush timelines into clean, relinkable edit timelines and delivering horizontal and vertical versions built around speed ramps, impact transitions, AI voiceover, layered sound design, and trailer-style typography.',
      skills: ['DaVinci Resolve,', 'Trailer Editing,', 'Sound Design'],
      moreSkills: 4,
    },
    {
      title: 'AI Image & Motion Editor',
      org: 'Upwork',
      type: 'Long-term Contract',
      start: new Date(2026, 6, 1), // Jul 2026
      location: 'United States',
      locationTag: 'remote',
      about:
        'Working directly with a U.S. client on a long-term hourly contract, producing AI image and motion content with Higgsfield AI. I generate and art-direct stills, animate them into motion clips, and finish the results into delivery-ready assets that match the client’s brief.',
      skills: ['Higgsfield AI,', 'AI Image Generation,', 'Motion Editing'],
      moreSkills: 3,
    },
    {
      title: 'Stickman Animation Editor',
      org: 'YouTube Channel',
      type: 'Remote',
      start: new Date(2026, 5, 1), // Jun 2026
      location: 'Tbilisi, Georgia',
      locationTag: 'remote',
      about:
        'Turning ready-made voiceovers into long-form YouTube animation: I illustrate stickman frames in Adobe Illustrator and assemble them into hard-cut animation where one frame equals one idea. Episodes run 8–10 minutes, with full creative freedom over visual jokes, pacing, and SFX-driven sound design.',
      skills: ['Adobe Illustrator,', 'Hard-cut Animation,', 'SFX Design'],
      moreSkills: 3,
    },
    {
      title: 'Generative AI Video Editor',
      org: 'Georgian Ad Company',
      type: 'Full-time',
      start: new Date(2026, 3, 1), // Apr 2026
      end: new Date(2026, 6, 1), // Jul 2026 — career ended
      location: 'Tbilisi, Georgia',
      about:
        'Produced AI-generated commercials from 30-second spots up to 8-minute brand films. Generated voiceovers, images, and full video scenes with modern generative AI tools, then edited, graded, and sound-designed them into polished, ready-to-air ads.',
      skills: ['AI Video Generation,', 'AI Voice & Image,', 'Ad Editing'],
      moreSkills: 4,
    },
    {
      title: 'Visual Story Editor',
      org: 'PlotRoom',
      type: 'Full-time',
      start: new Date(2026, 3, 1), // Apr 2026
      end: new Date(2026, 5, 1), // Jun 2026 — career ended
      location: 'London, United Kingdom',
      locationTag: 'remote',
      about:
        'Video Storyteller for a UK-based creative startup, editing talking-head videos into highly engaging content for digital audiences across social media platforms. Managed end-to-end video production, including editing, audio design, and motion storytelling.',
      skills: ['Aobe Premiere Pro,', 'Talking-head Editing,', 'Audio Design'],
      moreSkills: 4,
    },
    {
      title: 'Visual Story Editor',
      org: 'TalesBox',
      type: 'Full-time',
      start: new Date(2025, 10, 1), // Nov 2025
      end: new Date(2026, 3, 1), // Apr 2026 — career ended
      location: 'London, United Kingdom',
      locationTag: 'remote',
      about:
        'Worked as a Video Storyteller for a UK-based creative startup, producing highly engaging content for digital audiences across social media platforms. Managed end-to-end video production, including editing, audio design, and motion storytelling.',
      skills: ['Aobe Premiere Pro,', 'Video Storytelling,', 'Audio Design'],
      moreSkills: 4,
    },
    {
      title: 'Visual Director (Post & Production)',
      org: 'Freelance',
      type: 'Project-based',
      start: new Date(2023, 7, 1), // Aug 2023
      location: 'Tbilisi, Georgia',
      locationTag: 'On-site',
      about:
        'Filmed construction processes for U.S. clients under short-term contract projects, managing end-to-end production including script development, copywriting, audio design, and professional color correction using Drone & Canon cameras and gimbal stabilization.',
      skills: ['Video production,', 'Color Gradeing,', 'Video Storytelling,'],
      moreSkills: 5,
    },
  ].sort((a, b) => b.start.getTime() - a.start.getTime()); // newest first

  // Total experience, counted from the earliest role's start to today and
  // rounded UP to the next whole year (e.g. 3 yrs + 1 day shows as 4).
  get totalYears(): number {
    const earliest = this.jobs.reduce(
      (min, j) => (j.start.getTime() < min.getTime() ? j.start : min),
      this.jobs[0].start
    );
    const now = new Date();
    let years = now.getFullYear() - earliest.getFullYear();
    const beforeAnniversary =
      now.getMonth() < earliest.getMonth() ||
      (now.getMonth() === earliest.getMonth() && now.getDate() < earliest.getDate());
    if (beforeAnniversary) years--;
    const onAnniversary =
      now.getMonth() === earliest.getMonth() && now.getDate() === earliest.getDate();
    return Math.max(1, onAnniversary ? years : years + 1);
  }
}
