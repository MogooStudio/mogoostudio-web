import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mogoostudio.com',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-cn', 'zh-tw'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
