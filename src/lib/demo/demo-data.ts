import type {
  BatchMatchResult,
  BatchMatchSummary,
  CandidateRecord,
  ExplainableMatchResult,
  InterviewQuestion,
  JobSkillRequirement,
} from '@/types';

export const demoJD = {
  id: 'java-backend-engineer',
  title: 'Java 后端开发工程师',
  description: `岗位职责：
1. 负责核心业务系统后端开发；
2. 参与高并发接口、缓存、数据库优化；
3. 参与 AI 应用平台的后端能力建设。

岗位要求：
1. 熟悉 Java、Spring Boot、MySQL、Redis；
2. 了解消息队列、分布式系统设计；
3. 有完整项目经验，能说明性能优化细节；
4. 对 AI 工程化或智能体应用有兴趣。`,
};

export const demoJobSkills: JobSkillRequirement[] = [
  {
    name: 'Java',
    category: '编程语言',
    importance: 'must',
    evidence: '熟悉 Java、Spring Boot、MySQL、Redis',
  },
  {
    name: 'Spring Boot',
    category: '后端',
    importance: 'must',
    evidence: '熟悉 Java、Spring Boot、MySQL、Redis',
  },
  {
    name: 'MySQL',
    category: '数据库',
    importance: 'must',
    evidence: '参与缓存、数据库优化',
  },
  {
    name: 'Redis',
    category: '数据库',
    importance: 'must',
    evidence: '参与高并发接口、缓存、数据库优化',
  },
  {
    name: '消息队列',
    category: '后端',
    importance: 'preferred',
    evidence: '了解消息队列、分布式系统设计',
  },
  {
    name: '分布式系统',
    category: '后端',
    importance: 'preferred',
    evidence: '了解消息队列、分布式系统设计',
  },
  {
    name: 'AI Agent',
    category: 'AI/ML',
    importance: 'bonus',
    evidence: '对 AI 工程化或智能体应用有兴趣',
  },
];

export const demoCandidates: CandidateRecord[] = [
  {
    id: 'demo-candidate-1',
    profile: {
      name: '郑杰全',
      email: 'demo1@example.com',
      phone: '13800000001',
      summary: '软件工程专业背景，具备 Java 后端、Redis、MySQL、AI 应用开发经验。',
      education: [
        {
          school: '中山大学',
          degree: '本科',
          major: '软件工程',
          startDate: '2022',
          endDate: '2026',
        },
      ],
      workExperience: [
        {
          company: '某科技公司',
          title: '后端研发实习生',
          startDate: '2025.06',
          endDate: '2025.09',
          description:
            '参与合规智能审查平台后端开发，负责异步任务调度、工单并发控制、规则引擎与 RAG 检索流程。',
        },
      ],
      projects: [
        {
          name: 'TalentFlow',
          role: '全栈开发',
          startDate: '2026.05',
          endDate: '2026.05',
          description:
            'AI 招聘决策智能体平台，支持简历解析、技能图谱、人岗匹配、面试助手。',
          technologies: ['Next.js', 'TypeScript', 'Vercel AI SDK', 'IndexedDB'],
        },
        {
          name: 'Quan RPC Framework',
          role: '后端开发',
          startDate: '2025.01',
          endDate: '2025.03',
          description:
            '自研 RPC 框架，实现服务注册、负载均衡、SPI、重试容错等能力。',
          technologies: ['Java', 'Vert.x', 'Etcd', 'TCP'],
        },
      ],
      skills: [
        { name: 'Java', level: 4, category: '编程语言' },
        { name: 'Spring Boot', level: 4, category: '后端' },
        { name: 'Redis', level: 4, category: '数据库' },
        { name: 'MySQL', level: 4, category: '数据库' },
        { name: 'AI Agent', level: 3, category: 'AI/ML' },
        { name: 'Next.js', level: 3, category: '前端' },
      ],
      yearsOfExperience: 1,
      currentTitle: '后端研发实习生',
      currentCompany: '某科技公司',
      rawText: 'Demo 简历文本：Java、Spring Boot、Redis、MySQL、RPC、AI Agent。',
    },
    resumeFile: { name: 'demo-zheng-jiequan.pdf', type: 'application/pdf', size: 102400 },
    tags: ['Demo', '后端', 'AI 工程化'],
    status: 'screening',
    createdAt: '2026-05-20T08:00:00.000Z',
    updatedAt: '2026-05-20T08:00:00.000Z',
  },
  {
    id: 'demo-candidate-2',
    profile: {
      name: '林可欣',
      email: 'demo2@example.com',
      phone: '13800000002',
      summary: '偏全栈方向，熟悉 React、Node.js、MySQL，有业务系统开发经验。',
      education: [
        {
          school: '华南理工大学',
          degree: '本科',
          major: '计算机科学与技术',
          startDate: '2021',
          endDate: '2025',
        },
      ],
      workExperience: [
        {
          company: '互联网创业公司',
          title: '全栈开发实习生',
          startDate: '2024.07',
          endDate: '2025.01',
          description: '负责运营后台、数据看板和用户权限模块，参与 MySQL 表结构设计。',
        },
      ],
      projects: [
        {
          name: '招聘运营看板',
          role: '前后端开发',
          startDate: '2024.09',
          endDate: '2024.12',
          description: '搭建招聘数据看板，支持岗位漏斗分析和候选人阶段追踪。',
          technologies: ['React', 'Node.js', 'MySQL'],
        },
      ],
      skills: [
        { name: 'React', level: 4, category: '前端' },
        { name: 'Node.js', level: 3, category: '后端' },
        { name: 'MySQL', level: 3, category: '数据库' },
        { name: 'TypeScript', level: 3, category: '编程语言' },
      ],
      yearsOfExperience: 1,
      currentTitle: '全栈开发实习生',
      currentCompany: '互联网创业公司',
      rawText: 'Demo 简历文本：React、Node.js、MySQL、数据看板。',
    },
    resumeFile: { name: 'demo-lin-kexin.pdf', type: 'application/pdf', size: 98304 },
    tags: ['Demo', '全栈'],
    status: 'new',
    createdAt: '2026-05-20T08:10:00.000Z',
    updatedAt: '2026-05-20T08:10:00.000Z',
  },
  {
    id: 'demo-candidate-3',
    profile: {
      name: '周明远',
      email: 'demo3@example.com',
      phone: '13800000003',
      summary: '具备 Java 后端基础，参与过企业内部系统开发，项目深度需要进一步验证。',
      education: [
        {
          school: '广东工业大学',
          degree: '本科',
          major: '软件工程',
          startDate: '2022',
          endDate: '2026',
        },
      ],
      workExperience: [
        {
          company: '制造业软件部门',
          title: 'Java 开发实习生',
          startDate: '2025.03',
          endDate: '2025.06',
          description: '参与内部工单系统接口开发和简单报表查询优化。',
        },
      ],
      projects: [
        {
          name: '工单管理系统',
          role: '后端开发',
          startDate: '2025.03',
          endDate: '2025.06',
          description: '完成工单查询、状态流转、权限校验等模块。',
          technologies: ['Java', 'Spring Boot', 'MySQL'],
        },
      ],
      skills: [
        { name: 'Java', level: 3, category: '编程语言' },
        { name: 'Spring Boot', level: 3, category: '后端' },
        { name: 'MySQL', level: 3, category: '数据库' },
      ],
      yearsOfExperience: 1,
      currentTitle: 'Java 开发实习生',
      currentCompany: '制造业软件部门',
      rawText: 'Demo 简历文本：Java、Spring Boot、MySQL、工单系统。',
    },
    resumeFile: { name: 'demo-zhou-mingyuan.pdf', type: 'application/pdf', size: 92160 },
    tags: ['Demo', 'Java'],
    status: 'new',
    createdAt: '2026-05-20T08:20:00.000Z',
    updatedAt: '2026-05-20T08:20:00.000Z',
  },
];

