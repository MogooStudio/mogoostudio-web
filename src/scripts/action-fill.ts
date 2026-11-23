export function initializeActionFills() {
  const motion = matchMedia('(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)');
  for (const button of document.querySelectorAll<HTMLElement>('.gallery-action')) {
    const fill = document.createElement('span');
    fill.className = 'action-fill';
    fill.setAttribute('aria-hidden', 'true');
    button.append(fill);
    let animation: Animation | undefined;

    function reset() {
      animation?.cancel();
      animation = undefined;
      fill.style.removeProperty('clip-path');
      button.removeAttribute('data-pointer-fill');
    }

    function flow(event: PointerEvent, entering: boolean) {
      if (!motion.matches || event.pointerType !== 'mouse') {
        reset();
        return;
      }
      const bounds = button.getBoundingClientRect();
      const percent = (offset: number, size: number) => 100 * Math.max(0, Math.min(1, offset / size));
      const x = percent(event.clientX - bounds.left, bounds.width);
      const y = percent(event.clientY - bounds.top, bounds.height);
      const circle = (full: boolean) => `circle(${full ? 145 : 0}% at ${x}% ${y}%)`;
      // On a quick reversal, continue from the visible front of the fill.
      const start = animation?.playState === 'running' ? getComputedStyle(fill).clipPath : circle(!entering);
      animation?.cancel();
      const end = circle(entering);
      button.setAttribute('data-pointer-fill', '');
      fill.style.clipPath = end;
      animation = fill.animate([{ clipPath: start }, { clipPath: end }], {
        duration: entering ? 660 : 530,
        easing: entering ? 'cubic-bezier(.32,.05,.22,1)' : 'cubic-bezier(.45,.02,.28,1)',
      });
    }

    button.addEventListener('pointerenter', event => flow(event, true));
    button.addEventListener('pointerleave', event => {
      if (button.hasAttribute('data-pointer-fill')) flow(event, false);
    });
    button.addEventListener('pointercancel', reset);
    window.addEventListener('blur', reset);
    motion.addEventListener('change', reset);
  }
}
