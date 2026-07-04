import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));

// Fire-and-forget visitor ping → notifies the visitor-tracker Telegram bot.
// Runs once per browser session; the server also de-dupes by IP.
try {
  if (sessionStorage.getItem('visitPinged') !== '1') {
    sessionStorage.setItem('visitPinged', '1');
    fetch('/.netlify/functions/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ path: location.pathname, referrer: document.referrer }),
    }).catch(() => {});
  }
} catch {}
