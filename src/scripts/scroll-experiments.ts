/** Round two: deliberate, visible motion. Imported only by the study harness. */
import { installProductEntrance } from './product-entrance';

type StudyWindow = Window & typeof globalThis;
type MotionMode = 'depth' | 'split' | 'stack';
const clamp = (value: number) => Math.max(0, Math.min(1, value));

function preserveStyles(elements: HTMLElement[]) {
  const styles = elements.map(element => [element, element.getAttribute('style')] as const);
  return () => styles.forEach(([element, style]) => {
    if (style === null) element.removeAttribute('style'); else element.setAttribute('style', style);
    delete element.dataset.motionState;
    delete element.dataset.motionProgress;
  });
}

function onScroll(win: StudyWindow, root: HTMLElement, products: HTMLElement[], render: () => void) {
  const abort = new AbortController();
  let pending = 0;
  const schedule = () => { if (!pending) pending = win.requestAnimationFrame(() => { pending = 0; render(); }); };
  win.addEventListener('scroll', schedule, { passive: true, signal: abort.signal });
  win.addEventListener('resize', schedule, { signal: abort.signal });
  const resize = new win.ResizeObserver(schedule);
  resize.observe(root);
  const mutations = new win.MutationObserver(schedule);
  products.forEach(product => mutations.observe(product, { attributes: true, attributeFilter: ['hidden'] }));
  render();
  return () => { abort.abort(); resize.disconnect(); mutations.disconnect(); win.cancelAnimationFrame(pending); };
}

function installDepth(win: StudyWindow, doc: Document, products: HTMLElement[]) {
  const restore = preserveStyles(products);
  const slots = products.map(product => {
    const slot = doc.createElement('div');
    slot.className = 'study-motion-slot';
    slot.style.gridColumn = win.getComputedStyle(product).gridColumn;
    product.before(slot);
    slot.append(product);
    product.style.transformOrigin = '50% 100%';
    return slot;
  });
  const stop = onScroll(win, doc.querySelector<HTMLElement>('#work-results')!, products, () => {
    if (doc.querySelector('dialog[open]')) return;
    products.forEach((product, index) => {
      const slot = slots[index];
      slot.hidden = product.hidden;
      if (product.hidden) return;
      const progress = clamp((win.innerHeight * 0.98 - slot.getBoundingClientRect().top) / (win.innerHeight * 0.62));
      const ease = progress * progress * (3 - 2 * progress);
      const remaining = 1 - ease;
      const narrow = win.innerWidth < 768;
      product.style.transform = progress === 1 ? 'none' : `perspective(1100px) translate3d(0,${(narrow ? 72 : 96) * remaining}px,0) rotateX(${(narrow ? 8 : 12) * remaining}deg) scale(${1 - (narrow ? 0.15 : 0.18) * remaining})`;
      product.style.opacity = String(1 - 0.25 * remaining);
      product.dataset.motionProgress = progress.toFixed(3);
      product.dataset.motionState = progress === 1 ? 'settled' : 'moving';
    });
  });
  return () => { stop(); slots.forEach((slot, index) => { slot.before(products[index]); slot.remove(); }); restore(); };
}

