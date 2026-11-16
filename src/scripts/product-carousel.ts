/** Native horizontal scrolling keeps touch swipes and vertical page scrolling intact. */
export function initializeProductCarousels() {
  document.querySelectorAll<HTMLElement>('[data-product-carousel]').forEach(carousel => {
    const viewport = carousel.querySelector<HTMLElement>('.carousel-viewport')!;
    const slides = [...viewport.querySelectorAll<HTMLButtonElement>('.carousel-slide')];
    const controls = [...carousel.querySelectorAll<HTMLButtonElement>('[data-carousel-direction]')];
    const status = carousel.querySelector<HTMLElement>('.carousel-status')!;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let destination: number | undefined;
    let frame = 0;
    let pressedScrollLeft = 0;

    function update() {
      if (!viewport.clientWidth) return;
      current = Math.max(0, Math.min(slides.length - 1, Math.round(viewport.scrollLeft / viewport.clientWidth)));
      if (destination !== undefined && Math.abs(viewport.scrollLeft - slides[destination].offsetLeft) < 1) destination = undefined;
      const focusedSlide = slides.find(slide => slide === document.activeElement);
      if (focusedSlide && focusedSlide !== slides[current]) {
        slides[current].removeAttribute('aria-hidden');
        slides[current].focus({ preventScroll: true });
      }
      slides.forEach((slide, index) => {
        slide.tabIndex = index === current ? 0 : -1;
        if (index === current) slide.removeAttribute('aria-hidden');
        else slide.setAttribute('aria-hidden', 'true');
      });
      controls.forEach(control => {
        control.disabled = Number(control.dataset.carouselDirection) < 0 ? current === 0 : current === slides.length - 1;
      });
      status.textContent = `${current + 1} / ${slides.length}`;
    }

    function select(index: number, instant: boolean) {
      const target = Math.max(0, Math.min(slides.length - 1, index));
      destination = target;
      viewport.scrollTo({ left: slides[target].offsetLeft, behavior: instant || reducedMotion.matches ? 'instant' : 'smooth' });
      if (instant || reducedMotion.matches) update();
    }

    viewport.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }, { passive: true });
    controls.forEach(control => {
      control.hidden = false;
      control.addEventListener('click', event => select((destination ?? current) + Number(control.dataset.carouselDirection), event.detail === 0));
    });
    carousel.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const target = Math.max(0, Math.min(slides.length - 1, (destination ?? current) + (event.key === 'ArrowLeft' ? -1 : 1)));
      select(target, true);
      slides[target].focus({ preventScroll: true });
    });

    // A swipe must never also open the enlarged preview on release.
    viewport.addEventListener('pointerdown', () => { destination = undefined; pressedScrollLeft = viewport.scrollLeft; }, { passive: true });
    viewport.addEventListener('click', event => {
      if (event.detail !== 0 && Math.abs(viewport.scrollLeft - pressedScrollLeft) > 8) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
    new ResizeObserver(() => select(destination ?? current, true)).observe(viewport);
    update();
  });
}
