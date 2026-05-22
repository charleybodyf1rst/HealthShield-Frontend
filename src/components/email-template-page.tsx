'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, RotateCcw, ArrowLeft, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { renderMarkdown } from '@/lib/render-markdown';
import { DocumentActions } from '@/components/document-actions';
import { useUser } from '@/stores/auth-store';

interface EmailTemplatePageProps {
  /** URL to the markdown source (e.g. /documents/email-hr-staffing.md). */
  markdownPath: string;
  /** Base filename for PDF export (no extension). */
  filenameBase: string;
  /** Page title shown in the dashboard header. */
  title: string;
  /** Page subtitle / description. */
  subtitle: string;
}

function fillMergeVars(md: string, values: Record<string, string>): string {
  return md.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = values[key]?.trim();
    return v && v.length > 0 ? v : '_____________________';
  });
}

export function EmailTemplatePage({
  markdownPath,
  filenameBase,
  title,
  subtitle,
}: EmailTemplatePageProps) {
  const user = useUser();

  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Merge-var state — sender fields default from logged-in user
  const [yourName, setYourName] = useState('');
  const [yourTitle, setYourTitle] = useState('');
  const [yourEmail, setYourEmail] = useState('');
  const [yourPhone, setYourPhone] = useState('');
  const [recipientFirstName, setRecipientFirstName] = useState('');
  const [partnerCompany, setPartnerCompany] = useState('');

  const [copied, setCopied] = useState(false);
  const printableRef = useRef<HTMLDivElement | null>(null);

  // One-time hydration of sender fields from the auth user
  useEffect(() => {
    if (!user) return;
    setYourName((cur) => cur || [user.firstName, user.lastName].filter(Boolean).join(' ') || '');
    setYourTitle((cur) => cur || user.title || 'Sales Manager');
    setYourEmail((cur) => cur || user.email || '');
    setYourPhone((cur) => cur || user.phone || '');
  }, [user]);

  useEffect(() => {
    fetch(markdownPath)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(setMarkdown)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [markdownPath]);

  const filledMarkdown = useMemo(() => {
    if (!markdown) return null;
    return fillMergeVars(markdown, {
      your_name: yourName,
      your_title: yourTitle,
      your_email: yourEmail,
      your_phone: yourPhone,
      recipient_first_name: recipientFirstName,
      partner_company: partnerCompany,
    });
  }, [markdown, yourName, yourTitle, yourEmail, yourPhone, recipientFirstName, partnerCompany]);

  const handleReset = () => {
    setRecipientFirstName('');
    setPartnerCompany('');
    if (user) {
      setYourName([user.firstName, user.lastName].filter(Boolean).join(' '));
      setYourTitle(user.title || 'Sales Manager');
      setYourEmail(user.email || '');
      setYourPhone(user.phone || '');
    }
  };

  const handleCopy = async () => {
    if (!filledMarkdown) return;
    try {
      // Strip markdown to plain text for easier paste into email clients.
      const plain = filledMarkdown
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/^---$/gm, '')
        .replace(/^#+\s+/gm, '')
        .trim();
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      toast.success('Email copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error(`Copy failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-400" />
            {title}
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/documents"
            className="text-xs text-white/60 hover:text-white inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Documents
          </Link>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy text'}
          </Button>
          <DocumentActions targetRef={printableRef} filename={filenameBase} />
        </div>
      </div>

      <Card className="bg-white/[0.03] border-white/10 p-5 print:hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Customize email</h2>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2 text-white/60 hover:text-white">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Recipient First Name" value={recipientFirstName} onChange={setRecipientFirstName} placeholder="e.g. Marsha" />
          <Field label="Partner Company" value={partnerCompany} onChange={setPartnerCompany} placeholder="e.g. Murray Resources" />
          <Field label="Your Name" value={yourName} onChange={setYourName} placeholder="Charley Blanchard" />
          <Field label="Your Title" value={yourTitle} onChange={setYourTitle} placeholder="Sales Manager" />
          <Field label="Your Email" value={yourEmail} onChange={setYourEmail} placeholder="charley@bodyf1rst.com" />
          <Field label="Your Phone" value={yourPhone} onChange={setYourPhone} placeholder="(512) 350-5372" />
        </div>
        <p className="text-xs text-white/40 mt-3">
          Your details are pre-filled from your login. Recipient + partner fields are per-send. Empty fields render as blank lines in the printed/PDF copy.
        </p>
      </Card>

      <div ref={printableRef}>
        <Card className="bg-white text-slate-900 p-0 print:shadow-none print:border-0 max-w-3xl mx-auto overflow-hidden">
          <div className="px-10 py-8">
            {error && <div className="text-sm text-red-700">Failed to load template: {error}</div>}
            {!filledMarkdown && !error && (
              <div className="flex items-center justify-center py-10 text-slate-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            )}
            {filledMarkdown && (
              <article className="prose-email">{renderMarkdown(filledMarkdown)}</article>
            )}
          </div>
          <div className="bg-slate-50 border-t border-slate-200 px-10 py-3 text-[11px] text-slate-500 flex justify-between items-center">
            <span>BodyF1RST, LLC · Partner Outreach</span>
            <span>10% · 12 Months · Paid Quarterly</span>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        .prose-email h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        .prose-email h2 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.4rem;
          color: #0f172a;
        }
        .prose-email p {
          margin: 0.7rem 0;
          line-height: 1.65;
          color: #1e293b;
        }
        .prose-email strong {
          color: #0f172a;
          font-weight: 600;
        }
        .prose-email ul {
          margin: 0.5rem 0 0.75rem 1.25rem;
          line-height: 1.6;
          color: #1e293b;
        }
        .prose-email li {
          margin: 0.2rem 0;
        }
        .prose-email hr {
          margin: 1rem 0 1.25rem;
          border: none;
          border-top: 2px solid #e2e8f0;
        }
        @media print {
          @page { margin: 0.5in; }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
        className="w-full rounded-md bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.06]"
      />
    </label>
  );
}
