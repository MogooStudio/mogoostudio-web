# MogooStudio 官网

MogooStudio 独立手游工作室官方网站，展示工作室游戏作品与品牌信息。

## 技术栈

- **Astro 4.16** - 静态网站生成器
- **Nunito** - 主字体
- 纯静态部署，无运行时依赖

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:4321` 查看本地开发服务器。

### 构建生产版本

```bash
npm run build
```

构建结果输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/     # 可复用组件（Nav、Footer、GameBlock 等）
├── layouts/        # 页面布局模板（BaseLayout）
└── pages/          # 页面路由
    ├── index.astro      # 首页
    ├── about.astro      # 关于我们
    ├── support.astro    # 技术支持
    ├── privacy.astro    # 隐私政策
    └── terms.astro      # 服务条款

public/             # 静态资源（favicon、游戏截图等）
```

## 部署

站点配置为静态输出（`output: 'static'`），部署目标域名：`https://mogoostudio.com`

构建后可部署到任何静态托管服务（Vercel、Netlify、Cloudflare Pages 等）。

## 开发规范

- 所有新增页面需通过 `BaseLayout` 布局模板统一样式
- 使用 `rawTitle` prop 控制浏览器标签标题格式（默认为 `页面名 | MogooStudio`）
- 组件样式使用 scoped `<style>` 避免全局污染
- 响应式设计优先，使用 `clamp()` 等 CSS 函数适配不同屏幕

## License

Copyright © 2024-2026 MogooStudio. All rights reserved.
