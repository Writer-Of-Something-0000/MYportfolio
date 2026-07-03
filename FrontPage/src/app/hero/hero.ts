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

  ngOnInit(): void {
    this.handleTypewriter();
    this.loadFeedbacks();
        setInterval(() => {
      // start fade out
      this.fade = false;

      setTimeout(() => {
        // change content after fade out
        this.currentIndex = (this.currentIndex + 1) % this.feedbacks.length;
        // fade in
        this.fade = true;
      }, 500); // must match CSS transition time
    }, 5000); 
  }


  ngOnDestroy(): void {
    if (this.timerId) clearTimeout(this.timerId);
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








  // Default feedbacks — used until the API responds, and as a fallback if it fails.
  feedbacks: Feedback[] = [
    {
      name: 'Tengo Tadumbadze',
      role: 'Co-Founder of @Talesbox',
      stars: 5,
      text: `A true discovery of 2025 for me — an energetic,
hardworking, and highly motivated professional who consistently
delivers high-quality results, often exceeding expectations.`
    },
    {
      name: 'Anna Smith',
      role: 'Product Manager at @StartupX',
      stars: 4,
      text: 'Amazing to work with. Always delivers on time and with great quality.'
    },
    {
      name: 'Giorgi K.',
      role: 'CTO at @TechLab',
      stars: 5,
      text: 'Very professional and reliable. Highly recommended.'
    }
  ];

  currentIndex = 0;
  fade = true;

  private async loadFeedbacks(): Promise<void> {
    try {
      const loaded = await this.feedbackService.load();
      if (loaded.length) {
        this.feedbacks = loaded;
        this.currentIndex = 0;
      }
    } catch (err) {
      // Keep the built-in defaults if the API is unavailable.
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
