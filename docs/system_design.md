# TalentFlow — 候选人管理功能 系统设计文档

## 1. 实现方案

### 1.1 核心技术挑战

| 挑战 | 解决方案 |
|------|----------|
| IndexedDB 封装与异步初始化 | `idb` 库（~1.2KB）+ 单例 Promise 封装，首次打开自动升级创建 ObjectStore |
| Zustand Store 与 IndexedDB 双向同步 | Store 的 `addCandidate`/`addResult` 写穿 IndexedDB；`loadFromDB()` 在 layout 层调用 |
| PDF 侧边抽屉渲染 | `react-pdf` + Next.js `dynamic(() => import(), { ssr: false })` 避免 SSR 报错 |
| 候选人详情 4 Tab 大页面 | 路由级拆分 + Tab 组件 lazy import |
| 原始简历文件存储（≤10MB） | IndexedDB `files` store 存 Blob，单独 ObjectStore 避免污染 candidates |
| 现有类型兼容扩展 | `MatchResult` 增加 `candidateId` + `createdAt`（不破坏现有维度字段）|

### 1.2 技术选型

| 依赖 | 版本 | 用途 |
|------|------|------|
| `idb` | ^8.0.0 | IndexedDB Promise 封装，支持 upgrade callback |
| `react-pdf` | ^9.0.0 | PDF.js 封装，侧边抽屉渲染 PDF 简历 |
| `zustand` | 已有 (^5.0.13) | 状态管理 |
| `lucide-react` | 已有 | 图标 |

### 1.3 架构分层

```
┌─────────────────────────────────────────────────────────┐
│                    React Components                       │
│  candidates/page.tsx   [id]/page.tsx   resume-drawer.tsx │
├─────────────────────────────────────────────────────────┤
│              Zustand Stores (内存状态 + 写穿)             │
│  resume-store.ts       match-store.ts     model-store.ts │
├─────────────────────────────────────────────────────────┤
│              lib/db.ts — TalentFlowDB 封装               │
│  openDB / candidates CRUD / matches CRUD / files CRUD   │
├─────────────────────────────────────────────────────────┤
│              IndexedDB (idb 库)                          │
│  database: talentflow-db  v1                             │
│  ├─ candidates  (keyPath: id)                            │
│  ├─ matches     (keyPath: candidateId)                   │
│  └─ files       (keyPath: candidateId)                   │
└─────────────────────────────────────────────────────────┘
```

### 1.4 IndexedDB Schema

**Database**: `talentflow-db`, version `1`

| ObjectStore | keyPath | 索引 | 说明 |
|-------------|---------|------|------|
| `candidates` | `id` (UUID) | `name`, `email`, `createdAt` | 候选人元数据+解析结果 |
| `matches` | `candidateId` | `overallScore` | 匹配结果，一个候选人一条 |
| `files` | `candidateId` | — | 原始简历文件 Blob |

---

## 2. 文件列表

### 新建文件（12 个）

| 文件 | 说明 |
|------|------|
| `src/lib/db.ts` | IndexedDB 统一访问层（TalentFlowDB 单例） |
| `src/app/candidates/page.tsx` | 候选人列表页（卡片/表格双视图） |
| `src/app/candidates/[id]/page.tsx` | 候选人详情页入口 |
| `src/app/candidates/[id]/layout.tsx` | 详情页布局（Tab 导航） |
| `src/components/candidates/candidate-card.tsx` | 候选人卡片组件 |
| `src/components/candidates/candidate-table.tsx` | 候选人表格组件 |
| `src/components/candidates/candidate-detail-tabs.tsx` | 4 Tab 容器 |
| `src/components/candidates/tab-overview.tsx` | 概览 Tab |
| `src/components/candidates/tab-skills.tsx` | 技能图谱 Tab（import 复用 skill-graph.tsx）|
| `src/components/candidates/tab-interview.tsx` | 面试记录 Tab |
| `src/components/candidates/tab-match.tsx` | 匹配结果 Tab |
| `src/components/candidates/resume-drawer.tsx` | 侧边抽屉（PDF/图片预览） |

