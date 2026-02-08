import { LanguageService } from './../services/languages';
import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  standalone: false,
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation  {
 isHover2 = false;
 isFire = false;
 isFire2 = false;
 isFire3 = false;
  // Texts
  fullText = "Dark Mode";
    fullText2 = "Luka Gengashvili";
  displayedText2 = "";
  index = 0;
  typingForward = true; // true = typing, false = deleting
  speed = 100; // typing speed in ms

  // Displayed texts
  displayedText = "";


  // Intervals
  typingInterval1: any;


  // --- First typewriter ---
  startTyping() {
    this.isHover2 = true;
    if (this.typingInterval1) return;

    let index = 0;
    this.typingInterval1 = setInterval(() => {
      if (index < this.fullText.length) {
        this.displayedText += this.fullText[index];
        index++;
      } else {
        clearInterval(this.typingInterval1);
        this.typingInterval1 = null;
      }
    }, 75);
  }

  resetTyping() {
    clearInterval(this.typingInterval1);
    this.typingInterval1 = null;
    this.displayedText = "";
  }

  // --- Combined hover events ---
  onHoverEnter() {
    this.isHover2 = true;
    this.startTyping();

  }

  onHoverLeave() {
    this.isHover2 = false;
    this.resetTyping();

  }






  ngOnInit(): void {
    this.loopTypewriter();
  }

  loopTypewriter() {
    setInterval(() => {
      if (this.typingForward) {
        // Type forward
        if (this.index < this.fullText2.length) {
          this.displayedText2 += this.fullText2[this.index];
          this.index++;
        } else {
          this.typingForward = false; // start deleting
        }
      } else {
        // Delete backward
        if (this.index > 0) {
          this.displayedText2 = this.displayedText2.slice(0, -1);
          this.index--;
        } else {
          this.typingForward = true; // start typing again
        }
      }
    }, this.speed);
  }









  languages = ['EN', 'KA'];
  currentIndex = 0;

  get currentLang() {
    return this.languages[this.currentIndex];
  }

  nextLang() {
    this.currentIndex =
      (this.currentIndex + 1) % this.languages.length;
  }


    
 

}
