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

  // Identity tracking for both loops. CareerService hands back the same objects
  // every pass, so this is belt-and-braces — but without it any future change
  // that rebuilds the list would silently recreate the DOM mid-click again.
  trackEntry(_: number, entry: TimelineEntry): string {
    return entry.org;
  }

  trackRole(_: number, job: Job): string {
    return `${job.org}|${job.title}|${job.start.getTime()}`;
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

  // --- grouped cards: one role on screen at a time ---
  // A grouped card shows a single role laid out exactly like a single-role card and
  // switches between them with dots, so six Upwork contracts occupy the same space
  // as every other card in the row instead of stretching it to twice the height.
  private activeByOrg = new Map<string, number>();

  activeIndex(entry: TimelineEntry): number {
    return this.activeByOrg.get(entry.org) ?? 0;
  }

  /** the role a card is currently showing */
  activeRole(entry: TimelineEntry): Job {
    return entry.roles[this.activeIndex(entry)] ?? entry.roles[0];
  }

  showRole(entry: TimelineEntry, index: number): void {
    // No drag guard here: the dots stop pointerdown from reaching the slider, so
    // they never take part in a drag and every click on one is deliberate. The
    // guard used to live here and ate the click whenever a hand drifted the few
    // pixels between press and release — which is most clicks.
    this.activeByOrg.set(entry.org, index);
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
