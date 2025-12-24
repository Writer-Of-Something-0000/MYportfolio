import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
fullText = "Portfolio";
  displayedText = "";
  index = 0;
  isDeleting = false;
  
  // პარამეტრები
  typingSpeed = 150;    // წერის სიჩქარე
  deletingSpeed = 70;   // წაშლის სიჩქარე
  pauseDuration = 2000; // პაუზა სიტყვის დასრულებისას (2 წამი)

  private timerId: any;

  ngOnInit(): void {
    this.handleTypewriter();
  }

  // აუცილებელია მეხსიერების გასასუფთავებლად
  ngOnDestroy(): void {
    if (this.timerId) clearTimeout(this.timerId);
  }

  handleTypewriter() {
    if (!this.isDeleting) {
      // ვწერთ სიმბოლოებს
      this.displayedText = this.fullText.substring(0, this.index + 1);
      this.index++;
    } else {
      // ვშლით სიმბოლოებს
      this.displayedText = this.fullText.substring(0, this.index - 1);
      this.index--;
    }

    // განვსაზღვროთ შემდეგი ნაბიჯის სიჩქარე
    let currentSpeed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

    // თუ სიტყვა ბოლომდე დაიწერა
    if (!this.isDeleting && this.index === this.fullText.length) {
      currentSpeed = this.pauseDuration; // შევჩერდეთ პორტფოლიოს წაკითხვამდე
      this.isDeleting = true;
    } 
    // თუ სიტყვა ბოლომდე წაიშალა
    else if (this.isDeleting && this.index === 0) {
      this.isDeleting = false;
      currentSpeed = 500; // მცირე პაუზა ახალი ციკლის დაწყებამდე
    }

    this.timerId = setTimeout(() => this.handleTypewriter(), currentSpeed);
  }
}