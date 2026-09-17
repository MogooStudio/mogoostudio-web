import assert from 'node:assert/strict';
import { test } from 'node:test';
import { installGameTracking } from '../src/lib/game-analytics.ts';

test('有效商店链接支持子元素与中键点击，忽略占位和右键，不拦截导航', () => {
  const listeners = {};
  const events = [];
  const root = {
    documentElement: { lang: 'zh-CN' },
    location: { pathname: '/zh-cn/' },
    addEventListener: (name, handler) => { listeners[name] = handler; },
    querySelectorAll: () => [],
  };
  installGameTracking((...args) => events.push(args), root);
  const link = {
    dataset: { analyticsEvent: 'app_store_click', gameId: 'minimalist-breakout', placement: 'game_card' },
    getAttribute: () => 'https://apps.apple.com/us/app/minimalist-breakout/id6776583255',
  };
  const target = { closest: () => link };
  listeners.click({ type: 'click', target, button: 0 });
  listeners.auxclick({ type: 'auxclick', target, button: 1 });
  listeners.auxclick({ type: 'auxclick', target, button: 2 });
  link.getAttribute = () => '#';
  listeners.click({ target, button: 0 });
  assert.equal(events.length, 2);
  assert.equal(events[0][0], 'app_store_click');
  assert.equal(events[0][1].game_id, 'minimalist-breakout');
  assert.equal(events[0][1].language, 'zh-CN');
  assert.equal(events[0][1].page_path, '/zh-cn/');
});

test('曝光需要连续可见一秒，快速滚过不计数，重复进入只计一次', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let notify;
  class Observer {
    constructor(callback) { notify = callback; }
    observe() {}
    unobserve() {}
  }
  const previous = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = Observer;
  t.after(() => { globalThis.IntersectionObserver = previous; });
  const events = [];
  const target = { dataset: { gameId: 'flappy-ball' } };
  const handlers = {};
  const root = {
    hidden: false,
    documentElement: { lang: 'en' },
    location: { pathname: '/' },
    addEventListener: (name, handler) => { handlers[name] = handler; },
    querySelectorAll: () => [target],
  };
  installGameTracking((...args) => events.push(args), root);
  const enter = () => notify([{ target, isIntersecting: true, intersectionRatio: 1 }]);
  const leave = () => notify([{ target, isIntersecting: false, intersectionRatio: 0 }]);
  enter();
  t.mock.timers.tick(500);
  leave();
  t.mock.timers.tick(1000);
  assert.equal(events.length, 0);
  enter();
  root.hidden = true;
  handlers.visibilitychange();
  t.mock.timers.tick(1000);
  assert.equal(events.length, 0);
  root.hidden = false;
  handlers.visibilitychange();
  t.mock.timers.tick(1000);
  assert.equal(events.length, 1);
  assert.equal(events[0][0], 'game_view');
  assert.equal(events[0][1].game_id, 'flappy-ball');
  leave();
  enter();
  t.mock.timers.tick(1000);
  assert.equal(events.length, 1);
});
