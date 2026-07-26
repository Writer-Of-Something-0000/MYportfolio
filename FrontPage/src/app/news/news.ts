import { Component, OnInit } from '@angular/core';

// A one-time "What's New" popup shown on the visitor's first arrival.
// Bump STORAGE_KEY whenever there's a new announcement to show it again.
const STORAGE_KEY = 'news-seen-v1';

@Component({
  selector: 'app-news',
  standalone: false,
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class News implements OnInit {
  open = false;

  ngOnInit(): void {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // let the page settle in first, then greet them
        setTimeout(() => (this.open = true), 900);
      }
    } catch {
      setTimeout(() => (this.open = true), 900);
    }
  }

  close(): void {
    this.open = false;
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* storage unavailable — the popup simply shows again next visit */
    }
  }
}
