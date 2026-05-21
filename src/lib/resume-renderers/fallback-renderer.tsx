// ============================================================
// Resume Renderer — Fallback Strategy
// ============================================================
// Shown when no other strategy can handle the file type.
// Offers a download button as the only recovery path.
// ============================================================

'use client';

import type { ReactElement } from 'react';
import type { ResumeRenderStrategy, RenderContext } from './types';
import { FileText, Download } from 'lucide-react';

export class FallbackRenderer implements ResumeRenderStrategy {
  readonly name = 'Fallback';

  /**
   * Fallback always returns true — it's the catch-all.
   * Must be registered last in the renderer list.
   */
  canHandle(): boolean {
    return true;
  }

  render(ctx: RenderContext): ReactElement {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FileText className="w-10 h-10 text-tf-text-secondary/30 mb-3" />
        <p className="text-sm text-tf-secondary mb-1">无法预览此文件类型</p>
        <p className="text-xs text-tf-text-secondary mb-4">
          {ctx.fileName}
        </p>
        <a
          href={ctx.blobUrl}
          download={ctx.fileName}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tf-accent text-white text-sm font-medium hover:bg-tf-accent-hover transition-colors"
        >
          <Download className="w-4 h-4" />
          下载文件
        </a>
      </div>
    );
  }
}
