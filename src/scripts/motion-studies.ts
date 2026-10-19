/** Isolated study harness. Production homepages never import these experiments. */
import { installScrollExperiment } from './scroll-experiments';

type StudyMode = 'depth' | 'split' | 'stack' | 'static';
const directions = {
  depth: { name: '整卡推近', label: 'A / CARDS COME CLOSER', title: '卡片从远处推到眼前。', description: '整张产品卡由小变大、向上推近，带一点立体倾角。滚动多少，就推进多少；进入阅读位置后完全展开。', timing: '缩放 82% → 100% · 上移 96px', cost: '运动直接、连贯；回滚时会退回。' },
  split: { name: '图文对向入场', label: 'B / TWO SIDES MEET', title: '图片与文字，从两边汇合。', description: '图片从左侧移入，文字从右侧落位。两部分各自在进入视野时播放，手机上也能分别看到完整过程。', timing: '图片 140px / 文字 100px · 760ms', cost: '方向感最强；每次进场后保持静止。' },
  stack: { name: '叠卡交接', label: 'C / THE NEXT CARD TAKES OVER', title: '下一件作品，接过整个画面。', description: '当前卡片停留，下一张沿着滚动方向覆盖上来；前一张同时缩小退后，形成真实的层叠交接。', timing: '卡片接力覆盖 · 前层退至 92%', cost: '变化最大；浏览节奏也最强。' },
  static: { name: '静态基线', label: '0 / THE QUIET BASELINE', title: '什么也不加，先感受阅读。', description: '关闭产品入场动效，用于与所选方案比较。保留正常滚动、分类和弹窗交互。', timing: '无滚动动效', cost: '最直接，完全交给内容本身。' },
} as const;

