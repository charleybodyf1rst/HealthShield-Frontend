'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Phone, Mail, MapPin, Send, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

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

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: Phone,
    label: 'Phone',
    value: '1-800-555-1234',
    href: 'tel:+18005551234',
    description: 'Mon-Fri, 8AM-8PM CT',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@healthshield.ai',
    href: 'mailto:info@healthshield.ai',
    description: 'We respond within 24 hours',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Austin, TX',
    href: null,
    description: 'United States',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Mon - Fri',
    href: null,
    description: '8:00 AM - 8:00 PM CT',
  },
];

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Placeholder — will integrate with backend contact endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Message sent! We will get back to you within 24 hours.');
      reset();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

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
              Get In{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-white/50">
              Have questions? We are here to help. Reach out and our team will respond promptly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Form */}
            <FadeInSection className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Name *</label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="Your name"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Email *</label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="you@company.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Subject *</label>
                    <input
                      {...register('subject', { required: 'Subject is required' })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="How can we help?"
                    />
                    {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Message *</label>
                    <textarea
                      {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Message must be at least 10 characters' } })}
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                      placeholder="Tell us more about your needs..."
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 text-base font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </FadeInSection>

            {/* Contact Info */}
            <FadeInSection className="lg:col-span-2" delay={0.2}>
              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <div
                    key={info.label}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex-shrink-0">
                        <info.icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white text-sm">{info.label}</h3>
                        {info.href ? (
                          <a href={info.href} className="text-white/70 hover:text-white transition-colors text-sm">
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-white/70 text-sm">{info.value}</p>
                        )}
                        <p className="text-white/40 text-xs mt-0.5">{info.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>
    </div>
  );
}
