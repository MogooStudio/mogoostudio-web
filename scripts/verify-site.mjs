import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const base = process.argv[2] || 'http://127.0.0.1:4321';
// Pin the pre-redesign revision so the legal-copy regression check survives commits.
const legalBaseline = '5ed87fa';
const locales = ['', '/zh-cn', '/zh-tw'];
const pages = ['', '/about', '/support', '/privacy', '/terms'];
const documents = new Map();
const normalize = path => path.replace(/\/$/, '') || '/';
for (const locale of locales) {
  for (const page of pages) {
    const path = `${locale}${page}/`;
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<body class="playground"/, `${path}: shared design`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${path}: one main heading`);
    assert.match(html, /<main id="main"/, `${path}: accessible main content`);
    assert.match(html, /class="playground-footer"/, `${path}: shared footer`);
    assert.match(html, /rel="canonical"/, `${path}: canonical`);
    assert.equal((html.match(/rel="alternate"/g) || []).length, 4, `${path}: locale alternatives`);
    const expectedLanguage = locale === '/zh-cn' ? 'zh-CN' : locale === '/zh-tw' ? 'zh-TW' : 'en';
    assert.ok(html.includes(`<html lang="${expectedLanguage}"`), `${path}: language`);
    documents.set(normalize(path), html);
  }
}
let links = 0;
for (const [path, html] of documents) {
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = match[1];
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    const target = new URL(href, `${base}${path}`);
    const document = documents.get(normalize(target.pathname));
    assert.ok(document, `${path}: missing page ${href}`);
    if (target.hash) assert.ok(document.includes(`id="${target.hash.slice(1)}"`), `${path}: missing anchor ${href}`);
    links++;
  }
}
for (const kind of ['privacy', 'terms']) {
  const component = readFileSync(`src/components/${kind[0].toUpperCase()}${kind.slice(1)}Content.astro`, 'utf8');
  const keys = text => [...text.matchAll(/t\('([^']+)'\)/g)].map(m => m[1]);
  for (const locale of ['', 'zh-cn/', 'zh-tw/']) {
    const original = execFileSync('git', ['show', `${legalBaseline}:src/pages/${locale}${kind}.astro`], { encoding: 'utf8' });
    const body = original.split('<section class="legal-body">')[1].split('</section>')[0];
    assert.deepEqual(keys(component), keys(body), `${locale}${kind}: preserve every legal paragraph`);
    const externalLinks = text => [...text.matchAll(/href="(https:[^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(externalLinks(component), externalLinks(body), `${locale}${kind}: preserve external policy links`);
  }
}
assert.equal(execFileSync('git', ['diff', legalBaseline, '--', 'src/i18n/ui.ts'], { encoding: 'utf8' }), '', 'Original legal translations unchanged');
console.log(`PASS: ${documents.size} localized pages, ${links} internal links, metadata and all legal copy preserved.`);
