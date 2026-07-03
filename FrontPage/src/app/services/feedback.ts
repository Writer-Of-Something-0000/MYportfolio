import { Injectable } from '@angular/core';

export interface Feedback {
  name: string;
  role: string;
  stars: number;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  // Public read endpoint that returns the raw feedback rows (Google Form / Sheet style).
  // Set this to your API URL. If it's empty or the request fails, the caller
  // falls back to its built-in defaults.
  private readonly endpoint = 'https://sheetdb.io/api/v1/gqfq2jhpj8rj4';

  async load(): Promise<Feedback[]> {
    if (!this.endpoint || this.endpoint.startsWith('PUT_YOUR_API_URL')) {
      return [];
    }

    const res = await fetch(this.endpoint, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Feedback request failed: ${res.status}`);

    const raw = await res.json();
    const rows: any[] = Array.isArray(raw) ? raw : raw?.data ?? [];

    return rows.map((row) => this.mapRow(row)).filter((f) => !!f.name || !!f.text);
  }

  // Maps one raw row into a Feedback. The API keys are long Georgian form-question
  // labels, so we match by keyword instead of exact key — that way small label
  // edits on the form don't break the mapping.
  private mapRow(row: Record<string, any>): Feedback {
    const pick = (...keywords: string[]): string => {
      const key = Object.keys(row).find((k) =>
        keywords.some((kw) => k.toLowerCase().includes(kw.toLowerCase()))
      );
      return key ? String(row[key] ?? '').trim() : '';
    };

    const starsRaw = pick('ვარსკვლ', 'star', 'rating');
    const stars = Math.min(5, Math.max(0, parseInt(starsRaw, 10) || 0));

    return {
      name: pick('სახელი', 'name'),
      role: pick('პოზიცია', 'კომპანია', 'position', 'company', 'role'),
      stars,
      text: pick('უკუკავშირი', 'ტექსტი', 'feedback', 'text', 'message'),
    };
  }
}
