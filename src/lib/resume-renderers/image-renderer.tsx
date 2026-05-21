// ============================================================
// Resume Renderer — Image Strategy
// ============================================================
// Renders common image formats (JPG, PNG, WebP, GIF, BMP, TIFF)
// using a simple <img> tag with blob URL.
// ============================================================

'use client';

import type { ReactElement } from 'react';
import type { ResumeRenderStrategy, RenderContext } from './types';

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i;

export class ImageRenderer implements ResumeRenderStrategy {
  readonly name = 'Image';

  canHandle(ctx: RenderContext): boolean {
    return (
      ctx.fileType.startsWith('image/') ||
      IMAGE_EXTENSIONS.test(ctx.fileName)
    );
  }

  render(ctx: RenderContext): ReactElement {
    return (
      <div className="flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob URLs are not supported by next/image */}
        <img
          src={ctx.blobUrl}
          alt={ctx.fileName}
          className="max-w-full h-auto rounded-xl shadow-lg"
        />
      </div>
    );
  }
}
