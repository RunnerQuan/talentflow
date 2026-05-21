// Type declarations for pdfjs-dist worker module
// Dynamically imported at runtime to pre-load the PDF worker,
// bypassing Next.js bundler path mangling issues.

declare module 'pdfjs-dist/legacy/build/pdf.worker.mjs' {
  const WorkerMessageHandler: unknown;
  export { WorkerMessageHandler };
}
