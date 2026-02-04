import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: false,
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
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


  scrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // toggle animation based on scroll position
    this.scrolled = window.scrollY > 1;
  }



}
