# MogooStudio 官网

[MogooStudio](https://mogoostudio.com) 独立工作室的静态官网，用于展示软件、应用与游戏作品、工作室信息，并提供技术支持、隐私政策与服务条款。

## 当前内容

- 展示《你行你上啊 · YouCanUp》和《Minimalist Breakout》的介绍与游戏截图
- 首页展示《你行你上啊》（YouCanUp）的图标、实机截图与简洁玩法介绍；当前标注 iOS、即将推出，产品介绍格式见 `AGENTS.md`
- YouCanUp 与 Minimalist Breakout 的首页展示图及截图轮播已同步项目现有的新素材，来源与更新日期见下方“内容维护”
- 首页以「薪动 · Golden Hour」开场。「更多作品」默认展示拼一页、Mogoo Codex Git、YouCanUp 和 Minimalist Breakout，可按应用或游戏筛选。
- 「薪动 · Golden Hour」保留六语独立落地页，分区介绍日常计薪、收入记录与分享、浏览器与安装、数据与隐私。桌面与手机采用对应的真实截图，按原比例显示。
- 提供英语、简体中文、繁体中文、日语、韩语和西班牙语页面；英语为默认语言
- 包含关于我们、技术支持、隐私政策和服务条款页面
- 内置响应式布局、语言切换、SEO 元信息、Canonical、`hreflang`、站点地图与爬虫规则
- 全站六种语言统一采用 C 方案「夜光展厅」。首页作品采用桌面左图右文、窄屏图上文下。关于、支持、薪动、隐私政策和服务条款共用首页的导航与页尾；在页尾切换语言会保留当前页面。视觉规范见 [DESIGN.md](DESIGN.md)。
- 提供 `ads.txt` 和 `app-ads.txt` 应用广告验证文件
- 浏览器标签页、页头和关于页共用 [MG 网站图标](public/favicon.svg)。[工作室标志精修原图](docs/design/brand/mogoostudio-mg-approved.png) 保留了浅底和深底两种版本。

## 技术栈

- [Astro 7](https://astro.build/)
- TypeScript
- Astro Assets 图片优化
- 原生 CSS、Intersection Observer 与 Web Animations API（产品入场和交互反馈）
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
| `node scripts/verify-site.mjs` | 服务器运行时检查 36 个页面、六语翻译完整性、站内链接、SEO、新增法律文案与第三方链接的实际输出，以及未修订法律正文的保留 |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 本地预览生产构建 |

## 路由与多语言

| 内容 | 英语 | 简体中文 | 繁体中文 | 日语 | 韩语 | 西班牙语 |
| --- | --- | --- | --- | --- | --- | --- |
| 首页 | `/` | `/zh-cn/` | `/zh-tw/` | `/ja/` | `/ko/` | `/es/` |
| 关于我们 | `/about/` | `/zh-cn/about/` | `/zh-tw/about/` | `/ja/about/` | `/ko/about/` | `/es/about/` |
| 技术支持 | `/support/` | `/zh-cn/support/` | `/zh-tw/support/` | `/ja/support/` | `/ko/support/` | `/es/support/` |
| 隐私政策 | `/privacy/` | `/zh-cn/privacy/` | `/zh-tw/privacy/` | `/ja/privacy/` | `/ko/privacy/` | `/es/privacy/` |
| 服务条款 | `/terms/` | `/zh-cn/terms/` | `/zh-tw/terms/` | `/ja/terms/` | `/ko/terms/` | `/es/terms/` |
| 薪动 · Golden Hour | `/golden-hour/` | `/zh-cn/golden-hour/` | `/zh-tw/golden-hour/` | `/ja/golden-hour/` | `/ko/golden-hour/` | `/es/golden-hour/` |

语言名称及 HTML、`hreflang`、Open Graph 标记集中维护在 `src/i18n/locales.ts`，语言识别与路径工具位于 `src/i18n/utils.ts`。英语与中文文案分别在 `src/i18n/ui.ts`（通用文案与法律正文）、`src/i18n/home.ts`（首页与共享导航）、`src/i18n/studio.ts`（工作室内页）；薪动落地页六语文案集中在 `src/i18n/golden-hour.ts`；日语、韩语、西班牙语的其他完整文案分别在 `ja.ts`、`ko.ts`、`es.ts`，由上述入口统一导出并检查类型。Astro 语言列表维护在 `astro.config.mjs`。新增页面使用 `src/pages/[locale]/[...page].astro` 生成对应的日语、韩语与西班牙语静态页面，现有英语和中文保留独立路由。新增页面时，需要补齐六种语言的路由，并更新站点地图和验证脚本中的页面列表。

首页样板为 `GoldenHourFeature.astro` 与 `src/styles/gallery.css`。首屏以墨黑背景、黄铜刻度盘、真实手机界面和衬线英文名呈现薪动。1440×900 桌面视口使用双栏，390 宽手机使用单栏。刻度盘素材位于 `src/assets/home/golden-dial.webp`。

点击薪动产品图，可在预览中查看主界面、月历和年报。桌面并列展示手机和桌面截图，窄屏展示手机截图。`ProductCarousel.astro` 和 `src/scripts/product-carousel.ts` 提供触控滑动、前后按钮和方向键切换。

「更多作品」保留各产品原有图标、截图、发布状态和产品入口。拼一页、YouCanUp 与 Minimalist Breakout 的截图共用细边手机壳。拼一页与 YouCanUp 第一项展示组合图，Minimalist Breakout 默认显示第一张。点击产品图可查看大图。拼一页的产品入口打开微信小程序码。Mogoo Codex Git 使用同一轮播展示面板总览、浅色提交历史和文件差异，后两张原图取自插件官网的 `docs/site/assets/history-light.webp` 与 `diff-detail.webp`。

六语分类标签由 `WorkTabs.astro` 实现，可用左右方向键切换，也可用 Home 或 End 跳至首末标签。禁用 JavaScript 时仍能浏览所有作品及截图。

## 项目结构

```text
.
├── public/                 # 原样输出的静态文件、爬虫与广告验证文件
├── src/
│   ├── assets/             # 游戏图标与截图，由 Astro 构建处理
│   ├── components/         # 导航、页脚、游戏展示和截图组件
│   ├── i18n/               # 多语言文案与路径工具
│   ├── layouts/            # 全局页面布局与 SEO 元信息
│   └── pages/              # 六语页面路由、站点地图
├── astro.config.mjs        # 站点地址、静态输出与语言路由配置
└── package.json            # 依赖与开发命令
```

## 内容维护

- 页面统一使用 `BaseLayout`；仅在需要完整自定义标题时传入 `rawTitle`
- 新增通用文案时，同时补齐 `en`、`zh-cn`、`zh-tw`、`ja`、`ko` 和 `es` 六套翻译
- 可由 Astro 优化的图片放在 `src/assets/`，必须保持固定 URL 的文件放在 `public/`
- 隐私政策、服务条款、第三方 SDK 或支持邮箱发生变化时，必须同步更新所有语言版本
- 2026-11-06 六语法律文档已补充 YouCanUp 的 Game Center 资料、玩家标识与本地哈希、排行榜成绩同步、公开展示、Apple 保存及退出／删除边界；隐私政策另说明独立统计先同意、拒绝仍可游玩、设置中撤回及历史数据处理边界；服务条款说明每局最多成功复活一次、广告奖励确认条件和续玩成绩规则
- 2026-11-16 清理已移除作品的隐私条目、旧翻译、样式、素材及早期设计档案，六语隐私政策的页面更新时间同步修订
- 同日按页面入口和素材引用清理未使用的旧图标、拼一页示例图、旧游戏展示组件、滚动动效对比页、分类实验及配套文案和过时实施计划；当前四款产品素材、本地字体及薪动落地页设计规范保留
- 提交前至少执行一次 `npm run build`

2026-11-20 新增 Mogoo Codex Git 六语首页展示，图标和截图分别来自插件项目的 `codex/assets/icon.svg` 和 `docs/images/mogoo-codex-git-overview.png`。发布状态依据 GitHub Releases，平台根据插件官网标注已验证的 Windows。

2026-11-16 恢复「拼一页」六语首页展示，用户已确认正式发布。使用 `photo-collage-mini-program` 当前 `71d2fae` 代码，在微信开发者工具重新截取首页、模板库、模板详情、编辑器和导出页，保存到 `src/assets/pinyiye/` 的 `home.png`、`templates.png`、`detail.png`、`editor.png`、`export.png`。第一项为编辑器与两张界面的组合，向右逐张切换，返回第一项恢复组合。产品入口打开原有微信小程序码供扫描；小程序码使用原始文件，不做有损转换或裁切，点击截图本身不弹框。

同日恢复「薪动 · Golden Hour」六语首页，基于 `golden-hour` 当前 `a7a71ad` 的本地运行界面重新截取主界面、月历、年报，桌面 1440×1000、手机 390×844，共六张图片，更新 `src/assets/golden-hour/`。采集使用内存中的示例记录和演示模式，不读取或写入个人收入归档；页面标注演示数据。桌面和窄屏自动显示对应截图，产品链接通向当前语言的独立落地页，落地页共享更新后的图片。两个恢复项目的切换按钮与 YouCanUp 相同，固定在作品卡片左右内边缘，支持鼠标、键盘及滑动。

2026-11-16 更新游戏截图：YouCanUp 使用相邻 `you-can-up-godot-handoff` 项目中 `game/output/app-store-media/editor/public/screenshots/search-menu/zh-Hans.png` 的菜单图，以及 `apple/iphone/zh-Hans/` 的五张游戏截图，同步到 `src/assets/youcanup/`，包括菜单、待蓄力、瞄准、蓄力、结算和造型；Minimalist Breakout 使用相邻 `minimalist-breakout` 项目中 `design/v1.1/store/screenshots/` 的六张截图，按文件名顺序同步到 `src/assets/screenshots/minimalist-breakout/1.png` 至 `6.png`。原图直接复制，首页轮播完整显示画面。

## 部署

站点在 `astro.config.mjs` 中配置为静态输出，生产域名为 `https://mogoostudio.com`。运行 `npm run build` 后，将 `dist/` 目录部署到任意静态托管服务即可。

当前托管为 Cloudflare Pages，项目 `mogoostudio-web` 与 GitHub 仓库关联；推送 `main` 后可通过对应提交的 Cloudflare Pages 检查核对部署结果，最后检查正式域名上的页面。

已停用的滚动动效原型地址通过 `public/_redirects` 永久跳转到首页，覆盖带尾斜杠、无尾斜杠及目录内的旧地址。清理源文件和 CDN 缓存后仍曾出现旧资源响应，因此保留这条退役入口规则；发布后需检查正式域名的实际跳转。

## 网站统计

官网使用 Cloudflare Web Analytics 统计汇总访问量与页面性能，由托管平台注入脚本，仓库不重复插入。

官网同时接入 Google Analytics，使用 Google 后台提供的 `GTM-MTMZ554B` 安装代码，在 `src/layouts/BaseLayout.astro` 的 `<head>` 中统一异步加载，覆盖六种语言的 36 个正式页面。代码只在生产构建中输出，`npm run dev` 不加载 Google 统计；`npm run preview` 可用于检查生产脚本。GA4 数据流关联与后续标签设置由 Google 后台管理，不额外添加 `gtag('config', ...)` 或另一份安装代码。隐私政策的官网统计章节已同步披露 Google 统计与 Cookie 使用。

## 联系方式

技术支持：[support@mogoostudio.com](mailto:support@mogoostudio.com)

## License

Copyright © 2024–2026 MogooStudio. All rights reserved.
