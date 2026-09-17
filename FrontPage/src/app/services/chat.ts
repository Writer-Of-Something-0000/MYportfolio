import { Injectable } from '@angular/core';

/** Carries the server's own message plus the cause, for the console breadcrumb. */
export class ChatError extends Error {
  constructor(message: string, readonly code?: string, readonly detail?: string) {
    super(message);
  }
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // Calls our own Netlify Function, which holds the Gemini key server-side.
  // No API key ever lives in the browser.
  private readonly endpoint = '/.netlify/functions/chat';

  async send(history: ChatTurn[]): Promise<string> {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });

    // The body carries the real cause even on a non-2xx, so read it either way
    // rather than throwing on the status and losing it.
    const data = await res.json().catch(() => null);

    if (data?.error) throw new ChatError(data.error, data.code, data.detail);
    if (!res.ok) throw new ChatError('Something went wrong. Please try again.', `http_${res.status}`);
    return data?.reply ?? 'Sorry, I couldn’t come up with a reply just now.';
  }
}
