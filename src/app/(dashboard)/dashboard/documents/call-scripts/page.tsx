'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Printer, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { renderMarkdown } from '@/lib/render-markdown';

/**
 * Renders the HealthShield Insurance Call Scripts from
 * /documents/healthshield-call-scripts.md as a clean, printable reference
 * for the sales team. Reused renderMarkdown helper from the referral agreement.
 */
export default function CallScriptsPage() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/documents/healthshield-call-scripts.md')
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
            <Phone className="h-6 w-6 text-cyan-400" />
            HealthShield Call Scripts
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Ready-to-use scripts for cold outreach, follow-ups, renewals, and
            cross-sell. Replace <code className="px-1 py-0.5 rounded bg-white/10 text-xs">{'{{variables}}'}</code>{' '}
            with the prospect&apos;s details before dialing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/documents" className="text-xs text-white/60 hover:text-white inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Documents
          </Link>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </Button>
        </div>
      </div>

      <Card className="bg-white text-slate-900 p-10 print:shadow-none print:border-0 max-w-4xl mx-auto">
        {error && (
          <div className="text-sm text-red-700">
            Failed to load scripts: {error}
          </div>
        )}
        {!markdown && !error && (
          <div className="flex items-center justify-center py-10 text-slate-500 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        )}
        {markdown && (
          <article className="prose-callscripts">
            {renderMarkdown(markdown)}
          </article>
        )}
      </Card>

      <style jsx global>{`
        .prose-callscripts h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        .prose-callscripts h2 {
          font-size: 1.35rem;
          font-weight: 600;
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
          padding-bottom: 0.35rem;
          border-bottom: 2px solid #e2e8f0;
        }
        .prose-callscripts h3 {
          font-size: 1.05rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.35rem;
          color: #1e293b;
        }
        .prose-callscripts p {
          margin: 0.6rem 0;
          line-height: 1.65;
          color: #1e293b;
        }
        .prose-callscripts strong {
          color: #0f172a;
        }
        .prose-callscripts em {
          color: #475569;
        }
        .prose-callscripts ul,
        .prose-callscripts ol {
          margin: 0.5rem 0 0.75rem 1.5rem;
          line-height: 1.65;
          color: #1e293b;
        }
        .prose-callscripts li {
          margin: 0.2rem 0;
        }
        .prose-callscripts blockquote {
          margin: 0.75rem 0;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-left: 3px solid #06b6d4;
          color: #0f172a;
          font-style: italic;
          line-height: 1.65;
        }
        .prose-callscripts hr {
          margin: 1.5rem 0;
          border: none;
          border-top: 1px solid #cbd5e1;
        }
        .prose-callscripts code {
          background: #f1f5f9;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-size: 0.9em;
        }
        @media print {
          .prose-callscripts h1,
          .prose-callscripts h2,
          .prose-callscripts h3 {
            page-break-after: avoid;
          }
          .prose-callscripts blockquote,
          .prose-callscripts li {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
