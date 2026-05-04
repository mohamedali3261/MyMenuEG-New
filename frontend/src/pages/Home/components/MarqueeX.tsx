import { useEffect, useState } from 'react';
import { useStore } from '../../../store/store';
import { api } from '../../../api';
import { resolveAssetUrl } from '../../../utils/assetUrl';

interface MarqueeLogo {
  id: string;
  image_url: string;
  name_ar?: string;
  name_en?: string;
  strip?: string;
  order_index?: number;
  type?: string;
  text_ar?: string;
  text_en?: string;
  color?: string;
  background_color?: string;
  speed?: number;
}

function MarqueeItem({ logo, rtl }: { logo: MarqueeLogo; rtl: boolean }) {
  if (logo.type === 'text') {
    return (
      <div
        className="marquee-item marquee-item--text"
        style={{
          backgroundColor: logo.background_color || '#1a1a1a',
          color: logo.color || '#ffffff',
          boxShadow: `0 8px 32px -8px ${logo.color || '#ffffff'}30, 0 0 0 1px ${logo.color || '#ffffff'}10`,
        }}
      >
        <span className="text-lg md:text-xl lg:text-2xl font-bold text-center">
          {rtl ? logo.text_ar : logo.text_en}
        </span>
      </div>
    );
  }

  return (
    <div className="marquee-item marquee-item--image glass-card border border-white/10 dark:border-white/5">
      <img
        src={resolveAssetUrl(logo.image_url)}
        alt={rtl ? logo.name_ar : logo.name_en}
        className="max-w-full max-h-full object-contain filter dark:brightness-90 dark:contrast-110 transition-all duration-500 ease-out group-hover:filter-none group-hover:brightness-100"
        loading="lazy"
      />
    </div>
  );
}

