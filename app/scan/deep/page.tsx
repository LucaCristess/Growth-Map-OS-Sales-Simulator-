'use client';

import Link from 'next/link';

export default function DeepScanPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        <Link
          href="/scan"
          className="text-text-muted hover:text-text text-sm mb-12 inline-block transition-colors"
        >
          Back to scan selection
        </Link>

        <h1 className="font-display text-4xl md:text-5xl text-text mb-4">
          Deep Scan
        </h1>
        <p className="text-text-secondary text-lg mb-12">
          ~5-8 minutes. Full diagnostic and complete revenue analysis.
        </p>

        <div className="bg-surface border border-border rounded-xl p-8 text-left">
          <p className="text-text-muted text-center">
            Questions coming in Brick 3...
          </p>
        </div>
      </div>
    </main>
  );
}
