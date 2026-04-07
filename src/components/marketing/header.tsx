'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Services', href: '/services' },
  { name: 'Plans', href: '/plans' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Quote', href: '/quote' },
];

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      )}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
        aria-label="Global"
      >
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="font-['Space_Grotesk'] font-bold text-xl tracking-tight text-white">
              Health<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Shield</span>
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white/80 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-black/95 backdrop-blur-xl px-6 py-6 sm:max-w-sm border-l border-white/10 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="-m-1.5 p-1.5 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="h-7 w-7 text-blue-400" />
                  <span className="font-['Space_Grotesk'] font-bold text-lg text-white">
                    Health<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Shield</span>
                  </span>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-white/80 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-8 flow-root">
                <div className="-my-6 divide-y divide-white/10">
                  <div className="space-y-1 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="py-6 space-y-4">
                    <Link
                      href="/login"
                      className="block w-full text-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
