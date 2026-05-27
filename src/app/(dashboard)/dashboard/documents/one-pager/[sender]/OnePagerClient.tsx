'use client';

import { use, useRef } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, ExternalLink } from 'lucide-react';
import { DocumentActions } from '@/components/document-actions';

interface Sender {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

const SENDERS: Record<string, Sender> = {
  charley:  { name: 'Charley Blanchard', role: 'Co-Founder / Sales Manager',         email: 'charley@bodyf1rst.com',  phone: '(512) 350-5372' },
  ken:      { name: 'Ken Laney',         role: 'Founder / CEO',                       email: 'ken@bodyf1rst.com',      phone: '(512) 470-0454' },
  brian:    { name: 'Brian Johnson',     role: 'Nutrition Coach / Account Exec',      email: 'brian@bodyf1rst.com',    phone: '(512) 203-5598' },
  jonathan: { name: 'Jonathan Bushell',  role: 'CTO',                                 email: 'jonathan@bodyf1rst.com', phone: '(760) 299-3577' },
  billy:    { name: 'Billy Torgerson',   role: 'Chief of Operations',                 email: 'billy@bodyf1rst.com',    phone: '(469) 352-6110' },
  nahid:    { name: 'Nahid Anowar',      role: 'YouTube Specialist',                  email: 'nahid@bodyf1rst.com',    phone: '(317) 418-9210' },
  dustin:   { name: 'Dustin Combs',      role: 'Co-Founder / Sr. Software Engineer',  email: 'dustin@bodyf1rst.com',   phone: '(512) 644-9673' },
  chris:    { name: 'Chris Vanberg',     role: 'Co-Founder / CRO',                    email: 'chris@bodyf1rst.com',    phone: '(512) 791-2185' },
  amy:      { name: 'Amy Dickerson',     role: 'Pilates Coach / Sales',               email: 'amy@bodyf1rst.com',      phone: '(310) 357-3572' },
};

const ROI_TIERS: Array<{ size: number; label: string }> = [
  { size: 50,  label: '50 employees' },
  { size: 100, label: '100 employees' },
  { size: 200, label: '200 employees' },
  { size: 500, label: '500 employees' },
];

const HOW_IT_WORKS: Array<{ title: string; desc: string }> = [
  { title: 'Schedule a 10-minute call',  desc: 'We review your team size and current benefits.' },
  { title: 'Get your custom ROI report', desc: 'See exact payroll tax savings for your company.' },
  { title: 'Enroll in 2 weeks - 6 weeks', desc: 'Simple setup. No disruption to current insurance.' },
  { title: 'Employees save Day 1',       desc: 'Free prescriptions, telehealth, urgent care — immediately.' },
];

const LEARN_MORE_LINKS: Array<{ label: string; href: string }> = [
  { label: 'bodyf1rst.com',                          href: 'https://bodyf1rst.com' },
  { label: 'B1 Corporate Wellness',                  href: 'https://bodyf1rst-corporate-wellness.web.app/' },
  { label: 'HealthShield Page',                      href: 'https://healthshield.ai' },
  { label: 'SilverPoint Health Overview (Video)',    href: 'https://www.youtube.com/results?search_query=silverpoint+health+overview' },
  { label: 'HealthShield Explainer (Video)',         href: 'https://www.youtube.com/results?search_query=healthshield+explainer' },
];

export default function OnePagerClient({ params }: { params: Promise<{ sender: string }> }) {
  const { sender } = use(params);
  const info = SENDERS[sender];
  const printableRef = useRef<HTMLElement | null>(null);
  if (!info) notFound();

  return (
    <div className="space-y-6">
      {/* Top bar — hidden in print */}
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/documents" className="text-xs text-white/60 hover:text-white inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Documents
          </Link>
        </div>
        <DocumentActions
          targetRef={printableRef}
          filename={`BodyF1RST-One-Pager-${info.name.replace(/\s+/g, '-')}`}
          orientation="portrait"
        />
      </div>

      {/* The one-pager */}
      <article ref={printableRef} className="max-w-5xl mx-auto bg-slate-950 text-white rounded-xl shadow-2xl overflow-hidden border-t-4 border-orange-500 print:shadow-none print:border-0 print:rounded-none">
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

        {/* Two-column grid — BodyF1RST LEFT, HealthShield RIGHT */}
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
        <section className="mx-10 mb-6 rounded-lg border-t-4 border-orange-500 bg-slate-900/60 px-6 py-5">
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

        {/* How It Works */}
        <section className="px-10 pb-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
            <h2 className="text-xl font-bold text-white">How It Works</h2>
            <p className="text-xs text-white/60">From first call to employee savings in under 6 weeks</p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {HOW_IT_WORKS.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="text-white font-semibold text-sm">{step.title}</p>
                  <p className="text-white/65 text-xs mt-0.5">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Learn More & Watch Videos */}
        <section className="mx-10 mb-7 rounded-lg bg-slate-900/60 border border-white/10 px-6 py-5">
          <h2 className="text-sm font-bold text-blue-300 mb-3 uppercase tracking-wider">Learn More &amp; Watch Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {LEARN_MORE_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1.5 underline underline-offset-2 decoration-blue-400/40"
              >
                {label} <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ))}
          </div>
        </section>

        {/* Ready to save? CTA + contact */}
        <footer className="bg-orange-500 px-10 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-white text-2xl font-bold leading-tight">Ready to save? Let&apos;s talk.</h2>
              <div className="mt-2 flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-white/95">
                <span className="font-semibold">{info.name}</span>
                {info.phone && (
                  <>
                    <span className="text-white/60">|</span>
                    <a href={`tel:${info.phone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-1 hover:underline">
                      <Phone className="w-3.5 h-3.5" /> {info.phone}
                    </a>
                  </>
                )}
                <span className="text-white/60">|</span>
                <a href={`mailto:${info.email}`} className="inline-flex items-center gap-1 hover:underline">
                  <Mail className="w-3.5 h-3.5" /> {info.email}
                </a>
              </div>
            </div>
            <div className="text-right text-white">
              <p className="font-bold text-lg leading-tight">BodyF1RST Corporate Wellness</p>
              <p className="text-sm text-white/90">{info.role}</p>
              <p className="text-xs text-white/80 mt-0.5">Austin, TX &nbsp;|&nbsp; bodyf1rst.com</p>
            </div>
          </div>
        </footer>
      </article>

      <style jsx global>{`
        @media print {
          @page { size: letter; margin: 0.4in; }
          body { background: white; }
          article {
            background: #0f172a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
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
