import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-experience',
  standalone: false,
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience {
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
