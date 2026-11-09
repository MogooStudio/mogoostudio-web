import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Read the actual TypeScript dictionaries without depending on Node's TS support.
const modules = new Map();
function loadTranslations(filename) {
  const path = resolve(filename);
  if (modules.has(path)) return modules.get(path);
  const module = { exports: {} };
  modules.set(path, module.exports);
  const { outputText } = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  runInNewContext(outputText, {
    exports: module.exports,
    require: name => loadTranslations(resolve(dirname(path), `${name}.ts`)),
  }, { filename: path });
  return module.exports;
}

const { languages, localeMetadata } = loadTranslations('src/i18n/locales.ts');
const { ui } = loadTranslations('src/i18n/ui.ts');
const { homeCopy } = loadTranslations('src/i18n/home.ts');
const { studioCopy } = loadTranslations('src/i18n/studio.ts');
const { goldenHourCopy } = loadTranslations('src/i18n/golden-hour.ts');
const locales = Object.keys(languages);
const prefix = locale => locale === 'en' ? '' : `/${locale}`;
const flatten = (value, path = '') => Object.fromEntries(Object.entries(value).flatMap(([key, child]) =>
  typeof child === 'string' ? [[`${path}${key}`, child]] : Object.entries(flatten(child, `${path}${key}.`))));
for (const [name, dictionary] of Object.entries({ ui, homeCopy, studioCopy, goldenHourCopy })) {
  const source = flatten(dictionary.en);
  for (const locale of locales) {
    const translated = flatten(dictionary[locale]);
    assert.deepEqual(Object.keys(translated).sort(), Object.keys(source).sort(), `${name}/${locale}: complete translation keys`);
    for (const [key, value] of Object.entries(translated)) {
      assert.ok(value.trim(), `${name}/${locale}/${key}: nonempty translation`);
      const placeholders = text => [...text.matchAll(/\{\w+\}/g)].map(match => match[0]).sort();
      assert.deepEqual(placeholders(value), placeholders(source[key]), `${name}/${locale}/${key}: interpolation`);
    }
  }
}

