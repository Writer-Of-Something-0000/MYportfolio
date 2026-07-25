import { Component, HostListener  } from '@angular/core';
import { FeedbackService, Feedback } from '../services/feedback';

@Component({
  selector: 'app-hero',
  standalone: false,
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  constructor(private feedbackService: FeedbackService) {}

  // Background video source picked by codec support + connection quality.
  //   AV1-capable browsers (Chrome etc.) → .webm tiers (1.4MB / 604KB / 461KB)
  //   Safari (no AV1)                    → H.264 .mp4 tiers (6.1MB / 1MB / 683KB)
  //   very slow / data-saver → low tier, 3g → mid tier, otherwise full.
  readonly videoSrc = Hero.pickVideoSrc();
  // precise codec string so Safari skips the AV1 source at selection time
  // instead of choosing it and failing on decode
  readonly videoType = this.videoSrc.endsWith('.webm')
    ? 'video/webm; codecs="av01.0.08M.08"'
    : 'video/mp4';

  private static pickVideoSrc(): string {
    // index.html already picked a file and started preloading it — reuse the
    // exact same URL so the <video> hits the warm cache instead of a new fetch.
    const preloaded = (window as any).__bgVideoSrc;
    if (typeof preloaded === 'string' && /\.(webm|mp4)$/.test(preloaded)) return preloaded;

    // fallback when the index.html script didn't run (must mirror its logic)
    const av1 = document.createElement('video').canPlayType('video/webm; codecs="av01.0.08M.08"');
    const files = av1
      ? { full: '/portfolio.webm', mid: '/smallsizeportfolio.webm', low: '/smallestportfolio.webm' }
      : { full: '/portfolio.mp4',  mid: '/smallsizeportfolio.mp4',  low: '/smallestportfolio.mp4' };

    const conn = (navigator as any).connection;
    if (conn) {
      // effectiveType is the stable signal (Chrome's own RTT+bandwidth composite);
      // the raw `downlink` number is a noisy estimate that dips on idle
      // connections, so it is deliberately NOT used here.
      const type: string = conn.effectiveType ?? '';

      // 2g (or data-saver users, who asked for minimal data) → tiniest file
      if (conn.saveData || /(^|-)2g$/.test(type)) return files.low;
      // 3g → middle size
      if (type === '3g') return files.mid;
    }
    return files.full;
  }

fullText = "Portfolio";
  displayedText = "";
  index = 0;
  isDeleting = false;
  

  typingSpeed = 150;   
  deletingSpeed = 70;   
  pauseDuration = 2000; 

  private timerId: any;

  private feedbackTimer: any;

  ngOnInit(): void {
    this.handleTypewriter();
    this.loadFeedbacks();
    this.scheduleFeedbackRotation();
  }

  // Rotates to the next feedback after a hold that scales with the current
  // feedback's length, so longer testimonials stay on screen longer.
  private scheduleFeedbackRotation(): void {
    clearTimeout(this.feedbackTimer);
    const hold = this.holdDuration(this.feedbacks[this.currentIndex]?.text);

    this.feedbackTimer = setTimeout(() => {
      // start fade out
      this.fade = false;

      setTimeout(() => {
        // change content after fade out (skip when there are no feedbacks)
        if (this.feedbacks.length) {
          this.currentIndex = (this.currentIndex + 1) % this.feedbacks.length;
        }
        this.expanded = false; // each new testimonial starts collapsed
        // fade in
        this.fade = true;
        this.scheduleFeedbackRotation();
      }, 500); // must match CSS transition time
    }, hold);
  }

  // Reading-time based hold, in ms: 1s base + 0.4s per word.
  // (5 words -> 3s, 10 words -> 5s.) Clamped so extremes stay reasonable.
  private holdDuration(text: string | undefined): number {
    const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length;
    const seconds = 1 + words * 0.4;
    return Math.min(10, Math.max(3, seconds)) * 1000;
  }


  ngOnDestroy(): void {
    if (this.timerId) clearTimeout(this.timerId);
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
  }

  handleTypewriter() {
    if (!this.isDeleting) {

      this.displayedText = this.fullText.substring(0, this.index + 1);
      this.index++;
    } else {

      this.displayedText = this.fullText.substring(0, this.index - 1);
      this.index--;
    }


    let currentSpeed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;


    if (!this.isDeleting && this.index === this.fullText.length) {
      currentSpeed = this.pauseDuration; 
      this.isDeleting = true;
    } 

    else if (this.isDeleting && this.index === 0) {
      this.isDeleting = false;
      currentSpeed = 500; 
    }

    this.timerId = setTimeout(() => this.handleTypewriter(), currentSpeed);
  }








  // Feedbacks come entirely from the API — nothing is hardcoded.
  feedbacks: Feedback[] = [];

  currentIndex = 0;
  fade = true;

  // long testimonials are clamped to ~5 lines with a "see full" toggle
  expanded = false;

  get isLong(): boolean {
    return (this.feedbacks[this.currentIndex]?.text?.length ?? 0) > 200;
  }

  // the text actually rendered: truncated (ending in …) when collapsed so the
  // "see full" link reads as an inline continuation of the sentence.
  get shownText(): string {
    const t = this.feedbacks[this.currentIndex]?.text ?? '';
    if (!this.isLong || this.expanded) return t + ' ';
    let cut = t.slice(0, 200);
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > 0) cut = cut.slice(0, lastSpace);
    return cut + '… ';
  }

  toggleFull(): void {
    this.expanded = !this.expanded;
    // pause the auto-rotation while someone is reading the full text
    if (this.expanded) {
      clearTimeout(this.feedbackTimer);
    } else {
      this.scheduleFeedbackRotation();
    }
  }

  private async loadFeedbacks(): Promise<void> {
    try {
      this.feedbacks = await this.feedbackService.load();
      this.currentIndex = 0;
      this.scheduleFeedbackRotation();
    } catch (err) {
      // No local reserve — if the API is unavailable, show nothing.
      this.feedbacks = [];
      console.error('Failed to load feedbacks:', err);
    }
  }




























  // "Catch UP" button smoothly scrolls to the contact form in the footer
  scrollToFooter() {
    document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrolled = false;
  diving = false; // the Catch UP button sinks away as the hero scrolls off

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // toggle animation based on scroll position
    this.scrolled = window.scrollY > 1;
    this.diving = window.scrollY > window.innerHeight * 0.35;
  }










}
