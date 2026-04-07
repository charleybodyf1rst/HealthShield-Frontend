'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
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
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-8">
          An error occurred while loading this page. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
