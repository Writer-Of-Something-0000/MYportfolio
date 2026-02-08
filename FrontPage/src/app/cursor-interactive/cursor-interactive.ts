import { Component, HostListener, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-cursor-interactive',
  standalone: false,
  templateUrl: './cursor-interactive.html',
  styleUrls: ['./cursor-interactive.css'],
})
export class CursorInteractive implements AfterViewInit {
  // რეალური მაუსის პოზიცია
  targetX = window.innerWidth / 2;
  targetY = window.innerHeight / 2;

  // ის პოზიცია, რაც რეალურად იხატება (აგვიანებს)
  currentX = this.targetX;
  currentY = this.targetY;

  // რამდენად ნელა მიყვეს (0.05 - ნელი, 0.2 - სწრაფი)
  ease = 0.08;

  ngAfterViewInit() {
    this.animate();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.targetX = event.clientX;
    this.targetY = event.clientY;
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    // Smooth interpolation (lerp)
    this.currentX += (this.targetX - this.currentX) * this.ease;
    this.currentY += (this.targetY - this.currentY) * this.ease;
  };
}