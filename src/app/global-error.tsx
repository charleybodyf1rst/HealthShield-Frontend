'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A1628] text-white min-h-screen flex items-center justify-center font-sans antialiased">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-8">
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
