'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Lock, FileText, Eye, Server, CheckCircle } from 'lucide-react';

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

const complianceAreas = [
  {
    icon: Shield,
    title: 'HIPAA Compliance',
    description: 'HealthShield is fully compliant with the Health Insurance Portability and Accountability Act. We maintain strict policies and procedures to protect Protected Health Information (PHI).',
    items: [
      'Business Associate Agreements (BAA) for all clients',
      'Annual HIPAA risk assessments',
      'Workforce training and awareness programs',
      'Incident response and breach notification procedures',
      'Minimum necessary access controls',
    ],
  },
  {
    icon: Lock,
    title: 'Data Encryption',
    description: 'All data is protected with industry-leading encryption standards, both at rest and in transit.',
    items: [
      'AES-256 encryption for data at rest',
      'TLS 1.3 for all data in transit',
      'End-to-end encryption for voice calls',
      'Encrypted database backups',
      'Hardware security modules (HSM) for key management',
    ],
  },
  {
    icon: Server,
    title: 'Infrastructure Security',
    description: 'Our infrastructure is built on enterprise-grade cloud platforms with multiple layers of security controls.',
    items: [
      'SOC 2 Type II certified cloud infrastructure',
      'Multi-region data redundancy',
      'DDoS protection and WAF',
      'Network segmentation and firewalls',
      'Regular penetration testing',
      '99.99% uptime SLA',
    ],
  },
  {
    icon: FileText,
    title: 'Audit Trail',
    description: 'Comprehensive logging and audit capabilities ensure full visibility into all system activities.',
    items: [
      'Complete audit logs for all PHI access',
      'User activity tracking and monitoring',
      'Automated compliance reporting',
      'Retention policies aligned with regulations',
      'Real-time alerting for suspicious activity',
    ],
  },
];

export default function CompliancePage() {
  return (
    <div className="bg-black">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-8">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Fully HIPAA Compliant</span>
            </div>

            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide">
              HIPAA Compliance{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">& Security</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-white/50">
              Your data security is our top priority. HealthShield is built from the ground up with healthcare compliance in mind.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Compliance Sections */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-8">
          {complianceAreas.map((area, i) => (
            <FadeInSection key={area.title} delay={0.1}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 lg:p-10 hover:bg-white/[0.07] transition-all duration-300">
                <div className="lg:flex lg:gap-10">
                  <div className="lg:flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                        <area.icon className="h-6 w-6 text-blue-400" />
                      </div>
                      <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white">
                        {area.title}
                      </h2>
                    </div>
                    <p className="text-white/60 leading-relaxed">
                      {area.description}
                    </p>
                  </div>
                  <div className="mt-6 lg:mt-0 lg:flex-1">
                    <ul className="space-y-3">
                      {area.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-white/60">{item}</span>
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
