'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Check, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

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

const tiers = [
  {
    name: 'Starter',
    price: '$299',
    period: '/mo',
    description: 'Perfect for small agencies getting started with AI automation.',
    featured: false,
    features: [
      '500 AI calls per month',
      '2,000 SMS messages',
      '5,000 emails',
      '1 user seat',
      'Basic analytics dashboard',
      'Email support',
      'Standard AI voice agent',
    ],
  },
  {
    name: 'Professional',
    price: '$699',
    period: '/mo',
    description: 'For growing agencies that need full automation and AI intelligence.',
    featured: true,
    features: [
      '2,000 AI calls per month',
      '10,000 SMS messages',
      '25,000 emails',
      '5 user seats',
      'Advanced analytics & reporting',
      'Priority support',
      'AI sales assistant',
      'Custom voice agent training',
      'CRM integrations',
      'Lead scoring & pipeline',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Unlimited everything with dedicated support and custom integrations.',
    featured: false,
    features: [
      'Unlimited AI calls',
      'Unlimited SMS messages',
      'Unlimited emails',
      'Unlimited user seats',
      'Custom analytics & BI',
      'Dedicated account manager',
      'Custom AI model training',
      'White-label options',
      'SLA guarantees',
      'On-premise deployment option',
      'Custom API integrations',
    ],
  },
];

const faqs = [
  {
    question: 'Can I change my plan later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees for Starter and Professional plans. Enterprise plans may include a one-time onboarding fee depending on your custom requirements.',
  },
  {
    question: 'What happens if I exceed my monthly limits?',
    answer: 'We will notify you when you reach 80% of your limits. Overages are billed at competitive per-unit rates, or you can upgrade to a higher plan.',
  },
  {
    question: 'Do you offer annual billing?',
    answer: 'Yes, annual billing is available with a 20% discount. Contact our sales team for annual pricing.',
  },
  {
    question: 'Is the platform HIPAA compliant?',
    answer: 'Absolutely. HealthShield is fully HIPAA compliant with end-to-end encryption, BAA agreements, and comprehensive audit logging.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-white font-medium">{question}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-white/50 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-white/50 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-4">
          <p className="text-white/50 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="bg-black">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide">
              Simple, Transparent{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Pricing</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-white/50">
              No hidden fees. No surprises. Choose the plan that fits your agency.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {tiers.map((tier, i) => (
              <FadeInSection key={tier.name} delay={i * 0.1}>
                <div
                  className={`relative h-full flex flex-col bg-white/5 backdrop-blur-xl border rounded-2xl p-8 transition-all duration-300 ${
                    tier.featured
                      ? 'border-blue-500/50 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-white">
                      {tier.name}
                    </h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="font-['Space_Grotesk'] text-4xl font-bold text-white">
                        {tier.price}
                      </span>
                      <span className="ml-1 text-white/50">{tier.period}</span>
                    </div>
                    <p className="mt-3 text-sm text-white/50">{tier.description}</p>
                  </div>

                  <ul className="mt-8 space-y-3 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white/60">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link
                      href={tier.name === 'Enterprise' ? '/contact' : '/quote'}
                      className={`block w-full text-center rounded-full py-3 text-sm font-semibold transition-all ${
                        tier.featured
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25'
                          : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                    </Link>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <FadeInSection className="text-center mb-12">
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
              Frequently Asked Questions
            </h2>
          </FadeInSection>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <FadeInSection key={faq.question}>
                <FAQItem question={faq.question} answer={faq.answer} />
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