export const demoMatchResult: ExplainableMatchResult = {
  candidateName: '郑杰全',
  overallScore: 87,
  dimensions: [
    {
      name: '技能匹配',
      score: 90,
      weight: 0.4,
      details: ['Java、Spring Boot、Redis、MySQL 均有直接技能证据', 'AI Agent 属于加分匹配项'],
    },
    {
      name: '经验匹配',
      score: 82,
      weight: 0.25,
      details: ['有后端实习和完整项目经历', '商业高并发线上经验仍需面试验证'],
    },
    {
      name: '岗位适配',
      score: 86,
      weight: 0.2,
      details: ['后端平台、RAG 流程和规则引擎经验与岗位方向接近'],
    },
    {
      name: '成长潜力',
      score: 91,
      weight: 0.15,
      details: ['能独立完成全栈 AI 应用并理解工程化链路'],
    },
  ],
  strengths: ['Java 后端基础扎实', '有 Redis、MySQL 与异步任务实践', '具备 AI 工程化项目经验'],
  weaknesses: ['消息队列没有明确直接证据', '分布式系统经历主要来自自研项目，生产复杂度需验证'],
  recommendation: '推荐进入技术面试，重点追问消息队列、分布式一致性和性能优化细节。',
  evidences: [
    {
      id: 'ev-java',
      dimension: '技能匹配',
      jdRequirement: '熟悉 Java、Spring Boot',
      resumeEvidence: '技能清单包含 Java(4/5)、Spring Boot(4/5)，项目包含 Quan RPC Framework。',
      evidenceType: 'skill',
      confidence: 92,
      verdict: 'matched',
    },
    {
      id: 'ev-cache',
      dimension: '技能匹配',
      jdRequirement: '参与高并发接口、缓存、数据库优化',
      resumeEvidence: '技能清单包含 Redis、MySQL；实习经历提到异步任务调度和工单并发控制。',
      evidenceType: 'experience',
      confidence: 84,
      verdict: 'partial',
    },
    {
      id: 'ev-agent',
      dimension: '岗位适配',
      jdRequirement: '对 AI 工程化或智能体应用有兴趣',
      resumeEvidence: 'TalentFlow 项目为 AI 招聘决策智能体平台，技术栈包含 Vercel AI SDK。',
      evidenceType: 'project',
      confidence: 90,
      verdict: 'matched',
    },
    {
      id: 'ev-mq',
      dimension: '经验匹配',
      jdRequirement: '了解消息队列',
      resumeEvidence: '简历中未发现直接证据。',
      evidenceType: 'missing',
      confidence: 72,
      verdict: 'missing',
    },
  ],
  risks: [
    {
      id: 'risk-java',
      level: 'green',
      title: '后端主栈匹配',
      description: 'Java、Spring Boot、Redis、MySQL 与岗位硬性要求高度重合。',
      suggestedAction: '技术面可直接进入项目深挖。',
    },
    {
      id: 'risk-mq',
      level: 'yellow',
      title: '消息队列证据不足',
      description: 'JD 要求了解消息队列，但简历中没有直接项目证据。',
      suggestedAction: '面试追问异步削峰、重试、幂等和死信处理。',
    },
    {
      id: 'risk-scale',
      level: 'yellow',
      title: '生产高并发深度待验证',
      description: '有并发控制与缓存实践，但生产规模和指标未明确。',
      suggestedAction: '追问 QPS、延迟、缓存命中率和数据库优化指标。',
    },
  ],
  followUpQuestions: [
    {
      id: 'fq-mq',
      question: '如果工单系统需要用消息队列削峰，你会如何设计重试、幂等和死信处理？',
      targetRisk: '消息队列证据不足',
      reason: '验证候选人是否具备 JD 中消息队列与异步架构的实际理解。',
      difficulty: 'medium',
    },
    {
      id: 'fq-cache',
      question: '请说明你在 Redis 缓存设计中如何处理热点 key、缓存穿透和数据一致性。',
      targetRisk: '生产高并发深度待验证',
      reason: '验证缓存优化是否停留在使用层面，还是理解线上风险。',
      difficulty: 'hard',
    },
    {
      id: 'fq-rpc',
      question: '你的 RPC 框架如何做服务发现、负载均衡和失败重试？关键取舍是什么？',
      targetRisk: '分布式系统深度待验证',
      reason: '验证分布式系统设计能力与个人贡献真实性。',
      difficulty: 'hard',
    },
  ],
  decision: {
    level: 'recommend',
    nextStep: 'technical_interview',
    summary: '候选人与 Java 后端岗位高度匹配，建议进入技术面试，围绕消息队列、缓存一致性和分布式系统深度追问。',
  },
};

