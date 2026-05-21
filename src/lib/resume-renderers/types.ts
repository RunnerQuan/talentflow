// ============================================================
// Resume Renderer — Strategy Pattern Type Definitions
// ============================================================

import type { ReactElement } from 'react';

/**
 * Input context passed to each rendering strategy.
 * Contains everything a renderer needs to display the resume.
 */
export interface RenderContext {
  /** Blob URL of the file (created from IndexedDB blob) */
  blobUrl: string;
  /** Original file name (e.g. "resume.pdf") */
  fileName: string;
  /** MIME type (e.g. "application/pdf") */
  fileType: string;
}

/**
 * Strategy interface — each file type implements this contract.
 *
 * Implementations are pure renderers: they receive a RenderContext
 * and return a ReactElement. No side effects, no state management.
 */
export interface ResumeRenderStrategy {
  /** Human-readable name for debugging / logging */
  readonly name: string;

  /**
   * Check whether this strategy can handle the given file.
   * Called in order — first match wins.
   */
  canHandle(ctx: RenderContext): boolean;

  /**
   * Render the file content.
   * The returned element fills the drawer's content area.
   */
  render(ctx: RenderContext): ReactElement;
}
