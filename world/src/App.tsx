import { Billing } from './cinema/Billing';
import { CinemaHero } from './cinema/CinemaHero';
import { AboutText } from './cinema/AboutText';
import { useSmoothScroll } from './scroll/useSmoothScroll';

export default function App() {
  useSmoothScroll();

  return (
    <main>
      <CinemaHero />
      <Billing />
      <AboutText />
      {/* the next chapters (work, experience, education, contact) come in after this */}
      <div className="reel" aria-hidden="true" />
    </main>
  );
}
