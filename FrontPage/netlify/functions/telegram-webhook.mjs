// Telegram webhook: lets the site owner chat with the bot about the contacts
// that came in through the portfolio form. The owner can ask things like
// "როგორია მე-5 id", "#3 ვინ იყო", "რომელი მეილია ყველაზე სანდო", "ბოლო 3".
//
// Only the owner (TELEGRAM_CHAT_ID) may use the bot. Every incoming message is
// answered by Groq using the stored contacts as context.
//
// Set the webhook once after deploy:
//   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<site>/.netlify/functions/telegram-webhook

import { getContacts, getContactById } from '../lib/store.mjs';

const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Telegram always expects a 200; we answer the user with a separate API call.
const ok = () => new Response('ok');

async function reply(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
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

// Formats one stored contact as an HTML block for Telegram.
function formatContact(c) {
  return (
    `📇 <b>#${c.id}</b> — <b>${esc(c.name)}</b>\n` +
    `✉️ ${esc(c.email)}\n` +
    `🗓 ${esc((c.date || '').slice(0, 10))}\n\n` +
    `💬 ${esc(c.message)}` +
    (c.analysis ? `\n\n🤖 ${esc(c.analysis)}` : '')
  );
}

// Asks Groq the owner's question, using the stored contacts as the only source.
async function askAI(question, contacts) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return '';

  const recent = contacts.slice(-50);
  const data =
    recent
      .map(
        (c) =>
          `#${c.id} | ${c.name} | ${c.email} | ${(c.date || '').slice(0, 10)}\n` +
          `შეტყობინება: ${c.message}\n` +
          `ანალიზი: ${c.analysis || '—'}`
      )
      .join('\n\n') || 'ჯერ არცერთი კონტაქტი არ შემოსულა.';

  const systemPrompt = `
შენ ხარ Luka-ს პირადი ასისტენტი ტელეგრამში. მართავ პორტფოლიოს საიტიდან შემოსულ კონტაქტებს.
თითოეულ კონტაქტს აქვს ID (#1, #2 ...). უპასუხე Luka-ს კითხვას ქართულად, მოკლედ და გასაგებად,
მხოლოდ ქვემოთ მოცემული მონაცემების საფუძველზე.

- თუ კითხვა კონკრეტულ ID-ს ეხება (მაგ. "მე-5", "#3", "მეხუთე"), მოძებნე ის ID და აღწერე ვინ იყო,
  რა მოგწერა და რამდენად სანდოა.
- თუ კითხვა ზოგადია (მაგ. "ყველაზე სანდო ვინ არის", "ბოლო კონტაქტები", "სულ რამდენია"), უპასუხე მონაცემებიდან.
- თუ მოთხოვნილი მონაცემი არ არსებობს, პირდაპირ თქვი რომ ასეთი ID/კონტაქტი არ არის.
- ნუ მოიგონებ ინფორმაციას, რომელიც მონაცემებში არ წერია.

=== კონტაქტები (${recent.length}) ===
${data}
`.trim();

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ];

  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, temperature: 0.4, max_tokens: 500, messages }),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const out = json?.choices?.[0]?.message?.content?.trim();
      if (out) return out;
    } catch {
      // try the next model
    }
  }
  return '';
}

export default async (req) => {
  if (req.method !== 'POST') return ok();

  let update;
  try {
    update = await req.json();
  } catch {
    return ok();
  }

  const msg = update?.message || update?.edited_message;
  const chatId = msg?.chat?.id;
  const text = String(msg?.text || '').trim();
  if (!chatId || !text) return ok();

  // Private bot: only the owner is allowed to talk to it.
  const owner = process.env.TELEGRAM_CHAT_ID;
  if (owner && String(chatId) !== String(owner)) {
    await reply(chatId, '🔒 ეს ბოტი პირადია.');
    return ok();
  }

  if (text === '/start' || text === '/help') {
    await reply(
      chatId,
      'გამარჯობა 👋\n\nაქ მოგდის პორტფოლიოს საიტიდან შემოსული კონტაქტები (თითო თავისი #ID-ით).\n\n' +
        'შემიძლია მათზე გიპასუხო. მაგალითად:\n' +
        '• <code>მე-5 id ვინ იყო?</code>\n' +
        '• <code>#3</code>\n' +
        '• <code>ყველაზე სანდო ვინ არის?</code>\n' +
        '• <code>ბოლო 3 კონტაქტი</code>\n' +
        '• <code>სულ რამდენი მოვიდა?</code>'
    );
    return ok();
  }

  const contacts = await getContacts();

  if (!contacts.length) {
    await reply(chatId, 'ჯერ არცერთი კონტაქტი არ შემოსულა. 📭');
    return ok();
  }

  // Fast path: a bare number → return that exact contact card.
  const bare = text.match(/^#?\s*(\d+)$/);
  if (bare) {
    const c = await getContactById(Number(bare[1]));
    await reply(chatId, c ? formatContact(c) : `❌ #${bare[1]} ID-ით კონტაქტი ვერ ვიპოვე.`);
    return ok();
  }

  // Otherwise let the AI answer from the stored contacts.
  const answer = await askAI(text, contacts);
  await reply(
    chatId,
    answer || '🤖 ვერ დავამუშავე მოთხოვნა ახლა. სცადე თავიდან ან მიწერე კონკრეტული #ID.'
  );
  return ok();
};
