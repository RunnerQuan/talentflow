// ============================================================
// TalentFlow — Drag & Drop Upload Zone
// ============================================================

'use client';

import { useState, useCallback, useRef } from 'react';
import { cn, isSupportedFileType } from '@/lib/utils';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  accept?: string;
}

export function UploadZone({
  onFileSelect,
  disabled = false,
  accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff',
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const file = files[0];

      if (file && isSupportedFileType(file.name)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [disabled, onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isSupportedFileType(file.name)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        'glass-card relative cursor-pointer',
        'flex flex-col items-center justify-center',
        'p-10 sm:p-14 text-center',
        'transition-all duration-300',
        'border-2 border-dashed',
        isDragging
          ? 'border-tf-accent bg-tf-accent/5 scale-[1.02]'
          : 'border-tf-glass-border hover:border-tf-accent/40',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-tf-accent/10 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-tf-accent" />
          </div>
          <div>
            <p className="text-base font-medium text-tf-primary mb-1">
              {selectedFile.name}
            </p>
            <p className="text-sm text-tf-text-secondary">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="flex items-center gap-1 text-xs text-tf-text-secondary hover:text-red-500 transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
            重新选择
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300',
              isDragging ? 'bg-tf-accent/20' : 'bg-tf-accent/10'
            )}
          >
            <Upload
              className={cn(
                'w-8 h-8 transition-colors duration-300',
                isDragging ? 'text-tf-accent' : 'text-tf-accent/70'
              )}
            />
          </div>
          <div>
            <p className="text-base font-medium text-tf-primary mb-1">
              {isDragging ? '松开以上传文件' : '拖拽简历到此处，或点击上传'}
            </p>
            <p className="text-sm text-tf-text-secondary">
              支持 PDF、Word (.doc/.docx)、TXT、图片 (JPG/PNG) 格式
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-tf-text-secondary">
            <FileText className="w-3.5 h-3.5" />
            <span>文件上传至本地服务器处理，不会外传至第三方</span>
          </div>
        </div>
      )}
    </div>
  );
}
