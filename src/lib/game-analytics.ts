type Capture = (event: string, properties: Record<string, string | number>) => void;

const gameNames: Record<string, string> = {
  'minimalist-breakout': 'Minimalist Breakout',
  'flappy-ball': 'Flappy Ball Hop',
};

export function installGameTracking(capture: Capture, root: Document = document) {
  const properties = (gameId: string) => ({
    game_id: gameId,
    game_name: gameNames[gameId] ?? gameId,
    language: root.documentElement.lang,
    page_path: root.location.pathname,
  });

  const onClick = (event: MouseEvent) => {
    if (event.type === 'auxclick' ? event.button !== 1 : event.button > 1) return;
    const target = event.target as Element | null;
    const element = target?.closest?.<HTMLElement>('[data-analytics-event]');
    const gameId = element?.dataset.gameId;
    const eventName = element?.dataset.analyticsEvent;
    if (!element || !gameId || !gameNames[gameId]) return;
    if (eventName !== 'app_store_click' && eventName !== 'game_interest') return;
    const data: Record<string, string | number> = {
      ...properties(gameId),
      placement: element.dataset.placement ?? 'game_card',
    };
    if (eventName === 'app_store_click') {
      const href = element.getAttribute('href') ?? '';
      let url: URL;
      try { url = new URL(href); } catch { return; }
      if (url.protocol !== 'https:' || url.hostname !== 'apps.apple.com') return;
      data.destination_url = url.origin + url.pathname;
    }
    if (element.dataset.screenshotIndex) data.screenshot_index = Number(element.dataset.screenshotIndex);
    capture(eventName, data);
  };
  root.addEventListener('click', onClick);
  root.addEventListener('auxclick', onClick);

  if (typeof IntersectionObserver === 'undefined') return;
  const seen = new Set<Element>();
  const visible = new Set<HTMLElement>();
  const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
  const cancel = (element: HTMLElement) => {
    clearTimeout(timers.get(element));
    timers.delete(element);
  };
  const start = (element: HTMLElement) => {
    if (root.hidden || seen.has(element) || timers.has(element)) return;
    timers.set(element, setTimeout(() => {
      timers.delete(element);
      if (root.hidden || !visible.has(element)) return;
      const gameId = element.dataset.gameId;
      if (gameId && gameNames[gameId]) {
        capture('game_view', { ...properties(gameId), visible_ms: 1000 });
        seen.add(element);
        visible.delete(element);
        observer.unobserve(element);
      }
    }, 1000));
  };
  // 观察标题，避免移动端整个游戏区块高于视口而永远达不到曝光阈值。
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const element = entry.target as HTMLElement;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        visible.add(element);
        start(element);
      } else {
        visible.delete(element);
        cancel(element);
      }
    });
  }, { threshold: 0.5, rootMargin: '-80px 0px 0px 0px' });
  root.querySelectorAll<HTMLElement>('[data-game-view]').forEach((element) => observer.observe(element));
  root.addEventListener('visibilitychange', () => {
    visible.forEach((element) => root.hidden ? cancel(element) : start(element));
  });
}
