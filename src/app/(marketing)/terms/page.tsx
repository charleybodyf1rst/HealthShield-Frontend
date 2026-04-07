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

export default function TermsPage() {
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
              Terms of <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Service</span>
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
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Acceptance of Terms</h2>
                <p className="text-white/60 leading-relaxed">
                  By accessing or using the HealthShield website, applications, and services (collectively, the &quot;Services&quot;), operated by SystemsF1RST LLC, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Description of Services</h2>
                <p className="text-white/60 leading-relaxed">
                  HealthShield provides AI-powered health insurance call center services including automated voice calling, SMS messaging, email campaigns, lead management, and CRM tools. Our platform is designed to help health insurance agencies automate and optimize their customer communications and enrollment processes.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Account Responsibilities</h2>
                <p className="text-white/60 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other security breach. You are responsible for ensuring that your use of the Services complies with all applicable laws and regulations, including healthcare regulations.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Acceptable Use</h2>
                <p className="text-white/60 leading-relaxed mb-3">You agree not to use the Services to:</p>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Violate any applicable laws, including HIPAA, TCPA, CAN-SPAM, or state insurance regulations</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Transmit unsolicited communications without proper consent</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Misrepresent your identity or affiliation with any organization</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Attempt to gain unauthorized access to other accounts or systems</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">-</span> Use the platform for any purpose not related to legitimate health insurance operations</li>
                </ul>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Subscription & Billing</h2>
                <p className="text-white/60 leading-relaxed">
                  Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change pricing with 30 days notice. Overages beyond your plan limits will be billed at the rates specified in your service agreement.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">HIPAA & Compliance</h2>
                <p className="text-white/60 leading-relaxed">
                  For clients who are covered entities or business associates under HIPAA, we will enter into a Business Associate Agreement (BAA). Both parties agree to comply with applicable provisions of HIPAA and HITECH. You are responsible for ensuring that your use of the Services complies with all applicable healthcare regulations.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Limitation of Liability</h2>
                <p className="text-white/60 leading-relaxed">
                  To the maximum extent permitted by law, HealthShield and SystemsF1RST LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Services.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Termination</h2>
                <p className="text-white/60 leading-relaxed">
                  Either party may terminate the subscription with 30 days written notice. We may immediately suspend or terminate your access if you violate these Terms. Upon termination, your right to use the Services will immediately cease, and we will securely delete or return your data in accordance with our data retention policies and applicable regulations.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Governing Law</h2>
                <p className="text-white/60 leading-relaxed">
                  These Terms shall be governed by the laws of the State of Texas, without regard to conflict of law principles. Any disputes arising from these Terms shall be resolved in the courts located in Travis County, Texas.
                </p>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-white mb-3">Contact</h2>
                <p className="text-white/60 leading-relaxed">
                  For questions about these Terms, contact us at{' '}
                  <a href="mailto:legal@healthshield.ai" className="text-blue-400 hover:text-blue-300 transition-colors">legal@healthshield.ai</a>{' '}
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
