// Serverless handler for the footer contact form.
// It does two things when someone submits the form:
//   1. Sends an instant Telegram message to the site owner.
//   2. Forwards the same message to email via FormSubmit (backup).
//
// Secrets live ONLY here, as Netlify environment variables — never in the browser:
//   TELEGRAM_BOT_TOKEN  — from @BotFather
//   TELEGRAM_CHAT_ID    — your personal chat id (from @userinfobot)
//   CONTACT_EMAIL       — optional; defaults to gengashvili05@gmail.com

const OWNER_EMAIL = process.env.CONTACT_EMAIL || 'gengashvili05@gmail.com';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// Telegram uses HTML parse mode below, so escape the user-supplied text.
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

async function sendTelegram(name, email, message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { ok: false, skipped: true };

  const text =
    `📬 <b>New portfolio message</b>\n\n` +
    `👤 <b>${esc(name)}</b>\n` +
    `✉️ ${esc(email)}\n\n` +
    `💬 ${esc(message)}`;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  return { ok: res.ok };
}

async function sendEmail(name, email, message) {
  const res = await fetch(`https://formsubmit.co/ajax/${OWNER_EMAIL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name,
      email,
      message,
      _subject: `Portfolio contact from ${name}`,
    }),
  });
  return { ok: res.ok };
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const message = String(body?.message ?? '').trim();

  if (!name || !email || !message) {
    return json({ error: 'All fields are required.' }, 400);
  }

  // Run both notifications; don't let one failure block the other.
  const [tg, mail] = await Promise.allSettled([
    sendTelegram(name, email, message),
    sendEmail(name, email, message),
  ]);

  const telegramOk = tg.status === 'fulfilled' && tg.value.ok;
  const emailOk = mail.status === 'fulfilled' && mail.value.ok;

  // As long as one channel delivered, treat the submission as successful.
  if (telegramOk || emailOk) return json({ ok: true, telegramOk, emailOk });

  return json({ error: 'Could not deliver your message. Please try again.' }, 502);
};
