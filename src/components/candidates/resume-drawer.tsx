// ============================================================
// TalentFlow — Resume Drawer (Side Panel)
// ============================================================
// Uses the Strategy Pattern for file rendering:
//   - PDF → iframe-based native PDF viewer
//   - Image → <img> with blob URL
//   - DOCX/DOC → mammoth.js HTML conversion
//   - Unknown → fallback with download button
//
// See: src/lib/resume-renderers/ for strategy implementations
// ============================================================

'use client';

import { useState, useEffect, useMemo } from 'react';
import { getFile } from '@/lib/db';
import { cn } from '@/lib/utils';
import { X, Download, FileText, Loader2 } from 'lucide-react';
import { getResumeRenderer } from '@/lib/resume-renderers';

interface ResumeDrawerProps {
  open: boolean;
  onClose: () => void;
  candidateId: string;
  fileName: string;
  fileType: string;
}

export function ResumeDrawer({
  open,
  onClose,
  candidateId,
  fileName,
  fileType,
}: ResumeDrawerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Load file blob from IndexedDB when drawer opens. */
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let url: string | null = null;

    const loadFile = async () => {
      setLoading(true);
      setError(null);
      try {
        const fileBlob = await getFile(candidateId);
        if (cancelled) return;

        if (!fileBlob) {
          setError('未找到简历文件');
          setLoading(false);
          return;
        }

        url = URL.createObjectURL(fileBlob);
        setBlobUrl(url);
      } catch {
        if (!cancelled) {
          setError('加载简历文件失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFile();

    return () => {
      cancelled = true;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [open, candidateId]);

  /** Clean up blob URL when drawer closes. */
  useEffect(() => {
    if (!open && blobUrl) {
      URL.revokeObjectURL(blobUrl);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- cleanup on close
      setBlobUrl(null);
    }
  }, [open, blobUrl]);

  /** Download the file. */
  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /**
   * Strategy Pattern — delegate rendering to the appropriate strategy.
   * useMemo ensures the renderer is only recomputed when file info changes.
   */
  const renderedContent = useMemo(() => {
    if (!blobUrl) return null;
    return getResumeRenderer({ blobUrl, fileName, fileType });
  }, [blobUrl, fileName, fileType]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out',
          'w-full sm:w-[50%] lg:w-[45%]',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="h-full bg-tf-bg/95 backdrop-blur-xl border-l border-tf-glass-border shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-tf-glass-border">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-tf-accent" />
              <div>
                <p className="text-sm font-medium text-tf-primary truncate max-w-[200px]">
                  {fileName}
                </p>
                <p className="text-xs text-tf-text-secondary">{fileType}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!blobUrl}
                className="p-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="下载文件"
              >
                <Download className="w-4 h-4 text-tf-secondary" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
                title="关闭"
              >
                <X className="w-4 h-4 text-tf-secondary" />
              </button>
            </div>
          </div>

          {/* Content — delegated to strategy renderer */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-tf-accent animate-spin mb-3" />
                <p className="text-sm text-tf-secondary">正在加载简历文件...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-64">
                <FileText className="w-10 h-10 text-tf-text-secondary/30 mb-3" />
                <p className="text-sm text-tf-secondary">{error}</p>
              </div>
            )}

            {!loading && !error && renderedContent}
          </div>
        </div>
      </div>
    </>
  );
}
