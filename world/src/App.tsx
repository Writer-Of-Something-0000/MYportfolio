import { Billing } from './cinema/Billing';
import { CinemaHero } from './cinema/CinemaHero';
import { useSmoothScroll } from './scroll/useSmoothScroll';
import { AboutText } from './ui/Intro';

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
