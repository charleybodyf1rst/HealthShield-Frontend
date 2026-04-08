'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Phone, MessageSquare, Mail, Users, ArrowRight, Shield,
  Star, CheckCircle, Play, Quote,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Reusable fade-in wrapper with staggered reveal                     */
/* ------------------------------------------------------------------ */
function FadeInSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Marquee CSS (injected once)                                        */
/* ------------------------------------------------------------------ */
const marqueeCSS = `
@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function MarketingPage() {
  return (
    <div style={{ backgroundColor: '#0A1628' }}>
      <style>{marqueeCSS}</style>

      {/* ============================================================ */}
      {/*  SECTION 1 — HERO                                            */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* BG image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80')",
          }}
        />
        {/* Navy overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(10,22,40,0.65) 50%, rgba(10,22,40,0.82) 100%)',
          }}
        />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-32 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left — copy (7 cols on lg) */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <p
                  className="text-xs font-medium tracking-[0.25em] uppercase mb-6"
                  style={{
                    color: '#C9A84C',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                  }}
                >
                  <Shield className="inline h-3.5 w-3.5 mr-2 -mt-0.5" />
                  Trusted by 50+ Insurance Agencies
                </p>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25 }}
                className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight"
                style={{
                  fontFamily: 'var(--font-dm-serif), serif',
                  color: '#F5F0E8',
                }}
              >
                The Future of
                <br />
                Health Insurance
                <br />
                Is{' '}
                <span style={{ color: '#C9A84C' }}>Intelligent</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="mt-8 text-lg leading-relaxed max-w-xl"
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  color: '#64748B',
                }}
              >
                Automate enrollment calls, claims follow-ups, and customer
                service with conversational AI agents that sound human and never
                sleep. Reduce operational costs by 60% while lifting
                satisfaction scores to 98%.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-all hover:brightness-110"
                  style={{
                    backgroundColor: '#C9A84C',
                    color: '#0A1628',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    minHeight: 48,
                  }}
                >
                  Schedule a Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-all hover:bg-white/5"
                  style={{
                    border: '1px solid rgba(245,240,232,0.3)',
                    color: '#F5F0E8',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    minHeight: 48,
                  }}
                >
                  <Play className="h-4 w-4" />
                  Watch How It Works
                </Link>
              </motion.div>
            </div>

            {/* Right — floating stats card (5 cols on lg) */}
            <motion.div
              className="lg:col-span-5 flex justify-center lg:justify-end"
              initial={{ opacity: 0, x: 60, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 3 }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            >
              <div
                className="rounded-2xl p-8 w-full max-w-sm"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(15,29,50,0.8) 0%, rgba(15,29,50,0.6) 100%)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
                  transform: 'rotate(3deg)',
                }}
              >
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-6"
                  style={{
                    color: '#C9A84C',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                  }}
                >
                  Live Platform Metrics
                </p>
                {[
                  { label: 'Client Satisfaction', value: '98%', icon: Star },
                  { label: 'Daily AI Calls', value: '10K+', icon: Phone },
                  { label: 'Cost Reduction', value: '60%', icon: CheckCircle },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + i * 0.15 }}
                    className="flex items-center justify-between py-4"
                    style={{
                      borderBottom:
                        i < 2
                          ? '1px solid rgba(201,168,76,0.1)'
                          : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className="h-5 w-5"
                        style={{ color: '#C9A84C' }}
                      />
                      <span
                        className="text-sm"
                        style={{
                          color: '#64748B',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: 'var(--font-dm-serif), serif',
                        color: '#F5F0E8',
                      }}
                    >
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — TRUSTED BY (logo marquee)                       */}
      {/* ============================================================ */}
      <section
        className="relative overflow-hidden py-12"
        style={{ borderTop: '1px solid rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p
            className="text-center text-xs tracking-[0.25em] uppercase mb-8"
            style={{
              color: '#C9A84C',
              fontFamily: 'var(--font-dm-sans), sans-serif',
            }}
          >
            Trusted by Leading Insurers
          </p>
        </div>
        <div className="relative">
          <div
            className="flex whitespace-nowrap"
            style={{ animation: 'marquee-scroll 30s linear infinite' }}
          >
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex items-center gap-20 px-10">
                {[
                  'Aetna',
                  'BlueCross',
                  'Cigna',
                  'Humana',
                  'UnitedHealth',
                  'Kaiser',
                ].map((name) => (
                  <span
                    key={`${setIndex}-${name}`}
                    className="text-2xl font-bold tracking-wide select-none"
                    style={{
                      fontFamily: 'var(--font-dm-serif), serif',
                      color: 'rgba(245,240,232,0.15)',
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3 — BENTO GRID (HealthShield Advantage)             */}
      {/* ============================================================ */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeInSection className="mb-16 max-w-2xl">
            <p
              className="text-xs tracking-[0.25em] uppercase mb-4"
              style={{
                color: '#C9A84C',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              The HealthShield Advantage
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl leading-tight"
              style={{
                fontFamily: 'var(--font-dm-serif), serif',
                color: '#F5F0E8',
              }}
            >
              Why Leading Agencies
              <br />
              Choose HealthShield
            </h2>
          </FadeInSection>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1 — AI Voice Calling (spans 2 cols) */}
            <FadeInSection delay={0.05} className="lg:col-span-2">
              <div
                className="rounded-xl p-8 lg:p-10 h-full"
                style={{
                  backgroundColor: '#0F1D32',
                  borderTop: '3px solid #C9A84C',
                }}
              >
                <Phone className="h-8 w-8 mb-5" style={{ color: '#C9A84C' }} />
                <h3
                  className="text-xl lg:text-2xl mb-3"
                  style={{
                    fontFamily: 'var(--font-dm-serif), serif',
                    color: '#F5F0E8',
                  }}
                >
                  AI Voice Calling
                </h3>
                <p
                  className="text-base leading-relaxed max-w-lg"
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    color: '#64748B',
                  }}
                >
                  Automated outbound and inbound health insurance calls powered
                  by ElevenLabs conversational AI. Handle open enrollment
                  campaigns, claims status inquiries, appointment scheduling,
                  and policy renewal follow-ups at scale -- with voices
                  indistinguishable from your best human agents.
                </p>
                {/* Mini analytics visual */}
                <div className="mt-6 flex items-end gap-1.5">
                  {[40, 65, 50, 80, 72, 90, 85, 95, 88, 92].map((h, i) => (
                    <div
                      key={i}
                      className="rounded-sm"
                      style={{
                        width: 8,
                        height: h * 0.6,
                        backgroundColor:
                          i >= 7
                            ? '#C9A84C'
                            : 'rgba(201,168,76,0.25)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </FadeInSection>

            {/* Card 2 — AI Text Messaging */}
            <FadeInSection delay={0.15}>
              <div
                className="rounded-xl p-8 h-full"
                style={{
                  backgroundColor: '#0F1D32',
                  borderTop: '3px solid #C9A84C',
                }}
              >
                <MessageSquare
                  className="h-8 w-8 mb-5"
                  style={{ color: '#C9A84C' }}
                />
                <h3
                  className="text-xl mb-3"
                  style={{
                    fontFamily: 'var(--font-dm-serif), serif',
                    color: '#F5F0E8',
                  }}
                >
                  AI Text Messaging
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    color: '#64748B',
                  }}
                >
                  Intelligent SMS follow-ups, appointment reminders, and
                  enrollment confirmations that keep your customers informed
                  and engaged throughout their insurance journey.
                </p>
              </div>
            </FadeInSection>

            {/* Card 3 — Smart Email Campaigns */}
            <FadeInSection delay={0.2}>
              <div
                className="rounded-xl p-8 h-full"
                style={{
                  backgroundColor: '#0F1D32',
                  borderTop: '3px solid #C9A84C',
                }}
              >
                <Mail
                  className="h-8 w-8 mb-5"
                  style={{ color: '#C9A84C' }}
                />
                <h3
                  className="text-xl mb-3"
                  style={{
                    fontFamily: 'var(--font-dm-serif), serif',
                    color: '#F5F0E8',
                  }}
                >
                  Smart Email Campaigns
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    color: '#64748B',
                  }}
                >
                  Personalized email sequences for lead nurturing, open
                  enrollment reminders, and policy renewal notifications
                  -- each crafted by AI to maximize open and conversion rates.
                </p>
              </div>
            </FadeInSection>

            {/* Card 4 — Intelligent Lead Management (spans 2 cols) */}
            <FadeInSection delay={0.25} className="lg:col-span-2">
              <div
                className="rounded-xl p-8 lg:p-10 h-full"
                style={{
                  backgroundColor: '#0F1D32',
                  borderTop: '3px solid #C9A84C',
                }}
              >
                <Users
                  className="h-8 w-8 mb-5"
                  style={{ color: '#C9A84C' }}
                />
                <h3
                  className="text-xl lg:text-2xl mb-3"
                  style={{
                    fontFamily: 'var(--font-dm-serif), serif',
                    color: '#F5F0E8',
                  }}
                >
                  Intelligent Lead Management
                </h3>
                <p
                  className="text-base leading-relaxed max-w-lg"
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    color: '#64748B',
                  }}
                >
                  AI-powered CRM with pipeline tracking, predictive lead
                  scoring, and real-time analytics. Convert more prospects into
                  enrolled members with automated nurture sequences that adapt
                  to each lead&apos;s behavior and intent signals.
                </p>
                {/* Pipeline visual */}
                <div className="mt-6 flex items-center gap-3">
                  {[
                    { label: 'New', pct: 100 },
                    { label: 'Qualified', pct: 72 },
                    { label: 'Proposal', pct: 54 },
                    { label: 'Enrolled', pct: 38 },
                  ].map((stage) => (
                    <div key={stage.label} className="flex-1">
                      <div
                        className="h-2 rounded-full mb-1"
                        style={{ backgroundColor: 'rgba(201,168,76,0.15)' }}
                      >
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${stage.pct}%`,
                            backgroundColor: '#C9A84C',
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] uppercase tracking-wider"
                        style={{
                          color: '#64748B',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                        }}
                      >
                        {stage.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 4 — BY THE NUMBERS                                  */}
      {/* ============================================================ */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        {/* BG image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1920&q=80')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,22,40,0.78) 0%, rgba(10,22,40,0.72) 100%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <p
              className="text-xs tracking-[0.25em] uppercase mb-4"
              style={{
                color: '#C9A84C',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              By The Numbers
            </p>
            <h2
              className="text-3xl sm:text-4xl"
              style={{
                fontFamily: 'var(--font-dm-serif), serif',
                color: '#F5F0E8',
              }}
            >
              Results That Speak for Themselves
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: '10,000+', label: 'Daily AI Calls' },
              { value: '98%', label: 'Client Satisfaction' },
              { value: '$2.4M', label: 'Revenue Generated' },
              { value: '60%', label: 'Cost Reduction' },
            ].map((stat, i) => (
              <FadeInSection key={stat.label} delay={i * 0.1} className="text-center">
                <div
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold"
                  style={{
                    fontFamily: 'var(--font-dm-serif), serif',
                    color: '#C9A84C',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="mt-3 text-sm uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    color: 'rgba(245,240,232,0.6)',
                  }}
                >
                  {stat.label}
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 5 — HOW IT WORKS (timeline)                         */}
      {/* ============================================================ */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <FadeInSection className="text-center mb-20">
            <p
              className="text-xs tracking-[0.25em] uppercase mb-4"
              style={{
                color: '#C9A84C',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              How It Works
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl"
              style={{
                fontFamily: 'var(--font-dm-serif), serif',
                color: '#F5F0E8',
              }}
            >
              Three Steps to Transform
              <br />
              Your Operations
            </h2>
          </FadeInSection>

          <div className="relative">
            {/* Vertical gold line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-px hidden lg:block"
              style={{ backgroundColor: 'rgba(201,168,76,0.25)' }}
            />

            {[
              {
                number: '01',
                title: 'Connect Your Systems',
                description:
                  'Integrate HealthShield with your existing insurance platforms, CRM, and communication channels. Our API-first architecture connects in minutes -- not months.',
                align: 'left' as const,
              },
              {
                number: '02',
                title: 'Configure AI Agents',
                description:
                  'Customize voice personas, call scripts, SMS templates, and email sequences. Set compliance guardrails, approval workflows, and escalation rules specific to your agency.',
                align: 'right' as const,
              },
              {
                number: '03',
                title: 'Scale Your Operations',
                description:
                  'Launch AI-powered campaigns across voice, text, and email simultaneously. Monitor performance in real-time and watch your enrollment numbers climb while costs decline.',
                align: 'left' as const,
              },
            ].map((step, i) => (
              <FadeInSection key={step.number} delay={i * 0.15}>
                <div
                  className={`relative grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 last:mb-0 items-center`}
                >
                  {/* Gold dot on timeline */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full hidden lg:block z-10"
                    style={{
                      backgroundColor: '#C9A84C',
                      boxShadow: '0 0 20px rgba(201,168,76,0.4)',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />

                  {/* Content — alternates sides */}
                  <div
                    className={`${
                      step.align === 'right' ? 'lg:col-start-2' : ''
                    }`}
                  >
                    <div
                      className={`${
                        step.align === 'right'
                          ? 'lg:pl-16'
                          : 'lg:pr-16 lg:text-right'
                      }`}
                    >
                      <span
                        className="text-6xl lg:text-7xl font-bold block mb-2"
                        style={{
                          fontFamily: 'var(--font-dm-serif), serif',
                          color: 'rgba(201,168,76,0.2)',
                        }}
                      >
                        {step.number}
                      </span>
                      <h3
                        className="text-2xl lg:text-3xl mb-3"
                        style={{
                          fontFamily: 'var(--font-dm-serif), serif',
                          color: '#F5F0E8',
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-base leading-relaxed"
                        style={{
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          color: '#64748B',
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Empty column for spacing on the other side */}
                  {step.align === 'right' && (
                    <div className="hidden lg:block lg:col-start-1 lg:row-start-1" />
                  )}
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 6 — TESTIMONIALS                                    */}
      {/* ============================================================ */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(201,168,76,0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: '#0D1B2E' }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <p
              className="text-xs tracking-[0.25em] uppercase mb-4"
              style={{
                color: '#C9A84C',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              What Our Clients Say
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {[
              {
                quote:
                  'HealthShield transformed our enrollment season. We handled 3x the call volume with half the staff, and our satisfaction scores actually went up. The AI voices are so natural that most callers have no idea they are speaking with a machine.',
                name: 'Sarah Mitchell',
                title: 'VP of Operations',
                company: 'Meridian Health Partners',
              },
              {
                quote:
                  'The ROI was evident within the first month. Our cost per enrollment dropped by 58%, and the AI agents consistently outperform our benchmarks on first-call resolution. This is the future of insurance operations.',
                name: 'David Chen',
                title: 'Chief Technology Officer',
                company: 'Pacific Insurance Group',
              },
            ].map((testimonial, i) => (
              <FadeInSection key={testimonial.name} delay={i * 0.15}>
                <div
                  className="rounded-xl p-8 lg:p-10 h-full"
                  style={{
                    backgroundColor: 'rgba(15,29,50,0.6)',
                    border: '1px solid rgba(201,168,76,0.1)',
                  }}
                >
                  <Quote
                    className="h-10 w-10 mb-6"
                    style={{ color: '#C9A84C', opacity: 0.6 }}
                  />
                  <p
                    className="text-base lg:text-lg leading-relaxed mb-8"
                    style={{
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      color: 'rgba(245,240,232,0.8)',
                    }}
                  >
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    {/* Photo placeholder */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        border: '2px solid #C9A84C',
                        backgroundColor: 'rgba(201,168,76,0.1)',
                        color: '#C9A84C',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                      }}
                    >
                      {testimonial.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color: '#F5F0E8',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                        }}
                      >
                        {testimonial.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: '#64748B',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                        }}
                      >
                        {testimonial.title}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 7 — FINAL CTA                                       */}
      {/* ============================================================ */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        {/* BG image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1920&q=80')",
          }}
        />
        {/* Warm navy + gold overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(10,22,40,0.78) 0%, rgba(15,29,50,0.70) 50%, rgba(10,22,40,0.78) 100%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6"
              style={{
                fontFamily: 'var(--font-dm-serif), serif',
                color: '#F5F0E8',
              }}
            >
              Ready to Transform Your
              <br />
              Insurance Operations?
            </h2>
            <p
              className="text-lg mb-10 max-w-xl mx-auto"
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                color: '#64748B',
              }}
            >
              Join 50+ agencies that have reduced costs, increased enrollments,
              and elevated customer satisfaction with HealthShield AI.
            </p>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center gap-2 rounded-full px-10 py-4 text-base font-semibold transition-all hover:brightness-110"
              style={{
                backgroundColor: '#C9A84C',
                color: '#0A1628',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                minHeight: 48,
              }}
            >
              Get Started Today
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p
              className="mt-6 text-sm"
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                color: 'rgba(245,240,232,0.4)',
              }}
            >
              No commitment required &bull; Setup in 48 hours
            </p>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
