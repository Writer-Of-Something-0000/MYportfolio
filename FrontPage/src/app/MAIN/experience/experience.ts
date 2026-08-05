import { Component, ElementRef, ViewChild } from '@angular/core';
import { CareerService, Job } from '../../services/career';

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

  get jobs(): Job[] {
    return this.career.jobs;
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
