import Link from 'next/link';

const popularPages = [
  { name: 'Home', href: '/', description: 'Back to the homepage' },
  { name: 'Our Plans', href: '/plans', description: 'Browse insurance plans' },
  { name: 'Get a Quote', href: '/quote', description: 'Request a quote' },
  { name: 'Contact', href: '/contact', description: 'Get in touch' },
  { name: 'FAQ', href: '/faq', description: 'Common questions' },
  { name: 'Dashboard', href: '/dashboard', description: 'Manage your account' },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <div className="mb-6">
          <span className="text-[120px] md:text-[160px] font-black leading-none bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            404
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Try one of these pages instead.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {popularPages.map((page) => (
            <Link
              key={page.name}
              href={page.href}
              className="group p-4 rounded-xl border border-white/10 bg-white/5 hover:border-amber-500/30 hover:bg-white/10 transition-all duration-300"
            >
              <div className="font-semibold text-white text-sm">{page.name}</div>
              <div className="text-slate-500 text-xs mt-0.5">{page.description}</div>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold hover:opacity-90 transition-all duration-300"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
