import { AfterViewInit, Component, NgZone, signal } from '@angular/core';
import { SessionTracker } from './services/session-tracker';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  protected readonly title = signal('FrontPage');

  // scroll-reveal: fade-in + slide-up when elements enter the viewport.
  // Native IntersectionObserver — no library, zero network cost.
  private readonly revealSelector = [
    '#title',
    '#portfolio-paragraph',
    '#jobs',
    '.video',
    '#experience-container',
    '#education-container',
    '#skills-deck',
    '#editing-ul',
    '#codeing-ul',
    '#hobies-ul',
    '#languages-ul',
    'footer form',
  ].join(',');

  // SessionTracker is injected here so it initializes on app start (route + leave listeners).
  constructor(private zone: NgZone, private session: SessionTracker) {}

  ngAfterViewInit() {
    // observers run outside Angular so they don't trigger change detection
    this.zone.runOutsideAngular(() => this.setupMotion());
  }

  private setupMotion() {
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            this.session.trackSection(entry.target.id);
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const attach = () => {
      document.querySelectorAll(this.revealSelector).forEach((el) => {
        if (!el.classList.contains('reveal')) {
          el.classList.add('reveal');
          revealIO.observe(el);
        }
      });
    };

    attach();
    // catches elements added later (route changes, videos loaded from YouTube)
    new MutationObserver(attach).observe(document.body, { childList: true, subtree: true });
  }
}
