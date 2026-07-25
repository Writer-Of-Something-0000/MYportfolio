import { Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat';
import { FeedbackService, Feedback } from '../services/feedback';

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
  route?: string; // navigate to this route (and close the chat) instead of asking
}

// One rendered message. Extends the API turn with optional social cards.
interface ChatMsg {
  role: 'user' | 'model';
  text: string;
  cards?: SocialCard[];
  feedbacks?: Feedback[]; // testimonial cards (shown on mobile via the Feedbacks teaser)
}

@Component({
  selector: 'app-gemini-chat',
  standalone: false,
  templateUrl: './gemini-chat.html',
  styleUrl: './gemini-chat.css',
})
export class GeminiChat implements OnInit, OnDestroy {
  open = false;
  sending = false;
  contactPending = false; // 10s silent wait after tapping "How can I reach you?"
  teasersVisible = false; // attention CTAs popped out of the FAB
  showCatchUp = false; // persistent "Catch UP" CTA glued to the FAB
  atFooter = false; // true when the contact footer is the active section
  isMobile = false; // the feedback section is hidden on mobile, so we surface it here
  messages: ChatMsg[] = [];

  // Preset quick-question chips shown inside the chat.
  readonly suggestions: Suggestion[] = [
    { label: 'Show me your work', route: '/projects' },
    { label: 'Tell me about your latest experience', text: 'Tell me about your latest experience' },
    { label: 'What tools & software do you use?', text: 'What software and tools do you use?' },
    { label: 'How can I reach you?', contact: true },
  ];

  // Attention CTAs that pop out of the FAB once the hero scrolls away. The set
  // adapts to the section in view so the questions match what the visitor is
  // currently looking at.
  readonly teasersDefault: Suggestion[] = [
    { label: '👀 Wanna see my work?', route: '/projects' },
    { label: '🎬 What do I actually do?', text: 'What kind of video work do you do?' },
    { label: '🔥 Why work with me?', text: 'Why should someone hire you?' },
  ];
  readonly teasersExperience: Suggestion[] = [
    { label: '🚀 What’s your latest role?', text: 'What is your latest role and what do you do there?' },
    { label: '🌍 Who’ve you worked with?', text: 'Which companies and clients have you worked with?' },
    { label: '⏳ How experienced are you?', text: 'How many years of experience do you have?' },
  ];
  readonly teasersEducation: Suggestion[] = [
    { label: '🎓 What did you study?', text: 'What did you study and where?' },
    { label: '📜 Got certifications?', text: 'What certifications and courses have you completed?' },
  ];
  readonly teasersContact: Suggestion[] = [
    { label: '🤝 Why me?', text: 'Why should someone choose to work with you?' },
  ];

  // Which set is showing right now — updated on scroll from the active section.
  activeTeasers: Suggestion[] = this.teasersDefault;

  // Sections mapped to their teaser set, in document order.
  private readonly sectionMap: { sel: string; set: Suggestion[] }[] = [
    { sel: 'app-experience', set: this.teasersExperience },
    { sel: 'app-education', set: this.teasersEducation },
    { sel: 'footer', set: this.teasersContact },
  ];

