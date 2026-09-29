import { useEffect, useMemo, useRef, useState } from 'react';
import { profile } from '../data/profile';
import { pickShowreel } from '../scene/videoSource';
import './CinemaHero.css';

/** Tbilisi local time, for clients in other time zones */
function useTbilisiTime(): string {
  const format = () =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit' }).format(
      new Date(),
    );
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/**
 * The opening frame. The showreel plays full-bleed behind 2.39:1 letterbox
 * bars; the bars start shut (a black screen) and open the moment the footage
 * actually plays, then close again as the visitor scrolls on — the title
 * sequence is over. The top bar carries the chrome, the bottom bar the title card.
 */
export function CinemaHero() {
  const stage = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const src = useMemo(pickShowreel, []);
  const time = useTbilisiTime();

  // if autoplay is blocked or the file is slow, open on the poster anyway
  useEffect(() => {
    const id = setTimeout(() => setOpen(true), 3500);
    return () => clearTimeout(id);
  }, []);

  // once the shutter has finished opening, the bars track the scroll directly
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setSettled(true), 1800);
    return () => clearTimeout(id);
  }, [open]);

  // scrolling through the pinned hero closes the bars again
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = stage.current?.parentElement;
      if (el) {
        const room = el.offsetHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, room)));
        stage.current!.style.setProperty('--close', (p * p * (3 - 2 * p)).toFixed(4));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="cinema" aria-label="Intro">
      <div
        ref={stage}
        className={`cinema-stage${open ? ' is-open' : ''}${settled ? ' is-settled' : ''}`}
      >
        <div className="cinema-media" aria-hidden="true">
          <video
            className="cinema-video"
            src={src}
            poster="/portfolio-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onPlaying={() => setOpen(true)}
          />
          <div className="cinema-grade" />
          <div className="cinema-grain" />
        </div>

        <header className="bar bar-top">
          <div className="bar-inner">
            <p className="clock">
              Tbilisi <span>{time}</span>
            </p>
            <nav className="menu" aria-label="Main">
              <a href="#work">Work</a>
              <a href="#experience">Experience</a>
              <a href="#contact">Contact</a>
              <a className="menu-cv" href={profile.cv.href} download={profile.cv.filename}>
                Download CV
              </a>
            </nav>
          </div>
        </header>

        <div className="bar bar-bottom">
          <div className="bar-inner">
            <h1 className="title-card">{profile.name}</h1>
            <p className="now-showing">
              <span className="now-label">Now showing</span>
              <span className="now-title">Showreel</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
