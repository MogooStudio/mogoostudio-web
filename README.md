# MogooStudio 官网

[MogooStudio](https://mogoostudio.com) 独立工作室的静态官网，用于展示软件、应用与游戏作品、工作室信息，并提供技术支持、隐私政策与服务条款。

## 当前内容

- 展示《Minimalist Breakout》和《Flappy Ball Hop》的介绍、图标与游戏截图
- 首页展示《你行你上啊》（YouCanUp）的图标、实机截图与简洁玩法介绍；当前标注 iOS、即将推出，产品介绍格式见 `AGENTS.md`
- 首页展示微信小程序「拼一页」的品牌头像、实际编辑界面与拼图成品；当前状态为已发布，点击“打开小程序”可查看微信小程序码
- 提供英语、简体中文和繁体中文页面；英语为默认语言
- 包含关于我们、技术支持、隐私政策和服务条款页面
- 内置响应式布局、语言切换、SEO 元信息、Canonical、`hreflang`、站点地图与爬虫规则
- 首页采用 A+B 分段滚动动效：首屏静物拉远并衔接作品区，「拼一页」相纸向心聚拢；支持回滚倒放和系统“减少动态效果”设置
- 精选作品采用居中胶囊分类导航，按全部、游戏、小程序切换，并显示实际作品数量
- 提供 `ads.txt` 和 `app-ads.txt` 应用广告验证文件

## 技术栈

- [Astro 7](https://astro.build/)
- TypeScript
- Astro Assets 图片优化
- GSAP / ScrollTrigger（随站点打包，不依赖外部 CDN）
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
| `npm run check` | 检查 Astro 与 TypeScript 类型 |
| `node scripts/verify-site.mjs` | 开发服务器运行时检查 15 个页面、站内链接和法律原文保留 |
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

翻译文案维护在 `src/i18n/ui.ts`（原有文案与法律正文）、`src/i18n/home.ts`（首页与共享导航）、`src/i18n/studio.ts`（工作室内页），路径与语言识别逻辑位于 `src/i18n/utils.ts`。新增页面时，需要同步补齐三种语言的路由，并更新 `src/pages/sitemap-index.xml.ts` 中的页面列表。

首页动效位于 `src/scripts/home-motion.ts`。主叙事随滚动位置变化，其他作品与价值图标仅出场一次；窄屏缩短位移，短视口取消固定舞台，减少动态效果或禁用 JavaScript 时保留完整静态内容。方案与验证记录见 `docs/design/2026-10-16-scroll-motion/`。

作品分类逻辑位于 `src/scripts/work-categories.ts`，分类依据写在产品的 `data-work-category` 上，数量从实际产品节点计算。筛选后独立重建作品区动效；直达被隐藏的产品锚点时恢复全部作品并定位。禁用 JavaScript 时隐藏分类控件、展示全部产品。三语分类文案与结果播报维护在 `src/i18n/home.ts`，选定方案及截图见 `docs/design/2026-10-16-work-categories/`。

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

「拼一页」文案位于 `src/i18n/home.ts` 的 `pinyiye` 字段，展示素材位于 `src/assets/pinyiye/`，来源为本地 `photo-collage-mini-program` 项目的已选头像 v16、原生编辑/导出截图和实际模板导出成品。小程序已发布，三种语言的发布状态已同步；“打开小程序”按钮弹出用户提供的正式微信小程序码（`wechat-code.jpg`），支持关闭按钮、Esc 和点击遮罩关闭，并恢复按钮焦点。小程序码保留原始文件，不做有损转换或裁切。

## 部署

站点在 `astro.config.mjs` 中配置为静态输出，生产域名为 `https://mogoostudio.com`。运行 `npm run build` 后，将 `dist/` 目录部署到任意静态托管服务即可。

当前托管为 Cloudflare Pages，项目 `mogoostudio-web` 与 GitHub 仓库关联；推送 `main` 后可通过对应提交的 Cloudflare Pages 检查核对部署结果，最后检查正式域名上的页面。

## 网站统计

官网使用 Cloudflare Web Analytics 统计汇总访问量与页面性能，由托管平台注入脚本，仓库不重复插入。

## 联系方式

技术支持：[support@mogoostudio.com](mailto:support@mogoostudio.com)

## License

Copyright © 2024–2026 MogooStudio. All rights reserved.
