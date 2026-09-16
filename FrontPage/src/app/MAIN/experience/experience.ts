import { Component, ElementRef, ViewChild } from '@angular/core';
import { CareerService, Job, TimelineEntry } from '../../services/career';

@Component({
  selector: 'app-experience',
  standalone: false,
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience {
  // roles + the total-years number live in CareerService so the hero paragraph
  // and these cards can never disagree
  constructor(private career: CareerService) {}

  /** the cards themselves — single roles plus one grouped card per multi-role org */
  get timeline(): TimelineEntry[] {
    return this.career.timeline;
  }

  get totalYears(): number {
    return this.career.totalYears;
  }

  private readonly months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  /** "Jun 2026" */
  monthLabel(d: Date): string {
    return `${this.months[d.getMonth()]} ${d.getFullYear()}`;
  }

  /**
   * "Aug 2026 – Sep 2026", "Aug 2026 – present", or just "Aug 2026" for a role
   * that started and ended inside the same month.
   */
  rangeLabel(span: { start: Date; end?: Date }): string {
    if (!span.end) return `${this.monthLabel(span.start)} – present`;
    const from = this.monthLabel(span.start);
    const to = this.monthLabel(span.end);
    return from === to ? from : `${from} – ${to}`;
  }

  /**
   * live-counted tenure, e.g. "3 mos" or "2 yr 11 mos" (inclusive of both months).
   * Takes a role or a whole grouped entry — both carry the same start/end shape.
   */
  duration(span: { start: Date; end?: Date }): string {
    const end = span.end ?? new Date();
    let months =
      (end.getFullYear() - span.start.getFullYear()) * 12 +
      (end.getMonth() - span.start.getMonth()) +
      1; // count the current month too
    if (months < 1) months = 1;

    const years = Math.floor(months / 12);
    const rem = months % 12;
    const parts: string[] = [];
    if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (rem) parts.push(`${rem} mo${rem > 1 ? 's' : ''}`);
    return parts.join(' ');
  }

  // --- grouped cards: one role can be opened at a time, per card ---
  // key is "<org>|<role title>"; nothing is open until a visitor asks for it, so a
  // six-contract Upwork card stays the same height as the single-role cards next to it.
  private openRole: string | null = null;

  /** a role with neither a write-up nor skills has nothing to reveal, so it doesn't open */
  hasDetail(job: Job): boolean {
    return !!job.about || !!job.skills?.length;
  }

  private roleKey(entry: TimelineEntry, job: Job): string {
    return `${entry.org}|${job.title}`;
  }

  isOpen(entry: TimelineEntry, job: Job): boolean {
    return this.hasDetail(job) && this.openRole === this.roleKey(entry, job);
  }

  toggleRole(entry: TimelineEntry, job: Job): void {
    if (this.dragMoved || !this.hasDetail(job)) return; // a drag must not open a role
    const key = this.roleKey(entry, job);
    this.openRole = this.openRole === key ? null : key;
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
  /** true once the pointer travelled far enough to count as a drag, not a click */
  private dragMoved = false;

  dragStart(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return; // on touch the browser scrolls natively
    cancelAnimationFrame(this.momentumId);
    this.isDown = true;
    this.dragMoved = false;
    this.startX = event.clientX;
    this.lastX = event.clientX;
    this.velocity = 0;
    this.scrollStart = this.slider.nativeElement.scrollLeft;
  }

  dragMove(event: PointerEvent) {
    if (!this.isDown) return;
    const dx = event.clientX - this.startX;
    if (Math.abs(dx) > 4) this.dragMoved = true;
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
