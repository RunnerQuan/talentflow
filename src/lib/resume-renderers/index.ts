// ============================================================
// Resume Renderer — Strategy Registry & Factory
// ============================================================
// Central registry that maps file types to rendering strategies.
//
// Design Pattern: Strategy
//   - Each file type (PDF, Image, DOCX/DOC) has its own strategy class
//   - Strategies are registered in priority order
//   - First matching strategy wins
//   - FallbackRenderer catches anything that doesn't match
//
// Usage:
//   import { getResumeRenderer } from '@/lib/resume-renderers';
//   const element = getResumeRenderer({ blobUrl, fileName, fileType });
// ============================================================

import type { ReactElement } from 'react';
import type { ResumeRenderStrategy, RenderContext } from './types';
import { PDFRenderer } from './pdf-renderer';
import { ImageRenderer } from './image-renderer';
import { DocxRenderer } from './docx-renderer';
import { FallbackRenderer } from './fallback-renderer';

// Re-export types for consumers
export type { RenderContext, ResumeRenderStrategy } from './types';

/**
 * Ordered list of rendering strategies.
 * First match wins — put specific strategies before general ones.
 * FallbackRenderer MUST be last.
 */
const STRATEGIES: ResumeRenderStrategy[] = [
  new PDFRenderer(),
  new ImageRenderer(),
  new DocxRenderer(),
  new FallbackRenderer(), // catch-all, must be last
];

/**
 * Find the first strategy that can handle the given file,
 * then render it. Returns a React element for the drawer.
 *
 * @throws never — FallbackRenderer always matches.
 */
export function getResumeRenderer(ctx: RenderContext): ReactElement {
  for (const strategy of STRATEGIES) {
    if (strategy.canHandle(ctx)) {
      console.log(`[resume-renderer] Using strategy: ${strategy.name} for ${ctx.fileName}`);
      return strategy.render(ctx);
    }
  }

  // Unreachable — FallbackRenderer.canHandle() always returns true.
  // But TypeScript needs the safety net:
  return new FallbackRenderer().render(ctx);
}
