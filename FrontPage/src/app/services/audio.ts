import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private pick = new Audio('/Audio/Pick.wav'); // public folder path
  private click = new Audio('/Audio/click.wav'); // public folder path
  constructor() {
    this.pick.volume = 0.3;
    this.click.volume = 0.3;


  }

  player() {
      this.pick.pause();    
    this.pick.play().catch(err => console.log('Audio play blocked:', err));
  }


  clicker() {
      this.click.pause();    
    this.click.play().catch(err => console.log('Audio play blocked:', err));
  }


}