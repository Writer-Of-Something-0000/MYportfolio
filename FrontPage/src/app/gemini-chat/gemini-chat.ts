import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../services/chat';

// A clickable contact/social card shown inside a chat reply.
interface SocialCard {
  label: string;
  href: string;
  icon: string; // Font Awesome classes
}

// A preset question chip. `contact: true` triggers the built-in contact reply
// (with social cards) instead of asking the AI.
interface Suggestion {
  label: string;
  text?: string;
  contact?: boolean;
}

// One rendered message. Extends the API turn with optional social cards.
interface ChatMsg {
  role: 'user' | 'model';
  text: string;
  cards?: SocialCard[];
}

@Component({
  selector: 'app-gemini-chat',
  standalone: false,
  templateUrl: './gemini-chat.html',
  styleUrl: './gemini-chat.css',
})
export class GeminiChat {
  open = false;
  sending = false;
  contactPending = false; // 10s silent wait after tapping "How can I reach you?"
  messages: ChatMsg[] = [];

  // Preset quick-question chips shown in the chat.
  readonly suggestions: Suggestion[] = [
    { label: 'Tell me about your latest experience', text: 'Tell me about your latest experience' },
    { label: 'What tools & software do you use?', text: 'What software and tools do you use?' },
    { label: 'How can I reach you?', contact: true },
  ];

  // The social cards shown when someone taps "How can I reach you?".
  private readonly contactCards: SocialCard[] = [
    { label: 'Upwork', href: 'https://www.upwork.com/freelancers/~01302173bf6de06e93', icon: 'fa-brands fa-upwork' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/luka-gengashvili-652a18345/', icon: 'fa-brands fa-linkedin-in' },
    { label: 'Telegram', href: 'https://t.me/+995558722027', icon: 'fa-brands fa-telegram' },
    { label: 'WhatsApp', href: 'https://wa.me/995558722027', icon: 'fa-brands fa-whatsapp' },
  ];

  @ViewChild('scroll') private scrollRef?: ElementRef<HTMLDivElement>;

  constructor(private chat: ChatService) {}

  toggle() {
    this.open = !this.open;
    if (this.open) this.scrollDown();
  }

  // Tap on a preset chip.
  pick(s: Suggestion) {
    if (this.sending || this.contactPending) return;

    if (s.contact) {
      this.revealContact();
      return;
    }

    if (s.text) this.ask(s.text);
  }

  // Built-in contact reply — no AI call. Scrolls the page to the footer, then
  // stays completely silent (no typing dots) for 10s before "writing" the
  // reply with the clickable social cards.
  private async revealContact() {
    this.messages.push({ role: 'user', text: 'How can I reach you?' });
    this.contactPending = true; // silent wait: no typing dots, chips/input locked
    this.scrollDown();

    // scroll the whole page down to the contact footer
    this.scrollPageToFooter();

    // 10 seconds of complete silence, then start "writing"
    await this.sleep(10000);

    this.sending = true; // now the typing dots appear
    this.scrollDown();
    await this.sleep(1200);

    this.messages.push({
      role: 'model',
      text: 'You can also find me here:',
      cards: this.contactCards,
    });
    this.sending = false;
    this.contactPending = false;
    this.scrollDown();
  }

  private sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  // Scroll the main page down to the contact footer ("Catch UP"). Smooth on
  // normal browsers; reduced-motion setups get an instant jump — either way
  // the page actually reaches the footer.
  private scrollPageToFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const targetY = window.scrollY + footer.getBoundingClientRect().top;
    const reduce =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: targetY, behavior: reduce ? 'auto' : 'smooth' });
  }

  // Send whatever is typed in the composer.
  async send(input: HTMLInputElement) {
    const text = input.value.trim();
    if (!text || this.sending) return;
    input.value = '';
    await this.ask(text);
  }

  // Push a user message and stream the AI reply.
  private async ask(text: string) {
    if (this.sending) return;

    this.messages.push({ role: 'user', text });
    this.sending = true;
    this.scrollDown();

    try {
      const reply = await this.chat.send(this.messages.map((m) => ({ role: m.role, text: m.text })));
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
