/** Shared implementation of the selected image/text entrance, used by home and its preview. */
type MotionWindow = Window & typeof globalThis;

export function installProductEntrance(win: MotionWindow, doc: Document) {
  const products = [...doc.querySelectorAll<HTMLElement>('.product')];
  const targets = products.flatMap(product => [
    product.querySelector<HTMLElement>(':scope > button'),
    product.querySelector<HTMLElement>('.product-info'),
  ].filter((target): target is HTMLElement => target !== null));
  const originalStyles = [...products, ...targets].map(element => [element, element.getAttribute('style')] as const);
  const played = new WeakSet<HTMLElement>();
  const inView = new WeakSet<HTMLElement>();
  const imagesReady = new WeakSet<HTMLElement>();
  const loading = new WeakSet<HTMLElement>();
  const animations = new Map<HTMLElement, Animation>();
  let disposed = false;

  products.forEach(product => { product.style.overflow = 'hidden'; });
  const pose = (target: HTMLElement) => target.tagName === 'BUTTON'
    ? `translate3d(${win.innerWidth < 768 ? -90 : -140}px,32px,0) rotate(-4deg)`
    : `translate3d(${win.innerWidth < 768 ? 72 : 100}px,20px,0)`;
  const settle = (target: HTMLElement) => {
    target.style.removeProperty('transform');
    target.style.removeProperty('opacity');
    target.dataset.motionState = 'settled';
  };
  const play = (target: HTMLElement) => {
    if (disposed || played.has(target) || !inView.has(target) || target.closest<HTMLElement>('.product')?.hidden) return;
    if (target.tagName === 'BUTTON' && !imagesReady.has(target)) {
      if (loading.has(target)) return;
      loading.add(target);
      // Lazy pictures must be visible when their entrance plays, even on a cold load.
      void Promise.allSettled([...target.querySelectorAll('img')].map(img => img.decode())).then(() => {
        imagesReady.add(target);
        loading.delete(target);
        play(target);
      });
      return;
    }
    played.add(target);
    observer.unobserve(target);
    target.dataset.motionState = 'playing';
    const animation = target.animate([
      { transform: pose(target), opacity: 0.45 },
      { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
    ], { duration: 760, easing: 'cubic-bezier(.23,1,.32,1)' });
    animations.set(target, animation);
    void animation.finished.then(() => {
      if (!disposed) settle(target);
      animations.delete(target);
    }).catch(() => {});
  };
  const observer = new win.IntersectionObserver(entries => {
    entries.forEach(entry => {
      const target = entry.target as HTMLElement;
      if (entry.isIntersecting) { inView.add(target); play(target); }
      else inView.delete(target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach(target => {
    target.style.transform = pose(target);
    target.style.opacity = '0.45';
    target.dataset.motionState = 'waiting';
    observer.observe(target);
  });
  const resize = () => {
    targets.filter(target => !played.has(target)).forEach(target => { target.style.transform = pose(target); });
  };
  const focus = (event: FocusEvent) => {
    const target = targets.find(item => item.contains(event.target as Node));
    if (!target) return;
    played.add(target);
    observer.unobserve(target);
    animations.get(target)?.finish();
    settle(target);
  };
  doc.addEventListener('focusin', focus);
  win.addEventListener('resize', resize);
  return () => {
    disposed = true;
    observer.disconnect();
    doc.removeEventListener('focusin', focus);
    win.removeEventListener('resize', resize);
    animations.forEach(animation => animation.cancel());
    originalStyles.forEach(([element, style]) => {
      if (style === null) element.removeAttribute('style'); else element.setAttribute('style', style);
      delete element.dataset.motionState;
    });
  };
}
