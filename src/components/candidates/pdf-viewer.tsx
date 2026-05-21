// ============================================================
// TalentFlow — PDF Viewer Component (iframe native renderer)
// ============================================================
// Uses the browser's built-in PDF engine (PDFium / PDF.js) via
// <iframe>. This is the most universal approach — it handles
// any PDF regardless of font encoding, complex layout, or
// embedded fonts, with zero JS dependency issues.
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setLoadError(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setLoadError(true);
  }, []);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-10 h-10 text-tf-text-secondary/30 mb-3" />
        <p className="text-sm text-tf-secondary mb-2">PDF 加载失败</p>
        <p className="text-xs text-tf-text-secondary">
          该 PDF 文件可能已损坏或格式不兼容
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-tf-bg/60 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-tf-accent animate-spin" />
            <p className="text-sm text-tf-secondary">正在加载 PDF...</p>
          </div>
        </div>
      )}

      {/* Browser-native PDF rendering via iframe */}
      <iframe
        src={url}
        title="PDF Viewer"
        className="flex-1 w-full min-h-[600px] border-0 rounded-xl shadow-lg"
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
}
