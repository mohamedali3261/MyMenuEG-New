import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useStore } from '../../../store/store';
import { resolveAssetUrl } from '../../../utils/assetUrl';

interface SlideData {
  id: string;
  place: string;
  title: string;
  title2: string;
  description: string;
  image: string;
  btn_link?: string;
  page_id?: string;
}

interface GsapSliderProps {
  slides: SlideData[];
}

export default function GsapSlider({ slides }: GsapSliderProps) {
  const { rtl, branding } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<number[]>([]);
  const detailsEvenRef = useRef(true);
  const clicksRef = useRef(0);
  const loopKillRef = useRef(false);
  const stepFnRef = useRef<((dir?: 'next' | 'prev') => Promise<void>) | null>(null);
  const intervalRef = useRef(5); // seconds, default 5
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cardWidth = 160;
  const cardHeight = 240;
  const gap = 30;
  const dotGap = 16; // gap between dots
  const ease = "sine.inOut";

  const q = (sel: string) => containerRef.current?.querySelector(sel);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAutoSlide = () => {
    clearTimer();
    if (intervalRef.current > 0 && slides.length > 1) {
      timerRef.current = setTimeout(() => {
        if (stepFnRef.current && !loopKillRef.current) {
          stepFnRef.current('next').then(() => startAutoSlide());
        }
      }, intervalRef.current * 1000);
    }
  };

  useEffect(() => {
    if (!containerRef.current || slides.length === 0) return;
    loopKillRef.current = false;
    orderRef.current = slides.map((_, i) => i);
    detailsEvenRef.current = true;

    const loadImages = async () => {
      const promises = slides.map(({ image }) => new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = resolveAssetUrl(image);
      }));
      await Promise.all(promises);
    };

    const init = () => {
      const c = containerRef.current!;
      const order = orderRef.current;
      const [active, ...rest] = order;
      const detailsActive = detailsEvenRef.current ? '[data-details="even"]' : '[data-details="odd"]';
      const detailsInactive = detailsEvenRef.current ? '[data-details="odd"]' : '[data-details="even"]';
      const { innerHeight: height, innerWidth: width } = window;
      const offsetTop = height - 350;
      const offsetLeft = (width - (cardWidth + gap) * rest.length) / 2;

      // Update active details text
      const da = q(detailsActive);
      if (da) {
        const placeEl = da.querySelector('.detail-text');
        const t1 = da.querySelector('.detail-title-1');
        const t2 = da.querySelector('.detail-title-2');
        const desc = da.querySelector('.detail-desc');
        if (placeEl) placeEl.textContent = slides[active].place;
        if (t1) t1.textContent = slides[active].title;
        if (t2) t2.textContent = slides[active].title2;
        if (desc) desc.textContent = slides[active].description;
      }

      gsap.set('[data-pagination]', { bottom: '40px', left: '50%', xPercent: -50, opacity: 0, zIndex: 100 });
      gsap.set('[data-card="' + active + '"]', { x: 0, y: 0, width, height, zIndex: 20, borderRadius: 0 });
      if (da) gsap.set(da, { opacity: 0, zIndex: 22, x: -200 });
      const diEl = q(detailsInactive);
      if (diEl) gsap.set(diEl, { opacity: 0, zIndex: 12 });

      // Reset inactive details text positions
      const dia = q(detailsInactive);
      if (dia) {
        const dt = dia.querySelector('.detail-text');
        const d1 = dia.querySelector('.detail-title-1');
        const d2 = dia.querySelector('.detail-title-2');
        const dd = dia.querySelector('.detail-desc');
        const dc = dia.querySelector('.detail-cta');
        if (dt) gsap.set(dt, { y: 100 });
        if (d1) gsap.set(d1, { y: 100 });
        if (d2) gsap.set(d2, { y: 100 });
        if (dd) gsap.set(dd, { y: 50 });
        if (dc) gsap.set(dc, { y: 60 });
      }

      rest.forEach((i: number, index: number) => {
        gsap.set(`[data-card="${i}"]`, {
          x: offsetLeft + 400 + index * (cardWidth + gap),
          y: offsetTop, width: cardWidth, height: cardHeight,
          zIndex: 30, borderRadius: 16,
        });
        gsap.set(`[data-slide-item="${i}"]`, { scale: 0.6, opacity: 0.3, backgroundColor: 'rgba(255,255,255,0.3)' });
      });
      gsap.set(`[data-slide-item="${active}"]`, { scale: 1.2, opacity: 1, backgroundColor: 'rgba(255,255,255,0.9)' });
      gsap.set('[data-indicator]', { x: -width });

      const startDelay = 0.6;

      gsap.to('[data-cover]', { x: width + 400, delay: 0.5, ease });

      rest.forEach((i: number, index: number) => {
        gsap.to(`[data-card="${i}"]`, { x: offsetLeft + index * (cardWidth + gap), zIndex: 30, ease, delay: startDelay });
      });
      gsap.to('[data-pagination]', { opacity: 1, xPercent: -50, ease, delay: startDelay });
      if (da) gsap.to(da, { opacity: 1, x: 0, ease, delay: startDelay });
    };

    const step = (dir: 'next' | 'prev' = 'next') => {
      return new Promise<void>((resolve) => {
        if (dir === 'prev') {
          const last = orderRef.current.pop()!;
          orderRef.current.unshift(last);
        } else {
          orderRef.current.push(orderRef.current.shift()!);
        }
        detailsEvenRef.current = !detailsEvenRef.current;

        const detailsActive = detailsEvenRef.current ? '[data-details="even"]' : '[data-details="odd"]';
        const detailsInactive = detailsEvenRef.current ? '[data-details="odd"]' : '[data-details="even"]';

        const da = q(detailsActive);
        const order = orderRef.current;
        const [active, ...rest] = order;
        const prv = rest[rest.length - 1];

        // Update active details text
        if (da) {
          const placeEl = da.querySelector('.detail-text');
          const t1 = da.querySelector('.detail-title-1');
          const t2 = da.querySelector('.detail-title-2');
          const desc = da.querySelector('.detail-desc');
          if (placeEl) placeEl.textContent = slides[active].place;
          if (t1) t1.textContent = slides[active].title;
          if (t2) t2.textContent = slides[active].title2;
          if (desc) desc.textContent = slides[active].description;
        }

        const daStep = q(detailsActive);
        if (daStep) {
          gsap.set(daStep, { zIndex: 22 });
          gsap.to(daStep, { opacity: 1, delay: 0.4, ease });
        }
        const dtStep = q(`${detailsActive} .detail-text`);
        const d1Step = q(`${detailsActive} .detail-title-1`);
        const d2Step = q(`${detailsActive} .detail-title-2`);
        const ddStep = q(`${detailsActive} .detail-desc`);
        const dcStep = q(`${detailsActive} .detail-cta`);
        if (dtStep) gsap.to(dtStep, { y: 0, delay: 0.1, duration: 0.7, ease });
        if (d1Step) gsap.to(d1Step, { y: 0, delay: 0.15, duration: 0.7, ease });
        if (d2Step) gsap.to(d2Step, { y: 0, delay: 0.15, duration: 0.7, ease });
        if (ddStep) gsap.to(ddStep, { y: 0, delay: 0.3, duration: 0.4, ease });
        if (dcStep) gsap.to(dcStep, { y: 0, delay: 0.35, duration: 0.4, onComplete: resolve, ease });

        const diStep = q(detailsInactive);
        if (diStep) gsap.set(diStep, { zIndex: 12 });

        const { innerHeight: height, innerWidth: width } = window;
        const offsetTop = height - 350;
        const offsetLeft = (width - (cardWidth + gap) * rest.length) / 2;

        gsap.set(`[data-card="${prv}"]`, { zIndex: 10 });
        gsap.set(`[data-card="${active}"]`, { zIndex: 20 });
        gsap.to(`[data-card="${prv}"]`, { scale: 1.5, ease });

        gsap.to(`[data-slide-item="${active}"]`, { scale: 1.2, opacity: 1, backgroundColor: 'rgba(255,255,255,0.9)', ease });
        gsap.to(`[data-slide-item="${prv}"]`, { scale: 0.6, opacity: 0.3, backgroundColor: 'rgba(255,255,255,0.3)', ease });

        gsap.to(`[data-card="${active}"]`, {
          x: 0, y: 0, ease, width, height, borderRadius: 0,
          onComplete: () => {
            const xNew = offsetLeft + (rest.length - 1) * (cardWidth + gap);
            gsap.set(`[data-card="${prv}"]`, { x: xNew, y: offsetTop, width: cardWidth, height: cardHeight, zIndex: 30, borderRadius: 16, scale: 1 });
            gsap.set(`[data-slide-item="${prv}"]`, { scale: 0.6, opacity: 0.3, backgroundColor: 'rgba(255,255,255,0.3)' });
            const diReset = q(detailsInactive);
            if (diReset) {
              gsap.set(diReset, { opacity: 0 });
              const dtR = diReset.querySelector('.detail-text');
              const d1R = diReset.querySelector('.detail-title-1');
              const d2R = diReset.querySelector('.detail-title-2');
              const ddR = diReset.querySelector('.detail-desc');
              const dcR = diReset.querySelector('.detail-cta');
              if (dtR) gsap.set(dtR, { y: 100 });
              if (d1R) gsap.set(d1R, { y: 100 });
              if (d2R) gsap.set(d2R, { y: 100 });
              if (ddR) gsap.set(ddR, { y: 50 });
              if (dcR) gsap.set(dcR, { y: 60 });
            }
            clicksRef.current -= 1;
            if (clicksRef.current > 0) {
              step();
            }
          },
        });

        rest.forEach((i: number, index: number) => {
          if (i !== prv) {
            const xNew = offsetLeft + index * (cardWidth + gap);
            gsap.set(`[data-card="${i}"]`, { zIndex: 30 });
            gsap.to(`[data-card="${i}"]`, { x: xNew, y: offsetTop, width: cardWidth, height: cardHeight, ease, delay: 0.1 * (index + 1) });
            gsap.to(`[data-slide-item="${i}"]`, { scale: 0.6, opacity: 0.3, backgroundColor: 'rgba(255,255,255,0.3)', ease });
          }
        });
      });
    };

    stepFnRef.current = step;

    // Fetch interval and init
    import('../../../api').then(({ api }) => {
      api.get('/settings').then(res => {
        intervalRef.current = res.data.gsapSliderInterval ?? 5;
        loadImages().then(() => {
          init();
          startAutoSlide();
        }).catch(console.error);
      }).catch(() => {
        loadImages().then(() => init()).catch(console.error);
      });
    });

    // Listen for admin control events
    const handleAdminNext = () => {
      clearTimer();
      if (stepFnRef.current && slides.length > 1) {
        clicksRef.current++;
        stepFnRef.current('next').then(() => startAutoSlide());
      }
    };
    const handleAdminPrev = () => {
      clearTimer();
      if (stepFnRef.current && slides.length > 1) {
        clicksRef.current++;
        stepFnRef.current('prev').then(() => startAutoSlide());
      }
    };
    const handleAdminGoTo = (e: Event) => {
      clearTimer();
      const idx = (e as CustomEvent).detail?.index;
      if (typeof idx === 'number' && stepFnRef.current) {
        const current = orderRef.current[0];
        const diff = idx - current;
        const runSteps = async () => {
          if (diff > 0) {
            for (let i = 0; i < diff; i++) await stepFnRef.current!('next');
          } else if (diff < 0) {
            for (let i = 0; i < Math.abs(diff); i++) await stepFnRef.current!('prev');
          }
          startAutoSlide();
        };
        runSteps();
      }
    };
    window.addEventListener('gsap-slider-next', handleAdminNext);
    window.addEventListener('gsap-slider-prev', handleAdminPrev);
    window.addEventListener('gsap-slider-go-to', handleAdminGoTo as EventListener);

    return () => {
      loopKillRef.current = true;
      clearTimer();
      stepFnRef.current = null;
      gsap.killTweensOf('*');
      window.removeEventListener('gsap-slider-next', handleAdminNext);
      window.removeEventListener('gsap-slider-prev', handleAdminPrev);
      window.removeEventListener('gsap-slider-go-to', handleAdminGoTo as EventListener);
    };
  }, [slides]);

  if (slides.length === 0) return null;

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#1a1a1a]" style={{ color: '#FFFFFFDD', fontFamily: 'Inter, sans-serif' }}>
      {/* Indicator */}
      <div data-indicator className="fixed left-0 right-0 top-0 h-[5px] z-[60] bg-primary-500" />

      {/* Cover */}
      <div data-cover className="absolute left-0 top-0 w-screen h-screen bg-transparent z-[100]" />

      {/* Cards */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          data-card={index}
          className="absolute left-0 top-0 bg-cover bg-center cursor-pointer"
          style={{ backgroundImage: `url(${resolveAssetUrl(slide.image)})`, boxShadow: '8px 8px 20px 4px rgba(0,0,0,0.5)' }}
          onClick={() => {
            if (stepFnRef.current) {
              clearTimer();
              const current = orderRef.current[0];
              const diff = index - current;
              const runSteps = async () => {
                if (diff > 0) {
                  for (let i = 0; i < diff; i++) await stepFnRef.current!('next');
                } else if (diff < 0) {
                  for (let i = 0; i < Math.abs(diff); i++) await stepFnRef.current!('prev');
                }
                startAutoSlide();
              };
              runSteps();
            }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ))}

      {/* Details Even - Split Layout */}
      <div data-details="even" className="absolute top-[240px] left-0 right-0 z-[22] px-[60px] flex justify-between items-start">
        {/* Left Side - Place & Titles */}
        <div className="max-w-[600px]">
          <div className="h-[60px] overflow-hidden">
            <div className="detail-text pt-4 text-[24px] text-white/95 relative font-semibold tracking-wider">
              <span className="absolute top-0 left-0 w-[40px] h-[4px] rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />
              {slides[0]?.place}
            </div>
          </div>
          <div className="h-[120px] overflow-hidden mt-[4px]">
            <div className="detail-title-1 font-bold text-[88px] leading-tight bg-gradient-to-r from-white via-white/95 to-white/70 bg-clip-text text-transparent drop-shadow-3xl" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {slides[0]?.title}
            </div>
          </div>
          <div className="h-[120px] overflow-hidden mt-[4px]">
            <div className="detail-title-2 font-bold text-[88px] leading-tight bg-gradient-to-r from-primary-300 via-white to-white/70 bg-clip-text text-transparent drop-shadow-3xl" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {slides[0]?.title2}
            </div>
          </div>
        </div>
        {/* Right Side - Description & CTA */}
        <div className="max-w-[450px] pt-[180px]">
          <div className="detail-desc text-white/80 text-base leading-relaxed text-right backdrop-blur-md bg-black/20 p-4 rounded-2xl border border-white/10">
            {slides[0]?.description}
          </div>
          <div className="detail-cta mt-8 flex items-center justify-end gap-4">
            <a
              href={slides[0]?.page_id ? `/page/${slides[0]?.page_id}` : slides[0]?.btn_link || '#'}
              className="detail-discover-btn h-12 px-8 text-sm font-semibold uppercase inline-flex items-center gap-3 rounded-full text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
              style={{
                background: branding.blendColors
                  ? `linear-gradient(135deg, rgb(var(--primary-500-rgb)) 0%, rgb(var(--primary-600-rgb)) 50%, rgb(var(--accent-500-rgb)) 100%)`
                  : `linear-gradient(135deg, rgb(var(--primary-500-rgb)) 0%, rgb(var(--primary-600-rgb)) 100%)`,
                boxShadow: `0 10px 40px -10px rgb(var(--primary-500-rgb) / 0.5), 0 4px 12px rgb(var(--primary-600-rgb) / 0.3)`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = branding.blendColors
                  ? `linear-gradient(135deg, rgb(var(--primary-400-rgb)) 0%, rgb(var(--primary-500-rgb)) 50%, rgb(var(--accent-400-rgb)) 100%)`
                  : `linear-gradient(135deg, rgb(var(--primary-400-rgb)) 0%, rgb(var(--primary-500-rgb)) 100%)`;
                e.currentTarget.style.boxShadow = `0 20px 50px -10px rgb(var(--primary-500-rgb) / 0.6), 0 8px 20px rgb(var(--primary-600-rgb) / 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = branding.blendColors
                  ? `linear-gradient(135deg, rgb(var(--primary-500-rgb)) 0%, rgb(var(--primary-600-rgb)) 50%, rgb(var(--accent-500-rgb)) 100%)`
                  : `linear-gradient(135deg, rgb(var(--primary-500-rgb)) 0%, rgb(var(--primary-600-rgb)) 100%)`;
                e.currentTarget.style.boxShadow = `0 10px 40px -10px rgb(var(--primary-500-rgb) / 0.5), 0 4px 12px rgb(var(--primary-600-rgb) / 0.3)`;
              }}
            >
              <span>{rtl ? 'اكتشف المكان' : 'Discover Location'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Details Odd - Split Layout */}
      <div data-details="odd" className="absolute top-[240px] left-0 right-0 z-[12] px-[60px] flex justify-between items-start opacity-0">
        {/* Left Side - Place & Titles */}
        <div className="max-w-[600px]">
          <div className="h-[60px] overflow-hidden">
            <div className="detail-text pt-4 text-[24px] text-white/95 relative font-semibold tracking-wider">
              <span className="absolute top-0 left-0 w-[40px] h-[4px] rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />
            </div>
          </div>
          <div className="h-[120px] overflow-hidden mt-[4px]">
            <div className="detail-title-1 font-bold text-[88px] leading-tight bg-gradient-to-r from-white via-white/95 to-white/70 bg-clip-text text-transparent drop-shadow-3xl" style={{ fontFamily: 'Oswald, sans-serif' }} />
          </div>
          <div className="h-[120px] overflow-hidden mt-[4px]">
            <div className="detail-title-2 font-bold text-[88px] leading-tight bg-gradient-to-r from-primary-300 via-white to-white/70 bg-clip-text text-transparent drop-shadow-3xl" style={{ fontFamily: 'Oswald, sans-serif' }} />
          </div>
        </div>
        {/* Right Side - Description & CTA */}
        <div className="max-w-[450px] pt-[180px]">
          <div className="detail-desc text-white/80 text-base leading-relaxed text-right backdrop-blur-md bg-black/20 p-4 rounded-2xl border border-white/10" />
          <div className="detail-cta mt-8 flex items-center justify-end gap-4">
            <a
              href="#"
              className="detail-discover-btn h-12 px-8 text-sm font-semibold uppercase inline-flex items-center gap-3 rounded-full text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
              style={{
                background: branding.blendColors
                  ? `linear-gradient(135deg, rgb(var(--primary-500-rgb)) 0%, rgb(var(--primary-600-rgb)) 50%, rgb(var(--accent-500-rgb)) 100%)`
                  : `linear-gradient(135deg, rgb(var(--primary-500-rgb)) 0%, rgb(var(--primary-600-rgb)) 100%)`,
                boxShadow: `0 10px 40px -10px rgb(var(--primary-500-rgb) / 0.5), 0 4px 12px rgb(var(--primary-600-rgb) / 0.3)`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = branding.blendColors
                  ? `linear-gradient(135deg, rgb(var(--primary-400-rgb)) 0%, rgb(var(--primary-500-rgb)) 50%, rgb(var(--accent-400-rgb)) 100%)`
                  : `linear-gradient(135deg, rgb(var(--primary-400-rgb)) 0%, rgb(var(--primary-500-rgb)) 100%)`;
                e.currentTarget.style.boxShadow = `0 20px 50px -10px rgb(var(--primary-500-rgb) / 0.6), 0 8px 20px rgb(var(--primary-600-rgb) / 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = branding.blendColors
                  ? `linear-gradient(135deg, rgb(var(--primary-500-rgb)) 0%, rgb(var(--primary-600-rgb)) 50%, rgb(var(--accent-500-rgb)) 100%)`
                  : `linear-gradient(135deg, rgb(var(--primary-500-rgb)) 0%, rgb(var(--primary-600-rgb)) 100%)`;
                e.currentTarget.style.boxShadow = `0 10px 40px -10px rgb(var(--primary-500-rgb) / 0.5), 0 4px 12px rgb(var(--primary-600-rgb) / 0.3)`;
              }}
            >
              <span>{rtl ? 'اكتشف المكان' : 'Discover Location'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div data-pagination className="absolute flex items-center justify-center gap-2 px-6">
        {/* Slide Progress Bars */}
        {slides.map((_, index) => (
          <button
            key={index}
            data-slide-item={index}
            onClick={() => {
              if (stepFnRef.current) {
                clearTimer();
                const current = orderRef.current[0];
                const diff = index - current;
                const runSteps = async () => {
                  if (diff > 0) {
                    for (let i = 0; i < diff; i++) await stepFnRef.current!('next');
                  } else if (diff < 0) {
                    for (let i = 0; i < Math.abs(diff); i++) await stepFnRef.current!('prev');
                  }
                  startAutoSlide();
                };
                runSteps();
              }
            }}
            className="w-8 h-[3px] rounded-full bg-white/30 transition-all duration-300 hover:bg-white/50 cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
}
