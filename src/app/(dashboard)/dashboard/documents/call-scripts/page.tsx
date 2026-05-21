'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function CallScriptsPage() {
  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Phone className="h-6 w-6 text-orange-400" />
            HealthShield Sales Call Script
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Setting demos that close — 10-section playbook with stat hooks, objection handlers,
            outreach cadence, and the do&apos;s &amp; don&apos;ts your team can lean on every call.
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

      <Card className="bg-white text-slate-900 p-0 print:shadow-none print:border-0 max-w-4xl mx-auto overflow-hidden">
        {/* Hero band */}
        <div className="bg-slate-900 text-white text-center py-10 px-8">
          <h2 className="text-4xl font-extrabold tracking-tight">HEALTHSHIELD</h2>
          <p className="mt-2 text-slate-300">Sales Call Script</p>
          <p className="mt-1 text-orange-400 font-semibold">Setting Demos That Close</p>
        </div>
        <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-300" />

        <div className="p-10 space-y-10">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <Stat value="$681" caption="Saved Per Employee Per Year" />
            <Stat value="$0" caption="Upfront Cost To Employer" />
            <Stat value="93%" caption="Employee Eligibility Rate" />
            <Stat value="2.5x" caption="Lloyd's of London Tax Coverage" />
          </div>

          {/* Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-sm leading-relaxed text-slate-800">
            HealthShield is a <strong>preventative care benefits program</strong> that saves employers an
            average of <strong>$681 per employee per year</strong> in payroll taxes — with zero upfront cost.
            It sits on top of existing health plans (nothing changes), gives employees 24/7 telehealth, 200+
            free prescriptions, DNA screenings, and RN coaching, and is fully backed by{' '}
            <strong>Lloyd&apos;s of London Tax Position Insurance</strong>. Your job: get 20 minutes on their calendar.
          </div>

          {/* WHO TO CALL */}
          <section>
            <h3 className="text-orange-600 font-bold tracking-wide mb-3">WHO TO CALL</h3>
            <Table
              head={['Decision Maker', 'Title Examples', 'What They Care About']}
              rows={[
                ['Benefits Owner', 'HR Director, VP People, Benefits Manager', 'Employee satisfaction, retention, admin burden'],
                ['Financial Buyer', 'CFO, Controller, VP Finance', 'Tax savings, ROI, compliance risk'],
                ['Executive Sponsor', 'CEO, COO, Owner', 'Competitive advantage, total cost, simplicity'],
              ]}
              firstColBold
            />
          </section>

          {/* BEFORE THE CALL */}
          <section>
            <h3 className="text-orange-600 font-bold tracking-wide">BEFORE THE CALL</h3>
            <p className="text-sm text-slate-500 mt-0.5 mb-3">Preparation checklist — do this for every prospect</p>
            <ChecklistSquare items={[
              'Research company size, industry, and any visible benefits on job postings',
              'Identify the decision-maker by name and title (LinkedIn, company website)',
              <>Calculate their savings: <strong>employee count x $681</strong> = annual savings</>,
              'Have your calendar open with 2-3 available demo slots this week',
              'Pull up the HealthShield website in case they want a link',
            ]} />
          </section>

          {/* Section 1: OPENING */}
          <NumberedSection number={1} title="THE OPENING" subtitle="15-20 seconds — earn the right to keep talking">
            <ProTip>
              You have 10 seconds to earn the next 60. Lead with the dollar amount, not your company name.
              Sound like a peer sharing intel, not a salesperson reading a script.
            </ProTip>
            <Label>SAY:</Label>
            <SayBox>
              &ldquo;Hi [Name], this is [Your Name] with BodyF1RST. I&apos;ll be quick — we help companies like
              yours save an average of <strong>$681 per employee per year</strong> in payroll taxes, with zero
              upfront cost and zero changes to your existing health plan. Do you have 60 seconds so I can see if
              this even applies to [Company]?&rdquo;
            </SayBox>
            <Label>IF GATEKEEPER:</Label>
            <SayBox>
              &ldquo;I have some benefits savings information for [Decision Maker] regarding their payroll taxes —
              could you connect me, or is there a better time to reach them?&rdquo;
            </SayBox>
          </NumberedSection>

          {/* Section 2: QUALIFY */}
          <NumberedSection number={2} title="QUALIFY THE PROSPECT" subtitle="30-45 seconds — confirm fit before pitching">
            <Label>SAY:</Label>
            <SayBox>
              &ldquo;Great, thanks for the minute. Two quick questions so I don&apos;t waste your time:&rdquo;
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>&ldquo;How many W-2 employees do you have?&rdquo;</strong> (Need 25+)</li>
                <li><strong>&ldquo;Are you offering any supplemental or preventative benefits beyond your major medical?&rdquo;</strong></li>
              </ul>
            </SayBox>
            <ProTip>
              Listen for pain signals: rising premiums, high turnover, employees skipping doctor visits,
              difficulty competing for talent. These are your hooks for the pitch.
            </ProTip>
            <Label>IF QUALIFIED (25+ employees):</Label>
            <SayBox>
              &ldquo;Perfect. So at [X] employees, you&apos;re looking at roughly <strong>$[X × $681]</strong> per
              year in payroll tax savings that you&apos;re leaving on the table right now. Let me take 90 seconds
              to explain how it works.&rdquo;
            </SayBox>
            <Label className="mt-5">SIZE-BASED HOOKS:</Label>
            <Table
              head={['Company Size', 'Annual Savings', 'Hook']}
              rows={[
                ['25 employees', '$17,025', '"That\'s a new hire\'s salary — just from tax savings."'],
                ['50 employees', '$34,050', '"That covers your entire benefits admin cost."'],
                ['100 employees', '$68,100', '"Most companies reinvest that into raises or equipment."'],
                ['250 employees', '$170,250', '"That\'s serious money being left on the table."'],
                ['500 employees', '$340,500', '"At your size, this funds an entire department."'],
              ]}
              greenSecondCol
            />
          </NumberedSection>

          {/* Section 3: PITCH */}
          <NumberedSection number={3} title="DELIVER THE PITCH" subtitle="60-90 seconds — value for them AND their employees">
            <Label>SAY:</Label>
            <SayBox>
              &ldquo;HealthShield is a preventative care program that <strong>sits on top of your existing
              health plan</strong> — we don&apos;t touch, change, or replace anything you already have.
              Here&apos;s what it does:&rdquo;
            </SayBox>

            <h4 className="font-bold text-slate-900 mt-5">EMPLOYER BENEFITS <span className="font-normal text-slate-500">(what the decision-maker cares about):</span></h4>
            <BenefitList
              variant="employer"
              items={[
                ['Payroll Tax Savings', '$681/employee/year through Section 125 pre-tax benefits'],
                ['Zero Upfront Cost', 'Savings start on the very first payroll cycle'],
                ["Lloyd's of London Backing", 'Tax Position Insurance covers up to 2.5x your savings'],
                ['Minimal Admin', 'We run everything — one small payroll adjustment on your end'],
                ['Talent Magnet', 'Competitive benefits that help recruit and retain top people'],
              ]}
            />

            <h4 className="font-bold text-slate-900 mt-5">EMPLOYEE BENEFITS <span className="font-normal text-slate-500">(what makes employees love it):</span></h4>
            <BenefitList
              variant="employee"
              items={[
                ['24/7 Telehealth', 'Unlimited virtual doctor + mental health visits — $0 co-pay'],
                ['200+ Free Prescriptions', 'Most common meds at $0 through major pharmacy networks'],
                ['DNA & Biometric Screenings', 'Free health screenings to catch problems early'],
                ['RN Health Coaching', 'Personal registered nurse for ongoing health guidance'],
                ['Increased Take-Home Pay', 'Pre-tax structure = more money in every paycheck'],
                ['Hospitalization Coverage', 'Limited benefit plan for unexpected hospital stays'],
              ]}
            />

            <Label className="mt-5">SAY:</Label>
            <SayBox>
              &ldquo;And here&apos;s the part that closes the deal for most companies — this is fully
              IRS-compliant. It&apos;s based on <strong>Tax Code 213(d)</strong> and <strong>Section 125</strong>{' '}
              cafeteria plans, structures your finance team already knows. And it&apos;s backed by{' '}
              <strong>Lloyd&apos;s of London</strong>, so if the IRS ever questions the position, you&apos;re
              covered for up to 2.5 times your savings, including interest and penalties. Zero risk.&rdquo;
            </SayBox>
          </NumberedSection>

          {/* Section 4: ASK */}
          <NumberedSection number={4} title="MAKE THE ASK" subtitle="15-20 seconds — book the demo">
            <Label>SAY:</Label>
            <SayBox>
              &ldquo;I&apos;d love to set up a quick <strong>20-minute demo</strong> where I can show you the
              exact savings for [Company] — I&apos;ll build a custom report with your headcount and run through
              the employee benefits portal so you can see exactly what your team gets.{' '}
              <strong>Would [Tuesday] or [Thursday] work better for you?</strong>&rdquo;
            </SayBox>
            <ProTip>
              Always offer exactly two options. &ldquo;Are you free this week?&rdquo; invites &ldquo;no.&rdquo;
              Two specific days create a choice, not a yes/no. If neither works, they&apos;ll suggest an
              alternative — that&apos;s still a win.
            </ProTip>
          </NumberedSection>

          {/* Section 5: LOCK IT DOWN */}
          <NumberedSection number={5} title="LOCK IT DOWN" subtitle="When they say yes — confirm everything before hanging up">
            <Label>SAY:</Label>
            <SayBox>
              &ldquo;Excellent! I&apos;ll send you a calendar invite right now. Quick question — would it help to
              have your CFO or benefits admin on the call too? That way they can see the tax savings breakdown
              firsthand and we can answer everyone&apos;s questions in one sitting.&rdquo;
            </SayBox>
            <Label>CONFIRM BEFORE HANGING UP:</Label>
            <ChecklistSquare items={[
              'Date and time (repeat it back to them)',
              'Their email address (spell it out)',
              'Additional attendees and their roles',
              'Exact employee headcount (for the custom savings report)',
              <>&ldquo;I&apos;ll send the invite in the next 5 minutes — keep an eye out&rdquo;</>,
            ]} />
            <DoNot>
              <strong>DO NOT</strong> hang up without a confirmed date, time, and email. &ldquo;I&apos;ll check
              my calendar and get back to you&rdquo; is not a booked demo — it&apos;s a lost lead. Push gently:
              &ldquo;I have my calendar right here — let&apos;s lock something in so I can prepare your custom
              savings report.&rdquo;
            </DoNot>
          </NumberedSection>

          {/* Section 6: OBJECTIONS */}
          <NumberedSection number={6} title="HANDLING OBJECTIONS" subtitle="Stay calm, acknowledge, redirect to value">
            <ProTip>
              The formula: <strong>Acknowledge</strong> their concern → <strong>Reframe</strong> with a key fact
              → <strong>Redirect</strong> back to the demo. Never argue. Never get defensive.
            </ProTip>

            <Objection q={'"We\'re happy with our current benefits."'}>
              &ldquo;That&apos;s great — and we don&apos;t touch any of that. HealthShield sits{' '}
              <strong>on top of</strong> your existing plan. Think of it as unlocking tax savings you&apos;re
              already entitled to, while adding benefits your employees will actually use — telehealth, free
              prescriptions, health coaching. The demo takes 20 minutes — worst case, you learn about a tax
              strategy you didn&apos;t know existed.&rdquo;
            </Objection>

            <Objection q={'"We don\'t have the budget right now."'}>
              &ldquo;I completely understand — that&apos;s actually the #1 reason companies love this. There&apos;s{' '}
              <strong>zero upfront cost</strong>. The program pays for itself through payroll tax savings starting
              on your first payroll cycle. At [X] employees, that&apos;s roughly <strong>$[amount] per year</strong>{' '}
              flowing back to you. Can I show you the math in 20 minutes?&rdquo;
            </Objection>

            <Objection q={'"Just send me an email."'}>
              &ldquo;Absolutely, I&apos;ll send that right over. But here&apos;s the thing — the savings calculator
              is way more compelling when I plug in <strong>your actual numbers</strong>. How about I send the
              overview now, and we do a quick 15-minute call on [Day] so I can walk through your custom report? If
              the numbers don&apos;t work, no hard feelings at all.&rdquo;
            </Objection>

            <Objection q={'"Is this actually legal? Sounds too good to be true."'}>
              &ldquo;I love that question — it shows you&apos;re doing your due diligence. This is built on{' '}
              <strong>Tax Code 213(d)</strong> and <strong>Section 125</strong> cafeteria plans, which have been
              in the tax code for decades. Your finance team will recognize both immediately. And here&apos;s what
              seals it — we&apos;re backed by <strong>Lloyd&apos;s of London Tax Position Insurance</strong>. If
              the IRS ever challenged the position, the policy covers up to 2.5x your total savings, including
              interest and penalties.&rdquo;
            </Objection>

            <Objection q={'"We\'re too small / only have [X] employees."'}>
              &ldquo;We work with companies as small as 25 employees. At [X] people, you&apos;d save{' '}
              <strong>$[X × 681]</strong> per year — that&apos;s real money. And there are volume discounts as you
              grow. Worth 20 minutes to see the numbers?&rdquo;
            </Objection>

            <Objection q={'"I need to run this by my boss / partner."'}>
              &ldquo;Of course — that&apos;s smart. Let&apos;s book the demo with both of you on the call so they
              can see the savings firsthand and ask questions directly. Would [Day] work for both of you?&rdquo;
            </Objection>

            <Objection q={'"We already looked at something like this."'}>
              &ldquo;Interesting — what did you look at? [Listen.] Got it. A few things that set HealthShield apart:
              the <strong>Lloyd&apos;s of London insurance</strong> (most programs don&apos;t have that), the{' '}
              <strong>$0 upfront cost</strong>, and the fact that we don&apos;t change your existing plan at all.
              Might be worth a fresh look — 20 minutes?&rdquo;
            </Objection>
          </NumberedSection>

          {/* Section 7: VOICEMAIL */}
          <NumberedSection number={7} title="VOICEMAIL" subtitle="Under 30 seconds — one clear reason to call back">
            <Label>SAY:</Label>
            <SayBox>
              &ldquo;Hi [Name], it&apos;s [Your Name] with BodyF1RST. Quick reason for the call — we help companies
              save an average of <strong>$681 per employee per year</strong> in payroll taxes through a preventative
              health program. Zero upfront cost, backed by Lloyd&apos;s of London. I&apos;d love 15 minutes to see
              if this applies to [Company]. My number is <strong>[Your Number]</strong>. That&apos;s{' '}
              <strong>[Your Number]</strong>. Talk soon.&rdquo;
            </SayBox>
            <ProTip>
              Max 2 voicemails per prospect. After that, switch to email, then LinkedIn. Space voicemails 3-4
              business days apart. Morning calls (8-9 AM) and late afternoon (4-5 PM) have the highest pickup rates.
            </ProTip>
          </NumberedSection>

          {/* Section 8: FOLLOW-UP EMAIL */}
          <NumberedSection number={8} title="FOLLOW-UP EMAIL" subtitle="Send within 1 hour of the call">
            <Label>SUBJECT LINE:</Label>
            <SayBox>
              &ldquo;$[total savings] in annual payroll tax savings for [Company] — zero cost&rdquo;
            </SayBox>
            <Label>EMAIL BODY:</Label>
            <SayBox>
              <div className="space-y-3">
                <p>Hi [Name],</p>
                <p>
                  Thanks for taking my call today. As I mentioned, HealthShield helps companies save an average of{' '}
                  <strong>$681/employee/year</strong> in payroll taxes through a fully compliant preventative care
                  program — with zero upfront cost.
                </p>
                <p>
                  At <strong>[X] employees</strong>, [Company] could save approximately{' '}
                  <strong>$[total]</strong> per year.
                </p>
                <p>Your employees would also receive:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>24/7 telehealth and mental health support ($0 co-pay)</li>
                  <li>200+ free prescriptions at major pharmacies</li>
                  <li>Free DNA and biometric health screenings</li>
                  <li>Dedicated RN health coaching</li>
                  <li>Net increase in take-home pay</li>
                </ul>
                <p>
                  I&apos;d love to walk you through a <strong>20-minute demo</strong> with your custom savings report.
                  Here&apos;s my calendar: <strong>[CALENDAR LINK]</strong>
                </p>
                <p>
                  Best,<br />
                  [Your Name]<br />
                  BodyF1RST | HealthShield<br />
                  [Phone] | [Email]
                </p>
              </div>
            </SayBox>
          </NumberedSection>

          {/* Section 9: CADENCE */}
          <NumberedSection number={9} title="OUTREACH CADENCE" subtitle="The 14-day follow-up sequence">
            <Table
              head={['Day', 'Action', 'Notes']}
              rows={[
                ['Day 1', 'Call #1 + Voicemail if no answer', 'Morning (8-9 AM) or late afternoon (4-5 PM)'],
                ['Day 1', 'Follow-up email', 'Send within 1 hour of call — use template above'],
                ['Day 3', 'LinkedIn connection request', 'Short note: "Tried reaching you about payroll tax savings"'],
                ['Day 5', 'Call #2 + Voicemail if no answer', 'Different time of day than Call #1'],
                ['Day 7', 'Email #2 — value add', 'Share a savings case study or ROI calculator link'],
                ['Day 10', 'Call #3 (no voicemail)', 'If no pickup, move to email only'],
                ['Day 14', 'Breakup email', '"Last note from me — here if the timing is ever right"'],
              ]}
              firstColBold
              firstColOrange
            />
          </NumberedSection>

          {/* Section 10: DO'S AND DON'TS */}
          <NumberedSection number={10} title="DO'S AND DON'TS" subtitle="Keep these in mind on every call">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2.5 font-bold text-emerald-700 border-r border-slate-200">✔ DO</div>
              <div className="bg-red-50 px-4 py-2.5 font-bold text-red-700">✘ DON&apos;T</div>
              {[
                ['Lead with the dollar savings', 'Lead with your company name or product'],
                ['Sound like a peer sharing useful intel', "Sound like you're reading a script"],
                ['Ask questions and listen', 'Talk for more than 90 seconds without pausing'],
                ['Use their employee count in the pitch', 'Give generic "companies save money" pitches'],
                ['Offer exactly two day/time options', 'Ask "when are you free?" (too open-ended)'],
                ["Mention Lloyd's of London early", "Oversell or make promises you can't keep"],
                ['Confirm everything before hanging up', 'Accept "I\'ll get back to you" as a booked demo'],
                ['Follow up within 1 hour with email', 'Wait days to follow up after a good call'],
              ].map(([d, dn], i) => (
                <div key={i} className="contents">
                  <div className="px-4 py-2.5 text-sm text-emerald-700 border-r border-t border-slate-200">{d}</div>
                  <div className="px-4 py-2.5 text-sm text-red-700 border-t border-slate-200">{dn}</div>
                </div>
              ))}
            </div>
          </NumberedSection>

          {/* Quick Reference */}
          <section>
            <h3 className="text-orange-600 font-bold tracking-wide mb-3">QUICK REFERENCE — KEY NUMBERS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-900 text-white px-4 py-2 font-semibold text-sm border-r border-slate-700">Metric</div>
              <div className="bg-slate-900 text-white px-4 py-2 font-semibold text-sm">Value</div>
              {[
                ['Avg. payroll tax savings', '$681/emp/year'],
                ['Upfront cost', '$0'],
                ['Employee eligibility', '93%'],
                ['Min. income to qualify', '$17,500/year'],
                ["Lloyd's coverage", '2.5x tax savings'],
                ['Free prescriptions', '200+'],
                ['Telehealth co-pay', '$0'],
                ['Tax code basis', 'Sec 125 + 213(d)'],
                ['Min. company size', '25 W-2 employees'],
                ['Demo length', '20 minutes'],
              ].map(([k, v], i) => (
                <div key={i} className="contents">
                  <div className="px-4 py-2 text-sm text-slate-700 font-medium border-r border-t border-slate-200">{k}</div>
                  <div className="px-4 py-2 text-sm text-orange-600 font-semibold border-t border-slate-200">{v}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-4 text-xs text-slate-400 flex justify-between">
            <span>BodyF1RST | HealthShield | Confidential</span>
            <span>Sales Call Script</span>
          </div>
        </div>
      </Card>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .numbered-section,
          .say-box,
          .pro-tip,
          .do-not,
          .objection {
            page-break-inside: avoid;
          }
          h3, h4 {
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}

function Stat({ value, caption }: { value: string; caption: string }) {
  return (
    <div>
      <div className="text-4xl font-extrabold text-orange-600">{value}</div>
      <div className="text-xs text-slate-500 mt-1 leading-tight">{caption}</div>
    </div>
  );
}

function NumberedSection({
  number,
  title,
  subtitle,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="numbered-section">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 bg-orange-500 text-white font-bold rounded flex items-center justify-center text-lg">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-3 pl-0 md:pl-12">{children}</div>
    </section>
  );
}

function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`text-xs font-bold tracking-wider text-slate-500 uppercase mt-3 ${className}`}>
      {children}
    </div>
  );
}

