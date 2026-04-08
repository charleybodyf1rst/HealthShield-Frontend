'use client';

import Link from 'next/link';
import { Shield, Phone, Mail, MapPin } from 'lucide-react';

const footerLinks = {
  company: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ],
  services: [
    { name: 'AI Voice Calling', href: '/services#voice' },
    { name: 'AI Text Messaging', href: '/services#sms' },
    { name: 'AI Email Campaigns', href: '/services#email' },
    { name: 'Smart Lead Management', href: '/services#crm' },
    { name: 'Savings Calculator', href: '/savings-calculator' },
    { name: 'Get a Quote', href: '/quote' },
  ],
  insurance: [
    { name: 'Medicare Plans', href: '/plans' },
    { name: 'ACA Marketplace', href: '/plans' },
    { name: 'Group Benefits', href: '/plans' },
    { name: 'Supplemental', href: '/plans' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'HIPAA Compliance', href: '/compliance' },
  ],
};

const socialLinks = [
  {
    name: 'LinkedIn',
    href: '#',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'Twitter',
    href: '#',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#060E1A] border-t border-[#C9A84C]/20">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          {/* Brand section */}
          <div className="space-y-6 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-[#C9A84C]" />
              <span className="font-[var(--font-dm-serif)] text-xl text-[#F5F0E8]">
                HealthShield
              </span>
            </Link>
            <p className="text-sm text-[#F5F0E8]/60 max-w-xs leading-relaxed">
              AI-powered health insurance call center technology. Streamlining enrollment, claims, and customer service with intelligent automation.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#F5F0E8]/60">
                <Phone className="h-4 w-4 text-[#C9A84C]" />
                <a href="tel:+18005551234" className="text-sm hover:text-[#F5F0E8] transition-colors">
                  1-800-555-1234
                </a>
              </div>
              <div className="flex items-center gap-3 text-[#F5F0E8]/60">
                <Mail className="h-4 w-4 text-[#C9A84C]" />
                <a href="mailto:info@healthshield.ai" className="text-sm hover:text-[#F5F0E8] transition-colors">
                  info@healthshield.ai
                </a>
              </div>
              <div className="flex items-center gap-3 text-[#F5F0E8]/60">
                <MapPin className="h-4 w-4 text-[#C9A84C]" />
                <span className="text-sm">Austin, TX</span>
              </div>
            </div>

            {/* HIPAA Badge */}
            <div className="inline-flex items-center gap-2 bg-[#C9A84C]/5 backdrop-blur-xl border border-[#C9A84C]/20 rounded-lg px-3 py-2">
              <Shield className="h-4 w-4 text-[#C9A84C]" />
              <span className="text-xs font-medium text-[#C9A84C]">HIPAA Compliant</span>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F5F0E8]/30 hover:text-[#C9A84C] transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Links sections — 4 columns: Company, Services, Insurance, Legal */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-3 xl:mt-0 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wider">
                Company
              </h3>
              <ul role="list" className="mt-4 space-y-3">
                {footerLinks.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wider">
                Services
              </h3>
              <ul role="list" className="mt-4 space-y-3">
                {footerLinks.services.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wider">
                Insurance
              </h3>
              <ul role="list" className="mt-4 space-y-3">
                {footerLinks.insurance.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wider">
                Legal
              </h3>
              <ul role="list" className="mt-4 space-y-3">
                {footerLinks.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-[#C9A84C]/10 pt-8">
          <p className="text-xs text-[#F5F0E8]/40 text-center">
            &copy; {new Date().getFullYear()} HealthShield AI. All rights reserved. | Powered by SystemsF1RST LLC
          </p>
        </div>
      </div>
    </footer>
  );
}
