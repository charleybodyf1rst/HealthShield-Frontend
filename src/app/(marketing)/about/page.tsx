'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Lightbulb, Shield, Lock, BarChart3, Users } from 'lucide-react';

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

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We leverage cutting-edge AI and machine learning to continuously improve health insurance operations and customer experiences.',
  },
  {
    icon: Shield,
    title: 'Trust',
    description: 'We build trust through transparency, reliability, and consistently delivering on our promises to clients and their customers.',
  },
  {
    icon: Lock,
    title: 'Compliance',
    description: 'HIPAA compliance is at the core of everything we do. We maintain the highest standards of data security and patient privacy.',
  },
  {
    icon: BarChart3,
    title: 'Results',
    description: 'We are obsessed with measurable outcomes. Every feature we build is designed to drive real, quantifiable improvements.',
  },
];

const teamMembers = [
  { name: 'Leadership Team', role: 'Coming Soon', initials: 'LT' },
  { name: 'Engineering', role: 'Coming Soon', initials: 'EN' },
  { name: 'AI Research', role: 'Coming Soon', initials: 'AI' },
  { name: 'Customer Success', role: 'Coming Soon', initials: 'CS' },
];

export default function AboutPage() {
  return (
    <div className="bg-black">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide">
              About{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">HealthShield</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-white/50">
              Transforming health insurance operations with AI-powered automation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <FadeInSection>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 lg:p-12 text-center">
              <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-white/60 leading-relaxed max-w-3xl mx-auto">
                HealthShield exists to make health insurance accessible, efficient, and human-centered through artificial intelligence. We believe that AI should enhance — not replace — the human connection in healthcare. Our platform empowers insurance agencies to serve more people, faster and better, while maintaining the personal touch that customers deserve.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Values */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeInSection className="text-center mb-12">
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
              Our Values
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <FadeInSection key={value.title} delay={i * 0.1}>
                <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mx-auto">
                    <value.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="mt-4 font-['Space_Grotesk'] text-lg font-semibold text-white">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team Placeholder */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeInSection className="text-center mb-12">
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
              Our Team
            </h2>
            <p className="mt-4 text-white/50">
              Meet the people building the future of health insurance technology.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, i) => (
              <FadeInSection key={member.name} delay={i * 0.1}>
                <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
                  <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <span className="font-['Space_Grotesk'] text-xl font-bold text-white/50">
                      {member.initials}
                    </span>
                  </div>
                  <h3 className="mt-4 font-['Space_Grotesk'] text-lg font-semibold text-white">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-white/40">{member.role}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