### 修改文件（6 个）

| 文件 | 修改内容 |
|------|----------|
| `package.json` | 添加 `idb`, `react-pdf` 依赖 |
| `src/types/index.ts` | 新增 `Candidate`, `CandidateStatus`, `ResumeFileMeta`, `InterviewRecord`；扩展 `MatchResult` 增加 `candidateId` + `createdAt` |
| `src/lib/store/resume-store.ts` | 重构为存 `Candidate[]`（非 `CandidateProfile[]`）；新增 `loadFromDB()` |
| `src/lib/store/match-store.ts` | 新增 `loadFromDB()`；写穿 IndexedDB |
| `src/components/layout/navbar.tsx` | 移除 `/skills` 入口，新增 `/candidates` 入口 |
| `src/app/layout.tsx` | 新增 ClientLayout 包裹 `<body>`，useEffect 中调用 `loadFromDB()` |
| `src/app/upload/page.tsx` | 解析完成后构建 `Candidate` 对象并写入 IndexedDB，然后跳转 `/candidates` |

### 删除文件（1 个）

| 文件 | 原因 |
|------|------|
| `src/app/skills/page.tsx` | 技能图谱入口移入候选人详情 Tab，独立页面不再需要 |

---

## 3. 数据结构和接口

### 3.1 类型定义扩展（src/types/index.ts）

```typescript
// ---- 新增类型 ----

export type CandidateStatus = 'new' | 'screening' | 'interviewing' | 'offer' | 'rejected';

export interface ResumeFileMeta {
  name: string;
  type: 'application/pdf' | 'image/png' | 'image/jpeg';
  size: number;  // bytes, ≤ 10MB
}

export interface Candidate {
  id: string;                      // crypto.randomUUID()
  profile: CandidateProfile;
  resumeFile: ResumeFileMeta | null;
  tags: string[];
  status: CandidateStatus;
  createdAt: string;               // ISO 8601
  updatedAt: string;
}

export interface InterviewRecord {
  id: string;
  candidateId: string;
  round: InterviewRound;           // 已有类型
  questions: InterviewQuestion[];  // 已有类型
  evaluations: InterviewEvaluation[]; // 已有类型
  overallScore: number;
  recommendation: string;
  summary: string;
  createdAt: string;
}

// ---- MatchResult 扩展（新增 2 个字段）----
export interface MatchResult {
  candidateId: string;             // 新增
  overallScore: number;            // 已有
  dimensions: MatchDimension[];    // 已有
  strengths: string[];             // 已有
  weaknesses: string[];            // 已有
  recommendation: string;          // 已有
  candidateName: string;           // 已有
  createdAt: string;               // 新增
}
```

### 3.2 DB Layer 接口（src/lib/db.ts）

```typescript
import { openDB, IDBPDatabase } from 'idb';
import type { Candidate, MatchResult } from '@/types';

interface TalentFlowDBSchema {
  candidates: { key: string; value: Candidate; indexes: { name: string; email: string; createdAt: string } };
  matches:    { key: string; value: MatchResult; indexes: { overallScore: number } };
  files:      { key: string; value: { candidateId: string; blob: Blob; fileName: string } };
}

class TalentFlowDB {
  private dbPromise: Promise<IDBPDatabase<TalentFlowDBSchema>> | null = null;

  // ---- Singleton ----
  static instance = new TalentFlowDB();

  // ---- Open (lazy) ----
  private open(): Promise<IDBPDatabase<TalentFlowDBSchema>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<TalentFlowDBSchema>('talentflow-db', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('candidates')) {
            const cs = db.createObjectStore('candidates', { keyPath: 'id' });
            cs.createIndex('name', 'profile.name');
            cs.createIndex('email', 'profile.email');
            cs.createIndex('createdAt', 'createdAt');
          }
          if (!db.objectStoreNames.contains('matches')) {
            const ms = db.createObjectStore('matches', { keyPath: 'candidateId' });
            ms.createIndex('overallScore', 'overallScore');
          }
          if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files', { keyPath: 'candidateId' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  // ---- Candidates ----
  async getAllCandidates(): Promise<Candidate[]> { ... }
  async getCandidate(id: string): Promise<Candidate | undefined> { ... }
  async putCandidate(c: Candidate): Promise<void> { ... }
  async deleteCandidate(id: string): Promise<void> { ... }

  // ---- Matches ----
  async getMatchByCandidate(candidateId: string): Promise<MatchResult | undefined> { ... }
  async putMatch(m: MatchResult): Promise<void> { ... }

  // ---- Files ----
  async getResumeFile(candidateId: string): Promise<Blob | undefined> { ... }
  async putResumeFile(candidateId: string, blob: Blob, fileName: string): Promise<void> { ... }
  async deleteResumeFile(candidateId: string): Promise<void> { ... }
}

export const talentFlowDB = TalentFlowDB.instance;
```

