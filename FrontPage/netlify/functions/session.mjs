// Session summary: the site sends this (via navigator.sendBeacon) when a visitor
// leaves. Reports time on site, pages/sections seen and videos watched to the
// visitor-tracker Telegram bot.
//
// Uses the same VISITOR_BOT_TOKEN / VISITOR_CHAT_ID as visit.mjs.

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function isBot(ua = '') {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|monitor|curl|wget|headless|lighthouse|pingdom|uptime|gptbot|python-requests/i.test(
    ua
  );
}

function fmtDuration(sec) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m ? `${m}წთ ${rem}წმ` : `${rem}წმ`;
}

// IP geolocation via ip-api.com (free, no key).
async function geo(ip) {
  try {
    const url = `http://ip-api.com/json/${ip}?fields=status,country,city,query`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    if (data?.status === 'success') return data;
  } catch {
    // ignore — location is optional
  }
  return null;
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

  if (isBot(ua)) return new Response('ok');

  const dur = Number(body.durationSec) || 0;
  const pages = Array.isArray(body.pages) ? body.pages : [];
  const videos = Array.isArray(body.videos) ? body.videos : [];
  const sections = Array.isArray(body.sections) ? body.sections : [];

  // Skip trivial bounces: no video, one page, barely any scroll and under 10s.
  if (!videos.length && pages.length <= 1 && sections.length < 2 && dur < 10) {
    return new Response('ok');
  }

  const g = await geo(ip);
  const loc = g ? `${g.city || '?'}, ${g.country || '?'}` : 'უცნობი';
  const ref =
    String(body.referrer || '')
      .replace(/^https?:\/\//, '')
      .split('/')[0] || 'პირდაპირი';

  let text =
    `📊 <b>სესია დასრულდა</b>\n\n` +
    `⏱ საიტზე დრო: <b>${esc(fmtDuration(dur))}</b>\n` +
    `🌍 ${esc(loc)}\n` +
    `📡 <code>${esc(ip)}</code>\n` +
    `🔗 საიდან: ${esc(ref)}\n\n` +
    `📄 ნანახი გვერდები: ${esc(pages.join(', ') || '—')}\n`;

  if (videos.length) {
    text +=
      `\n🎬 <b>ნახა ვიდეო (${videos.length}):</b>\n` +
      videos.map((v) => `   • ${esc(v.title || v.id)}`).join('\n') +
      '\n';
  } else {
    text += `\n🎬 ვიდეო: არ უნახავს\n`;
  }

  if (sections.length) {
    text += `👀 ნანახი სექციები: ${esc(sections.join(', '))}`;
  }

  await notify(text);
  return new Response('ok');
};