function MarqueeStrip({ logos, reverse, speed }: { logos: MarqueeLogo[]; reverse: boolean; speed: number }) {
  if (logos.length === 0) return null;

  return (
    <div className={`marquee ${reverse ? 'marquee--reverse' : ''}`} style={{ '--duration': `${speed}s` } as React.CSSProperties}>
      <div className="marquee__group">
        {logos.map((logo) => (
          <div key={logo.id} className="relative group">
            <MarqueeItem logo={logo} rtl={false} />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="marquee__group">
        {logos.map((logo) => (
          <div key={`dup-${logo.id}`} className="relative group">
            <MarqueeItem logo={logo} rtl={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarqueeX() {
  const { rtl } = useStore();
  const [logos, setLogos] = useState<MarqueeLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [vertical, setVertical] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/marquee-logos'),
      api.get('/marquee-logos/settings')
    ])
      .then(([logosRes, settingsRes]) => {
        setLogos(logosRes.data || []);
        setEnabled(settingsRes.data?.enabled ?? true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !enabled || logos.length === 0) return null;

  const strip1Logos = logos.filter(l => l.strip === '1' || !l.strip);
  const strip2Logos = logos.filter(l => l.strip === '2');
  const speed = logos[0]?.speed || 30;

  return (
    <section className="relative w-full py-10 md:py-16 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary-500/15 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-accent-500/15 blur-[100px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />

      {/* Section title */}
      <div className="text-center mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-primary-500">
            {rtl ? 'شركاؤنا' : 'Our Partners'}
          </span>
        </div>
      </div>

      {/* Toggle direction button */}
      <button
        className={`marquee-toggle ${vertical ? 'marquee-toggle--vertical' : ''}`}
        onClick={() => setVertical(!vertical)}
        title={rtl ? 'تغيير اتجاه التمرير' : 'Toggle scroll axis'}
      >
        <svg aria-hidden="true" viewBox="0 0 512 512" width="100">
          <path d="M377.941 169.941V216H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.568 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296h243.882v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.568 0-33.941l-86.059-86.059c-15.119-15.12-40.971-4.412-40.971 16.97z" />
        </svg>
      </button>

      {/* Marquee wrapper */}
      <div className={`marquee-wrapper ${vertical ? 'marquee-wrapper--vertical' : ''}`}>
        <MarqueeStrip logos={strip1Logos} reverse={false} speed={speed} />
        <MarqueeStrip logos={strip2Logos.length > 0 ? strip2Logos : strip1Logos} reverse={true} speed={speed} />
      </div>

      {/* Styles */}
      <style>{`
        .marquee-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--marquee-gap, 1.5rem);
          max-width: 100vw;
        }

        .marquee-wrapper--vertical {
          flex-direction: row;
          height: 70vh;
        }

        .marquee {
          display: flex;
          overflow: hidden;
          user-select: none;
          gap: var(--marquee-gap, 1.5rem);
          --mask-direction: to right;
          mask-image: linear-gradient(
            var(--mask-direction),
            hsl(0 0% 0% / 0),
            hsl(0 0% 0% / 1) 10%,
            hsl(0 0% 0% / 1) 90%,
            hsl(0 0% 0% / 0)
          );
          -webkit-mask-image: linear-gradient(
            var(--mask-direction),
            hsl(0 0% 0% / 0),
            hsl(0 0% 0% / 1) 10%,
            hsl(0 0% 0% / 1) 90%,
            hsl(0 0% 0% / 0)
          );
        }

        .marquee--vertical {
          --mask-direction: to bottom;
        }

        .marquee--vertical,
        .marquee--vertical .marquee__group {
          flex-direction: column;
        }

        .marquee--vertical .marquee__group {
          animation-name: scroll-y;
        }

        .marquee__group {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: var(--marquee-gap, 1.5rem);
          min-width: 100%;
          animation: scroll-x var(--duration, 30s) linear infinite;
          will-change: transform;
        }

        .marquee--reverse .marquee__group {
          animation-direction: reverse;
          animation-delay: -3s;
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee__group {
            animation-play-state: paused;
          }
        }

        .marquee:hover .marquee__group {
          animation-play-state: paused;
        }

        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% - var(--marquee-gap, 1.5rem))); }
        }

        @keyframes scroll-y {
          from { transform: translateY(0); }
          to { transform: translateY(calc(-100% - var(--marquee-gap, 1.5rem))); }
        }

        /* Item styles */
        .marquee-item {
          display: grid;
          place-items: center;
          width: clamp(6rem, 1rem + 15vmin, 12rem);
          aspect-ratio: 16/9;
          padding: clamp(0.5rem, 1vmin, 1.5rem);
          border-radius: 0.75rem;
          transition: transform 500ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 500ms ease-out;
        }

        .marquee-item:hover {
          transform: scale(1.1);
          box-shadow: 0 20px 40px -10px hsl(var(--primary) / 20);
        }

        .marquee-item--text {
          aspect-ratio: 3/1;
          width: clamp(8rem, 1rem + 20vmin, 18rem);
        }

        .marquee-item--image {
          background: hsl(0 0% 100% / 5);
        }

        .marquee--vertical .marquee-item {
          aspect-ratio: 1;
          width: clamp(5rem, 1rem + 10vmin, 9rem);
          padding: clamp(0.5rem, 1.5vmin, 1rem);
        }

        /* Toggle button */
        .marquee-toggle {
          position: relative;
          position: fixed;
          top: 1rem;
          left: 1rem;
          width: 2.5rem;
          height: 2.5rem;
          font: inherit;
          text-align: center;
          cursor: pointer;
          outline: none;
          border: none;
          border-radius: 50%;
          color: inherit;
          background: hsl(0 0% 100% / 10);
          backdrop-filter: blur(8px);
          z-index: 10;
          transition: background 300ms ease;
        }

        .marquee-toggle:hover {
          background: hsl(0 0% 100% / 20);
        }

        .marquee-toggle:focus-visible {
          box-shadow: 0 0 0 2px hsl(var(--primary));
        }

        .marquee-toggle svg {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 1.2rem;
          height: 1.2rem;
          fill: currentColor;
          transform: translate(-50%, -50%);
          transition: transform 300ms cubic-bezier(0.25, 1, 0.5, 1);
        }

        .marquee-toggle--vertical svg {
          transform: translate(-50%, -50%) rotate(-90deg);
        }
      `}</style>
    </section>
  );
}
