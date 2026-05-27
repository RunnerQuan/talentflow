# TalentFlow Agent Platform Design

## Goal

Transform TalentFlow from an AI recruiting tool into an AI-driven recruiting decision agent platform. This phase implements the complete P0 + P1 scope from the optimization plan while keeping the work demo-first and stable.

The product positioning becomes:

> TalentFlow: AI 招聘决策智能体平台，让招聘从经验判断走向证据驱动。

The primary homepage CTA is `一键体验`, not `一键体验 Demo`.

## Scope

This phase includes:

- Homepage Agent workflow redesign.
- One-click `/demo` experience with deterministic local data and no API key dependency.
- Explainable match results with evidence chains, risks, follow-up questions, and decision output.
- One-click conversion from match follow-up questions into technical interview questions.
- Skill gap graph comparing candidate skills against JD requirements.
- Batch candidate ranking for one JD against multiple candidates.
- Structured interview enhancements: question intent, scoring rubrics, dimension scores, risk verification, and next-step report fields.
- README updates for contest presentation.

This phase does not include:

- Field-level resume parsing confidence.
- Manual candidate profile calibration.
- Full hiring decision report page and export workflow.

Those are P2 follow-ups and should remain separate to reduce first-round implementation risk.

## Architecture

The existing Next.js App Router structure remains in place. The implementation extends current patterns:

- UI uses existing `GlassCard`, `Button`, `Input`, and Tailwind/Liquid Glass styling.
- Client state continues to use Zustand stores.
- Persistent local records continue to use IndexedDB through `src/lib/db.ts`.
- AI API routes continue to use Vercel AI SDK structured object generation with JSON fallback.

New and changed areas:

- `src/app/page.tsx`: Rebuilt homepage with hero, Agent workflow, core capabilities, demo entry, and contest highlights.
- `src/app/demo/page.tsx`: Deterministic demo page.
- `src/lib/demo/demo-data.ts`: Demo JD, candidates, explainable match results, interview questions, ranking results, and skill gap data inputs.
- `src/types/index.ts`: Adds explainable matching, skill gap, batch ranking, and structured interview fields.
- `src/app/api/match/route.ts`: Returns explainable match results.
- `src/components/match/*`: Evidence chain, risk board, follow-up questions, and decision card.
- `src/lib/skills/build-skill-gap-graph.ts`: Builds a lightweight graph from candidate skills and JD skill requirements.
- `src/app/api/extract-jd-skills/route.ts`: Extracts JD skill requirements when API settings are available.
- `src/components/skills/*`: Skill gap graph, legend, and summary.
- `src/app/ranking/page.tsx` and `src/app/api/batch-match/route.ts`: Batch candidate ranking.
- `src/components/ranking/*`: Ranking table, Top candidate cards, JD panel, and summary.
- `src/app/api/interview/route.ts` and interview components: Structured interview generation, evaluation, and reporting.

## User Flow

1. User lands on the homepage.
2. The first viewport communicates `AI 招聘决策智能体平台` and shows `一键体验`.
3. Clicking `一键体验` opens `/demo`.
4. Demo page shows a Java backend JD, three candidates, and a six-Agent workflow.
5. Clicking start analysis animates the workflow:
   `Resume Parser -> Profile -> Skill Graph -> JD Matching -> Interview -> Decision`.
6. Results show ranked candidates, explainable match evidence, risk levels, skill gaps, follow-up questions, and recommended next action.
7. In the regular match page, real AI match results use the same evidence and risk components.
8. Follow-up questions can be converted into technical interview questions and persisted as an interview record.
9. The ranking page supports real batch ranking with API settings and deterministic demo fallback without API settings.

## Data Model

Add explainable matching types:

- `MatchEvidence`: JD requirement, resume evidence, evidence type, confidence, verdict.
- `MatchRisk`: green/yellow/red risk level with suggested action.
- `FollowUpQuestion`: question, target risk, reason, difficulty.
- `ExplainableMatchResult extends MatchResult`: evidence, risks, follow-up questions, and decision.