function SayBox({ children }: { children: ReactNode }) {
  return (
    <div className="say-box bg-emerald-50 border-l-4 border-emerald-500 px-4 py-3 rounded-r text-sm leading-relaxed text-slate-800">
      {children}
    </div>
  );
}

function ProTip({ children }: { children: ReactNode }) {
  return (
    <div className="pro-tip bg-amber-50 border-l-4 border-amber-500 px-4 py-3 rounded-r text-sm leading-relaxed text-amber-900 italic">
      <strong className="not-italic">PRO TIP: </strong>
      {children}
    </div>
  );
}

function DoNot({ children }: { children: ReactNode }) {
  return (
    <div className="do-not bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-r text-sm leading-relaxed text-red-800">
      {children}
    </div>
  );
}

function ChecklistSquare({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-slate-800">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-slate-900 leading-tight">■</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Table({
  head,
  rows,
  firstColBold,
  firstColOrange,
  greenSecondCol,
}: {
  head: string[];
  rows: (string | ReactNode)[][];
  firstColBold?: boolean;
  firstColOrange?: boolean;
  greenSecondCol?: boolean;
}) {
  return (
    <div className="overflow-hidden border border-slate-200 rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-orange-500 text-white">
            {head.map((h, i) => (
              <th key={i} className="text-left px-4 py-2 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              {row.map((cell, j) => {
                const cls = [
                  'px-4 py-2 align-top',
                  j === 0 && firstColBold ? 'font-semibold' : '',
                  j === 0 && firstColOrange ? 'text-orange-600' : 'text-slate-700',
                  j === 1 && greenSecondCol ? 'text-emerald-700 font-semibold' : '',
                ].join(' ');
                return <td key={j} className={cls}>{cell}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BenefitList({
  variant,
  items,
}: {
  variant: 'employer' | 'employee';
  items: [string, string][];
}) {
  const isEmployer = variant === 'employer';
  const icon = isEmployer ? '✔' : '❤';
  const iconColor = isEmployer ? 'text-emerald-600' : 'text-red-500';
  const labelColor = isEmployer ? 'text-emerald-700' : 'text-red-600';
  const bgColor = isEmployer ? 'bg-emerald-50/40' : 'bg-red-50/40';
  return (
    <div className={`mt-2 border border-slate-200 rounded-lg overflow-hidden ${bgColor}`}>
      {items.map(([label, desc], i) => (
        <div key={i} className={`flex gap-3 px-4 py-2 text-sm ${i < items.length - 1 ? 'border-b border-slate-200/60' : ''}`}>
          <span className={`${iconColor} font-bold flex-shrink-0`}>{icon}</span>
          <span className={`${labelColor} font-semibold w-44 flex-shrink-0`}>{label}</span>
          <span className="text-slate-700">{desc}</span>
        </div>
      ))}
    </div>
  );
}

function Objection({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="objection mt-3">
      <div className="text-sm font-semibold text-slate-900 flex items-start gap-2">
        <span className="text-red-500 mt-0.5">■</span>
        <span>{q}</span>
      </div>
      <div className="say-box bg-slate-50 border-l-4 border-slate-400 px-4 py-3 rounded-r text-sm leading-relaxed text-slate-800 mt-1.5 ml-5">
        {children}
      </div>
    </div>
  );
}
