'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

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

const faqs = [
  {
    question: 'What is HealthShield?',
    answer: 'HealthShield is an AI-powered health insurance call center platform. We automate outbound and inbound calls, SMS messages, email campaigns, and lead management using advanced conversational AI technology.',
  },
  {
    question: 'How does the AI voice calling work?',
    answer: 'Our AI voice agents use natural language processing to conduct human-like phone conversations. They can handle enrollment inquiries, claims follow-ups, appointment scheduling, and more. Calls can be seamlessly transferred to human agents when needed.',
  },
  {
    question: 'Is HealthShield HIPAA compliant?',
    answer: 'Yes, HealthShield is fully HIPAA compliant. All data is encrypted at rest and in transit, we provide Business Associate Agreements (BAA), maintain comprehensive audit logs, and follow strict access controls.',
  },
  {
    question: 'Can I integrate HealthShield with my existing systems?',
    answer: 'Absolutely. HealthShield integrates with popular CRM platforms, insurance carrier systems, calendar tools, and communication platforms. Our Enterprise plan includes custom API integrations tailored to your workflow.',
  },
  {
    question: 'How long does setup take?',
    answer: 'Most agencies are up and running within 48 hours for Starter and Professional plans. Enterprise deployments with custom integrations typically take 1-2 weeks depending on complexity.',
  },
  {
    question: 'What types of insurance plans does HealthShield support?',
    answer: 'We support all major health insurance plan types including Individual Health, Family Health, Medicare Advantage, Medicare Supplement, Dental & Vision, Short-Term Health, Group/Employer plans, and Life Insurance.',
  },
  {
    question: 'Can the AI handle complex insurance questions?',
    answer: 'Yes. Our AI agents are trained on comprehensive insurance knowledge bases and can handle complex questions about coverage, deductibles, copays, networks, and enrollment periods. For highly specialized queries, calls are seamlessly transferred to licensed agents.',
  },
  {
    question: 'What kind of analytics and reporting do you provide?',
    answer: 'HealthShield provides real-time dashboards with call volume metrics, conversion rates, customer satisfaction scores, lead pipeline analytics, agent performance tracking, and ROI reporting. Professional and Enterprise plans include advanced custom reports.',
  },
  {
    question: 'Is there a contract or commitment?',
    answer: 'Starter and Professional plans are month-to-month with no long-term commitment. You can cancel anytime. Enterprise plans may include custom terms. Annual billing is available with a 20% discount.',
  },
  {
    question: 'How do you ensure call quality?',
    answer: 'Every AI call is monitored for quality. We use real-time sentiment analysis, automated quality scoring, and call recording with transcription. You can review calls anytime through your dashboard and provide feedback to continuously improve AI performance.',
  },
];

export default function FAQPage() {
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
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Questions</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-white/50">
              Everything you need to know about HealthShield and our AI-powered call center platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <FadeInSection>
            <Accordion.Root type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <Accordion.Item
                  key={i}
                  value={`item-${i}`}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden data-[state=open]:border-white/20 transition-colors"
                >
                  <Accordion.Trigger className="group w-full flex items-center justify-between px-6 py-4 text-left">
                    <span className="text-white font-medium pr-4">{faq.question}</span>
                    <ChevronDown className="h-5 w-5 text-white/50 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="px-6 pb-4">
                      <p className="text-white/50 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