Add skill gap types:

- `JobSkillRequirement`: skill requirement extracted from JD.
- `SkillGapNode`: candidate/job/both/missing skill node.
- `SkillGapEdge`: has evidence, requires, missing, or related edge.
- `SkillGapGraphData`: graph node and edge collection.

Add batch ranking type:

- `BatchMatchResult`: candidate name/id, score, rank, level, highlights, risks, suggested action.

Extend interview types:

- `InterviewQuestion`: optional `whyAsk`, `evidenceFromResume`, `targetRisk`, `scoringRubric`.
- `InterviewEvaluation`: optional dimension scores and risk verification status.
- `InterviewReport`: optional next step, next-round focus, and final risks.

Existing data remains compatible because all new persisted fields are optional where they affect old records.

## API Behavior

`POST /api/match`:

- Keeps the existing request shape.
- Returns an explainable match result.
- Requires evidence to come from candidate profile fields, or explicitly states `简历中未发现直接证据`.
- Generates follow-up questions from yellow/red risks.

`POST /api/extract-jd-skills`:

- Accepts JD text and model settings.
- Returns structured skill requirements with importance and source evidence.

`POST /api/batch-match`:

- Accepts JD text, candidates, and model settings.
- Returns sorted results and summary.
- Uses one model call for all candidates.

`POST /api/interview`:

- `generate` returns question intent and scoring rubric.
- `evaluate` returns dimension scores and risk verification.
- `report` returns next-step decision and remaining risks.

## UI Design

The visual direction stays close to the existing Liquid Glass UI while making the platform feel more agentic and decision-oriented.

Homepage:

- Full first viewport with product name, platform positioning, supporting copy, and CTA.
- Agent workflow cards show input, output, and status.
- Core capability cards focus on parsing, graph, matching, and interview decision.
- Demo section uses `一键体验`.
- Contest highlights focus on multi-agent workflow, evidence-based matching, and interview decision loop.

Demo:

- Left: JD panel.
- Middle: candidate/ranking panel.
- Right: Agent workflow and result panel.
- Results are deterministic and do not call AI APIs.

Match:

- Existing score and dimension view remains.
- New sections append below: decision card, evidence chain, risk board, follow-up questions.
- Missing explainable fields produce no crash and simply hide enhanced sections.

Skills:

- Skill gap graph distinguishes `both`, `candidate`, and `missing`.
- Missing must-have skills are visually red and prominent.

Ranking:

- JD input and candidate selection on the left.
- Ranking table, Top 3 cards, and pool summary on the right.
- Demo fallback is clearly labeled when API settings are missing.

Interview:

- Question cards show intent, resume evidence, target risk, and scoring rubric.
- Evaluation view shows five dimension scores and risk verification.
- Report view shows next step and remaining risks.

## Error Handling

- Demo never depends on model settings or network.
- Real AI pages keep current model configuration checks.
- API routes validate required inputs and return localized error messages.
- Enhanced UI components treat missing arrays as empty arrays.
- API fallback JSON parsing remains for model providers that fail structured output.

## Testing And Verification

Verification for this phase:

- `npm run lint`
- `npm run build`
- Manual browser check of:
  - `/`
  - `/demo`
  - `/match`
  - `/ranking`
  - `/interview`
- Responsive check for homepage, demo, and ranking on desktop and mobile widths.

Acceptance criteria:

- Homepage shows platform positioning and `一键体验` in the first viewport.
- `/demo` works with no API key and shows complete decision flow.
- Match results can show evidence, risks, follow-ups, and decision.
- Follow-up questions can create an interview record.
- Skill gap graph highlights missing JD requirements.
- Ranking page sorts multiple candidates and has demo fallback.
- Interview questions and reports show structured decision context.
- Old records without new fields do not crash existing pages.
