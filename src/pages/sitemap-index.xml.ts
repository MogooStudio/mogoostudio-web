import { languages } from '../i18n/ui';
import { getLocalizedPath } from '../i18n/utils';

const SITE = 'https://mogoostudio.com';
const paths = ['/', '/about', '/privacy', '/support', '/terms'];
const hreflangMap: Record<string, string> = { en: 'en', 'zh-cn': 'zh-Hans', 'zh-tw': 'zh-Hant' };

function withTrailingSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

export function GET() {
  const urls = paths
    .map((path) => {
      const alternates = Object.keys(languages)
        .map((code) => {
          const href = `${SITE}${withTrailingSlash(getLocalizedPath(path, code))}`;
          return `<xhtml:link rel="alternate" hreflang="${hreflangMap[code]}" href="${href}" />`;
        })
        .join('');
      const defaultHref = `${SITE}${withTrailingSlash(path)}`;
      const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}" />`;

      return Object.keys(languages)
        .map((code) => {
          const loc = `${SITE}${withTrailingSlash(getLocalizedPath(path, code))}`;
          return `<url><loc>${loc}</loc>${alternates}${xDefault}</url>`;
        })
        .join('');
    })
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
