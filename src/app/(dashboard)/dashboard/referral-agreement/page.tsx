'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, Printer, Loader2 } from 'lucide-react';
import { renderMarkdown } from '@/lib/render-markdown';

/**
 * Renders the HealthShield Referral Partner Agreement from /legal/referral-agreement.md.
 * Uses a tiny built-in markdown renderer (headers, bold, lists, hr, paragraphs) to
 * avoid adding a heavyweight markdown dep just for one legal page.
 */
export default function ReferralAgreementPage() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/legal/referral-agreement.md')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(setMarkdown)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSignature className="h-6 w-6 text-emerald-400" />
            Referral Agreement
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Standard partner agreement — same terms for HR staffing firms and insurance
            brokers (10% of first 12 months’ net revenue, paid quarterly). Send the link
            to a prospective partner or print to PDF for signature.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </Button>
        </div>
      </div>

      <Card className="bg-white text-slate-900 p-10 print:shadow-none print:border-0 max-w-4xl mx-auto">
        {error && (
          <div className="text-sm text-red-700">
            Failed to load agreement: {error}
          </div>
        )}
        {!markdown && !error && (
          <div className="flex items-center justify-center py-10 text-slate-500 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        )}
        {markdown && (
          <article className="prose-agreement">
            {renderMarkdown(markdown)}
          </article>
        )}
      </Card>

      <style jsx global>{`
        .prose-agreement h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        .prose-agreement h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        .prose-agreement h3 {
          font-size: 1.05rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.35rem;
          color: #1e293b;
        }
        .prose-agreement p {
          margin: 0.6rem 0;
          line-height: 1.65;
          color: #1e293b;
        }
        .prose-agreement strong {
          color: #0f172a;
        }
        .prose-agreement ul,
        .prose-agreement ol {
          margin: 0.5rem 0 0.75rem 1.5rem;
          line-height: 1.65;
          color: #1e293b;
        }
        .prose-agreement li {
          margin: 0.2rem 0;
        }
        .prose-agreement hr {
          margin: 1.5rem 0;
          border: none;
          border-top: 1px solid #cbd5e1;
        }
        .prose-agreement code {
          background: #f1f5f9;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-size: 0.9em;
        }
        @media print {
          .prose-agreement h1,
          .prose-agreement h2,
          .prose-agreement h3 {
            page-break-after: avoid;
          }
          .prose-agreement p,
          .prose-agreement li {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

