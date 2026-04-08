import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans } from 'next/font/google';
import './globals.css';

// Force all pages to render dynamically — prevents stale cached HTML after deploys
export const dynamic = 'force-dynamic';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: ['400'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
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
        url: '/logos/healthshield-logo.svg',
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
    images: ['/logos/healthshield-logo.svg'],
  },
  icons: {
    icon: '/logos/healthshield-logo.svg',
    shortcut: '/logos/healthshield-logo.svg',
    apple: '/logos/healthshield-logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSerifDisplay.variable} ${dmSans.variable} font-sans antialiased`}>
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
