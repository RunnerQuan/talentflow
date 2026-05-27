// ============================================================
// TalentFlow — Type Definitions
// ============================================================

/** Model identifier — user-defined string */
export type ModelId = string;

/** Persisted model settings saved to localStorage */
export interface ModelSettings {
  /** User-defined model name sent to the API (e.g. 'gpt-4o', 'claude-3-5-sonnet-20241022') */
  modelName: string;
  apiKey: string;
  baseURL: string;
}

/** Vision model settings — separate config for image/scanned PDF parsing */
export interface VisionModelSettings {
  /** Vision-capable model name (e.g. 'gpt-4o', 'claude-3-5-sonnet-20241022') */
  modelName: string;
  apiKey: string;
  baseURL: string;
  /** Whether to use vision model settings; if false, falls back to main model */
  enabled: boolean;
}

/** Education history entry */
export interface Education {
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

/** Work experience entry */
export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

/** Project entry */
export interface Project {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

/** A single skill with proficiency */
export interface Skill {
  name: string;
  level: number; // 1-5
  category: string;
}

/** Structured candidate profile parsed from resume */
export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  summary: string;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: Skill[];
  yearsOfExperience: number;
  currentTitle: string;
  currentCompany: string;
  rawText?: string;
}

/** A skill node in the graph */
export interface SkillNode {
  id: string;
  name: string;
  category: string;
  level: number;
  x: number;
  y: number;
}

/** An edge between two skill nodes */
export interface SkillEdge {
  source: string;
  target: string;
  relation: 'prerequisite' | 'complementary' | 'evolution';
}

/** The full skill graph data */
export interface SkillGraphData {
  nodes: SkillNode[];
  edges: SkillEdge[];
}

/** Matching dimension score */
export interface MatchDimension {
  name: string;
  score: number;
  weight: number;
  details: string[];
}

/** Complete match result */
export interface MatchResult {
  overallScore: number;
  dimensions: MatchDimension[];
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  candidateName: string;
}

export type EvidenceType =
  | 'skill'
  | 'experience'
  | 'project'
  | 'education'
  | 'summary'
  | 'missing';

export type EvidenceVerdict = 'matched' | 'partial' | 'missing' | 'uncertain';

export interface MatchEvidence {
  id: string;
  dimension: string;
  jdRequirement: string;
  resumeEvidence: string;
  evidenceType: EvidenceType;
  confidence: number;
  verdict: EvidenceVerdict;
}

export interface MatchRisk {
  id: string;
  level: 'green' | 'yellow' | 'red';
  title: string;
  description: string;
  suggestedAction: string;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  targetRisk: string;
  reason: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ExplainableMatchResult extends MatchResult {
  evidences?: MatchEvidence[];
  risks?: MatchRisk[];
  followUpQuestions?: FollowUpQuestion[];
  decision?: {
    level: 'strong_recommend' | 'recommend' | 'hold' | 'not_recommend';
    nextStep: 'technical_interview' | 'hr_screening' | 'talent_pool' | 'reject';
    summary: string;
  };
}

export interface JobSkillRequirement {
  name: string;
  category: string;
  importance: 'must' | 'preferred' | 'bonus';
  evidence: string;
}

export interface SkillGapNode {
  id: string;
  name: string;
  category: string;
  level?: number;
  source: 'candidate' | 'job' | 'both' | 'missing';
  importance?: 'must' | 'preferred' | 'bonus';
  gapLevel?: 'none' | 'minor' | 'major';
  candidateEvidence?: string;
  jdEvidence?: string;
}

export interface SkillGapEdge {
  source: string;
  target: string;
  relation: 'has_evidence' | 'requires' | 'missing' | 'related';
}

export interface SkillGapGraphData {
  nodes: SkillGapNode[];
  edges: SkillGapEdge[];
}

export interface BatchMatchResult {
  candidateId?: string;
  candidateName: string;
  score: number;
  rank: number;
  level: 'A' | 'B' | 'C' | 'D';
  highlights: string[];
  risks: string[];
  suggestedAction: '直接技术面' | 'HR 初筛' | '进入人才库' | '暂不推荐';
}

export interface BatchMatchSummary {
  totalCandidates: number;
  recommendedCount: number;
  averageScore: number;
  topCandidateName: string;
}

/** Interview question */
export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
  followUp?: string;
  whyAsk?: string;
  evidenceFromResume?: string;
  targetRisk?: string;
  scoringRubric?: string[];
}

/** Interview round type */
export type InterviewRound = 'screening' | 'technical' | 'cultural' | 'final';

/** Interview evaluation */
export interface InterviewEvaluation {
  questionId: string;
  answer: string;
  score: number;
  feedback: string;
  dimensionScores?: {
    accuracy: number;
    logic: number;
    depth: number;
    authenticity: number;
    communication: number;
  };
  riskVerified?: 'resolved' | 'partially_resolved' | 'confirmed' | 'unknown';
}

/** Complete interview report */
export interface InterviewReport {
  candidateName: string;
  round: InterviewRound;
  questions: InterviewQuestion[];
  evaluations: InterviewEvaluation[];
  overallScore: number;
  recommendation: string;
  summary: string;
  nextStep?: 'next_round' | 'offer' | 'hold' | 'reject';
  nextRoundFocus?: string[];
  finalRisks?: string[];
}

/** Efficiency statistics for dashboard */
export interface EfficiencyStats {
  totalMatches: number;
  avgProcessingTime: number; // minutes
  efficiencyMultiplier: number;
  timeSaved: number; // hours
  costSaved: number; // yuan
}

/** ROI calculator inputs */
export interface ROIInputs {
  teamSize: number;
  avgSalary: number;
  monthlyResumes: number;
  timePerResume: number; // minutes
}

/** ROI calculator outputs */
export interface ROIOutputs {
  monthlyTimeSaved: number; // hours
  yearlyCostSaved: number; // yuan
  roiPercentage: number;
}

// ============================================================
// Candidate Management Types
// ============================================================

/** Candidate status lifecycle */
export type CandidateStatus = 'new' | 'screening' | 'interviewing' | 'offer' | 'rejected';

/** Raw resume file metadata (blob stored separately in IndexedDB files store) */
export interface ResumeFile {
  name: string;
  type: string; // MIME type
  size: number;
}

/** Complete candidate record persisted in IndexedDB */
export interface CandidateRecord {
  id: string;
  profile: CandidateProfile;
  resumeFile: ResumeFile;
  tags: string[];
  status: CandidateStatus;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

/** Match result record persisted in IndexedDB */
export interface MatchResultRecord {
  id: string;
  candidateId: string;
  jobTitle: string;
  jobDescription?: string;
  score: number;
  dimensions?: MatchDimension[];
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  recommendation?: string;
  strengths: string[];
  weaknesses: string[];
  evidences?: MatchEvidence[];
  risks?: MatchRisk[];
  followUpQuestions?: FollowUpQuestion[];
  decision?: ExplainableMatchResult['decision'];
  createdAt: string;
}

/** Interview record persisted in IndexedDB */
export interface InterviewRecord {
  id: string;
  candidateId: string;
  round: InterviewRound;
  questions: InterviewQuestion[];
  evaluations: InterviewEvaluation[];
  report: InterviewReport | null;
  createdAt: string;
}

/** Status display label map */
export const STATUS_LABELS: Record<CandidateStatus, string> = {
  new: '新增',
  screening: '筛选中',
  interviewing: '面试中',
  offer: '已发 Offer',
  rejected: '已拒绝',
};

/** Status color map (Tailwind classes) */
export const STATUS_COLORS: Record<CandidateStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  screening: 'bg-amber-100 text-amber-700',
  interviewing: 'bg-purple-100 text-purple-700',
  offer: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};
