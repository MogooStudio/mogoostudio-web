# MogooStudio 官网

[MogooStudio](https://mogoostudio.com) 独立工作室的静态官网，用于展示软件、应用与游戏作品、工作室信息，并提供技术支持、隐私政策与服务条款。

## 当前内容

- 展示《Minimalist Breakout》和《Flappy Ball Hop》的介绍、图标与游戏截图
- 首页展示《你行你上啊》（YouCanUp）的图标、实机截图与简洁玩法介绍；当前标注 iOS、即将推出，产品介绍格式见 `AGENTS.md`
- YouCanUp 与 Minimalist Breakout 的首页展示图及截图预览已同步项目现有的新素材，来源与更新日期见下方“内容维护”
- 首页仅展示游戏，不再展示小程序和 Web 项目，也不再提供作品分类筛选
- 「薪动 · Golden Hour」保留六语独立落地页，分区介绍日常计薪、收入记录与分享、浏览器与安装、数据与隐私。桌面与手机采用对应的真实截图，按原比例显示。
- 提供英语、简体中文、繁体中文、日语、韩语和西班牙语页面；英语为默认语言
- 包含关于我们、技术支持、隐私政策和服务条款页面
- 内置响应式布局、语言切换、SEO 元信息、Canonical、`hreflang`、站点地图与爬虫规则
- 首页采用原生纵向滚动与 B 方案“图文对向入场”：图片从左侧、文字从右侧进入，各自在进入视野时播放一次；移除首屏固定、拉远及产品随滚动聚拢等旧效果
- 提供 `ads.txt` 和 `app-ads.txt` 应用广告验证文件

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

首页已采用 B 方案“图文对向入场”，入口为 `src/scripts/home-motion.ts`，共享实现位于 `src/scripts/product-entrance.ts`。桌面图片从左侧 140px、文字从右侧 100px 入场，手机分别为 90px 与 72px，时长 760ms。图片完成解码后再播放，图片与介绍分别观察进入视野的时机；滚回时不重复播放。键盘聚焦时立即落位，系统开启“减少动态效果”时展示完整静态内容。禁用 JavaScript 时内容正常显示。

独立的 `/motion-studies/` 对比页保留第二轮“整卡推近”“图文对向入场”“叠卡交接”和静态基线，使用真实首页，支持六语、宽屏/手机及自动滚动演示。预览通过 iframe 标识与 `motion-study` 参数关闭首页自动安装的动效，再由对比页安装所选方案，预览内导航后也不会重复安装。旧方案与验证记录保留在 `docs/design/2026-10-16-scroll-motion/` 作为历史记录。

首页精选作品直接展示三个游戏，产品图片不再提供弹框预览或放大入口。历史作品分类实现与六语文案暂时保留，但首页不再加载分类脚本或渲染筛选控件；历史方案及截图见 `docs/design/2026-10-16-work-categories/`。

YouCanUp 和 Minimalist Breakout 的首页产品图共用 `ProductCarousel.astro` 与 `src/scripts/product-carousel.ts`，各提供六张截图，不自动播放。YouCanUp 第一项为原来的菜单与实机双图组合，向右切换后每次显示一张，向左切回第一项恢复双图，无需刷新；双图与单图可以反复往返切换。Minimalist Breakout 默认只显示第一张。手机可左右滑动，触控板可横向滚动；桌面鼠标移到作品卡片左右内边缘时显示对应箭头，按钮距边缘 8px、垂直居中，单图与双图模式保持相同位置，点击切换。键盘可聚焦箭头或当前截图，用方向键切换，首尾箭头按实际位置禁用；纵向手势仍滚动页面。悬停或点击截图均不打开弹框。未启用 JavaScript 时仍可原生横向浏览截图。

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
- 提交前至少执行一次 `npm run build`

「拼一页」已从六语首页移除，截图预览与小程序码弹窗也不再渲染。原有 `src/i18n/home.ts` 的 `pinyiye` 文案与 `src/assets/pinyiye/` 素材保留，小程序码保留原始文件，不做有损转换或裁切。

2026-11-16 更新游戏截图：YouCanUp 使用相邻 `you-can-up-godot-handoff` 项目中 `game/output/app-store-media/editor/public/screenshots/search-menu/zh-Hans.png` 的菜单图，以及 `apple/iphone/zh-Hans/` 的五张游戏截图，同步到 `src/assets/youcanup/`，包括菜单、待蓄力、瞄准、蓄力、结算和造型；Minimalist Breakout 使用相邻 `minimalist-breakout` 项目中 `design/v1.1/store/screenshots/` 的六张截图，按文件名顺序同步到 `src/assets/screenshots/minimalist-breakout/1.png` 至 `6.png`。原图直接复制，首页轮播与截图弹窗共用并完整显示画面。

## 部署

站点在 `astro.config.mjs` 中配置为静态输出，生产域名为 `https://mogoostudio.com`。运行 `npm run build` 后，将 `dist/` 目录部署到任意静态托管服务即可。

当前托管为 Cloudflare Pages，项目 `mogoostudio-web` 与 GitHub 仓库关联；推送 `main` 后可通过对应提交的 Cloudflare Pages 检查核对部署结果，最后检查正式域名上的页面。

## 网站统计

官网使用 Cloudflare Web Analytics 统计汇总访问量与页面性能，由托管平台注入脚本，仓库不重复插入。

官网同时接入 Google Analytics，使用 Google 后台提供的 `GTM-MTMZ554B` 安装代码，在 `src/layouts/BaseLayout.astro` 的 `<head>` 中统一异步加载，覆盖六种语言的 36 个正式页面。代码只在生产构建中输出，`npm run dev` 不加载 Google 统计；`npm run preview` 可用于检查生产脚本。GA4 数据流关联与后续标签设置由 Google 后台管理，不额外添加 `gtag('config', ...)` 或另一份安装代码。隐私政策的官网统计章节已同步披露 Google 统计与 Cookie 使用。

## 联系方式

技术支持：[support@mogoostudio.com](mailto:support@mogoostudio.com)

## License

Copyright © 2024–2026 MogooStudio. All rights reserved.
