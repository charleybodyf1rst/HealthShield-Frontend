'use client';

/**
 * Direct PDF download via the server-side Puppeteer renderer.
 *
 * Builds a standalone HTML document (the printable element + every
 * stylesheet from the source page + a <base> tag so relative URLs
 * resolve), POSTs it to the pdf-renderer Cloud Run service, and
 * triggers a download of the returned PDF blob.
 *
 * Why server-side: four client-side approaches all failed on Tailwind 4
 * (html2pdf.js / html2canvas-pro / modern-screenshot / print-window).
 * The print-window worked visually but opened a print dialog instead of
 * downloading a file. This implementation produces a one-click PDF
 * download with pixel-identical rendering (it's real Chromium).
 */

export interface ExportPdfOptions {
  /** Element to render. */
  element?: HTMLElement | null;
  /** Filename for the downloaded PDF (no .pdf extension required). */
  filename: string;
  /** Default 'portrait'. */
  orientation?: 'portrait' | 'landscape';
  /** Default 'letter'. */
  format?: 'letter' | 'a4';
  /** Page margin in inches; default 0.4. */
  margin?: number;
  /** Retained for backward-compat; no effect with server-side rendering. */
  openInNewTab?: boolean;
}

const RENDERER_URL = process.env.NEXT_PUBLIC_PDF_RENDERER_URL ?? '';
const RENDERER_TOKEN = process.env.NEXT_PUBLIC_PDF_RENDERER_TOKEN ?? '';

export async function exportToPdf(opts: ExportPdfOptions): Promise<void> {
  const el = opts.element;
  if (!el) throw new Error('exportToPdf: target element is null');
  if (!RENDERER_URL) {
    throw new Error(
      'PDF renderer URL not configured (NEXT_PUBLIC_PDF_RENDERER_URL missing). Falling back to browser print is not implemented.',
    );
  }

  // Collect every <style> and <link rel="stylesheet"> from the source page
  const styles = Array.from(
    document.querySelectorAll<HTMLElement>('style, link[rel="stylesheet"]'),
  )
    .map((node) => node.outerHTML)
    .join('\n');

  const baseHref = `${window.location.origin}/`;
  const orientation = opts.orientation ?? 'portrait';
  const format = (opts.format ?? 'letter') === 'a4' ? 'A4' : 'Letter';
  const margin = opts.margin ?? 0.4;

  // Build the standalone document
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <base href="${baseHref}" />
  <title>${escapeHtml(opts.filename)}</title>
  ${styles}
  <style>
    html, body { margin: 0; padding: 0; background: white; }
  </style>
</head>
<body>
${el.outerHTML}
</body>
</html>`;

  const res = await fetch(`${RENDERER_URL.replace(/\/$/, '')}/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(RENDERER_TOKEN ? { Authorization: `Bearer ${RENDERER_TOKEN}` } : {}),
    },
    body: JSON.stringify({
      html,
      format,
      orientation,
      margin,
    }),
  });

  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).detail || (await res.json()).error || ''; } catch { /* ignore */ }
    throw new Error(`PDF render failed (${res.status})${detail ? ': ' + detail : ''}`);
  }

  const blob = await res.blob();
  const filename = opts.filename.endsWith('.pdf') ? opts.filename : `${opts.filename}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
