import Link from 'next/link';

// Force dynamic rendering — never serve stale cached HTML for auth pages
export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding with navy/gold design */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A1628]"
      >
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#C9A84C] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="font-bold text-xl tracking-widest uppercase font-[var(--font-dm-serif)]">
              HEALTHSHIELD
            </span>
          </Link>

          <div className="space-y-6">
            {/* Gold accent line */}
            <div className="w-12 h-0.5 bg-[#C9A84C]" />

            <blockquote className="text-2xl font-medium leading-relaxed text-[#F5F0E8] opacity-90">
              &quot;HealthShield&apos;s AI call center increased our enrollment rate by 47%.
              We handle 3x more leads with the same team size.&quot;
            </blockquote>
            <div>
              <p className="font-semibold text-[#F5F0E8]">Sarah Martinez</p>
              <p className="text-[#F5F0E8] opacity-50 text-sm">VP of Operations, Premier Insurance Group</p>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm">
            <div>
              <p className="text-2xl font-bold text-[#C9A84C]">10,000+</p>
              <p className="text-[#F5F0E8] opacity-50">AI Calls Daily</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#C9A84C]">98%</p>
              <p className="text-[#F5F0E8] opacity-50">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#C9A84C]">50+</p>
              <p className="text-[#F5F0E8] opacity-50">Insurance Partners</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
