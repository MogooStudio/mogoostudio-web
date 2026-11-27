export function initializeScreenshotZoom(dialog: HTMLDialogElement) {
  const viewport = dialog.querySelector<HTMLElement>('.work-preview-viewport')!;
  const image = viewport.querySelector('img')!;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function render(x: number, y: number) {
    const bounds = viewport.getBoundingClientRect();
    const limitX = Math.max(0, (image.offsetWidth * scale - bounds.width) / 2);
    const limitY = Math.max(0, (image.offsetHeight * scale - bounds.height) / 2);
    offsetX = Math.max(-limitX, Math.min(limitX, x));
    offsetY = Math.max(-limitY, Math.min(limitY, y));
    image.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    viewport.toggleAttribute('data-zoomed', scale > 1);
  }

  dialog.addEventListener('wheel', event => {
    event.preventDefault();
    const bounds = viewport.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    let delta = event.deltaY;
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 16;
    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= bounds.height;
    const next = Math.max(1, Math.min(6, scale * Math.exp(-delta * 0.002)));
    if (next === scale) return;

    // Keep the image point beneath the cursor stationary as its scale changes.
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    const ratio = next / scale;
    scale = next;
    render(x - (x - offsetX) * ratio, y - (y - offsetY) * ratio);
  }, { passive: false });

  let lastX = 0;
  let lastY = 0;
  viewport.addEventListener('pointerdown', event => {
    if (scale === 1 || !event.isPrimary || event.button !== 0) return;
    viewport.setPointerCapture(event.pointerId);
    lastX = event.clientX;
    lastY = event.clientY;
  });
  viewport.addEventListener('pointermove', event => {
    if (!viewport.hasPointerCapture(event.pointerId) || scale === 1) return;
    render(offsetX + event.clientX - lastX, offsetY + event.clientY - lastY);
    lastX = event.clientX;
    lastY = event.clientY;
  });

  new ResizeObserver(() => render(offsetX, offsetY)).observe(viewport);
  dialog.addEventListener('close', () => {
    scale = 1;
    render(0, 0);
  });
}
