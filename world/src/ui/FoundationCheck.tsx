import { palette } from '../theme/tokens';
import { jobs, timeline, totalYears, careerStart, monthLabel } from '../data/career';
import { schools } from '../data/education';
import { skillGroups, tools } from '../data/skills';
import { profile, socials } from '../data/profile';
import { fallbackWorks } from '../data/works';
import './FoundationCheck.css';

/**
 * Phase 0 checkpoint: shows that the palette and every piece of content made it
 * across from the Angular site. Temporary — removed once the Intro scene lands.
 */
export function FoundationCheck() {
  const courses = schools.flatMap((s) => s.courses.map((c) => ({ school: s.name, ...c })));

  return (
    <main className="foundation">
      <p className="phase">PHASE 0 · FOUNDATION</p>
      <h1>{profile.name}</h1>
      <p className="role">{profile.role}</p>

      <section>
        <h2>Palette</h2>
        <ul className="swatches">
          {Object.entries(palette).map(([name, value]) => (
            <li key={name}>
              <span className="chip" style={{ background: value }} />
              <span>{name}</span>
              <code>{value}</code>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Content</h2>
        <ul className="stats">
          <li><b>{jobs.length}</b> roles → <b>{timeline.length}</b> clip groups</li>
          <li><b>{totalYears()}</b> years · since {monthLabel(careerStart)}</li>
          <li><b>{schools.length}</b> schools · <b>{courses.length}</b> courses</li>
          <li><b>{skillGroups.length}</b> skill groups · <b>{tools.length}</b> tools</li>
          <li><b>{fallbackWorks.length}</b> fallback works · <b>{socials.length}</b> socials</li>
        </ul>
      </section>

      <section>
        <h2>“Bachelor’s degree” → proposed wording</h2>
        <ul className="courses">
          {courses.map((c) => (
            <li key={c.school + c.name}>
              <span>{c.name}</span>
              <em>{c.kind}</em>
              <small>{c.school}</small>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
