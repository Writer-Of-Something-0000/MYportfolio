import { AudioService } from './../services/audio';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  constructor(private audio: AudioService) {}

  hover() {
    this.audio.player();
  }

  click() {
 this.audio.clicker();
  }

}
