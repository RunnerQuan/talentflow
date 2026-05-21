<div align="center">

# TalentFlow

**AI 驱动的招聘决策智能体平台**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

<br/>

从简历解析到技能图谱，从智能匹配到面试助手 — 用 AI 重新构建招聘全流程

</div>

---

## 核心功能

### AI 简历解析
- 支持 PDF、Word、图片等多格式简历上传
- AI 自动提取结构化候选人信息（教育、经验、技能、项目）
- 智能字体编码检测，自动降级到视觉 OCR 路径
- 多阶段状态指示，实时反馈解析进度

### 候选人管理
- 可视化候选人卡片列表，支持搜索和筛选
- 候选人详情页含 4 个 Tab：概览 | 技能图谱 | 面试记录 | 匹配结果
- 侧边抽屉展示原始简历文件，便于核实 AI 解析准确性

### 技能图谱
- 可视化技能网络图，洞察能力关联与演化路径
- 基于候选人简历自动构建技能图谱
- 支持技能强度评估和关联分析

### 智能匹配
- 多维度加权匹配算法：技能 / 经验 / 文化 / 潜力四维评估
- 岗位 JD 与候选人简历的双向匹配
- 匹配结果可视化展示，优势与待提升项一目了然

### AI 面试助手
- 基于候选人简历和岗位要求自动生成面试问题
- 支持技术面试和行为面试两类问题
- 面试记录管理与评估追踪

### 数据看板
- 招聘流程数据可视化
- 候选人来源与转化分析
- 关键指标实时监控

---

## 技术栈

| 层级 | 技术选型 |
|------|---------|
| **框架** | Next.js 16 (App Router) + React 19 |
| **语言** | TypeScript 5 |
| **样式** | Tailwind CSS 4 + 自定义液态玻璃设计系统 |
| **状态管理** | Zustand |
| **数据获取** | TanStack React Query |
| **AI 集成** | Vercel AI SDK (支持 OpenAI / Anthropic / Google 等多模型) |
| **图表** | Recharts |
| **文件解析** | pdf-parse + mammoth (Word) |
| **本地存储** | IndexedDB (idb) + localStorage |
| **图标** | Lucide React |

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm / yarn / pnpm

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/talentflow.git
cd talentflow

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 访问应用。

### 模型配置

首次使用需要在 **设置页面** 配置 AI 模型：

1. 进入 `/settings` 页面
2. 填入 API Key（支持 OpenAI、Anthropic、Google 等）
3. 选择默认模型和视觉模型
4. 测试连接后保存

---

## 项目结构

```
talentflow/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── api/                # API Routes (BFF 层)
│   │   │   ├── parse-resume/   # 简历解析接口
│   │   │   ├── match/          # 人岗匹配接口
│   │   │   └── interview/      # 面试助手接口
│   │   ├── candidates/         # 候选人管理页面
│   │   ├── dashboard/          # 数据看板
│   │   ├── interview/          # 面试助手页面
│   │   ├── match/              # 人岗匹配页面
│   │   ├── settings/           # 模型设置页面
│   │   └── upload/             # 简历上传页面
│   ├── components/             # React 组件
│   │   ├── ui/                 # 通用 UI 组件 (GlassCard, Button, Dialog...)
│   │   ├── candidates/         # 候选人相关组件
│   │   ├── resume/             # 简历上传组件
│   │   ├── match/              # 匹配结果组件
│   │   └── interview/          # 面试相关组件
│   ├── lib/                    # 核心库
│   │   ├── ai/                 # AI 模型集成
│   │   │   ├── resume-parser.ts  # 简历解析 AI
│   │   │   ├── matcher.ts        # 匹配算法
│   │   │   ├── interviewer.ts    # 面试问题生成
│   │   │   └── models.ts         # 模型配置
│   │   ├── store/              # Zustand 状态管理
│   │   ├── db.ts               # IndexedDB 数据库
│   │   └── storage.ts          # localStorage 封装
│   └── types/                  # TypeScript 类型定义
├── public/                     # 静态资源
└── docs/                       # 项目文档
```

---

## 设计理念

### 液态玻璃 UI

TalentFlow 采用独特的液态玻璃（Liquid Glass）设计语言：

- **半透明层次感**：`backdrop-blur` + 渐变背景营造深度
- **微妙光效**：`shimmer` 动画和渐变文字增添科技感
- **流畅动效**：`animate-fade-in-up` 等自定义动画提升交互体验
- **精致细节**：圆角卡片、细线分隔、微妙阴影

### 数据持久化策略

| 存储层 | 用途 | 原因 |
|--------|------|------|
| **localStorage** | 模型配置、UI 偏好 | 体积小、同步读取 |
| **IndexedDB** | 候选人数据、简历文件、匹配结果 | 体积大、异步读写 |

### AI 多模型支持

通过 Vercel AI SDK 集成多个 AI 服务商：

- **OpenAI**：GPT-4o、GPT-4 等
- **Anthropic**：Claude 3.5 Sonnet、Claude 3 Opus 等
- **Google**：Gemini Pro、Gemini Flash 等
- **视觉模型**：独立配置，用于图片简历 OCR 解析

---

## 部署

### Vercel 部署（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### Docker 部署

```bash
# 构建镜像
docker build -t talentflow .

# 运行容器
docker run -p 3000:3000 talentflow
```

---

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 许可证

本项目采用 [MIT License](./LICENSE) 开源许可证。

---

<div align="center">

**TalentFlow** — AI 驱动的招聘决策智能体

小鹏 AI 公开赛参赛作品

</div>
