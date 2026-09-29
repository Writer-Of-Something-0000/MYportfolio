import { useEffect, useRef } from 'react';
import { profile, heroParagraphs, socials } from '../data/profile';
import { totalYears } from '../data/career';
import { worldState } from '../scroll/worldState';
import { prefersReducedMotion } from '../scroll/useSmoothScroll';
import './Intro.css';

/** font-stretch at rest, and the most a fast scroll can squeeze it */
const REST = 100;
const SQUEEZED = 52;

/**
 * The opening title. The name is set in Anybody's width axis and reacts to the
 * scroll like a speed ramp: the faster the reel is scrubbed, the tighter the
 * letters compress, easing back out when it slows.
 */
export function Intro() {
  const name = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    let stretch = REST;
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const speed = Math.min(1, Math.abs(worldState.velocity) / 45);
      const target = REST - (REST - SQUEEZED) * speed;
      // compress fast, recover slowly — the ramp's ease-out
      const rate = target < stretch ? 14 : 3;
      stretch += (target - stretch) * (1 - Math.exp(-rate * dt));
      if (name.current) name.current.style.fontStretch = `${stretch.toFixed(1)}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="intro">
      <div className="title">
        <h1 className="name" ref={name}>
          {profile.name}
        </h1>
        <p className="role">Video editor and post-production specialist in Tbilisi, Georgia.</p>

        <div className="actions">
          <a className="cv" href={profile.cv.href} download={profile.cv.filename}>
            Download CV
          </a>
          <ul className="links">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener">
                  <i className={s.icon} aria-hidden="true" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="hint" aria-hidden="true">Scroll to play the reel</p>
    </section>
  );
}

/** The about text in full, for search engines and screen readers — on screen it plays as subtitles. */
export function AboutText() {
  return (
    <section className="sr-only" aria-label="About">
      {heroParagraphs(totalYears()).map((p) => (
        <p key={p.slice(0, 24)}>{p}</p>
      ))}
    </section>
  );
}
