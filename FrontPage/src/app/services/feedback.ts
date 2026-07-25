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
  // Our own Netlify Function reads the feedback straight from the public Google
  // Sheet (the Google Form's responses) — no SheetDB, no request limits. It
  // returns the same raw row shape (objects keyed by column label) that mapRow
  // expects. If the request fails, the caller falls back to its built-in defaults.
  private readonly endpoint = '/.netlify/functions/feedback';

  async load(): Promise<Feedback[]> {
    if (!this.endpoint || this.endpoint.startsWith('PUT_YOUR_API_URL')) {
      return [];
    }

    // no-store so a freshly added Google Form response shows up on a normal
    // reload — the browser never serves a stale cached copy of this list.
    const res = await fetch(this.endpoint, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
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
