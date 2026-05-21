'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, Printer, Loader2, RotateCcw } from 'lucide-react';
import { renderMarkdown } from '@/lib/render-markdown';

const DEFAULT_HEALTHSHIELD_ADDRESS = '3651 Greystone Drive, Suite 302, Austin, TX 78731';

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

export default function ReferralAgreementPage() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [partnerCompany, setPartnerCompany] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerTitle, setPartnerTitle] = useState('');
  const [partnerAddress, setPartnerAddress] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(todayLongDate());
  const [healthshieldAddress, setHealthshieldAddress] = useState(DEFAULT_HEALTHSHIELD_ADDRESS);

  useEffect(() => {
    fetch('/legal/referral-agreement.md')
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
      partner_company: partnerCompany,
      partner_name: partnerName,
      partner_title: partnerTitle,
      partner_address: partnerAddress,
      effective_date: effectiveDate,
      healthshield_address: healthshieldAddress,
    });
  }, [
    markdown,
    partnerCompany,
    partnerName,
    partnerTitle,
    partnerAddress,
    effectiveDate,
    healthshieldAddress,
  ]);

  const handlePrint = () => window.print();
  const handleReset = () => {
    setPartnerCompany('');
    setPartnerName('');
    setPartnerTitle('');
    setPartnerAddress('');
    setEffectiveDate(todayLongDate());
    setHealthshieldAddress(DEFAULT_HEALTHSHIELD_ADDRESS);
  };

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
            brokers (10% of first 12 months’ net revenue, paid quarterly). Fill in the
            partner details below, then click Print / Save as PDF for a ready-to-sign copy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </Button>
        </div>
      </div>

      <Card className="bg-white/[0.03] border-white/10 p-5 print:hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Customize for partner</h2>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2 text-white/60 hover:text-white">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="Partner Company"
            value={partnerCompany}
            onChange={setPartnerCompany}
            placeholder="Murray Resources, LLC"
          />
          <Field
            label="Effective Date"
            value={effectiveDate}
            onChange={setEffectiveDate}
            placeholder="May 21, 2026"
          />
          <Field
            label="Signer Name"
            value={partnerName}
            onChange={setPartnerName}
            placeholder="Marsha Murray"
          />
          <Field
            label="Signer Title"
            value={partnerTitle}
            onChange={setPartnerTitle}
            placeholder="President"
          />
          <Field
            label="Partner Address"
            value={partnerAddress}
            onChange={setPartnerAddress}
            placeholder="1980 Post Oak Blvd, Suite 1500, Houston, TX 77056"
            className="md:col-span-2"
          />
          <Field
            label="HealthShield Address"
            value={healthshieldAddress}
            onChange={setHealthshieldAddress}
            placeholder={DEFAULT_HEALTHSHIELD_ADDRESS}
            className="md:col-span-2"
          />
        </div>
        <p className="text-xs text-white/40 mt-3">
          Empty fields render as blank lines in the printed PDF for handwritten fill-in.
        </p>
      </Card>

      <Card className="bg-white text-slate-900 p-10 print:shadow-none print:border-0 max-w-4xl mx-auto">
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
        className="w-full rounded-md bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/60 focus:bg-white/[0.06]"
      />
    </label>
  );
}
