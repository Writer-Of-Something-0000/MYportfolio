import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));

// Owner opt-out: opening the site once with "?owner=1" flags THIS device so it
// is never tracked again (works per-device, independent of network/IP).
try {
  if (new URLSearchParams(location.search).get('owner') === '1') {
    localStorage.setItem('ownerVisit', '1');
  }
} catch {}

function isOwnerDevice(): boolean {
  try {
    return localStorage.getItem('ownerVisit') === '1';
  } catch {
    return false;
  }
}
(window as any).__isOwnerDevice = isOwnerDevice;

// Fire-and-forget visitor ping → notifies the visitor-tracker Telegram bot.
// Skipped on the owner's own devices; runs once per browser session otherwise.
try {
  if (!isOwnerDevice() && sessionStorage.getItem('visitPinged') !== '1') {
    sessionStorage.setItem('visitPinged', '1');
    fetch('/.netlify/functions/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ path: location.pathname, referrer: document.referrer }),
    }).catch(() => {});
  }
} catch {}
