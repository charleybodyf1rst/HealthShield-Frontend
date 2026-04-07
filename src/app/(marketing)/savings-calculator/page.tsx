'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calculator, DollarSign, TrendingDown, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

const planTypes = [
  'Individual Health',
  'Family Health',
  'Medicare Advantage',
  'Medicare Supplement',
  'Group / Employer',
];

export default function SavingsCalculatorPage() {
  const [monthlyPremium, setMonthlyPremium] = useState(500);
  const [employees, setEmployees] = useState(10);
  const [planType, setPlanType] = useState('Group / Employer');
  const [calculated, setCalculated] = useState(false);

  // Client-side savings estimation logic
  const planMultiplier: Record<string, number> = {
    'Individual Health': 0.12,
    'Family Health': 0.15,
    'Medicare Advantage': 0.10,
    'Medicare Supplement': 0.08,
    'Group / Employer': 0.18,
  };

  const multiplier = planMultiplier[planType] || 0.12;
  const monthlySavings = Math.round(monthlyPremium * employees * multiplier);
  const annualSavings = monthlySavings * 12;
  const aiCostReduction = Math.round(employees * 45); // $45/employee/month for AI automation
  const totalMonthlySavings = monthlySavings + aiCostReduction;
  const totalAnnualSavings = totalMonthlySavings * 12;

  const handleCalculate = () => {
    setCalculated(true);
  };

  return (
    <div className="bg-black">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide">
              Calculate Your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Savings</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-white/50">
              See how much your organization can save with HealthShield AI-powered automation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calculator */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Input Form */}
            <FadeInSection>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Calculator className="h-6 w-6 text-blue-400" />
                  <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white">Your Details</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Current Monthly Premium (per employee)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        type="number"
                        value={monthlyPremium}
                        onChange={(e) => setMonthlyPremium(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Number of Employees: <span className="text-blue-400 font-bold">{employees}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={employees}
                      onChange={(e) => setEmployees(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      <span>1</span>
                      <span>250</span>
                      <span>500</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Current Plan Type
                    </label>
                    <select
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                    >
                      {planTypes.map((type) => (
                        <option key={type} value={type} className="bg-black">{type}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleCalculate}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 text-base font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25"
                  >
                    Calculate Savings
                    <Calculator className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </FadeInSection>

            {/* Results */}
            <FadeInSection delay={0.2}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingDown className="h-6 w-6 text-green-400" />
                  <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white">Projected Savings</h2>
                </div>

                {calculated ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <p className="text-sm text-white/50 mb-1">Premium Optimization Savings</p>
                      <p className="font-['Space_Grotesk'] text-3xl font-bold text-white">
                        ${monthlySavings.toLocaleString()}<span className="text-lg text-white/50">/mo</span>
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <p className="text-sm text-white/50 mb-1">AI Automation Cost Reduction</p>
                      <p className="font-['Space_Grotesk'] text-3xl font-bold text-white">
                        ${aiCostReduction.toLocaleString()}<span className="text-lg text-white/50">/mo</span>
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-5">
                      <p className="text-sm text-blue-300 mb-1">Total Annual Savings</p>
                      <p className="font-['Space_Grotesk'] text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        ${totalAnnualSavings.toLocaleString()}
                      </p>
                      <p className="text-sm text-white/40 mt-1">${totalMonthlySavings.toLocaleString()} per month</p>
                    </div>

                    <Link
                      href="/quote"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 text-base font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25"
                    >
                      Get a Custom Quote
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <DollarSign className="h-12 w-12 text-white/10 mb-3" />
                    <p className="text-white/30">Enter your details and click &quot;Calculate Savings&quot; to see your projected cost reduction.</p>
                  </div>
                )}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>
    </div>
  );
}
