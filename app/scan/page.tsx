'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/hooks/useSession';
import { useAnswers } from '@/lib/hooks/useAnswers';

export default function ScanPage() {
  const { session, loading: sessionLoading } = useSession();
  const { answers, saving: answersLoading } = useAnswers(session?.id ?? null);
  const [hasExistingScan, setHasExistingScan] = useState(false);
  const [scanType, setScanType] = useState<'quick' | 'deep' | null>(null);

  useEffect(() => {
    if (!answersLoading && Object.keys(answers).length > 0) {
      setHasExistingScan(true);
      // Determine scan type from answers
      if (answers.show_count !== undefined || answers.monthly_leads !== undefined) {
        setScanType('deep');
      } else {
        setScanType('quick');
      }
    }
  }, [answers, answersLoading]);

  if (sessionLoading || answersLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-text-muted">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full mx-auto">
        {/* Resume prompt */}
        {hasExistingScan && scanType && (
          <div className="bg-surface border border-brand/20 rounded-xl p-8 mb-10 text-center">
            <span className="text-brand text-sm font-medium tracking-wider uppercase">
              Welcome back
            </span>
            <h2 className="font-display text-2xl text-text mt-3 mb-2">
              You have an unfinished {scanType === 'quick' ? 'Quick' : 'Deep'} Scan
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              Pick up where you left off, or start fresh.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/scan/${scanType}`}
                className="bg-brand hover:bg-brand-hover text-background font-medium px-6 py-3 rounded-lg transition-all duration-200"
              >
                Resume Scan
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('growthmap_session');
                  setHasExistingScan(false);
                  window.location.reload();
                }}
                className="bg-surface border border-border text-text hover:border-text-muted font-medium px-6 py-3 rounded-lg transition-all duration-200"
              >
                Start Fresh
              </button>
            </div>
          </div>
        )}

        {/* Scan selection */}
        <div className="text-center mb-12">
          <span className="text-brand text-sm font-medium tracking-wider uppercase">
            Choose Your Scan
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-text mt-4 mb-4">
            Sales Scale Simulator
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            Analyze your sales funnel and discover your primary constraint.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Scan */}
          <Link
            href="/scan/quick"
            className="group bg-surface border border-border rounded-xl p-8 hover:border-brand transition-all duration-300"
          >
            <div className="text-brand text-sm font-medium tracking-wider uppercase mb-3">
              Quick Scan
            </div>
            <h2 className="font-display text-2xl text-text mb-3">
              7 questions
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              Booked calls, show rate, close rate, ownership, revenue, AOV, target.
            </p>
            <div className="text-brand text-sm group-hover:translate-x-1 transition-transform">
              Start Quick Scan →
            </div>
          </Link>

          {/* Deep Scan */}
          <Link
            href="/scan/deep"
            className="group bg-surface border border-border rounded-xl p-8 hover:border-brand transition-all duration-300"
          >
            <div className="text-brand text-sm font-medium tracking-wider uppercase mb-3">
              Deep Scan
            </div>
            <h2 className="font-display text-2xl text-text mb-3">
              10 questions
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              Raw counts, leads/month, team size, niche, years in business.
            </p>
            <div className="text-brand text-sm group-hover:translate-x-1 transition-transform">
              Start Deep Scan →
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
