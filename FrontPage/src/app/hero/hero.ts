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
