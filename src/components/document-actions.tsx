'use client';

import { useState, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportToPdf } from '@/lib/export-pdf';

interface DocumentActionsProps {
  /** Ref to the element that should be exported. */
  targetRef: RefObject<HTMLElement | null>;
  /** Base filename for the downloaded PDF (without .pdf). */
  filename: string;
  /** Optional: open the generated PDF in a new tab instead of downloading. Default false (download). */
  pdfOpensInNewTab?: boolean;
  /** Optional: orientation override (default portrait). */
  orientation?: 'portrait' | 'landscape';
  /** Optional: format override (default letter). */
  format?: 'letter' | 'a4';
  /** Optional: button size. */
  size?: 'sm' | 'default';
  /** Optional: button variant. */
  variant?: 'default' | 'outline' | 'ghost';
}

/**
 * Two-button action group used on every printable/PDF-able dashboard page.
 * - PDF: generates a real PDF file from the rendered DOM via html2pdf.js,
 *   then either downloads it (default) or opens in a new tab.
 * - Print: opens the browser print dialog (window.print). The browser's
 *   "Save as PDF" destination also works from here, but as a print dialog.
 */
export function DocumentActions({
  targetRef,
  filename,
  pdfOpensInNewTab = true,
  orientation,
  format,
  size = 'sm',
  variant = 'outline',
}: DocumentActionsProps) {
  const [exporting, setExporting] = useState(false);

  const handlePdf = async () => {
    if (!targetRef.current) {
      toast.error('Nothing to export yet');
      return;
    }
    setExporting(true);
    try {
      await exportToPdf({
        element: targetRef.current,
        filename,
        orientation,
        format,
        openInNewTab: pdfOpensInNewTab,
      });
    } catch (err) {
      console.error('PDF export failed', err);
      toast.error(`PDF export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={handlePdf}
        disabled={exporting}
        className="gap-2"
      >
        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
        {exporting ? 'Generating…' : 'PDF'}
      </Button>
      <Button variant={variant} size={size} onClick={handlePrint} className="gap-2">
        <Printer className="w-4 h-4" />
        Print
      </Button>
    </div>
  );
}
