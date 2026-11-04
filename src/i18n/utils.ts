import { ui } from './ui';
import { defaultLang, isLocale, type Locale } from './locales';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (isLocale(lang)) return lang;
  return defaultLang;
}

export function useTranslations(lang: Locale) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function getPathWithoutLocale(path: string) {
  const [, segment] = path.split('/');
  return isLocale(segment) && segment !== defaultLang ? path.slice(segment.length + 1) || '/' : path;
}

export function getLocalizedPath(path: string, locale: Locale) {
  if (locale === defaultLang) return path;
  return `/${locale}${path}`;
}
