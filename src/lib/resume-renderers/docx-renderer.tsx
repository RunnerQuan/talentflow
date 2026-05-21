// ============================================================
// Resume Renderer — DOCX/DOC Strategy
// ============================================================
// Uses mammoth.js to convert Word documents to HTML, then
// renders the result with scoped styles to match the app's
// design language (liquid glass / Apple aesthetic).
//
// Flow: Blob URL → fetch → ArrayBuffer → mammoth.convertToHtml → render
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReactElement } from 'react';
import type { ResumeRenderStrategy, RenderContext } from './types';
import { Loader2, AlertCircle } from 'lucide-react';

/** mammoth.js types (minimal) */
interface MammothResult {
  value: string; // HTML string
  messages: Array<{ type: string; message: string }>;
}

/** File extensions this renderer handles */
const WORD_EXTENSIONS = /\.(docx?|doc)$/i;

/** MIME types for Word documents */
const WORD_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export class DocxRenderer implements ResumeRenderStrategy {
  readonly name = 'DOCX/DOC';

  canHandle(ctx: RenderContext): boolean {
    const lowerName = ctx.fileName.toLowerCase();
    return (
      WORD_MIME_TYPES.includes(ctx.fileType) ||
      WORD_EXTENSIONS.test(lowerName)
    );
  }

  render(ctx: RenderContext): ReactElement {
    return <WordDocumentView blobUrl={ctx.blobUrl} fileName={ctx.fileName} />;
  }
}

// ============================================================
// WordDocumentView — Internal component for DOCX rendering
// ============================================================

interface WordDocumentViewProps {
  blobUrl: string;
  fileName: string;
}

function WordDocumentView({ blobUrl, fileName }: WordDocumentViewProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertToHtml = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the blob as ArrayBuffer
      const response = await fetch(blobUrl);
      const arrayBuffer = await response.arrayBuffer();

      // Dynamically import mammoth.js (tree-shakeable, only loaded when needed)
      const mammoth = await import('mammoth');

      // Convert DOCX/DOC to HTML
      const result: MammothResult = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          // Preserve basic formatting for readability
          styleMap: [
            'p[style-name="Heading 1"] => h1:fresh',
            'p[style-name="Heading 2"] => h2:fresh',
            'p[style-name="Heading 3"] => h3:fresh',
            'b => strong',
            'i => em',
          ],
        }
      );

      if (result.messages.length > 0) {
        console.log('[WordDocumentView] mammoth messages:', result.messages);
      }

      setHtml(result.value || '<p>文档内容为空</p>');
    } catch (err) {
      console.error('[WordDocumentView] Conversion failed:', err);
      setError(
        err instanceof Error ? err.message : '无法解析此 Word 文档'
      );
    } finally {
      setLoading(false);
    }
  }, [blobUrl]);

  useEffect(() => {
    convertToHtml();
  }, [convertToHtml]);

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-tf-accent animate-spin mb-3" />
        <p className="text-sm text-tf-secondary">正在解析 Word 文档...</p>
      </div>
    );
  }

  // ---- Error state ----
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-10 h-10 text-tf-text-secondary/30 mb-3" />
        <p className="text-sm text-tf-secondary mb-2">{error}</p>
        <p className="text-xs text-tf-text-secondary">
          请确保文件未损坏且为有效的 Word 文档
        </p>
      </div>
    );
  }

  // ---- Rendered HTML ----
  return (
    <div className="word-document-container">
      {/* Scoped styles for mammoth-generated HTML */}
      <style>{`
        .word-document-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
            'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
          font-size: 14px;
          line-height: 1.75;
          color: #1a1a2e;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .word-document-content h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.25rem 0 0.75rem;
          color: #0f0f23;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding-bottom: 0.5rem;
        }
        .word-document-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
          color: #0f0f23;
        }
        .word-document-content h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem;
          color: #1a1a2e;
        }
        .word-document-content p {
          margin: 0.5rem 0;
        }
        .word-document-content ul,
        .word-document-content ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .word-document-content li {
          margin: 0.25rem 0;
        }
        .word-document-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 0.75rem 0;
          font-size: 0.875rem;
        }
        .word-document-content th,
        .word-document-content td {
          border: 1px solid rgba(0, 0, 0, 0.1);
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .word-document-content th {
          background: rgba(0, 0, 0, 0.03);
          font-weight: 600;
        }
        .word-document-content a {
          color: #6366f1;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .word-document-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        .word-document-content blockquote {
          border-left: 3px solid rgba(99, 102, 241, 0.3);
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: #64748b;
        }
      `}</style>

      <div
        className="word-document-content"
        dangerouslySetInnerHTML={{ __html: html || '' }}
      />
    </div>
  );
}
