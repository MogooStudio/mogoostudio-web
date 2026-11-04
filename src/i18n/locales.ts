/** Supported locales and their public metadata. Keep routing and SEO in sync. */
export const languages = {
  en: 'English',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
} as const;

export type Locale = keyof typeof languages;
export const defaultLang: Locale = 'en';
export const localeMetadata = {
  en: { html: 'en', hreflang: 'en', og: 'en_US' },
  'zh-cn': { html: 'zh-CN', hreflang: 'zh-Hans', og: 'zh_CN' },
  'zh-tw': { html: 'zh-TW', hreflang: 'zh-Hant', og: 'zh_TW' },
  ja: { html: 'ja', hreflang: 'ja', og: 'ja_JP' },
  ko: { html: 'ko', hreflang: 'ko', og: 'ko_KR' },
  es: { html: 'es', hreflang: 'es', og: 'es_ES' },
} as const satisfies Record<Locale, { html: string; hreflang: string; og: string }>;

export function isLocale(value: string): value is Locale {
  return Object.hasOwn(languages, value);
}

/** Preserve each message's structure while allowing translated strings. */
export type Translation<T> = { readonly [K in keyof T]: T[K] extends string ? string : Translation<T[K]> };
