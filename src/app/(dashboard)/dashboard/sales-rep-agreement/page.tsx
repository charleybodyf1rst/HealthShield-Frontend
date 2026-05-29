'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, Loader2, RotateCcw } from 'lucide-react';
import { renderMarkdown } from '@/lib/render-markdown';
import { DocumentActions } from '@/components/document-actions';

const DEFAULT_BODYFIRST_ADDRESS = '3651 Greystone Drive, Suite 302, Austin, TX 78731';

function todayLongDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function fillMergeVars(md: string, values: Record<string, string>): string {
  return md.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = values[key]?.trim();
    return v && v.length > 0 ? v : '_____________________';
  });
}

export default function SalesRepAgreementPage() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [repName, setRepName] = useState('');
  const [repAddress, setRepAddress] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [territoryOrFocus, setTerritoryOrFocus] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(todayLongDate());
  const [bodyfirstAddress, setBodyfirstAddress] = useState(DEFAULT_BODYFIRST_ADDRESS);

  useEffect(() => {
    fetch('/legal/sales-rep-agreement.md')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(setMarkdown)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const filledMarkdown = useMemo(() => {
    if (!markdown) return null;
    return fillMergeVars(markdown, {
      rep_name: repName,
      rep_address: repAddress,
      rep_email: repEmail,
      territory_or_focus: territoryOrFocus,
      effective_date: effectiveDate,
      bodyfirst_address: bodyfirstAddress,
    });
  }, [
    markdown,
    repName,
    repAddress,
    repEmail,
    territoryOrFocus,
    effectiveDate,
    bodyfirstAddress,
  ]);

  const printableRef = useRef<HTMLDivElement | null>(null);

  const handleReset = () => {
    setRepName('');
    setRepAddress('');
    setRepEmail('');
    setTerritoryOrFocus('');
    setEffectiveDate(todayLongDate());
    setBodyfirstAddress(DEFAULT_BODYFIRST_ADDRESS);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSignature className="h-6 w-6 text-orange-400" />
            Sales Representative Agreement
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Commission-only 1099 sales rep agreement. 10% of Net Revenue,
            <strong className="text-white/70"> paid on a cash basis only after the customer pays the invoice</strong>,
            and only after a 60-day qualification window. Commissions end the month
            engagement terminates. 90-day clawback. 12-month post-engagement
            non-compete in the employee benefits industry with 3× liquidated
            damages. Fill in rep details, then Print / Save as PDF.
          </p>
        </div>
        <DocumentActions
          targetRef={printableRef}
          filename={repName ? `Sales-Rep-Agreement-${repName.replace(/[^A-Za-z0-9]+/g, '-')}` : 'Sales-Rep-Agreement'}
        />
      </div>

      <Card className="bg-white/[0.03] border-white/10 p-5 print:hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Customize for sales rep</h2>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2 text-white/60 hover:text-white">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="Sales Rep Legal Name"
            value={repName}
            onChange={setRepName}
            placeholder="Jane Smith"
          />
          <Field
            label="Effective Date"
            value={effectiveDate}
            onChange={setEffectiveDate}
            placeholder="May 29, 2026"
          />
          <Field
            label="Sales Rep Address"
            value={repAddress}
            onChange={setRepAddress}
            placeholder="1234 Sales Lane, Austin, TX 78704"
            className="md:col-span-2"
          />
          <Field
            label="Sales Rep Email"
            value={repEmail}
            onChange={setRepEmail}
            placeholder="jane@example.com"
            className="md:col-span-2"
          />
          <Field
            label="BodyF1RST Address"
            value={bodyfirstAddress}
            onChange={setBodyfirstAddress}
            placeholder={DEFAULT_BODYFIRST_ADDRESS}
            className="md:col-span-2"
          />
          <Field
            label="Territory or Focus (optional)"
            value={territoryOrFocus}
            onChange={setTerritoryOrFocus}
            placeholder="Texas mid-market employers, 50–500 employees"
            className="md:col-span-2"
          />
        </div>
        <p className="text-xs text-white/40 mt-3">
          Empty fields render as blank lines in the printed PDF for handwritten fill-in.
          Leave Territory blank for no geographic restriction beyond the non-compete language.
        </p>
      </Card>

      <div ref={printableRef}>
      <Card className="bg-white text-slate-900 p-0 print:shadow-none print:border-0 max-w-4xl mx-auto overflow-hidden">
        {/* Branded header */}
        <div className="bg-slate-950 text-white px-10 py-7 border-b-4 border-orange-500 flex items-center justify-between gap-6">
          <img
            src="/logos/b1-performance-optimization.png"
            alt="BodyF1RST · Performance Optimization"
            className="h-16 w-auto"
          />
          <div className="text-right">
            <div className="text-orange-400 text-[10px] font-bold tracking-[0.25em] uppercase">
              Sales Representative Agreement
            </div>
            <div className="text-white/60 text-xs mt-1">BodyF1RST Commission Plan</div>
            <div className="text-white/40 text-[10px] mt-1">10% · While Engaged · 60-Day Sales Cycle</div>
          </div>
        </div>

        {/* Agreement body */}
        <div className="px-10 py-8">
          {error && (
            <div className="text-sm text-red-700">
              Failed to load agreement: {error}
            </div>
          )}
          {!filledMarkdown && !error && (
            <div className="flex items-center justify-center py-10 text-slate-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}
          {filledMarkdown && (
            <article className="prose-agreement">
              {renderMarkdown(filledMarkdown)}
            </article>
          )}
        </div>

        {/* Branded footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-10 py-4 text-[11px] text-slate-500 flex justify-between items-center">
          <span>BodyF1RST, LLC · Confidential</span>
          <span className="font-semibold text-slate-600">Performance Optimization</span>
        </div>
      </Card>
      </div>

      <style jsx global>{`
        .prose-agreement h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .prose-agreement h2 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.4rem;
          color: #0f172a;
          padding-bottom: 0.35rem;
          border-bottom: 2px solid #ea580c;
          display: inline-block;
        }
        .prose-agreement h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-top: 1.1rem;
          margin-bottom: 0.3rem;
          color: #1e293b;
        }
        .prose-agreement p {
          margin: 0.55rem 0;
          line-height: 1.6;
          color: #1e293b;
        }
        .prose-agreement strong {
          color: #0f172a;
          font-weight: 600;
        }
        .prose-agreement ul,
        .prose-agreement ol {
          margin: 0.5rem 0 0.75rem 1.5rem;
          line-height: 1.6;
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
          background: #fff7ed;
          color: #9a3412;
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
          font-size: 0.88em;
        }
        @media print {
          @page { margin: 0.5in; }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
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

function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-xs font-medium text-white/60 uppercase tracking-wide">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-400/60 focus:bg-white/[0.06]"
      />
    </label>
  );
}
