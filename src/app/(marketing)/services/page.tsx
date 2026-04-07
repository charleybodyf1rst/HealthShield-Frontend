'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Phone, MessageSquare, Mail, Users, CheckCircle } from 'lucide-react';

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

const services = [
  {
    id: 'voice',
    icon: Phone,
    title: 'AI Voice Calling',
    description: 'Automated outbound and inbound health insurance calls powered by state-of-the-art conversational AI. Our voice agents sound natural, handle complex insurance questions, and never miss a follow-up.',
    features: [
      'Natural-sounding AI voice agents',
      'Inbound call handling and routing',
      'Outbound enrollment campaigns',
      'Claims status follow-ups',
      'Appointment scheduling',
      'Multi-language support',
      'Real-time call transcription',
      'Warm transfer to human agents',
    ],
  },
  {
    id: 'sms',
    icon: MessageSquare,
    title: 'AI Text Messaging',
    description: 'Intelligent SMS follow-ups, appointment reminders, and enrollment confirmations that keep your customers informed and engaged throughout their insurance journey.',
    features: [
      'Automated appointment reminders',
      'Enrollment status updates',
      'Payment reminders',
      'Two-way SMS conversations',
      'Personalized follow-up sequences',
      'Opt-in/opt-out compliance',
      'Bulk SMS campaigns',
      'Smart scheduling (avoid off-hours)',
    ],
  },
  {
    id: 'email',
    icon: Mail,
    title: 'AI Email Campaigns',
    description: 'Personalized email sequences for lead nurturing, open enrollment reminders, and policy renewal notifications. AI-crafted content that resonates with each recipient.',
    features: [
      'Automated drip campaigns',
      'Open enrollment reminders',
      'Policy renewal notifications',
      'Personalized content generation',
      'A/B testing and optimization',
      'CAN-SPAM compliance built-in',
      'Engagement tracking and analytics',
      'Dynamic template personalization',
    ],
  },
  {
    id: 'crm',
    icon: Users,
    title: 'Smart CRM & Lead Management',
    description: 'AI-powered CRM with pipeline tracking, lead scoring, and analytics. Convert more prospects into enrolled members with intelligent automation.',
    features: [
      'AI-powered lead scoring',
      'Pipeline management',
      'Automated task assignment',
      'Contact deduplication',
      'Activity tracking and history',
      'Custom reporting dashboards',
      'Integration with insurance carriers',
      'Team performance analytics',
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-black">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide">
              Our <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-white/50">
              Comprehensive AI-powered solutions for health insurance call centers. Every touchpoint automated, every interaction optimized.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
          {services.map((service, i) => (
            <FadeInSection key={service.id} delay={0.1}>
              <div
                id={service.id}
                className="scroll-mt-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 lg:p-12 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="lg:flex lg:gap-12">
                  <div className="lg:flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                        <service.icon className="h-7 w-7 text-blue-400" />
                      </div>
                      <h2 className="font-['Space_Grotesk'] text-2xl lg:text-3xl font-bold text-white">
                        {service.title}
                      </h2>
                    </div>
                    <p className="text-white/60 leading-relaxed text-lg">
                      {service.description}
                    </p>
                  </div>
                  <div className="mt-8 lg:mt-0 lg:flex-1">
                    <h3 className="font-['Space_Grotesk'] text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
                      Key Features
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-white/60">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>
    </div>
  );
}