type StackLayer = { marker: HTMLElement; layer: HTMLElement; face: HTMLElement; products: HTMLElement[] };
function installStack(win: StudyWindow, doc: Document, products: HTMLElement[]) {
  const root = doc.querySelector<HTMLElement>('#work-results')!;
  const restore = preserveStyles([root]);
  root.style.display = 'flow-root';
  root.style.isolation = 'isolate';
  let wide = win.innerWidth >= 768;
  let layers: StackLayer[] = [];
  function ungroup() {
    products.forEach(product => root.append(product));
    layers.forEach(({ marker, layer }) => { marker.remove(); layer.remove(); });
    layers = [];
  }
  function group() {
    ungroup();
    wide = win.innerWidth >= 768;
    const rows = wide ? [[products[0]], [products[1]], products.slice(2)] : products.map(product => [product]);
    rows.forEach(row => {
      const marker = doc.createElement('div');
      marker.className = 'study-stack-marker';
      marker.setAttribute('aria-hidden', 'true');
      const layer = doc.createElement('div');
      layer.className = 'study-stack-layer';
      const face = doc.createElement('div');
      face.className = 'study-stack-face';
      face.append(...row);
      layer.append(face);
      root.append(marker, layer);
      layers.push({ marker, layer, face, products: row });
    });
  }
  function render() {
    if ((win.innerWidth >= 768) !== wide) group();
    if (doc.querySelector('dialog[open]')) return;
    const visible = layers.filter(item => {
      item.layer.hidden = item.products.every(product => product.hidden);
      item.marker.hidden = item.layer.hidden;
      return !item.layer.hidden;
    });
    visible.forEach((item, index) => {
      item.layer.style.zIndex = String(index + 1);
      // Hold a readable card before the next layer starts covering its controls.
      item.layer.style.marginBottom = index === visible.length - 1 ? '0px' : `${Math.max(112, Math.min(360, win.innerHeight * 0.6))}px`;
      // Tall cards first scroll all the way into reading position, then stick.
      item.layer.style.top = `${Math.min(24 + index * 12, win.innerHeight - item.layer.offsetHeight - 24)}px`;
      const next = visible[index + 1];
      const progress = next ? clamp((win.innerHeight * 0.82 - next.layer.getBoundingClientRect().top) / (win.innerHeight * 0.64)) : 0;
      item.face.style.transform = `translate3d(0,${-18 * progress}px,0) scale(${1 - 0.08 * progress})`;
      item.face.dataset.motionProgress = progress.toFixed(3);
    });
  }
  group();
  const stop = onScroll(win, root, products, render);
  const productTarget = (hash: string) => {
    try { const target = doc.getElementById(decodeURIComponent(hash.slice(1))); return products.find(product => product === target || (target && product.contains(target))); }
    catch { return undefined; }
  };
  function positionProduct(product: HTMLElement, behavior: ScrollBehavior = 'instant') {
    render();
    const item = layers.find(layer => layer.products.includes(product));
    if (!item || product.hidden) return;
    win.scrollTo({ top: item.marker.getBoundingClientRect().top + win.scrollY - 24, behavior });
  }
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, win.location.href);
    if (url.origin !== win.location.origin || url.pathname !== win.location.pathname || url.search !== win.location.search) return;
    const product = productTarget(url.hash);
    if (!product) return;
    event.preventDefault();
    win.history.pushState(null, '', url);
    positionProduct(product, 'smooth');
  };
  const hash = () => { const product = productTarget(win.location.hash); if (product) positionProduct(product); };
  const focus = (event: FocusEvent) => {
    const product = products.find(item => item.contains(event.target as Node));
    if (!product) return;
    const index = layers.findIndex(item => item.products.includes(product));
    const current = layers[index];
    const next = layers.slice(index + 1).find(item => !item.layer.hidden);
    const target = event.target as HTMLElement;
    const bounds = target.getBoundingClientRect();
    const covered = current && next && next.layer.getBoundingClientRect().top < current.layer.getBoundingClientRect().bottom - 30;
    if (covered || bounds.top < 24 || bounds.bottom > win.innerHeight - 24) {
      positionProduct(product);
      render();
      // A tall mobile card cannot fit at its heading. Bring the focused control
      // into the safe viewport instead of stopping at the card's first pixel.
      const focused = target.getBoundingClientRect();
      const delta = focused.bottom > win.innerHeight - 24
        ? focused.bottom - (win.innerHeight - 24)
        : focused.top < 24 ? focused.top - 24 : 0;
      if (delta) { win.scrollBy({ top: delta, behavior: 'instant' }); render(); }
    }
  };
  doc.addEventListener('click', click);
  doc.addEventListener('focusin', focus);
  win.addEventListener('hashchange', hash);
  const anchorFrame = win.requestAnimationFrame(hash);
  return () => { stop(); win.cancelAnimationFrame(anchorFrame); doc.removeEventListener('click', click); doc.removeEventListener('focusin', focus); win.removeEventListener('hashchange', hash); ungroup(); restore(); };
}

export function installScrollExperiment(mode: MotionMode, win: StudyWindow, doc: Document) {
  const products = [...doc.querySelectorAll<HTMLElement>('.product')];
  const style = doc.createElement('style');
  style.textContent = `
    .study-motion-slot{min-width:0}
    .study-motion-slot[hidden],.study-stack-layer[hidden]{display:none!important}
    .study-stack-marker{height:0;display:flow-root}
    .study-stack-layer{position:sticky;margin-bottom:112px}
    .study-stack-layer:last-child{margin-bottom:0}
    .study-stack-face{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;transform-origin:50% 0;border-radius:22px;box-shadow:0 14px 32px #17231b14}
    @media(max-width:767px){.study-stack-face{grid-template-columns:1fr}.study-stack-layer{margin-bottom:80px}}
  `;
  doc.head.append(style);
  const dispose = mode === 'depth' ? installDepth(win, doc, products) : mode === 'split' ? installProductEntrance(win, doc) : installStack(win, doc, products);
  return () => { dispose(); style.remove(); };
}
