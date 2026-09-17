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

## 网站统计

线上页面已检测到 Cloudflare Web Analytics 脚本，仓库不重复插入。PostHog 用于游戏关注度与 App Store 点击统计，两者可同时使用。

### 首次启用 PostHog

当前 `src/components/PostHog.astro` 已填入用户提供的公开项目 Key 和 US 接入地址，常规构建无需额外环境变量。该 Key 会随网页公开，不具备后台管理权限。上线前仍需完成第 3 步的后台开关，并重新构建部署。

1. 使用自己的邮箱在 [PostHog](https://us.posthog.com/signup) 注册免费账号，创建 `MogooStudio` 项目。
2. 在项目设置复制 **Project API Key**（通常以 `phc_` 开头），不要使用个人 API key。
3. 在 **Project Settings → Web analytics** 启用 **Cookieless server hash mode**。这是必需步骤，否则服务端会忽略无 Cookie 事件。
4. 更换项目时，可参考 `.env.example` 覆盖构建环境变量：`PUBLIC_POSTHOG_KEY` 与 `PUBLIC_POSTHOG_HOST`。US 使用 `https://us.i.posthog.com`，EU 使用 `https://eu.i.posthog.com`。本地可填入被 Git 忽略的 `.env`；线上覆盖需在托管平台的构建环境配置。显式将 Key 或 Host 设为空值可关闭统计。
5. 重新执行 `npm run build` 并部署。静态站点的变量在构建时写入文件，部署后修改变量需要重新构建。
6. 访问正式官网并点击游戏截图、App Store 按钮，在 PostHog 的实时事件页面检查事件及 `game_id`。

仅生产构建且域名为 `mogoostudio.com` 时启用 PostHog；本地与预览域名不发送数据。接入关闭自动点击采集、会话录屏、热力图、问卷、性能和异常采集，不创建个人档案，并尊重浏览器 DNT 设置。无 Cookie 模式不保存浏览器统计标识，其匿名访客估算不等于实名人数或跨设备去重人数。

### 事件与报表

| 事件 | 统计口径 | 用途 |
| --- | --- | --- |
| `$pageview` | 每次页面加载一次 | 查看官网访问与语言分布 |
| `game_view` | 游戏标题至少 50% 可见且页面在前台连续 1 秒；每次页面加载每款游戏最多一次 | 游戏曝光量 |
| `game_interest` | 点击游戏截图或页脚游戏链接；悬停和程序默认高亮不算 | 比较主动关注情况 |
| `app_store_click` | 点击有效的 `apps.apple.com` 链接，含中键打开；占位按钮不算 | 商店跳转次数与估算访客数 |

游戏事件附带 `game_id`、固定英文 `game_name`、`language`、`page_path`；点击事件另有 `placement`，截图点击包含 `screenshot_index`。以稳定 `game_id` 分组可合并不同语言的同款游戏。

在 **Insights → Trends** 分别选择以上事件，按 `game_id` 拆分：总次数用 Total count，估算点击人数用 Unique users。可建立 `game_view → app_store_click` 漏斗，按游戏拆分并排除没有商店链接的游戏；无 Cookie 标识的时效会限制跨天归因。浏览到游戏标题只代表曝光，不能单独证明更喜欢它，还要看主动互动和商店跳转比例，并考虑首页上下位置的影响。

当前仅 Minimalist Breakout 有商店链接；Flappy Ball Hop 为“即将上线”，有曝光和互动统计但不会产生商店点击，不能据此判定它不受关注。点击量不等于安装量，安装数据请查看 App Store Connect。

验证命令：`npm test`、`npm run build`。真实上报还需配置有效项目并上线后在后台确认。

参考：[Astro 接入](https://posthog.com/docs/libraries/astro)、[无 Cookie 配置](https://posthog.com/tutorials/cookieless-tracking)。

## 联系方式

技术支持：[support@mogoostudio.com](mailto:support@mogoostudio.com)

## License

Copyright © 2024–2026 MogooStudio. All rights reserved.
