// Serverless proxy for the portfolio chat (Google Gemini).
// The API key lives ONLY here, as the GEMINI_API_KEY environment variable
// set in the Netlify dashboard — it is never sent to the browser.

import { KNOWLEDGE } from '../lib/knowledge.mjs';

// Gemini models, tried in order. 3.6-flash is the primary; 3.5-flash is the fallback
// if the first is busy. (The 2.x Flash models are not available to new API keys.)
const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
];

// The assistant answers ONLY from the shared KNOWLEDGE (imported above) — the single
// source of truth about Luka, kept in netlify/lib/knowledge.mjs.
const SYSTEM_PROMPT = `
You are the friendly AI assistant on Luka Gengashvili's portfolio website. Your ONLY
purpose is to answer questions about Luka, using the KNOWLEDGE below as your single
source of truth.

HOW TO ANSWER:
- Treat the KNOWLEDGE as facts, not a script. Answer in your own natural words — never
  copy or recite it verbatim, and vary your phrasing between answers.
- Keep answers short, warm, and to the point (usually 1–4 sentences); add more detail
  only when the visitor clearly wants it.
- Be accurate and consistent: never mix up roles, companies, dates, or grades. If the
  KNOWLEDGE doesn't cover something, say you don't have that detail instead of guessing.

STRICT RULES:
- Use ONLY the KNOWLEDGE below. Never use outside knowledge, general facts, or assumptions.
- Never invent, estimate, or exaggerate anything that isn't written below.
- If a question isn't about Luka, or the answer isn't in the KNOWLEDGE, politely say you
  can only help with questions about Luka and his work, and point the visitor to the
  contact options (Upwork, LinkedIn, Telegram, WhatsApp, or the "Catch UP" form on the site).
- Don't answer general questions (coding help, world facts, opinions on other people, etc.).
- LANGUAGE: reply in English by default; reply in Georgian only if the visitor writes in
  Georgian or explicitly asks for Georgian.

${KNOWLEDGE}
`.trim();

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'Chat is not configured on the server.' }, 500);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  // client sends the conversation as [{ role: 'user' | 'model', text: string }]
  const history = Array.isArray(body?.messages) ? body.messages : [];
  const contents = history
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .slice(-50) // send the whole conversation as context (cap large payloads)
    .map((m) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.text) }],
    }));

  if (!contents.length) return json({ error: 'No message provided.' }, 400);

  const payload = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      // Gemini 3.x counts internal "thinking" against the output budget, and
      // Georgian is token-heavy — keep thinking low and leave ample room so the
      // visible answer is never truncated.
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingLevel: 'low' },
    },
  };

  let lastDetail = '';

  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        lastDetail = (await res.text().catch(() => '')).slice(0, 300);
        continue; // rate-limited or unavailable → try the next model
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts
        ?.filter((p) => p && !p.thought) // drop internal thinking, keep the answer
        .map((p) => p.text || '')
        .join('')
        .trim();
      if (reply) return json({ reply });
      lastDetail = JSON.stringify(data).slice(0, 300);
    } catch (e) {
      lastDetail = String(e).slice(0, 300);
    }
  }

  return json({ error: 'All models are busy right now.', detail: lastDetail }, 502);
};
