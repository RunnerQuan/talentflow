// ============================================================
// Resume Renderer — PDF Strategy
// ============================================================
// Delegates to the existing PDFViewer component which uses
// the browser's built-in PDF engine via <iframe>.
// ============================================================

'use client';

import type { ReactElement } from 'react';
import type { ResumeRenderStrategy, RenderContext } from './types';
import { PDFViewer } from '@/components/candidates/pdf-viewer';

export class PDFRenderer implements ResumeRenderStrategy {
  readonly name = 'PDF';

  canHandle(ctx: RenderContext): boolean {
    return (
      ctx.fileType === 'application/pdf' ||
      ctx.fileName.toLowerCase().endsWith('.pdf')
    );
  }

  render(ctx: RenderContext): ReactElement {
    return <PDFViewer url={ctx.blobUrl} />;
  }
}
