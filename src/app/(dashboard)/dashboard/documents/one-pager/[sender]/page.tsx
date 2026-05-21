'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Mail, Phone } from 'lucide-react';

const SENDERS: Record<string, { name: string; email: string; phone?: string }> = {
  charley: { name: 'Charley Blanchard', email: 'charley@bodyf1rst.com' },
  ken: { name: 'Ken Laney', email: 'Ken@bodyf1rst.com', phone: '(512) 470-0454' },
  brian: { name: 'Brian Johnson', email: 'brian@systemsf1rst.com', phone: '(512) 203-5598' },
};

const ROI_TIERS: Array<{ size: number; label: string }> = [
  { size: 50, label: '50 employees' },
  { size: 100, label: '100 employees' },
  { size: 200, label: '200 employees' },
  { size: 500, label: '500 employees' },
];

export default function OnePagerPage({ params }: { params: Promise<{ sender: string }> }) {
  const { sender } = use(params);
  const info = SENDERS[sender];
  if (!info) notFound();

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Top bar — hidden in print */}
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/documents" className="text-xs text-white/60 hover:text-white inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Documents
          </Link>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </Button>
      </div>

      {/* The one-pager */}
      <article className="max-w-5xl mx-auto bg-slate-950 text-white rounded-xl shadow-2xl overflow-hidden border-t-4 border-orange-500 print:shadow-none print:border-0 print:rounded-none">
        {/* Header */}
        <header className="px-10 pt-8 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            <span className="text-green-400">BodyF1RST</span>
            <span className="text-white/80 text-2xl md:text-3xl mx-3">partnered with</span>
            <span className="text-blue-400">HealthShield</span>
          </h1>
          <div className="flex items-baseline justify-between mt-2 flex-wrap gap-2">
            <p className="text-orange-400 font-semibold text-lg">Where Prevention Meets Performance.</p>
            <p className="text-white/60 text-sm">Corporate Wellness & Preventive Healthcare</p>
          </div>
          <p className="text-white text-xl mt-5">
            One solution. Two powerful programs. <span className="font-semibold">Zero cost to your bottom line.</span>
          </p>
        </header>

        <div className="border-t border-white/10" />

        {/* Two-column grid — BodyF1RST LEFT, HealthShield RIGHT (matches title order) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-10 py-7">
          {/* LEFT — BodyF1RST */}
          <section className="rounded-lg bg-slate-900/60 border-t-4 border-green-500 p-6">
            <h2 className="text-xl font-bold text-green-400 mb-4">
              BodyF1RST <span className="text-white/70 text-sm font-normal">AI-Powered Corporate Wellness</span>
            </h2>
            <ul className="space-y-2 text-sm text-white/90">
              <BulletItem dot="green"><strong>AI avatar coach</strong> — personalized fitness & nutrition</BulletItem>
              <BulletItem dot="green"><strong>89% retention rate</strong> — employees actually use it</BulletItem>
              <BulletItem dot="green"><strong>Team challenges</strong> & leaderboards drive engagement</BulletItem>
              <BulletItem dot="green"><strong>Mental health CBT</strong> modules for stress management</BulletItem>
              <BulletItem dot="green"><strong>HR dashboard</strong> — real-time engagement metrics</BulletItem>
              <BulletItem dot="green"><strong>Wearable sync</strong> — Apple Watch, Fitbit, Garmin</BulletItem>
              <BulletItem dot="green"><strong>50,000+ active users</strong> across partner companies</BulletItem>
              <BulletItem dot="green"><strong>35% productivity boost</strong> reported by employers</BulletItem>
              <BulletItem dot="green"><strong>Gamification</strong> — points, badges, competitions</BulletItem>
            </ul>
          </section>

          {/* RIGHT — HealthShield */}
          <section className="rounded-lg bg-slate-900/60 border-t-4 border-blue-500 p-6">
            <h2 className="text-xl font-bold text-blue-400 mb-4">
              HealthShield <span className="text-white/70 text-sm font-normal">Preventive Healthcare Plan</span>
            </h2>
            <ul className="space-y-2 text-sm text-white/90">
              <BulletItem dot="blue"><strong>$681/employee/year</strong> saved in payroll taxes</BulletItem>
              <BulletItem dot="blue"><strong>IRS Section 125</strong> pre-tax benefit — legal & compliant</BulletItem>
              <BulletItem dot="blue"><strong>Telehealth visits</strong> — doctor visits anytime, anywhere</BulletItem>
              <BulletItem dot="blue"><strong>Free urgent care</strong> — no copays, no deductibles</BulletItem>
              <BulletItem dot="blue"><strong>Mental health</strong> & counseling support included</BulletItem>
              <BulletItem dot="blue"><strong>Full family coverage</strong> — spouses & dependents</BulletItem>
              <BulletItem dot="blue"><strong>$0 out-of-pocket</strong> to employer or employee</BulletItem>
              <BulletItem dot="blue"><strong>SilverPoint Health</strong> — trusted nationwide network</BulletItem>
            </ul>
          </section>
        </div>

        {/* ROI band */}
        <section className="mx-10 mb-7 rounded-lg border-t-4 border-orange-500 bg-slate-900/60 px-6 py-5">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
            <h2 className="text-xl font-bold text-orange-400">Your ROI at a Glance</h2>
            <p className="text-xs text-white/60">Based on $681 savings per employee per year</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {ROI_TIERS.map(({ size, label }) => (
              <div key={size} className="flex flex-col">
                <span className="text-white/70">{label}</span>
                <span className="text-green-400 font-bold text-lg">
                  ${(size * 681).toLocaleString()}/yr
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Contact strip */}
        <footer className="bg-gradient-to-r from-slate-900 to-slate-800 px-10 py-5 border-t border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Your contact</p>
              <p className="text-white font-semibold text-lg">{info.name}</p>
            </div>
            <div className="text-sm text-white/85 space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href={`mailto:${info.email}`} className="hover:text-white">{info.email}</a>
              </div>
              {info.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400" />
                  <a href={`tel:${info.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white">{info.phone}</a>
                </div>
              )}
            </div>
          </div>
        </footer>
      </article>

      <style jsx global>{`
        @media print {
          @page { size: letter; margin: 0.4in; }
          body { background: white; }
          article { background: #0f172a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

function BulletItem({ dot, children }: { dot: 'green' | 'blue'; children: React.ReactNode }) {
  const cls = dot === 'green' ? 'bg-green-400' : 'bg-blue-400';
  return (
    <li className="flex items-start gap-2">
      <span className={`mt-1.5 inline-block h-1.5 w-1.5 rounded-full ${cls} flex-shrink-0`} />
      <span>{children}</span>
    </li>
  );
}
