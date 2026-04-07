'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Heart, Users, Shield, Clock, Eye, Building2, Briefcase, Umbrella, ArrowRight,
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

const plans = [
  {
    icon: Heart,
    title: 'Individual Health',
    description: 'Comprehensive coverage for individuals including preventive care, prescriptions, and specialist visits.',
  },
  {
    icon: Users,
    title: 'Family Health',
    description: 'Full family coverage with pediatric care, maternity benefits, and family deductible options.',
  },
  {
    icon: Shield,
    title: 'Medicare Advantage',
    description: 'Enhanced Medicare benefits including vision, dental, hearing, and wellness programs.',
  },
  {
    icon: Umbrella,
    title: 'Medicare Supplement',
    description: 'Fill the gaps in Original Medicare with predictable costs and nationwide coverage.',
  },
  {
    icon: Eye,
    title: 'Dental & Vision',
    description: 'Standalone dental and vision plans with comprehensive coverage for routine and major services.',
  },
  {
    icon: Clock,
    title: 'Short-Term Health',
    description: 'Temporary coverage for life transitions with flexible terms from 30 days to 12 months.',
  },
  {
    icon: Building2,
    title: 'Group / Employer',
    description: 'Competitive group health plans for businesses of all sizes with employer contribution options.',
  },
  {
    icon: Briefcase,
    title: 'Life Insurance',
    description: 'Term and whole life options to protect your family\'s financial future with guaranteed benefits.',
  },
];

export default function PlansPage() {
  return (
    <div className="bg-black">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide">
              Insurance Plans{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                We Support
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-white/50">
              Our AI call center handles enrollment, questions, and support across all major health insurance plan types.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => (
              <FadeInSection key={plan.title} delay={i * 0.08}>
                <div className="group h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 group-hover:border-blue-400/50 transition-colors">
                    <plan.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="mt-4 font-['Space_Grotesk'] text-lg font-semibold text-white">
                    {plan.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">
                    {plan.description}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>

          {/* CTA */}
          <FadeInSection className="mt-16 text-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 lg:p-12">
              <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white">
                Not sure which plan is right for you?
              </h2>
              <p className="mt-3 text-white/50 max-w-lg mx-auto">
                Get a personalized recommendation from our AI assistant or speak with a licensed agent.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 text-sm font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25"
                >
                  Get a Personalized Quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
