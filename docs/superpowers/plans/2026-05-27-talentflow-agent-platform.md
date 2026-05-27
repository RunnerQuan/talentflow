# TalentFlow Agent Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete P0 + P1 TalentFlow agent-platform upgrade with homepage, deterministic demo, explainable matching, skill-gap graph, batch ranking, and structured interview enhancements.

**Architecture:** Extend the existing Next.js App Router app without changing the persistence layer architecture. Add optional type fields for backward compatibility, use local demo data for stable contest presentation, and reuse existing GlassCard/Button/Tailwind patterns for all new views.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Zustand, IndexedDB via `idb`, Vercel AI SDK, Zod, lucide-react.

---

## File Map

- Modify `src/types/index.ts`: Add explainable match, skill gap, ranking, and structured interview fields.
- Create `src/lib/demo/demo-data.ts`: Deterministic JD, candidates, match results, ranking results, and interview questions.
- Create `src/lib/skills/build-skill-gap-graph.ts`: Pure function for candidate/JD skill gap graph data.
- Create `src/components/home/agent-card.tsx`, `agent-workflow.tsx`, `demo-entry.tsx`: Homepage platform components.
- Modify `src/app/page.tsx`: Replace SaaS-style landing with Agent platform homepage and `一键体验` CTA.
- Create `src/components/demo/demo-workflow.tsx`, `demo-result-panel.tsx`; create `src/app/demo/page.tsx`: Deterministic demo flow.
- Modify `src/app/api/match/route.ts`: Return `ExplainableMatchResult`.
- Create match components: `evidence-chain.tsx`, `risk-board.tsx`, `follow-up-questions.tsx`, `decision-card.tsx`.
- Modify `src/components/match/match-result.tsx`: Display enhanced result sections and create interview records from follow-ups.
- Create `src/app/api/extract-jd-skills/route.ts` and skill-gap UI components.
- Create `src/app/ranking/page.tsx`, `src/app/api/batch-match/route.ts`, and ranking components.
- Modify `src/app/api/interview/route.ts`, `src/components/interview/question-card.tsx`, and `src/app/interview/page.tsx`: Structured interview fields.
- Modify `README.md`: Contest-oriented positioning and workflow.

## Task 1: Types And Demo Data

- [ ] Extend `src/types/index.ts` with optional explainable match, skill-gap, batch ranking, and structured interview types.
- [ ] Create deterministic demo data in `src/lib/demo/demo-data.ts`.
- [ ] Create `src/lib/skills/build-skill-gap-graph.ts` as a pure utility.
- [ ] Run `npx tsc --noEmit` and fix type errors introduced by new shared types.

## Task 2: Homepage Agent Platform

- [ ] Create home components under `src/components/home/`.
- [ ] Replace `src/app/page.tsx` with the approved homepage structure.
- [ ] Ensure primary CTA text is exactly `一键体验` and links to `/demo`.
- [ ] Check mobile layout does not rely on full-width horizontal workflow.

## Task 3: Deterministic Demo Flow

- [ ] Create demo workflow and result-panel components.
- [ ] Create `/demo` page that animates Agent status locally and never calls an API.
- [ ] Show JD, three candidates, ranking, evidence, risks, follow-ups, skill gap summary, and decision.
- [ ] Label demo mode as no API key required.

## Task 4: Explainable Match API And UI

- [ ] Extend `/api/match` Zod schema and prompt to return evidence, risks, follow-ups, and decision.
- [ ] Create match display components for decision, evidence chain, risk board, and follow-up questions.
- [ ] Wire enhanced components into existing `MatchResultDisplay` with backward-compatible field checks.
- [ ] Add a follow-up conversion action that persists a technical interview record through `useInterviewStore`.

## Task 5: Skill Gap Graph

- [ ] Add `/api/extract-jd-skills` with structured skill extraction.
- [ ] Create skill gap graph, legend, and summary components.
- [ ] Integrate the graph in demo and match result UI when JD skill requirements are available.
- [ ] Keep the graph lightweight SVG/HTML and avoid new graph dependencies.

## Task 6: Batch Ranking

- [ ] Add `/api/batch-match` with one-call ranking schema and JSON fallback.
- [ ] Add ranking components for JD panel, summary, Top candidates, and ranking table.
- [ ] Add `/ranking` page with real candidate selection and demo fallback when API settings are missing.
- [ ] Ensure multiple candidates can be ranked and sorted by score.

## Task 7: Structured Interview Enhancements

- [ ] Extend `/api/interview` schemas and prompts for question intent, scoring rubric, dimension scores, risk verification, and next-step report fields.
- [ ] Update `QuestionCard` to show new optional structured fields without breaking old questions.
- [ ] Update interview report UI to show next step, next-round focus, final risks, and dimension scores.

## Task 8: README And Verification

- [ ] Update `README.md` with AI recruiting decision agent platform positioning, core highlights, Mermaid workflow, demo instructions, and contest fit.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Start the dev server and inspect `/`, `/demo`, `/match`, `/ranking`, and `/interview` in the browser.
