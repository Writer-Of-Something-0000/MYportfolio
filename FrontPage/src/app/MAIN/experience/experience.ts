import { AfterViewInit, Component, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-experience',
  standalone: false,
  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class Experience implements AfterViewInit {
  // mobile-only card deck: tapping the top card brings the next one forward
  private cards: HTMLElement[] = [];
  private container: HTMLElement | null = null;
  private active = 0;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    this.container = this.el.nativeElement.querySelector('#experience-container');
    this.cards = Array.from(this.el.nativeElement.querySelectorAll('#experience'));
    this.cards.forEach((card) => card.addEventListener('click', () => this.next()));
    this.layout();
    // card heights change while the typewriter runs — keep the deck height in sync
    const ro = new ResizeObserver(() => this.layout());
    this.cards.forEach((card) => ro.observe(card));
  }

  @HostListener('window:resize')
  layout() {
    if (!this.container || !this.cards.length) return;
    const n = this.cards.length;
    if (!window.matchMedia('(max-width: 850px)').matches) {
      this.container.style.height = '';
      return;
    }
    let tallest = 0;
    this.cards.forEach((card, i) => {
      card.style.setProperty('--pos', String((i - this.active + n) % n));
      tallest = Math.max(tallest, card.offsetHeight);
    });
    this.container.style.height = tallest + (n - 1) * 14 + 'px';
  }

  private next() {
    if (!window.matchMedia('(max-width: 850px)').matches) return;
    this.active = (this.active + 1) % this.cards.length;
    this.layout();
  }
}
