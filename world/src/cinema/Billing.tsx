import { Fragment } from 'react';
import { totalYears } from '../data/career';
import './Billing.css';

/** One run of a billing block: small connecting words between the big credits. */
type Run = { small?: string; big: string }[];

/**
 * Who Luka is, set as a film poster's billing block: ultra-condensed capitals
 * for the credits, tiny words between them. Every fact comes from the site's
 * own content.
 */
export function Billing() {
  const years = totalYears();
  const lines: Run[] = [
    [{ big: 'Luka Gengashvili' }, { small: 'is a', big: 'post-production specialist' }],
    [
      { small: 'with', big: `${years} years` },
      { small: 'in', big: 'video editing' },
      { big: 'motion graphics' },
      { small: 'and', big: 'AI-powered content' },
    ],
    [
      { small: 'edited in', big: 'Premiere Pro' },
      { small: 'graded in', big: 'DaVinci Resolve' },
      { small: 'animated in', big: 'After Effects' },
    ],
    [
      { small: 'designed in', big: 'Photoshop' },
      { big: 'Illustrator' },
      { big: 'Lightroom' },
      { small: 'and', big: 'Sony Vegas Pro' },
    ],
    [
      { small: 'shot with', big: 'drones' },
      { small: 'and', big: 'Canon cameras' },
      { small: 'based in', big: 'Tbilisi, Georgia' },
      { small: 'speaks', big: 'Georgian' },
      { small: 'and', big: 'English' },
    ],
  ];

  return (
    <section className="billing" aria-label="About">
      {lines.map((line, i) => (
        <p key={i} className={i === 0 ? 'billing-line billing-lead' : 'billing-line'}>
          {line.map((run, j) => (
            <Fragment key={j}>
              {run.small && <small>{run.small}</small>}
              <span>{run.big}</span>
            </Fragment>
          ))}
        </p>
      ))}
    </section>
  );
}
