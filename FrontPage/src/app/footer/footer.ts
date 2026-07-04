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

  // contact form → Netlify function → instant Telegram notification + email backup
  buttonText = 'Start the Conversation';
  sending = false;

  async send(
    event: Event,
    who: HTMLInputElement,
    channel: HTMLInputElement,
    msg: HTMLTextAreaElement
  ) {
    event.preventDefault();
    if (this.sending) return;

    const name = who.value.trim();
    const email = channel.value.trim();
    const message = msg.value.trim();

    if (!name || !email || !message) {
      this.flashButton('Please fill in all fields');
      return;
    }

    this.sending = true;
    this.buttonText = 'Sending…';

    try {
      const res = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('send failed');

      who.value = channel.value = msg.value = '';
      this.flashButton('Sent ✓');
    } catch {
      this.flashButton('Failed — try again');
    } finally {
      this.sending = false;
    }
  }

  private flashButton(text: string) {
    this.buttonText = text;
    setTimeout(() => (this.buttonText = 'Start the Conversation'), 3000);
  }
}
