'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';

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

export default function PrivacyPage() {
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
              Privacy <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="mt-4 text-white/40">Last updated: April 7, 2026</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <FadeInSection>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 lg:p-10 space-y-8">
              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Introduction</h2>
                <p className="text-white/60 leading-relaxed">
                  HealthShield (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), operated by SystemsF1RST LLC, provides AI-powered health insurance call center services. This Privacy Policy describes how we collect, use, and protect your personal information when you use our website, applications, and services, including our AI voice calling, SMS messaging, and email campaign platforms.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Information We Collect</h2>
                <p className="text-white/60 leading-relaxed mb-3">We collect information you provide directly to us, including:</p>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Contact Information: Name, email address, phone number, and mailing address</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Insurance Information: Plan preferences, coverage needs, employer information, and enrollment data</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Communication Data: Records of calls, SMS messages, and emails processed through our platform</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Account Information: Login credentials and profile details</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Usage Data: How you interact with our platform and services</li>
                </ul>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Process insurance inquiries and enrollment requests</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Provide AI-powered call center services including voice, SMS, and email</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Communicate regarding your account and services</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Improve our AI models and service quality</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Comply with legal and regulatory requirements including HIPAA</li>
                </ul>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">HIPAA Compliance</h2>
                <p className="text-white/60 leading-relaxed">
                  To the extent that we handle Protected Health Information (PHI), we comply with the Health Insurance Portability and Accountability Act (HIPAA). We enter into Business Associate Agreements (BAA) with covered entities and maintain appropriate administrative, physical, and technical safeguards to protect PHI.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Data Security</h2>
                <p className="text-white/60 leading-relaxed">
                  We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 encryption in transit, access controls, audit logging, and regular security assessments. Our infrastructure is hosted on SOC 2 Type II certified cloud platforms.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Data Retention</h2>
                <p className="text-white/60 leading-relaxed">
                  We retain personal information for as long as necessary to fulfill the purposes described in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Call recordings and communications data are retained in accordance with applicable healthcare regulations.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Your Rights</h2>
                <p className="text-white/60 leading-relaxed">
                  You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, contact us at{' '}
                  <a href="mailto:privacy@healthshield.ai" className="text-blue-400 hover:text-blue-300 transition-colors">privacy@healthshield.ai</a>.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Contact Us</h2>
                <p className="text-white/60 leading-relaxed">
                  For questions about this Privacy Policy, contact us at{' '}
                  <a href="mailto:privacy@healthshield.ai" className="text-blue-400 hover:text-blue-300 transition-colors">privacy@healthshield.ai</a>{' '}
                  or call 1-800-555-1234.
                </p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
