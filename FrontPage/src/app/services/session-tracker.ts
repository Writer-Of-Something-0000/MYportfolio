import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

// Human-readable labels for the two routes and the main home sections.
const PAGE_NAMES: Record<string, string> = {
  '/': 'მთავარი',
  '/projects': 'პროექტები',
};

const SECTION_NAMES: Record<string, string> = {
  title: 'მთავარი (Hero)',
  jobs: 'რჩეული ნამუშევრები',
  'experience-container': 'გამოცდილება',
  'education-container': 'განათლება',
  'skills-deck': 'უნარები',
  'hobies-ul': 'ჰობი',
  'languages-ul': 'ენები',
};

// Accumulates what a visitor did during their session and sends a single summary
// (videos watched, pages/sections seen, time on site) when they leave the site.
@Injectable({ providedIn: 'root' })
export class SessionTracker {
  private readonly start = Date.now();
  private readonly videos = new Map<string, string>(); // youtubeId → title
  private readonly pages = new Set<string>();
  private readonly sections = new Set<string>();
  private sent = false;

  constructor(router: Router) {
    this.addPage(location.pathname);

    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) this.addPage(e.urlAfterRedirects || e.url);
    });

    // Send the summary when the tab is closed / backgrounded / navigated away.
    const flush = () => this.flush();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
    window.addEventListener('pagehide', flush);
  }

  // Called from the video components when a visitor plays a video.
  trackVideo(id: string, title: string) {
    if (id) this.videos.set(id, title || id);
  }

  // Called when a home section scrolls into view (from the App reveal observer).
  trackSection(id: string) {
    const name = SECTION_NAMES[id];
    if (name) this.sections.add(name);
  }

  private addPage(path: string) {
    const clean = (path || '/').split('?')[0].split('#')[0] || '/';
    this.pages.add(PAGE_NAMES[clean] || clean);
  }

  private flush() {
    if (this.sent) return;
    const durationSec = Math.round((Date.now() - this.start) / 1000);
    this.sent = true;

    const payload = {
      durationSec,
      pages: [...this.pages],
      videos: [...this.videos.entries()].map(([id, title]) => ({ id, title })),
      sections: [...this.sections],
      referrer: document.referrer,
    };

    try {
      // sendBeacon survives page unload where fetch would be cancelled.
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/.netlify/functions/session', blob);
    } catch {
      // ignore — analytics must never break the page
    }
  }
}
