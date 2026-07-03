import { AfterViewInit, Component, NgZone, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  protected readonly title = signal('FrontPage');

  // Mobile-only "best on desktop" notice. Hidden once dismissed for the session.
  protected showMobileNotice =
    typeof sessionStorage === 'undefined' ||
    sessionStorage.getItem('mobileNoticeDismissed') !== '1';

  dismissMobileNotice() {
    this.showMobileNotice = false;
    try {
      sessionStorage.setItem('mobileNoticeDismissed', '1');
    } catch {}
  }

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

  // these get their text typed out character by character when they appear
  private readonly typeSelector = [
    '#title',
    '.txttxt',
    '#editing-txt',
    '#codeing-txt',
    '#skills-deck ul',
    '#hobies-ul',
    '#languages-ul',
    '.headline',
    '.tags',
    '#experience',
  ].join(',');

  constructor(private zone: NgZone) {}

  ngAfterViewInit() {
    // timers/observers run outside Angular so typing doesn't trigger change detection
    this.zone.runOutsideAngular(() => this.setupMotion());
  }

  private setupMotion() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const typeIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            typeIO.unobserve(entry.target);
            this.typeElement(entry.target as HTMLElement);
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
      if (reducedMotion) return;
      document.querySelectorAll<HTMLElement>(this.typeSelector).forEach((el) => {
        if (!el.dataset['typed']) {
          el.dataset['typed'] = 'pending';
          typeIO.observe(el);
        }
      });
    };

    attach();
    // catches elements added later (route changes, videos loaded from YouTube)
    new MutationObserver(attach).observe(document.body, { childList: true, subtree: true });
  }

  // types every text node inside the element one after another, keeping the markup
  private typeElement(root: HTMLElement) {
    root.dataset['typed'] = 'done';

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: { node: Text; text: string }[] = [];
    let current: Node | null;
    while ((current = walker.nextNode())) {
      const text = current.textContent ?? '';
      if (text.trim()) nodes.push({ node: current as Text, text });
    }
    if (!nodes.length) return;

    nodes.forEach((entry) => (entry.node.textContent = ''));

    const speed = 8; // ms per character
    let nodeIndex = 0;
    let charIndex = 0;

    const tick = () => {
      const entry = nodes[nodeIndex];
      if (!entry) return;
      charIndex++;
      entry.node.textContent = entry.text.slice(0, charIndex);
      if (charIndex >= entry.text.length) {
        nodeIndex++;
        charIndex = 0;
      }
      if (nodeIndex < nodes.length) setTimeout(tick, speed);
    };
    tick();
  }
}
