import { Injectable } from '@angular/core';

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

    if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);

    const data = await res.json();
    if (data?.error) throw new Error(data.error);
    return data?.reply ?? 'Sorry, I couldn’t come up with a reply just now.';
  }
}