export const demoInterviewQuestions: InterviewQuestion[] = demoMatchResult.followUpQuestions!.map((q) => ({
  id: q.id,
  question: q.question,
  category: q.targetRisk,
  difficulty: q.difficulty,
  expectedAnswer: `请重点验证：${q.reason}`,
  followUp: '根据候选人回答继续追问项目指标、技术取舍和个人贡献。',
  whyAsk: q.reason,
  evidenceFromResume: '由人岗匹配风险自动生成。',
  targetRisk: q.targetRisk,
  scoringRubric: ['能说明真实项目背景', '能解释关键技术取舍', '能给出指标或失败处理细节'],
}));

export const demoRankingResults: BatchMatchResult[] = [
  {
    candidateId: 'demo-candidate-1',
    candidateName: '郑杰全',
    score: 87,
    rank: 1,
    level: 'A',
    highlights: ['后端主栈匹配', 'AI 工程化项目经验突出'],
    risks: ['消息队列证据不足', '生产高并发指标需追问'],
    suggestedAction: '直接技术面',
  },
  {
    candidateId: 'demo-candidate-3',
    candidateName: '周明远',
    score: 72,
    rank: 2,
    level: 'B',
    highlights: ['Java/Spring Boot/MySQL 基础匹配', '有企业系统开发经历'],
    risks: ['Redis 和分布式经验缺失', '项目复杂度较低'],
    suggestedAction: 'HR 初筛',
  },
  {
    candidateId: 'demo-candidate-2',
    candidateName: '林可欣',
    score: 61,
    rank: 3,
    level: 'C',
    highlights: ['业务系统和 MySQL 经验可迁移', '全栈协作能力较好'],
    risks: ['Java/Spring Boot 主栈不匹配', '后端深度不足'],
    suggestedAction: '进入人才库',
  },
];

export const demoRankingSummary: BatchMatchSummary = {
  totalCandidates: demoRankingResults.length,
  recommendedCount: demoRankingResults.filter((item) => item.level === 'A' || item.level === 'B').length,
  averageScore: Math.round(
    demoRankingResults.reduce((sum, item) => sum + item.score, 0) / demoRankingResults.length
  ),
  topCandidateName: demoRankingResults[0].candidateName,
};
