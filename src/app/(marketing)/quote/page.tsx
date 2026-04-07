'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Send, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { insuranceApi } from '@/lib/api';

const quoteSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number is required'),
  company_name: z.string().optional(),
  plan_type: z.string().min(1, 'Please select a plan type'),
  num_employees: z.string().optional(),
  message: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

const planTypes = [
  'Individual Health',
  'Family Health',
  'Medicare Advantage',
  'Medicare Supplement',
  'Dental & Vision',
  'Short-Term Health',
  'Group / Employer',
  'Life Insurance',
  'Other',
];

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

export default function QuotePage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<QuoteFormData>();

  const onSubmit = async (data: QuoteFormData) => {
    try {
      await insuranceApi.requestQuote(data);
      toast.success('Quote request submitted! We will be in touch within 24 hours.');
      reset();
    } catch {
      toast.error('Something went wrong. Please try again or call us at 1-800-555-1234.');
    }
  };

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
              Get Your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Free Quote</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-white/50">
              Tell us about your needs and our team will create a personalized proposal within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <FadeInSection>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 lg:p-10">
              {isSubmitSuccessful ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-white">Thank You!</h2>
                  <p className="mt-2 text-white/50">Your quote request has been submitted. We will contact you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">First Name *</label>
                      <input
                        {...register('first_name', { required: 'First name is required' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="John"
                      />
                      {errors.first_name && <p className="mt-1 text-xs text-red-400">{errors.first_name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Last Name *</label>
                      <input
                        {...register('last_name', { required: 'Last name is required' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="Doe"
                      />
                      {errors.last_name && <p className="mt-1 text-xs text-red-400">{errors.last_name.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Email *</label>
                      <input
                        type="email"
                        {...register('email', { required: 'Email is required' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="john@company.com"
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Phone *</label>
                      <input
                        type="tel"
                        {...register('phone', { required: 'Phone is required' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Company Name</label>
                    <input
                      {...register('company_name')}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="Your Company"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Plan Type *</label>
                      <select
                        {...register('plan_type', { required: 'Plan type is required' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                      >
                        <option value="" className="bg-black">Select a plan type</option>
                        {planTypes.map((type) => (
                          <option key={type} value={type} className="bg-black">{type}</option>
                        ))}
                      </select>
                      {errors.plan_type && <p className="mt-1 text-xs text-red-400">{errors.plan_type.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Number of Employees</label>
                      <input
                        type="number"
                        {...register('num_employees')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="e.g. 50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Message</label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                      placeholder="Tell us about your specific needs..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3.5 text-base font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
