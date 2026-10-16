/** Native filter buttons progressively enhance the complete, readable product list. */
export function initializeWorkCategories(refreshMotion: () => void) {
  const nav = document.querySelector<HTMLElement>('.work-categories');
  const results = document.querySelector<HTMLElement>('#work-results');
  if (!nav || !results) return;

  const buttons = [...nav.querySelectorAll<HTMLButtonElement>('[data-work-filter]')];
  const products = [...results.querySelectorAll<HTMLElement>('[data-work-category]')];
  const activeLayer = nav.querySelector<HTMLElement>('.work-categories-active')!;
  const status = document.querySelector<HTMLElement>('.work-filter-status')!;
  let selected = 'all';
  let fade: Animation | undefined;

  nav.querySelectorAll<HTMLElement>('[data-category-count]').forEach(count => {
    count.textContent = String(products.filter(product => count.dataset.categoryCount === 'all'
      || product.dataset.workCategory === count.dataset.categoryCount).length);
  });

  function positionIndicator(instant: boolean) {
    nav!.toggleAttribute('data-instant', instant);
    const button = buttons.find(item => item.dataset.workFilter === selected)!;
    const left = button.offsetLeft - activeLayer.offsetLeft;
    const right = activeLayer.offsetWidth - left - button.offsetWidth;
    activeLayer.style.clipPath = `inset(0 ${right}px 0 ${left}px round 99px)`;
  }

  function select(category: string, instant: boolean) {
    if (selected === category) return;
    selected = category;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.workFilter === selected)));
    positionIndicator(instant);
    fade?.cancel();
    products.forEach(product => { product.hidden = selected !== 'all' && product.dataset.workCategory !== selected; });
    refreshMotion();
    status.textContent = status.dataset.resultMessage!.replace('{count}', String(products.filter(product => !product.hidden).length));
    if (!instant && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fade = results!.animate([{ opacity: 0.65 }, { opacity: 1 }], { duration: 180, easing: 'cubic-bezier(.23,1,.32,1)' });
    }
  }

  buttons.forEach(button => button.addEventListener('click', event => {
    select(button.dataset.workFilter!, event.detail === 0);
  }));

  function productFromHash(hash: string) {
    try {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      return products.find(product => product === target || (target && product.contains(target)));
    } catch { return undefined; }
  }

  // Reveal a hidden destination before native anchor navigation measures it.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
    if (productFromHash(url.hash)?.hidden) select('all', true);
  });
  window.addEventListener('hashchange', () => {
    const product = productFromHash(location.hash);
    if (!product?.hidden) return;
    select('all', true);
    product.scrollIntoView({ behavior: 'instant', block: 'start' });
  });

  nav.hidden = false;
  positionIndicator(true);
  new ResizeObserver(() => positionIndicator(true)).observe(nav);
  void document.fonts.ready.then(() => positionIndicator(true));
  refreshMotion();
}
