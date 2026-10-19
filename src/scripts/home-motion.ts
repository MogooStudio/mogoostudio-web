import { installProductEntrance } from './product-entrance';

export function initializeHomeMotion() {
  // The comparison page installs its selected experiment in this same homepage.
  if (window.frameElement?.id === 'study-preview' || new URLSearchParams(location.search).has('motion-study')) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let dispose: (() => void) | undefined;
  const synchronize = () => {
    dispose?.();
    dispose = reduced.matches ? undefined : installProductEntrance(window, document);
  };
  synchronize();
  reduced.addEventListener('change', synchronize);
  window.addEventListener('pagehide', () => {
    dispose?.();
    reduced.removeEventListener('change', synchronize);
  });
  // A restored page needs fresh observers after pagehide has cleaned up.
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      synchronize();
      reduced.addEventListener('change', synchronize);
    }
  });
}
