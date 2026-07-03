import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService, ChatTurn } from '../services/chat';

@Component({
  selector: 'app-gemini-chat',
  standalone: false,
  templateUrl: './gemini-chat.html',
  styleUrl: './gemini-chat.css',
})
export class GeminiChat {
  open = false;
  sending = false;
  messages: ChatTurn[] = [];

  @ViewChild('scroll') private scrollRef?: ElementRef<HTMLDivElement>;

  constructor(private chat: ChatService) {}

  toggle() {
    this.open = !this.open;
    if (this.open) this.scrollDown();
  }

  async send(input: HTMLInputElement) {
    const text = input.value.trim();
    if (!text || this.sending) return;

    this.messages.push({ role: 'user', text });
    input.value = '';
    this.sending = true;
    this.scrollDown();

    try {
      const reply = await this.chat.send(this.messages);
      this.messages.push({ role: 'model', text: reply });
    } catch {
      this.messages.push({ role: 'model', text: 'Something went wrong. Please try again.' });
    } finally {
      this.sending = false;
      this.scrollDown();
    }
  }

  private scrollDown() {
    // wait for the DOM to paint the new message before scrolling
    setTimeout(() => {
      const el = this.scrollRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
