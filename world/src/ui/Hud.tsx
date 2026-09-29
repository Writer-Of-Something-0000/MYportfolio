import { useEffect, useRef } from 'react';
import { timecode, worldState } from '../scroll/worldState';
import './Hud.css';

const TEMPLATE = '00:00:00:00';

/**
 * The running timecode, top right — the only chrome over the world. Each digit
 * sits in its own fixed-width cell so the readout never jitters, and the
 * digits are written straight into the DOM every frame, never through React.
 */
export function Hud() {
  const cells = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    let last = TEMPLATE;
    const tick = () => {
      const next = timecode(worldState.playheadZ);
      if (next !== last) {
        for (let i = 0; i < next.length; i++) {
          if (next[i] !== last[i]) cells.current[i]!.textContent = next[i];
        }
        last = next;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="timecode" aria-hidden="true">
      {[...TEMPLATE].map((ch, i) => (
        <span key={i} ref={(el) => void (cells.current[i] = el)} className={ch === ':' ? 'sep' : 'digit'}>
          {ch}
        </span>
      ))}
    </div>
  );
}
