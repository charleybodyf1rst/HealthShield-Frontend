'use client';

/**
 * Client-side PDF export from a DOM element.
 *
 * Uses html2canvas-pro (maintained fork of html2canvas) which supports modern
 * CSS color functions — lab(), oklab(), oklch(), color() — that Tailwind 4
 * emits natively. The original html2pdf.js bundles old html2canvas which
 * throws "Attempting to parse an unsupported color function" on these styles.
 *
 * Both html2canvas-pro and jspdf are lazy-imported so the initial bundle
 * doesn't pay the cost — only loaded when the user clicks an "PDF" button.
 */

export interface ExportPdfOptions {
  /** Element to render. */
  element?: HTMLElement | null;
  /** Filename for the saved PDF (no .pdf extension required, but allowed). */
  filename: string;
  /** Orientation; default 'portrait'. */
  orientation?: 'portrait' | 'landscape';
  /** Page format; default 'letter'. */
  format?: 'letter' | 'a4';
  /** Page margin in inches; default 0.4. */
  margin?: number;
  /** If true, opens the generated PDF in a new tab. Default false (download). */
  openInNewTab?: boolean;
}

const FORMAT_DIMENSIONS: Record<'letter' | 'a4', { w: number; h: number }> = {
  letter: { w: 8.5, h: 11 },
  a4: { w: 8.27, h: 11.69 },
};

export async function exportToPdf(opts: ExportPdfOptions): Promise<void> {
  const el = opts.element;
  if (!el) throw new Error('exportToPdf: target element is null');

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  // Render the element to a high-DPI canvas. html2canvas-pro handles
  // lab/oklab/oklch/color() natively, unlike the older html2canvas.
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const orientation = opts.orientation ?? 'portrait';
  const format = opts.format ?? 'letter';
  const dim = FORMAT_DIMENSIONS[format];
  const pageWidth = orientation === 'portrait' ? dim.w : dim.h;
  const pageHeight = orientation === 'portrait' ? dim.h : dim.w;
  const margin = opts.margin ?? 0.4;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  const pdf = new jsPDF({ unit: 'in', format, orientation, compress: true });

  // Scale canvas full width to the printable content width
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= contentHeight) {
    // Fits on one page
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 0.95),
      'JPEG',
      margin,
      margin,
      imgWidth,
      imgHeight,
      undefined,
      'FAST',
    );
  } else {
    // Multi-page: slice the canvas into page-sized chunks
    const pageHeightPx = (canvas.width * contentHeight) / contentWidth;
    let yOffsetPx = 0;
    let isFirstPage = true;
    while (yOffsetPx < canvas.height) {
      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - yOffsetPx);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx;
      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) throw new Error('exportToPdf: cannot acquire 2d context');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(canvas, 0, -yOffsetPx);
      const sliceImgHeight = (sliceHeightPx * imgWidth) / canvas.width;
      if (!isFirstPage) pdf.addPage();
      pdf.addImage(
        sliceCanvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        margin,
        margin,
        imgWidth,
        sliceImgHeight,
        undefined,
        'FAST',
      );
      yOffsetPx += pageHeightPx;
      isFirstPage = false;
    }
  }

  const filename = opts.filename.endsWith('.pdf') ? opts.filename : `${opts.filename}.pdf`;

  if (opts.openInNewTab) {
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } else {
    pdf.save(filename);
  }
}
