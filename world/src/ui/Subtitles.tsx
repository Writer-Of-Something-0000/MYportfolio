import { useEffect, useMemo, useState } from 'react';
import { aboutCues } from '../data/subtitles';
import { totalYears } from '../data/career';
import { secondsAt, worldState } from '../scroll/worldState';
import './Subtitles.css';

/**
 * Subtitles burned over the world, timed to the playhead. A line appears and
 * disappears on a hard cut — the way subtitles do — never with a fade.
 */
export function Subtitles() {
  const cues = useMemo(() => aboutCues(totalYears()), []);
  const [text, setText] = useState('');

  useEffect(() => {
    let raf = 0;
    let shown = '';
    const tick = () => {
      const t = secondsAt(worldState.playheadZ);
      const next = cues.find((c) => t >= c.from && t < c.to)?.text ?? '';
      if (next !== shown) setText((shown = next));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cues]);

  return (
    <div className="subtitles" aria-hidden="true">
      {text && <span>{text}</span>}
    </div>
  );
}
