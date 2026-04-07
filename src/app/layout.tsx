import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

// Force all pages to render dynamically — prevents stale cached HTML after deploys
export const dynamic = 'force-dynamic';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'HealthShield | AI-Powered Health Insurance Call Center',
    template: '%s | HealthShield',
  },
  description:
    'AI-powered health insurance call center. Automated AI calling, text messaging, and email campaigns for insurance agencies. HIPAA compliant.',
  keywords: [
    'Health Insurance',
    'AI Call Center',
    'Insurance AI',
    'HealthShield',
    'Medicare',
    'AI Calling',
    'Insurance CRM',
    'Automated Insurance',
  ],
  authors: [{ name: 'HealthShield' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://healthshield.ai',
    siteName: 'HealthShield',
    title: 'HealthShield | AI-Powered Health Insurance Call Center',
    description:
      'AI-powered health insurance call center. Automated calling, SMS, and email campaigns for insurance agencies.',
    images: [
      {
        url: '/logos/healthshield-logo.png',
        width: 1200,
        height: 630,
        alt: 'HealthShield',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HealthShield',
    description: 'AI-powered health insurance call center.',
    images: ['/logos/healthshield-logo.png'],
  },
  icons: {
    icon: '/logos/healthshield-logo.png',
    shortcut: '/logos/healthshield-logo.png',
    apple: '/logos/healthshield-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
