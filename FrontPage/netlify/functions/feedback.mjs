// Serverless feedback source. Reads testimonials straight from the public
// Google Sheet (the Google Form's responses) via Google's free "gviz" endpoint —
// no SheetDB, no API key, no request limits. Returns the same row shape the
// site's FeedbackService already expects: an array of objects keyed by the
// sheet's column labels, so the existing mapRow() keeps working unchanged.
//
// Optional environment variable (Netlify dashboard):
//   FEEDBACK_SHEET_ID — overrides the hard-coded sheet id below. The sheet must
//                       be shared as "Anyone with the link → Viewer".

const SHEET_ID =
  process.env.FEEDBACK_SHEET_ID || '1Ad-CSR5FGAXnC2w3N6ZKYocoVlGYzJGm_WoiIrwy178';
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// Warm-instance cache so a burst of page views doesn't hit Google every time.
const TTL_MS = 5 * 60 * 1000;
let cache = { at: 0, rows: null };

const json = (obj, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });

// Turns the gviz JSONP-ish body — `/*O_o*/\ngoogle.visualization.Query.setResponse({...});`
// — into an array of { [columnLabel]: value } rows.
export function parseGviz(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return [];

  const data = JSON.parse(text.slice(start, end + 1));
  const cols = (data?.table?.cols || []).map((c) => String(c?.label || c?.id || '').trim());
  const rows = data?.table?.rows || [];

  return rows
    .map((row) => {
      const cells = row?.c || [];
      const obj = {};
      cols.forEach((label, i) => {
        if (!label) return;
        const cell = cells[i];
        // prefer the formatted value (numbers/dates), fall back to the raw value
        obj[label] = cell == null ? '' : cell.f ?? cell.v ?? '';
      });
      return obj;
    })
    // drop completely empty rows
    .filter((obj) => Object.values(obj).some((v) => String(v).trim()));
}

export default async () => {
  const now = Date.now();

  // Serve fresh cache if we have it.
  if (cache.rows && now - cache.at < TTL_MS) {
    return json(cache.rows, 200, { 'Cache-Control': 'public, max-age=300' });
  }

  try {
    const res = await fetch(GVIZ_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      if (cache.rows) return json(cache.rows); // serve stale rather than fail
      return json({ error: 'Could not load feedback.' }, 502);
    }

    const text = await res.text();
    // Google Form appends new responses at the bottom, so reverse to show
    // the newest testimonials first.
    const rows = parseGviz(text).reverse();
    cache = { at: now, rows };
    return json(rows, 200, { 'Cache-Control': 'public, max-age=300' });
  } catch (e) {
    if (cache.rows) return json(cache.rows); // serve stale on network error
    return json({ error: 'Could not load feedback.', detail: String(e).slice(0, 200) }, 502);
  }
};
