'use client';

/**
 * Client-side PDF export from a DOM element using html2pdf.js.
 *
 * Lazy-imports html2pdf so the bundle doesn't include it on every page —
 * only loaded when the user clicks an "Open PDF" button.
 *
 * The default config uses scale: 2 for a crisp render and letter portrait
 * orientation. Pass `landscape: true` for business cards or wide content.
 */

export interface ExportPdfOptions {
  /** Element to render. Defaults to `document.body`. */
  element?: HTMLElement | null;
  /** Filename for the saved PDF (no .pdf extension required, but allowed). */
  filename: string;
  /** Orientation; default 'portrait'. */
  orientation?: 'portrait' | 'landscape';
  /** Page format; default 'letter'. Use 'a4' if needed. */
  format?: 'letter' | 'a4';
  /** Page margin in inches; default 0.4. */
  margin?: number;
  /** If true, opens the generated PDF in a new tab instead of downloading. Default false. */
  openInNewTab?: boolean;
}

export async function exportToPdf(opts: ExportPdfOptions): Promise<void> {
  const el = opts.element;
  if (!el) {
    throw new Error('exportToPdf: target element is null');
  }

  const html2pdf = (await import('html2pdf.js')).default;

  const filename = opts.filename.endsWith('.pdf') ? opts.filename : `${opts.filename}.pdf`;

  const worker = html2pdf()
    .from(el)
    .set({
      margin: opts.margin ?? 0.4,
      filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      },
      jsPDF: {
        unit: 'in',
        format: opts.format ?? 'letter',
        orientation: opts.orientation ?? 'portrait',
        compress: true,
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    });

  if (opts.openInNewTab) {
    const blob: Blob = await worker.outputPdf('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Revoke after a delay so the new tab has time to load it.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } else {
    await worker.save();
  }
}