  // The social cards shown when someone taps "How can I reach you?".
  private readonly contactCards: SocialCard[] = [
    { label: 'Upwork', href: 'https://www.upwork.com/freelancers/~01302173bf6de06e93', icon: 'fa-brands fa-upwork' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/luka-gengashvili-652a18345/', icon: 'fa-brands fa-linkedin-in' },
    { label: 'Telegram', href: 'https://t.me/+995558722027', icon: 'fa-brands fa-telegram' },
    { label: 'WhatsApp', href: 'https://wa.me/995558722027', icon: 'fa-brands fa-whatsapp' },
  ];

  @ViewChild('scroll') private scrollRef?: ElementRef<HTMLDivElement>;

  constructor(
    private chat: ChatService,
    private router: Router,
    private zone: NgZone,
    private feedback: FeedbackService
  ) {}

  ngOnInit() {
    this.isMobile = this.matchMobile();
    // Listen outside Angular so scrolling stays smooth; only re-enter the zone
    // when the teasers actually need to show or hide.
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
    });
  }

  @HostListener('window:resize')
  onResize() {
    const mobile = this.matchMobile();
    if (mobile !== this.isMobile) this.isMobile = mobile;
  }

  // The Feedbacks button surfaces the feedback section wherever the site hides
  // it — the same breakpoints as #feadback: narrow (≤850px) OR short (≤799px)
  // screens, which covers phones and tablets in both orientations.
  private matchMobile(): boolean {
    return (
      typeof matchMedia === 'function' &&
      matchMedia('(max-width: 850px), (max-height: 799px)').matches
    );
  }

  // teasers actually rendered: on mobile we trim them to leave room for the
  // Feedbacks button (+ Catch UP off the footer) so the stack never exceeds 4.
  get shownTeasers(): Suggestion[] {
    if (!this.isMobile) return this.activeTeasers;
    return this.activeTeasers.slice(0, this.atFooter ? 3 : 2);
  }

  // the Feedbacks button only appears on mobile, where the feedback section is hidden.
  get showFeedbacksBtn(): boolean {
    return this.isMobile && this.showCatchUp;
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }

  private onScroll = () => {
    const past = window.scrollY > window.innerHeight * 0.6;
    const onHome = this.router.url === '/';
    // Teasers, Feedbacks and Catch UP all ride the FAB whenever we're scrolled
    // down on the home page and the chat is closed — so they come back every
    // time the chat is opened and closed again.
    const show = past && !this.open && onHome;
    const set = show ? this.pickSectionTeasers() : this.activeTeasers;
    const atFooter = set === this.teasersContact;
    if (
      show !== this.showCatchUp ||
      show !== this.teasersVisible ||
      set !== this.activeTeasers ||
      atFooter !== this.atFooter
    ) {
      this.zone.run(() => {
        this.showCatchUp = show;
        this.teasersVisible = show;
        this.activeTeasers = set;
        this.atFooter = atFooter;
      });
    }
  };

  // "Catch UP" — smooth-scroll the page to the contact footer.
  catchUp() {
    this.scrollPageToFooter();
  }

  // Scrollspy: the active set is the last section (in document order) whose top
  // has scrolled above the trigger line. Holding the previous section through
  // the gaps between sections stops the default set from leaking back in.
  private pickSectionTeasers(): Suggestion[] {
    const line = window.innerHeight * 0.6;
    let set = this.teasersDefault;
    for (const s of this.sectionMap) {
      const el = document.querySelector(s.sel);
      if (el && el.getBoundingClientRect().top <= line) set = s.set;
    }
    return set;
  }

  toggle() {
    this.open = !this.open;
    if (this.open) this.scrollDown();
    this.onScroll(); // re-evaluate the teasers for the new open/closed state
  }

  // Tap an attention teaser: open the chat (for ask/contact) or navigate (route).
  tapTeaser(t: Suggestion) {
    if (!t.route) this.open = true; // ask/contact need the chat open
    this.pick(t);
  }

  // Tap on a preset chip.
  pick(s: Suggestion) {
    if (this.sending || this.contactPending) return;

    if (s.route) {
      // close the chat and take the visitor to that page (e.g. Projects)
      this.open = false;
      this.showCatchUp = false;
      this.teasersVisible = false;
      this.router.navigateByUrl(s.route);
      window.scrollTo(0, 0);
      return;
    }

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

  // A typed contact question ("what's his number?", "how do I reach you?") shows the
  // social cards instead of a plain-text answer.
  private async showContactCards(userText: string) {
    this.messages.push({ role: 'user', text: userText });
    this.sending = true;
    this.scrollDown();
    await this.sleep(800);
    this.messages.push({
      role: 'model',
      text: 'Here’s where you can reach me — just tap whichever works best for you:',
      cards: this.contactCards,
    });
    this.sending = false;
    this.scrollDown();
  }

  // Does the message ask how to reach / contact Luka (in English or Georgian)?
  private isContactQuery(text: string): boolean {
    const t = text.toLowerCase();
    const en =
      /\b(contact|reach (you|him|out)|get in touch|hire (you|him|luka)|(your|his) (number|phone|email|contact|details)|how (can|do|to) .*(reach|contact|hire)|phone number|e-?mail|whats\s?app|telegram|linkedin|upwork|get a ?hold)\b/;
    const ka =
      /(ნომერ|დაგიკავშირ|დაუკავშირ|დავუკავშირ|დაკავშირ|კონტაქტ|ტელეფონ|მეილ|ელ\.?\s?ფოსტ|როგორ.*(ვნახ|გნახ|დაგიკავშირ|მოგნახ|დავუკავშირ))/;
    return en.test(t) || ka.test(text);
  }

  // Show the testimonials as cards in the chat. The on-page feedback section is
  // hidden on mobile, so the Feedbacks teaser surfaces them here.
  async showFeedbacks() {
    this.open = true;
    this.messages.push({ role: 'user', text: 'Show me the feedback' });
    this.sending = true;
    this.scrollDown();
    try {
      const list = await this.feedback.load();
      this.messages.push(
        list.length
          ? { role: 'model', text: 'Here’s what people say about working with Luka:', feedbacks: list }
          : { role: 'model', text: 'No feedback to show just yet — check back soon! 🎬' }
      );
    } catch {
      this.messages.push({ role: 'model', text: 'Couldn’t load the feedback right now. Please try again.' });
    } finally {
      this.sending = false;
      this.scrollDown();
    }
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
    if (this.sending || this.contactPending) return;

    // contact questions get the clickable social cards, never a plain-text reply
    if (this.isContactQuery(text)) {
      await this.showContactCards(text);
      return;
    }

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
