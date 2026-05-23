'use client';

/**
 * Opens an isolated new window containing only the printable element + every
 * stylesheet from the current page, then auto-triggers window.print(). The
 * user picks "Save as PDF" as the print destination — the browser's own
 * renderer produces a pixel-perfect PDF.
 *
 * Replaces three failed client-side canvas approaches (html2pdf.js,
 * html2canvas-pro, modern-screenshot) — all of which dropped Tailwind 4
 * styling in different ways. Canvas libraries re-implement CSS rendering;
 * the browser already renders the dashboard correctly on-screen, so we
 * leverage that instead.
 */

export interface ExportPdfOptions {
  /** Element to render. */
  element?: HTMLElement | null;
  /** Used as the print-window title. */
  filename: string;
  /** Default 'portrait'. */
  orientation?: 'portrait' | 'landscape';
  /** Default 'letter'. */
  format?: 'letter' | 'a4';
  /** Page margin in inches; default 0.4. */
  margin?: number;
  /** Retained for backward-compat; no effect with the print-window approach. */
  openInNewTab?: boolean;
}

export async function exportToPdf(opts: ExportPdfOptions): Promise<void> {
  const el = opts.element;
  if (!el) throw new Error('exportToPdf: target element is null');

  // Copy every <style> and <link rel="stylesheet"> from the source document
  const styles = Array.from(
    document.querySelectorAll<HTMLElement>('style, link[rel="stylesheet"]'),
  )
    .map((node) => node.outerHTML)
    .join('\n');

  const win = window.open('', '_blank', 'width=900,height=1100');
  if (!win) {
    throw new Error('Pop-up blocked. Allow popups for this site and try again.');
  }

  const orientation = opts.orientation ?? 'portrait';
  const pageSize = opts.format === 'a4' ? 'A4' : 'letter';
  const margin = opts.margin ?? 0.4;

  win.document.open();
  win.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(opts.filename)}</title>
  ${styles}
  <style>
    html, body { margin: 0; padding: 0; background: white; }
    @page { size: ${pageSize} ${orientation}; margin: ${margin}in; }
    @media print {
      html, body { background: white !important; }
    }
  </style>
</head>
<body>
  ${el.outerHTML}
  <script>
    window.addEventListener('load', function () {
      // Give fonts + images a tick to load
      setTimeout(function () {
        window.focus();
        window.print();
      }, 400);
    });
    window.addEventListener('afterprint', function () {
      window.close();
    });
  </script>
</body>
</html>`);
  win.document.close();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
