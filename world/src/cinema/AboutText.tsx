import { heroParagraphs } from '../data/profile';
import { totalYears } from '../data/career';

/**
 * The about text in full, for search engines and screen readers. On screen the
 * same facts are set as the billing block.
 */
export function AboutText() {
  return (
    <section className="sr-only" aria-label="About Luka">
      {heroParagraphs(totalYears()).map((p) => (
        <p key={p.slice(0, 24)}>{p}</p>
      ))}
    </section>
  );
}