### 3.3 Store 改造要点

**resume-store.ts** 关键变更：
- `candidates: Candidate[]`（替换 `CandidateProfile[]`）
- 新增 `loadFromDB(): Promise<void>` — 调用 `talentFlowDB.getAllCandidates()`
- `addCandidate(candidate: Candidate)` — 写穿 IndexedDB：`talentFlowDB.putCandidate(candidate)`
- 移除 `activeCandidateIndex` 改为详情页通过 `id` 查询

**match-store.ts** 关键变更：
- 新增 `loadFromDB(): Promise<void>` — 调用 `talentFlowDB.getAllMatches()`（如果需要）
- `addResult(result: MatchResult)` — 写穿：`talentFlowDB.putMatch(result)`
- `results` 数组结构不变，`MatchResult` 增加 `candidateId`

---

## 4. 程序调用流程

> 详见 `docs/sequence-diagram.mermaid`

4 个核心时序图覆盖：
1. **应用启动** — layout.tsx → loadFromDB → IndexedDB
2. **简历解析→存储** — upload/page → API → resumeStore → IndexedDB → 跳转
3. **列表→详情→抽屉** — /candidates → 点击 → /candidates/[id] → Tab 切换 → resume-drawer
4. **匹配结果保存** — match/page → matchStore → IndexedDB → 详情页 Tab 4 读取

---

## 5. 不确定事项与假设

| # | 事项 | 假设/决策 |
|---|------|----------|
| 1 | 面试记录存储 | 新增 `InterviewRecord` 类型，暂仅存入 IndexedDB `interviews` store（可选），面试助手页的写入集成留后续任务 |
| 2 | 匹配页如何关联候选人 | `match/page.tsx` 保留现有独立功能；候选人详情 Tab 4 只读展示匹配结果（用 `candidateId` 查询） |
| 3 | 候选人列表排序/筛选 | 默认按 `createdAt` 倒序；筛选用 status 下拉 |
| 4 | 技能图谱 Tab | 直接 `import { SkillGraph } from '@/components/skills/skill-graph'`，传入 `candidate.profile.skills` |
| 5 | skills/page.tsx 删除 | 导航更新后删除，不影响其他页面 |
| 6 | resume-store 的 `activeCandidateIndex` | 重构为通过 `id` 查询（列表页 → 详情页通过路由参数），移除 `activeCandidateIndex` |

---

## 6. 依赖包列表

```
- idb@^8.0.0          IndexedDB Promise 封装，支持 upgrade callback
- react-pdf@^9.0.0    PDF.js React 组件，用于侧边抽屉渲染 PDF 简历
```

> 已有依赖（不需要新增）：zustand, next, react, react-dom, tailwindcss, lucide-react, clsx, tailwind-merge

---

## 7. 任务列表（按依赖顺序）

### T01: 数据层 — db.ts + 类型扩展 + store 持久化

