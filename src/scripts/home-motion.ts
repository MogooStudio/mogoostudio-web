import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Scroll position owns the two main scenes; supporting reveals play only once. */
export function initializeHomeMotion() {
  const home = document.querySelector<HTMLElement>('.playground-home');
  if (!home) return;

  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  const hero = home.querySelector<HTMLElement>('.playground-hero')!;
  let canPin = hero.offsetHeight < window.innerHeight;
  let entered = false;
  const revealed = new WeakSet<Element>();
  let rebuildWorks = () => {};

  media.add({
    desktop: '(min-width: 768px)',
    narrow: '(max-width: 767px)',
    reduced: '(prefers-reduced-motion: reduce)',
  }, context => {
    // matchMedia reverts transforms and pins when this preference changes live.
    if (context.conditions?.reduced) return;
    const narrow = Boolean(context.conditions?.narrow);
    const headline = home.querySelector<HTMLElement>('.hero-headline-motion')!;
    const heroImage = home.querySelector<HTMLImageElement>('.hero-art img')!;
    const artwork = home.querySelector<HTMLElement>('.pinyiye-artwork')!;

    if (!entered) {
      entered = true;
      // Keep entry opacity separate from the scroll-owned headline transform.
      gsap.from('.hero-copy', { opacity: 0, duration: 0.55, ease: 'power2.out' });
    }

    const depth = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'home-depth',
        trigger: hero,
        start: 'top top',
        end: () => `+=${Math.min(hero.offsetHeight, window.innerHeight * 0.85)}`,
        // With no extra spacing, the real works section covers the receding scene.
        // Short viewports keep normal document flow so the hero remains readable.
        pin: canPin ? hero : false,
        pinSpacing: false,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    depth.to('.hero-art', {
      y: () => -hero.offsetHeight * (narrow ? 1.05 : 0.9),
      duration: 1,
    }, 0).to(heroImage, {
      scale: 0.82,
      transformOrigin: '50% 100%',
      duration: 1,
    }, 0).to(headline, {
      y: () => -window.innerHeight * (narrow ? 0.32 : 0.4),
      duration: 0.65,
    }, 0).to(['.hero-intro', '.explore-button'], {
      autoAlpha: 0,
      duration: 0.1,
    }, 0.03);

    // Filtering rebuilds only work scenes; the hero keeps its current pin/state.
    let worksContext: gsap.Context | undefined;
    const buildWorks = () => {
      worksContext?.revert();
      worksContext = gsap.context(() => {
        if (!artwork.closest<HTMLElement>('.product')!.hidden) {
          const paper = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              id: 'home-paper',
              trigger: '.product-pinyiye',
              start: 'top 90%',
              end: narrow ? 'top 12%' : 'center 42%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
          const spread = () => Math.min(narrow ? 18 : 40, artwork.offsetWidth * 0.08);
          paper.fromTo('.pinyiye-print-weekend', {
            x: () => -spread(), y: narrow ? 18 : 30, rotation: -16, scale: 0.9,
          }, { x: 0, y: 0, rotation: -10, scale: 1, duration: 1 }, 0)
            .fromTo('.pinyiye-print-sunshine', {
              x: spread, y: narrow ? 24 : 40, rotation: 16, scale: 0.9,
            }, { x: 0, y: 0, rotation: 10, scale: 1, duration: 1 }, 0)
            .fromTo('.pinyiye-phone', { y: narrow ? 20 : 32, scale: 0.94 }, {
              y: 0, scale: 1, duration: 1,
            }, 0);
        }

        // Reveals affect artwork rather than moving product copy while it is read.
        const reveal = (trigger: Element, play: () => void) => {
          if (revealed.has(trigger) || trigger.closest('[hidden]')) return;
          ScrollTrigger.create({
            trigger,
            start: 'top 88%',
            once: true,
            onEnter: () => {
              revealed.add(trigger);
              play();
            },
          });
        };
        const youcanup = home.querySelector('.youcanup-artwork')!;
        reveal(youcanup, () => {
          gsap.fromTo('.youcanup-screen-menu', { y: 32, rotation: -10 }, {
            y: 0, rotation: -6, duration: 0.65, ease: 'back.out(0.6)',
          });
          gsap.fromTo('.youcanup-screen-gameplay', { y: 42, rotation: 11 }, {
            y: 0, rotation: 7, duration: 0.65, delay: 0.06, ease: 'back.out(0.6)',
          });
        });
        home.querySelectorAll('.product-artwork').forEach(image => reveal(image, () => {
          gsap.fromTo(image, { clipPath: 'inset(0 0 14% 0)', scale: 1.06 }, {
            clipPath: 'inset(0)', scale: 1, duration: 0.7, ease: 'power3.out',
          });
        }));
        const values = home.querySelector('.values-row')!;
        reveal(values, () => {
          gsap.fromTo('.value-icon', { y: 16, scale: 0.9 }, {
            y: 0, scale: 1, duration: 0.45, stagger: 0.07, ease: 'back.out(0.8)',
          });
        });
      }, home);
    };
    rebuildWorks = buildWorks;
    buildWorks();
    return () => {
      worksContext?.revert();
      rebuildWorks = () => {};
    };
  }, home);

  // Astro images reserve their dimensions; lazy image loads do not need refreshes
  // that could interrupt a native smooth anchor scroll or an open gallery.
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>(resolve => {
    window.addEventListener('load', () => resolve(), { once: true });
  });
  void Promise.all([document.fonts.ready, loaded]).then(() => {
    ScrollTrigger.refresh();
    // Pin setup may run after the browser's initial fragment positioning.
    // Resolve the same real anchor again after fonts and measurements settle.
    let anchor: HTMLElement | null = null;
    try {
      anchor = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    } catch { /* A malformed fragment has no matching section. */ }
    if (anchor && home.contains(anchor)) {
      anchor.scrollIntoView({ behavior: 'instant', block: 'start' });
      ScrollTrigger.update();
    }
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) ScrollTrigger.refresh();
  });
  window.addEventListener('resize', () => {
    const nextCanPin = hero.offsetHeight < window.innerHeight;
    if (nextCanPin === canPin) return;
    canPin = nextCanPin;
    // Refreshing trigger measurements alone cannot add/remove an existing pin.
    const scrollPosition = window.scrollY;
    gsap.matchMediaRefresh();
    window.scrollTo({ top: scrollPosition, behavior: 'instant' });
    ScrollTrigger.update();
  });

  return {
    refreshWorks() {
      const scrollPosition = window.scrollY;
      rebuildWorks();
      ScrollTrigger.refresh();
      window.scrollTo({ top: scrollPosition, behavior: 'instant' });
      ScrollTrigger.update();
    },
  };
}