export function initializeMotionStudies() {
  const frame = document.querySelector<HTMLIFrameElement>('#study-preview')!;
  const stage = document.querySelector<HTMLElement>('.preview-stage')!;
  const language = document.querySelector<HTMLSelectElement>('#study-language')!;
  const demo = document.querySelector<HTMLButtonElement>('[data-demo]')!;
  const status = document.querySelector<HTMLElement>('.preview-status')!;
  const modeButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-mode]')];
  let mode: StudyMode = 'depth';
  let disposeFrame: (() => void) | undefined;
  let demoFrame = 0;
  let playOnLoad = false;

  const route = () => language.value === 'en' ? '/' : `/${language.value}/`;
  function stopDemo() {
    const wasPlaying = demoFrame !== 0;
    cancelAnimationFrame(demoFrame);
    demoFrame = 0;
    demo.setAttribute('aria-pressed', 'false');
    demo.innerHTML = '<span aria-hidden="true">▶</span> 播放滚动演示';
    if (wasPlaying) status.textContent = '演示已暂停 · 可手动滚动继续浏览';
  }
  function reloadPreview(play = false) {
    stopDemo();
    playOnLoad = play;
    disposeFrame?.();
    disposeFrame = undefined;
    status.textContent = '正在载入首页…';
    frame.src = `${route()}?motion-study=${mode}`;
  }
  function selectMode(next: StudyMode, reload = true) {
    mode = next;
    const direction = directions[mode];
    modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    document.querySelector('[data-direction-label]')!.textContent = direction.label;
    document.querySelector('#direction-name')!.textContent = direction.title;
    document.querySelector('[data-direction-description]')!.textContent = direction.description;
    document.querySelector('[data-direction-timing]')!.textContent = direction.timing;
    document.querySelector('[data-direction-cost]')!.textContent = direction.cost;
    document.querySelector('[data-current-direction]')!.textContent = direction.name;
    const url = new URL(location.href);
    url.searchParams.set('mode', mode);
    history.replaceState(null, '', url);
    if (reload) reloadPreview();
  }

  function startDemo() {
    const win = frame.contentWindow!;
    const doc = frame.contentDocument!;
    if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      status.textContent = '系统已开启减少动态效果 · 请手动滚动预览';
      return;
    }
    const works = doc.querySelector<HTMLElement>('#works');
    const last = doc.querySelector<HTMLElement>('.studio-values');
    if (!works || !last) return;
    const start = Math.max(0, works.getBoundingClientRect().top + win.scrollY - win.innerHeight * 0.65);
    const end = last.getBoundingClientRect().top + win.scrollY - win.innerHeight * 0.32;
    win.scrollTo({ top: start, behavior: 'instant' });
    const started = performance.now();
    demo.setAttribute('aria-pressed', 'true');
    demo.innerHTML = '<span aria-hidden="true">Ⅱ</span> 暂停演示';
    status.textContent = '正在演示 · 手动滚动或打开弹窗会立即停止';
    const tick = (now: number) => {
      if (doc.querySelector('dialog[open]')) { stopDemo(); return; }
      const progress = Math.min(1, (now - started) / 14000);
      win.scrollTo({ top: start + (end - start) * progress, behavior: 'instant' });
      if (progress < 1) demoFrame = requestAnimationFrame(tick);
      else { stopDemo(); status.textContent = '演示结束 · 可回滚比较，或重播本方案'; }
    };
    demoFrame = requestAnimationFrame(tick);
  }

  function installFrame() {
    disposeFrame?.();
    const win = frame.contentWindow as Window & typeof globalThis;
    const doc = frame.contentDocument;
    if (!doc) return;
    const products = [...doc.querySelectorAll<HTMLElement>('.product')];
    if (!products.length) { status.textContent = '当前为内页 · 点击重播返回首页'; return; }
    const locale = doc.documentElement.lang.toLowerCase();
    language.value = locale === 'en' ? 'en' : locale === 'zh-tw' ? 'zh-tw' : 'zh-cn';
    if (!win.location.hash) win.scrollTo({ top: 0, behavior: 'instant' });
    const abort = new AbortController();
    const options = { signal: abort.signal };
    win.addEventListener('wheel', stopDemo, { ...options, passive: true });
    win.addEventListener('touchstart', stopDemo, { ...options, passive: true });
    win.addEventListener('keydown', stopDemo, options);
    win.addEventListener('pagehide', stopDemo, options);
    const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
    status.textContent = reduced.matches && mode !== 'static' ? '系统减少动态效果已生效 · 内容保持完整可读' : `${directions[mode].name} · 向下滚动感受这个方案`;
    let clearExperiment = () => {};
    const rebuildExperiment = () => {
      clearExperiment();
      clearExperiment = mode === 'static' || reduced.matches ? () => {} : installScrollExperiment(mode, win, doc);
    };
    reduced.addEventListener('change', () => {
      if (reduced.matches) {
        stopDemo();
        status.textContent = '系统减少动态效果已生效 · 内容保持完整可读';
      } else status.textContent = `${directions[mode].name} · 向下滚动感受这个方案`;
      rebuildExperiment();
    }, options);
    rebuildExperiment();

    disposeFrame = () => { stopDemo(); abort.abort(); clearExperiment(); };
    if (playOnLoad) { playOnLoad = false; startDemo(); }
  }

  modeButtons.forEach(button => button.addEventListener('click', () => selectMode(button.dataset.mode as StudyMode)));
  language.addEventListener('change', () => reloadPreview());
  document.querySelector('[data-replay]')!.addEventListener('click', () => reloadPreview());
  document.querySelectorAll<HTMLButtonElement>('button[data-device]').forEach(button => button.addEventListener('click', () => {
    stage.dataset.device = button.dataset.device;
    document.querySelectorAll<HTMLButtonElement>('button[data-device]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    reloadPreview();
  }));
  demo.addEventListener('click', () => { if (demoFrame) stopDemo(); else reloadPreview(true); });
  document.addEventListener('keydown', event => {
    if (event.target instanceof Element && event.target.matches('input,select,textarea')) return;
    const next = ({ '1': 'depth', '2': 'split', '3': 'stack', '0': 'static' } as Record<string, StudyMode>)[event.key];
    if (next) selectMode(next);
  });
  frame.addEventListener('load', installFrame);
  const requested = new URL(location.href).searchParams.get('mode');
  const initial = requested && (({ quiet: 'depth', guide: 'split', reveal: 'stack' } as Record<string, string>)[requested] || requested);
  if (initial && initial in directions) selectMode(initial as StudyMode);
  else if (frame.contentDocument?.readyState === 'complete' && frame.contentDocument.querySelector('.playground-home')) installFrame();
}