const base = process.argv[2] || 'http://127.0.0.1:4321';
const baseOrigin = new URL(base).origin;
// Pin the revision before adding languages; list intentional legal revisions below.
const legalBaseline = '9bfe25e5aac74e94e53b6c8abac70e7e6d5d8cd7';
const legalAdditions = {
  privacy: [
    'privacy.website.p2', 'privacy.website.google',
    'privacy.s2.gameCenterP', 'privacy.s2.gameCenterLi1', 'privacy.s2.gameCenterLi2',
    'privacy.s3.li7', 'privacy.s4.p4', 'privacy.s4.appleGameCenterPrivacy',
    'privacy.s6.p4', 'privacy.s7.p4', 'privacy.s9.li5',
    'privacy.s5.analyticsConsent', 'privacy.s9.analyticsChoice',
  ],
  terms: ['terms.s5.gameCenter', 'terms.s5.appleTerms', 'terms.s6.youcanup'],
};
const revisedLegalKeys = new Set(['privacy.s2.youcanup', 'privacy.s9.p2']);
const decodeHtml = html => html.replace(/&(?:amp|lt|gt|quot|apos|#39|#x27);/g, entity => ({
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'", '&#x27;': "'",
})[entity]);
const pages = ['', '/about', '/support', '/privacy', '/terms', '/golden-hour'];
const documents = new Map();
const normalize = path => path.replace(/\/$/, '') || '/';
for (const locale of locales) {
  for (const page of pages) {
    const path = `${prefix(locale)}${page}/`;
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const googleTag = 'https://www.googletagmanager.com/gtm.js?id=GTM-MTMZ554B';
    const googleScripts = [...html.matchAll(/<script\b[^>]*src="([^"]*googletagmanager\.com[^"]*)"[^>]*>/g)];
    const isDev = html.includes('/@vite/client');
    assert.equal(googleScripts.length, isDev ? 0 : 1, `${path}: Google tag only once in production`);
    if (!isDev) {
      assert.equal(googleScripts[0][1], googleTag, `${path}: supplied Google tag ID and loader`);
      assert.ok(html.indexOf(googleScripts[0][0]) < html.indexOf('</head>'), `${path}: Google tag in head`);
      assert.match(googleScripts[0][0], /\basync(?:\s|>)/, `${path}: asynchronous Google tag`);
    }
    assert.match(html, /<body class="playground"/, `${path}: shared design`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${path}: one main heading`);
    assert.match(html, /<main id="main"/, `${path}: accessible main content`);
    assert.match(html, /class="playground-footer"/, `${path}: shared footer`);
    assert.match(html, /rel="canonical"/, `${path}: canonical`);
    assert.equal((html.match(/rel="alternate"/g) || []).length, locales.length + 1, `${path}: locale alternatives`);
    assert.ok(html.includes(`<html lang="${localeMetadata[locale].html}"`), `${path}: language`);
    assert.ok(html.includes(`property="og:locale" content="${localeMetadata[locale].og}"`), `${path}: Open Graph locale`);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.equal(new URL(canonical).pathname, path, `${path}: canonical preserves page and locale`);
    for (const code of locales) {
      const href = `${prefix(code)}${page}/`;
      assert.ok(html.includes(`hreflang="${localeMetadata[code].hreflang}" href="https://mogoostudio.com${href}"`), `${path}: alternate ${code}`);
      assert.equal((html.match(new RegExp(`href="${href}" lang="${code}"`, 'g')) || []).length, 2, `${path}: desktop and mobile language links`);
    }
    for (const kind of ['privacy', 'terms']) {
      if (page === `/${kind}`) {
        const rendered = decodeHtml(html);
        assert.ok(rendered.includes(ui[locale][`${kind}.updated`]), `${path}: rendered revision date`);
        const changedKeys = [...legalAdditions[kind], ...[...revisedLegalKeys].filter(key => key.startsWith(`${kind}.`))];
        for (const key of changedKeys) {
          assert.ok(rendered.includes(ui[locale][key]), `${path}: rendered localized ${key}`);
        }
      }
    }
    if (page === '/privacy') {
      assert.ok(html.includes(ui[locale]['privacy.website.p2']), `${path}: rendered Google analytics disclosure`);
      assert.ok(html.includes(ui[locale]['privacy.website.google']), `${path}: Google privacy policy link`);
    }
    documents.set(normalize(path), html);
  }
}
let links = 0;
const imageLinks = new Set();
for (const [path, html] of documents) {
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = match[1];
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    const target = new URL(decodeHtml(href), `${base}${path}`);
    if (target.origin === baseOrigin && target.pathname.endsWith('.png') && !target.hash) {
      imageLinks.add(target.href);
      continue;
    }
    const document = documents.get(normalize(target.pathname));
    assert.ok(document, `${path}: missing page ${href}`);
    if (target.hash) assert.ok(document.includes(`id="${target.hash.slice(1)}"`), `${path}: missing anchor ${href}`);
    links++;
  }
}
for (const href of imageLinks) {
  const response = await fetch(href, { method: 'HEAD' });
  assert.equal(response.status, 200, `linked screenshot: ${href}`);
  assert.match(response.headers.get('content-type') || '', /^image\/png\b/, `linked screenshot type: ${href}`);
}
for (const kind of ['privacy', 'terms']) {
  const component = readFileSync(`src/components/${kind[0].toUpperCase()}${kind.slice(1)}Content.astro`, 'utf8');
  const keys = text => [...text.matchAll(/t\('([^']+)'\)/g)].map(m => m[1]);
  const original = execFileSync('git', ['show', `${legalBaseline}:src/components/${kind[0].toUpperCase()}${kind.slice(1)}Content.astro`], { encoding: 'utf8' });
  const additions = legalAdditions[kind];
  assert.deepEqual(keys(component).filter(key => !additions.includes(key)), keys(original), `${kind}: preserve every original legal paragraph`);
  for (const key of additions) assert.equal(keys(component).filter(value => value === key).length, 1, `${kind}: one ${key}`);
  const externalLinks = text => [...text.matchAll(/href="(https:[^"]+)"/g)].map(m => m[1]);
  const expectedLinks = kind === 'privacy' ? [
    'https://policies.google.com/privacy',
    'https://policies.google.com/technologies/partner-sites',
    'https://gameanalytics.com/privacy/',
    'https://www.apple.com/legal/privacy/data/en/game-center/',
    'https://www.cloudflare.com/privacypolicy/',
    'https://policies.google.com/privacy',
  ] : ['https://www.apple.com/legal/internet-services/itunes/'];
  assert.deepEqual(externalLinks(component), expectedLinks, `${kind}: existing and new provider policy links`);
  for (const locale of locales) {
    const page = documents.get(normalize(`${prefix(locale)}/${kind}/`));
    for (const href of new Set(expectedLinks)) {
      assert.ok(page.includes(`href="${href}"`), `${locale}/${kind}: rendered provider link ${href}`);
    }
  }
}
const baseline = execFileSync('git', ['show', `${legalBaseline}:src/i18n/ui.ts`], { encoding: 'utf8' });
const originalUi = new Function(`${baseline.replace(/export const /g, 'const ').replace(/ as const/g, '')}; return ui;`)();
for (const locale of ['en', 'zh-cn', 'zh-tw']) {
  for (const [key, value] of Object.entries(originalUi[locale])) {
    if (key === 'privacy.updated' || key === 'terms.updated' || revisedLegalKeys.has(key)) continue;
    assert.equal(ui[locale][key], value, `${locale}/${key}: preserve original wording`);
  }
}
const sitemapResponse = await fetch(`${base}/sitemap-index.xml`);
assert.equal(sitemapResponse.status, 200, 'sitemap available');
const sitemap = await sitemapResponse.text();
assert.equal((sitemap.match(/<loc>/g) || []).length, documents.size, 'sitemap covers all localized pages');
for (const path of documents.keys()) {
  assert.ok(sitemap.includes(`<loc>https://mogoostudio.com${path === '/' ? '/' : `${path}/`}</loc>`), `sitemap: ${path}`);
}
assert.ok(!sitemap.includes('undefined'), 'sitemap has no missing locale metadata');
console.log(`PASS: ${documents.size} localized pages, ${links} internal links, ${imageLinks.size} linked screenshots, complete translations, SEO, sitemap, Google tag installation, rendered Game Center/revive disclosures and unchanged legal wording preserved.`);
