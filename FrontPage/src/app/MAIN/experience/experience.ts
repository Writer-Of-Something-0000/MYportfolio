import { Component, ElementRef, ViewChild } from '@angular/core';

interface Job {
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

@Component({
  selector: 'app-experience',
  standalone: false,
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience {
  // month is 0-indexed: Jan = 0 … Dec = 11
  jobs: Job[] = [
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
      location: 'Tbilisi, Georgia',
      about:
        'Producing AI-generated commercials from 30-second spots up to 8-minute brand films. I generate voiceovers, images, and full video scenes with modern generative AI tools, then edit, grade, and sound-design them into polished, ready-to-air ads.',
      skills: ['AI Video Generation,', 'AI Voice & Image,', 'Ad Editing'],
      moreSkills: 4,
    },
    {
      title: 'Visual Story Editor',
      org: 'PlotRoom',
      type: 'Full-time',
      start: new Date(2026, 3, 1), // Apr 2026
      location: 'London, United Kingdom',
      locationTag: 'remote',
      about:
        'Video Storyteller for a UK-based creative startup, editing talking-head videos into highly engaging content for digital audiences across social media platforms. I manage end-to-end video production, including editing, audio design, and motion storytelling.',
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

  private readonly months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  /** "Jun 2026" */
  monthLabel(d: Date): string {
    return `${this.months[d.getMonth()]} ${d.getFullYear()}`;
  }

  /** live-counted tenure, e.g. "3 mos" or "2 yr 11 mos" (inclusive of both months) */
  duration(job: Job): string {
    const end = job.end ?? new Date();
    let months =
      (end.getFullYear() - job.start.getFullYear()) * 12 +
      (end.getMonth() - job.start.getMonth()) +
      1; // count the current month too
    if (months < 1) months = 1;

    const years = Math.floor(months / 12);
    const rem = months % 12;
    const parts: string[] = [];
    if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (rem) parts.push(`${rem} mo${rem > 1 ? 's' : ''}`);
    return parts.join(' ');
  }

  // --- drag-to-scroll slider (same behaviour as Selected Works) ---
  @ViewChild('slider') slider!: ElementRef<HTMLDivElement>;

  private isDown = false;
  private startX = 0;
  private scrollStart = 0;
  // flick momentum: keep gliding after the pointer lifts
  private lastX = 0;
  private velocity = 0;
  private momentumId = 0;

  dragStart(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return; // on touch the browser scrolls natively
    cancelAnimationFrame(this.momentumId);
    this.isDown = true;
    this.startX = event.clientX;
    this.lastX = event.clientX;
    this.velocity = 0;
    this.scrollStart = this.slider.nativeElement.scrollLeft;
  }

  dragMove(event: PointerEvent) {
    if (!this.isDown) return;
    const dx = event.clientX - this.startX;
    this.velocity = event.clientX - this.lastX;
    this.lastX = event.clientX;
    this.slider.nativeElement.scrollLeft = this.scrollStart - dx;
  }

  dragEnd() {
    if (!this.isDown) return;
    this.isDown = false;
    this.momentum();
  }

  private momentum = () => {
    this.velocity *= 0.94; // friction
    if (Math.abs(this.velocity) < 0.4) return;
    this.slider.nativeElement.scrollLeft -= this.velocity;
    this.momentumId = requestAnimationFrame(this.momentum);
  };
}
