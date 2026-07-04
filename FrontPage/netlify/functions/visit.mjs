// Visitor tracker: pings a SECOND Telegram bot whenever someone opens the site.
// Reports IP → country, city, ISP/org, device/OS/browser, referrer, and a
// best-effort profile (incl. VPN/Proxy/hosting detection).
//
// A real person's *name* can't be derived from an IP; the closest signal is the
// ISP/organization (a company network shows the company name) plus location and device.
//
// Environment variables (Netlify dashboard):
//   VISITOR_BOT_TOKEN  — the new bot's token from @BotFather
//   VISITOR_CHAT_ID    — optional; defaults to TELEGRAM_CHAT_ID (same Telegram account)

import { getStore } from '@netlify/blobs';

// Don't re-notify for the same IP within this window (avoids spam on reloads).
const DEDUP_MINUTES = 30;

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Lightweight user-agent parsing (no dependency).
function parseUA(ua = '') {
  const device = /iPad|Tablet/i.test(ua)
    ? 'Tablet'
    : /Mobile|iPhone|Android/i.test(ua)
    ? 'Mobile'
    : 'Desktop';
  const os = /Windows/i.test(ua)
    ? 'Windows'
    : /iPhone|iPad|iOS/i.test(ua)
    ? 'iOS'
    : /Mac OS X|Macintosh/i.test(ua)
    ? 'macOS'
    : /Android/i.test(ua)
    ? 'Android'
    : /Linux/i.test(ua)
    ? 'Linux'
    : 'უცნობი';
  const browser = /Edg\//i.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/i.test(ua)
    ? 'Opera'
    : /Chrome\//i.test(ua)
    ? 'Chrome'
    : /Firefox\//i.test(ua)
    ? 'Firefox'
    : /Safari\//i.test(ua)
    ? 'Safari'
    : 'უცნობი';
  return { device, os, browser };
}

// Skip crawlers, link previewers and monitors — they aren't real visitors.
function isBot(ua = '') {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|monitor|curl|wget|headless|lighthouse|pingdom|uptime|gptbot|python-requests/i.test(
    ua
  );
}

// IP geolocation via ip-api.com (free, no key, http-only on the free tier — fine server-side).
async function geo(ip) {
  try {
    const url = `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,org,mobile,proxy,hosting,query`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    if (data?.status === 'success') return data;
  } catch {
    // ignore — we still send the notification without geo
  }
  return null;
}

// Returns true if this IP hasn't been seen within the dedup window.
async function shouldNotify(ip) {
  try {
    const store = getStore('visitor-dedup');
    const last = await store.get(ip);
    const now = Date.now();
    if (last && now - Number(last) < DEDUP_MINUTES * 60 * 1000) return false;
    await store.set(ip, String(now));
    return true;
  } catch {
    return true; // if dedup storage fails, err on the side of notifying
  }
}

async function notify(text) {
  const token = process.env.VISITOR_BOT_TOKEN;
  const chatId = process.env.VISITOR_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
}

export default async (req, context) => {
  const ua = req.headers.get('user-agent') || '';
  const ip =
    req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    context?.ip ||
    '';

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Ignore bots and requests without an IP.
  if (isBot(ua) || !ip) return new Response('ok');
  if (!(await shouldNotify(ip))) return new Response('ok');

  const g = await geo(ip);
  const { device, os, browser } = parseUA(ua);

  const flags = [];
  if (g?.proxy) flags.push('VPN/Proxy');
  if (g?.hosting) flags.push('Hosting/სერვერი');
  if (g?.mobile) flags.push('მობ. ქსელი');

  const ref =
    String(body.referrer || req.headers.get('referer') || '')
      .replace(/^https?:\/\//, '')
      .split('/')[0] || 'პირდაპირი';
  const page = String(body.path || '/');

  const guess = [
    g?.city && g?.country ? `${g.city}, ${g.country}` : g?.country || 'უცნობი ლოკაცია',
    g?.isp || g?.org || '',
    `${device}/${os}`,
    flags.length ? `(${flags.join(', ')})` : 'რეალური მომხმარებელი',
  ]
    .filter(Boolean)
    .join(' · ');

  const text =
    `👁 <b>ახალი ვიზიტი საიტზე</b>\n\n` +
    `🌍 ქვეყანა: <b>${esc(g?.country || 'უცნობი')}${g?.countryCode ? ` (${esc(g.countryCode)})` : ''}</b>\n` +
    `🏙 ქალაქი: <b>${esc(g?.city || 'უცნობი')}${g?.regionName ? `, ${esc(g.regionName)}` : ''}</b>\n` +
    `📡 IP: <code>${esc(ip)}</code>\n` +
    `🏢 ISP: ${esc(g?.isp || g?.org || 'უცნობი')}\n` +
    `📱 მოწყობილობა: ${esc(device)} · ${esc(os)} · ${esc(browser)}\n` +
    `🔗 საიდან: ${esc(ref)}\n` +
    `📄 გვერდი: ${esc(page)}\n` +
    (flags.length ? `⚠️ ${esc(flags.join(', '))}\n` : '') +
    `\n🕵️ სავარაუდო: ${esc(guess)}`;

  await notify(text);
  return new Response('ok');
};
