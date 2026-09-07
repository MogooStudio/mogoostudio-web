# MogooStudio 官网

[MogooStudio](https://mogoostudio.com) 独立手游工作室的静态官网，用于展示游戏作品、工作室信息，并提供技术支持、隐私政策与服务条款。

## 当前内容

- 展示《Minimalist Breakout》和《Flappy Ball Hop》的介绍、图标与游戏截图
- 提供英语、简体中文和繁体中文页面；英语为默认语言
- 包含关于我们、技术支持、隐私政策和服务条款页面
- 内置响应式布局、语言切换、SEO 元信息、Canonical、`hreflang`、站点地图与爬虫规则
- 提供 `ads.txt` 和 `app-ads.txt` 应用广告验证文件

## 技术栈

- [Astro 7](https://astro.build/)
- TypeScript
- Astro Assets 图片优化
- 纯静态输出，无服务端运行时

## 本地开发

环境要求：Node.js 22.12 或更高版本，npm 9.6.5 或更高版本。

```bash
npm ci
npm run dev
```

开发服务器默认运行在 `http://localhost:4321`。

常用命令：

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 本地预览生产构建 |

## 路由与多语言

| 内容 | 英语 | 简体中文 | 繁体中文 |
| --- | --- | --- | --- |
| 首页 | `/` | `/zh-cn/` | `/zh-tw/` |
| 关于我们 | `/about/` | `/zh-cn/about/` | `/zh-tw/about/` |
| 技术支持 | `/support/` | `/zh-cn/support/` | `/zh-tw/support/` |
| 隐私政策 | `/privacy/` | `/zh-cn/privacy/` | `/zh-tw/privacy/` |
| 服务条款 | `/terms/` | `/zh-cn/terms/` | `/zh-tw/terms/` |

翻译文案集中维护在 `src/i18n/ui.ts`，路径与语言识别逻辑位于 `src/i18n/utils.ts`。新增页面时，需要同步补齐三种语言的路由，并更新 `src/pages/sitemap-index.xml.ts` 中的页面列表。

## 项目结构

```text
.
├── public/                 # 原样输出的静态文件、爬虫与广告验证文件
├── src/
│   ├── assets/             # 游戏图标与截图，由 Astro 构建处理
│   ├── components/         # 导航、页脚、游戏展示和截图组件
│   ├── i18n/               # 多语言文案与路径工具
│   ├── layouts/            # 全局页面布局与 SEO 元信息
│   └── pages/              # 英语及中英文页面路由、站点地图
├── astro.config.mjs        # 站点地址、静态输出与语言路由配置
└── package.json            # 依赖与开发命令
```

## 内容维护

- 页面统一使用 `BaseLayout`；仅在需要完整自定义标题时传入 `rawTitle`
- 新增通用文案时，同时补齐 `en`、`zh-cn` 和 `zh-tw` 三套翻译
- 可由 Astro 优化的图片放在 `src/assets/`，必须保持固定 URL 的文件放在 `public/`
- 隐私政策、服务条款、第三方 SDK 或支持邮箱发生变化时，必须同步更新所有语言版本
- 提交前至少执行一次 `npm run build`

## 部署

站点在 `astro.config.mjs` 中配置为静态输出，生产域名为 `https://mogoostudio.com`。运行 `npm run build` 后，将 `dist/` 目录部署到任意静态托管服务即可。

## 联系方式

技术支持：[support@mogoostudio.com](mailto:support@mogoostudio.com)

## License

Copyright © 2024–2026 MogooStudio. All rights reserved.