| 字段 | 内容 |
|------|------|
| **Task ID** | T01 |
| **优先级** | P0 |
| **依赖** | 无 |
| **源文件** | `package.json`（改）, `src/lib/db.ts`（新）, `src/types/index.ts`（改）, `src/lib/store/resume-store.ts`（改）, `src/lib/store/match-store.ts`（改）|
| **说明** | 数据基础层。`db.ts` 封装所有 IndexedDB CRUD；类型扩展为后续组件提供类型安全；Store 持久化让数据刷新不丢失 |

### T02: 根布局 + 导航栏更新

| 字段 | 内容 |
|------|------|
| **Task ID** | T02 |
| **优先级** | P0 |
| **依赖** | T01 |
| **源文件** | `src/app/layout.tsx`（改）, `src/components/layout/navbar.tsx`（改）, `src/app/skills/page.tsx`（删）|
| **说明** | 新增 ClientLayout wrapper，useEffect 中调用 `loadFromDB()`；导航移除 `/skills`、新增 `/candidates` |

### T03: 候选人列表页 + upload 改造

| 字段 | 内容 |
|------|------|
| **Task ID** | T03 |
| **优先级** | P0 |
| **依赖** | T01, T02 |
| **源文件** | `src/app/candidates/page.tsx`（新）, `src/components/candidates/candidate-card.tsx`（新）, `src/components/candidates/candidate-table.tsx`（新）, `src/app/upload/page.tsx`（改）|
| **说明** | 列表页支持卡片/表格双视图切换；upload 页改造为解析完成后构建 `Candidate` 并写入 IndexedDB |

### T04: 候选人详情页 + 4 Tab

| 字段 | 内容 |
|------|------|
| **Task ID** | T04 |
| **优先级** | P0 |
| **依赖** | T01 |
| **源文件** | `src/app/candidates/[id]/page.tsx`（新）, `src/app/candidates/[id]/layout.tsx`（新）, `src/components/candidates/candidate-detail-tabs.tsx`（新）, `src/components/candidates/tab-overview.tsx`（新）, `src/components/candidates/tab-skills.tsx`（新）, `src/components/candidates/tab-interview.tsx`（新）, `src/components/candidates/tab-match.tsx`（新）|
| **说明** | 详情页用 `use(params.id)` 获取候选人；4 个 Tab 各自读取对应数据；技能图谱 Tab 复用 `skill-graph.tsx` |

### T05: 侧边抽屉 + 集成调试

| 字段 | 内容 |
|------|------|
| **Task ID** | T05 |
| **优先级** | P0 |
| **依赖** | T04 |
| **源文件** | `src/components/candidates/resume-drawer.tsx`（新）, T03/T04 组件微调 |
| **说明** | 侧边抽屉组件，PDF 用 `react-pdf` 动态 import，图片用 `URL.createObjectURL`；最后整体联调 |

---

## 8. 共享知识

```
- 所有候选人 CRUD 通过 lib/db.ts 的 talentFlowDB 单例，组件不直接操作 IndexedDB
- 候选人 ID 始终使用 crypto.randomUUID() 生成
- Store 的 loadFromDB() 在 layout.tsx 的 ClientLayout useEffect 中调用（SSR 安全）
- react-pdf 使用 Next.js dynamic import：const PDFViewer = dynamic(() => ..., { ssr: false })
- 上传时校验文件大小 ≤ 10MB
- 状态枚举：'new' | 'screening' | 'interviewing' | 'offer' | 'rejected'
- 日期格式统一 ISO 8601 UTC string（new Date().toISOString()）
- 技能图谱直接 import 复用 components/skills/skill-graph.tsx，不复制
- Zustand store 采用写穿策略——更新内存后同步写入 IndexedDB
- MatchResult 扩展 candidateId 字段，用于按候选人查询匹配结果
- resume-store 从 CandidateProfile[] 重构为 Candidate[]（包含 id/status/tags/timestamps）
```

## 9. 任务依赖图

```
T01 (数据层) ──→ T02 (布局/导航) ──→ T03 (列表页 + upload)
   │
   └──────────→ T04 (详情页 + 4Tab) ──→ T05 (侧边抽屉 + 集成)
```

T03 和 T04 可并行开发（T03 依赖 T01+T02，T04 仅依赖 T01）。
