import { useEffect, useState } from 'react';
import { worldState } from '../scroll/worldState';
import './Loader.css';

/**
 * Covers the page until the world has drawn its first real frame, so nobody
 * meets a black or half-built screen. The gold line eases toward 90% while
 * waiting, completes when the world is ready, then the cover cuts away.
 */
export function Loader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      if (worldState.ready || now - start > 9000) {
        setProgress(100);
        setTimeout(() => setDone(true), 280);
        return;
      }
      // approaches 90% but never claims to be finished before it is
      setProgress(90 * (1 - Math.exp(-(now - start) / 1400)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (done) return null;
  return (
    <div className="loader" role="status" aria-live="polite">
      <p className="loader-label">Loading the reel</p>
      <div className="loader-bar">
        <span style={{ transform: `scaleX(${Math.max(0.04, progress / 100)})` }} />
      </div>
      <p className="loader-pct">{Math.round(progress)}%</p>
    </div>
  );
}
