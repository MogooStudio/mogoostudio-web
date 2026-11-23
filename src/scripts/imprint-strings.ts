const spacing = 6;
const lifetime = 1850;
const damping = 3.0;
const neighborGain = [1, .58, .36, .20];
const diagonal = Math.SQRT1_2;
type Pluck = { along: number; strength: number; time: number };
type Sample = { normal: number; along: number; time: number; left: number; top: number };

function attachStrings(stage: HTMLElement, signal: AbortSignal) {
  const canvas = document.createElement('canvas');
  canvas.className = 'imprint-strings';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  stage.prepend(canvas);

  const plucks = new Map<number, Pluck>();
  let previous: Sample | undefined;
  let frame = 0;
  let size = 0;

  function settle() {
    cancelAnimationFrame(frame);
    frame = 0;
    plucks.clear();
    stage.classList.remove('is-ringing');
    previous = undefined;
  }

  const paint = (now: number) => {
    for (const [line, hit] of plucks) {
      if (now - hit.time >= lifetime) plucks.delete(line);
    }
    if (!plucks.size) {
      settle();
      return;
    }
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const pixels = Math.max(1, Math.round(size * ratio));
    if (canvas.width !== pixels || canvas.height !== pixels) canvas.width = canvas.height = pixels;
    ctx.setTransform(pixels / size, 0, 0, pixels / size, 0, 0);
    ctx.clearRect(0, 0, size, size);
    // Work in string coordinates: x crosses the grooves, y follows a groove.
    ctx.rotate(Math.PI / 4);
    const span = size * diagonal;
    for (let line = 0; line * spacing < 2 * span; line++) {
      const x = line * spacing + .5;
      const end = Math.min(x, 2 * span - x);
      const hit = plucks.get(line);
      ctx.beginPath();
      ctx.moveTo(x, -end);
      ctx.strokeStyle = 'rgba(216,212,185,.12)';
      if (hit) {
        const age = Math.max(0, now - hit.time) / 1000;
        const envelope = (1 - Math.exp(-age * 40)) * Math.exp(-age * damping);
        const intensity = envelope * Math.min(1, Math.abs(hit.strength) / 14);
        const reach = 130 + age * 80;
        const sheen = ctx.createLinearGradient(x, hit.along - reach, x, hit.along + reach);
        sheen.addColorStop(0, 'rgba(216,212,185,.12)');
        sheen.addColorStop(.5, `rgba(222,214,185,${.12 + intensity * .58})`);
        sheen.addColorStop(1, 'rgba(216,212,185,.12)');
        ctx.strokeStyle = sheen;
        for (let y = Math.max(-end, hit.along - reach); y < Math.min(end, hit.along + reach); y += 4) {
          const distance = Math.abs(y - hit.along);
          const falloff = Math.exp(-Math.pow((distance - age * 70) / 55, 2));
          const offset = hit.strength * envelope * falloff * Math.cos(age * 12 - distance * .025);
          ctx.lineTo(x + offset, y);
        }
      }
      ctx.lineTo(x, end);
      ctx.stroke();
    }
    stage.classList.add('is-ringing');
    frame = requestAnimationFrame(paint);
  }

  stage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || event.buttons || (event.target as Element).closest('.phone-shell, .carousel-arrow-icon')) {
      previous = undefined;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    size = rect.width - 2; // Exclude the one-pixel circular border.
    const x = event.clientX - rect.left - 1, y = event.clientY - rect.top - 1;
    const normal = (x + y) * diagonal, along = (y - x) * diagonal;
    const from = previous;
    const time = performance.now();
    previous = { normal, along, time, left: rect.left, top: rect.top };
    if (!from || from.left !== rect.left || from.top !== rect.top || size <= 0) return;
    const delta = normal - from.normal;
    if (!delta) return;
    const speed = Math.abs(delta) / Math.max(8, time - from.time);
    const strength = Math.sign(delta) * (11 + Math.min(speed, 1.8) * 7.4);
    const center = size * diagonal;
    // Interpolate crossings so a fast sweep still strikes each string in order.
    const first = Math.ceil((Math.min(normal, from.normal) - .5) / spacing);
    const last = Math.floor((Math.max(normal, from.normal) - .5) / spacing);
    for (let line = first; line <= last; line++) {
      const n = line * spacing + .5;
      const t = (n - from.normal) / delta;
      const at = from.along + (along - from.along) * t;
      if (Math.hypot(n - center, at) >= size / 2) continue;
      const struckAt = time - (1 - t) * Math.min(32, time - from.time);
      for (let offset = 1 - neighborGain.length; offset < neighborGain.length; offset++) {
        const distance = Math.abs(offset);
        const target = line + offset;
        const start = struckAt + distance * 36;
        const amplitude = strength * neighborGain[distance];
        if (Math.hypot(n + offset * spacing - center, at) >= size / 2) continue;
        // A sympathetic vibration should never interrupt a stronger, still-ringing strike.
        const current = plucks.get(target);
        if (distance && current) {
          const age = Math.max(0, start - current.time) / 1000;
          if (Math.abs(current.strength) * Math.exp(-age * damping) >= Math.abs(amplitude)) continue;
        }
        plucks.set(target, { along: at, strength: amplitude, time: start });
      }
    }
    if (plucks.size && !frame) frame = requestAnimationFrame(paint);
  }, { passive: true, signal });
  stage.addEventListener('pointerleave', () => { previous = undefined; }, { signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); }, { signal });
  signal.addEventListener('abort', () => { settle(); canvas.remove(); }, { once: true });
}

export function initializeImprintStrings() {
  const allowed = matchMedia('(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)');
  let controller: AbortController | undefined;
  function sync() {
    controller?.abort();
    if (!allowed.matches) return;
    controller = new AbortController();
    for (const stage of document.querySelectorAll<HTMLElement>('.catalog-art-imprint')) {
      attachStrings(stage, controller.signal);
    }
  }
  allowed.addEventListener('change', sync);
  sync();
}
