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

  // Background video source picked by connection quality (Network Information API).
  // Slow connection / data-saver → 767KB small version; otherwise the 1.4MB full one.
  // Browsers without the API (Safari/Firefox) simply get the full version.
  readonly videoSrc = Hero.pickVideoSrc();

  private static pickVideoSrc(): string {
    const conn = (navigator as any).connection;
    if (conn) {
      const slowType = /(^|-)2g$|^3g$/.test(conn.effectiveType ?? '');
      const slowLink = typeof conn.downlink === 'number' && conn.downlink > 0 && conn.downlink < 1.5;
      if (conn.saveData || slowType || slowLink) return '/smallsizeportfolio.webm';
    }
    return '/portfolio.webm';
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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // toggle animation based on scroll position
    this.scrolled = window.scrollY > 1;
  }










}
