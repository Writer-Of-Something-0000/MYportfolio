// Serverless handler for the footer contact form.
// When someone submits the form it:
//   1. Runs an AI analysis of the sender (email origin, legitimacy, trust).
//   2. Stores the contact with a sequential id (#1, #2 …) so the Telegram bot
//      can answer questions about it later.
//   3. Sends an instant Telegram message to the site owner (id + message + analysis).
//   4. Forwards the raw message to email via FormSubmit (backup).
//
// Secrets live ONLY here, as Netlify environment variables — never in the browser:
//   TELEGRAM_BOT_TOKEN  — from @BotFather
//   TELEGRAM_CHAT_ID    — your personal chat id (from @userinfobot)
//   GROQ_API_KEY        — same key the chat function uses
//   CONTACT_EMAIL       — optional; defaults to gengashvili05@gmail.com

import { saveContact } from '../lib/store.mjs';

const OWNER_EMAIL = process.env.CONTACT_EMAIL || 'gengashvili05@gmail.com';

// Groq models tried in order (same as the chat function): 70B is smarter, 8B is the fast fallback.
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

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

// Asks Groq to profile the sender from their email + message. Returns a short
// Georgian assessment, or '' if the AI is unavailable (never blocks the notification).
async function analyzeSender(name, email, message) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return '';

  const domain = (email.split('@')[1] || '').toLowerCase();

  const systemPrompt = `
შენ ხარ ასისტენტი, რომელიც პორტფოლიოს საიტზე შემოსულ კონტაქტებს აანალიზებს Luka-სთვის
(ვიდეო ედიტორი/ვიზუალური რეჟისორი). მიიღებ ადამიანის სახელს, email-ს და შეტყობინებას.
გააკეთე მოკლე, გულწრფელი შეფასება ქართულად, ზუსტად ამ ფორმატით (მხოლოდ ეს 3 სტრიქონი):

• დომენი: <email-ის დომენი> — <corporate/კომპანიის თუ უფასო: gmail/outlook/ა.შ.>, <ქვეყანა TLD-ის ან კონტექსტის მიხედვით ან "უცნობი">
• სიგნალები: <1 წინადადება — შეტყობინება კონკრეტულია თუ ზოგადი/სპამისებრი, ახსენა თუ არა რეალური პროექტი/ბიუჯეტი/ვადა>
• ნდობა: <N>/10 — <ღირს პასუხის გაცემა / ფრთხილად / სავარაუდოდ სპამი>

წესები: იყავი რეალისტური. უფასო მეილი (gmail) ცუდი არაა, მაგრამ კომპანიის დომენი უფრო სანდოა.
ზოგადი/ბუნდოვანი შეტყობინება = დაბალი ნდობა. კონკრეტული პროექტი/დეტალები = მაღალი. მოკლედ.
`.trim();

  const userContent = `სახელი: ${name}\nEmail: ${email}\nდომენი: ${domain || 'უცნობი'}\nშეტყობინება: ${message}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];

  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, temperature: 0.4, max_tokens: 300, messages }),
      });
      if (!res.ok) continue; // rate-limited / unavailable → try next model
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (reply) return reply;
    } catch {
      // ignore and try the next model
    }
  }
  return '';
}

async function sendTelegram({ id, name, email, message, analysis }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { ok: false, skipped: true };

  const idTag = id ? ` <b>#${id}</b>` : '';
  let text =
    `📬 <b>New portfolio message</b>${idTag}\n\n` +
    `👤 <b>${esc(name)}</b>\n` +
    `✉️ ${esc(email)}\n\n` +
    `💬 ${esc(message)}`;

  if (analysis) {
    text += `\n\n🤖 <b>AI ანალიზი:</b>\n${esc(analysis)}`;
  }

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

  // Profile the sender first (best-effort), then notify. Analysis failure never blocks delivery.
  let analysis = '';
  try {
    analysis = await analyzeSender(name, email, message);
  } catch {
    analysis = '';
  }

  // Persist the contact and assign a sequential id (#1, #2 …) so it can be looked
  // up later from the Telegram bot. A storage failure must not block the notification.
  let id = null;
  try {
    const saved = await saveContact({ name, email, message, analysis });
    id = saved.id;
  } catch {
    id = null;
  }

  // Run both notifications; don't let one failure block the other.
  const [tg, mail] = await Promise.allSettled([
    sendTelegram({ id, name, email, message, analysis }),
    sendEmail(name, email, message),
  ]);

  const telegramOk = tg.status === 'fulfilled' && tg.value.ok;
  const emailOk = mail.status === 'fulfilled' && mail.value.ok;

  // As long as one channel delivered, treat the submission as successful.
  if (telegramOk || emailOk) return json({ ok: true, telegramOk, emailOk });

  return json({ error: 'Could not deliver your message. Please try again.' }, 502);
};
