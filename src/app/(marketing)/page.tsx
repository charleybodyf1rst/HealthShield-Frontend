'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Phone, MessageSquare, Mail, Users, ArrowRight, Shield,
  CheckCircle, Zap, Clock, BarChart3, HeadphonesIcon,
} from 'lucide-react';

function FadeInSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const stats = [
  { label: 'Calls Handled', value: '10,000+' },
  { label: 'Satisfaction', value: '98%' },
  { label: 'Insurance Partners', value: '50+' },
  { label: 'AI Support', value: '24/7' },
];

const features = [
  {
    icon: Phone,
    title: 'AI Voice Calling',
    description: 'Automated outbound and inbound health insurance calls powered by conversational AI. Handle enrollment, claims, and follow-ups at scale.',
  },
  {
    icon: MessageSquare,
    title: 'AI Text Messaging',
    description: 'Intelligent SMS follow-ups, appointment reminders, and enrollment confirmations. Keep your customers informed and engaged.',
  },
  {
    icon: Mail,
    title: 'AI Email Campaigns',
    description: 'Personalized email sequences for lead nurturing, open enrollment reminders, and policy renewal notifications.',
  },
  {
    icon: Users,
    title: 'Smart Lead Management',
    description: 'AI-powered CRM with pipeline tracking, lead scoring, and analytics. Convert more prospects into enrolled members.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Connect Your Systems',
    description: 'Integrate HealthShield with your existing insurance platforms, CRM, and communication channels in minutes.',
  },
  {
    number: '02',
    title: 'AI Takes Over',
    description: 'Our AI agents handle inbound calls, outbound campaigns, SMS follow-ups, and email sequences automatically.',
  },
  {
    number: '03',
    title: 'Watch Results Grow',
    description: 'Track enrollment rates, customer satisfaction, and cost savings in real-time through your analytics dashboard.',
  },
];

export default function MarketingPage() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white/70">HIPAA Compliant AI Technology</span>
            </div>

            <h1 className="font-['Space_Grotesk'] text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
              AI-POWERED HEALTH
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                INSURANCE CALL CENTER
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-lg text-white/60 leading-relaxed">
              Automate enrollment calls, claims follow-ups, and customer service with intelligent AI agents. Reduce costs by 60% while improving satisfaction rates.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3.5 text-base font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25"
              >
                Get a Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <FadeInSection key={stat.label} delay={i * 0.1} className="text-center">
                <div className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-white/50">{stat.label}</div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <h2 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-white uppercase tracking-wide">
              Intelligent Automation
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-white/50">
              Everything your health insurance call center needs, powered by AI that never sleeps.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <FadeInSection key={feature.title} delay={i * 0.1}>
                <div className="group h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    <feature.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="mt-4 font-['Space_Grotesk'] text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <h2 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-white uppercase tracking-wide">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-white/50">
              Get up and running in three simple steps.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <FadeInSection key={step.number} delay={i * 0.15}>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                  <div className="font-['Space_Grotesk'] text-5xl font-bold bg-gradient-to-r from-blue-400/30 to-purple-400/30 bg-clip-text text-transparent">
                    {step.number}
                  </div>
                  <h3 className="mt-4 font-['Space_Grotesk'] text-xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-white/50 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeInSection>
            <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 lg:p-16 text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-white uppercase tracking-wide">
                  Ready to Transform Your Call Center?
                </h2>
                <p className="mt-4 max-w-xl mx-auto text-white/50">
                  Join leading health insurance providers who have reduced operational costs by 60% with HealthShield AI.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/quote"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3.5 text-base font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25"
                  >
                    Get a Free Quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/savings-calculator"
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Calculate Savings
                  </Link>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
