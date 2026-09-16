'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/hooks/useSession';
import { useAnswers } from '@/lib/hooks/useAnswers';
import { analytics } from '@/lib/analytics';

export default function ScanPage() {
  const { session, loading: sessionLoading } = useSession();
  const { answers, saving: answersLoading } = useAnswers(session?.id ?? null);
  const [hasExistingScan, setHasExistingScan] = useState(false);
  const [scanType, setScanType] = useState<'quick' | 'deep' | null>(null);

  useEffect(() => {
    if (!answersLoading && Object.keys(answers).length > 0) {
      setHasExistingScan(true);
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

  // Return visit with incomplete scan — show only resume/fresh
  if (hasExistingScan && scanType) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-md w-full mx-auto text-center">
          <span className="text-brand text-sm font-medium tracking-wider uppercase">
            Welcome back
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-text mt-4 mb-4">
            You have an unfinished scan
          </h1>
          <p className="text-text-secondary text-sm mb-8">
            Pick up where you left off, or start fresh.
          </p>
          <div className="flex flex-col gap-4">
            <Link
              href={`/scan/${scanType}`}
              className="bg-brand hover:bg-brand-hover text-background font-semibold px-8 py-4 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              Resume Scan
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('growthmap_session');
                setHasExistingScan(false);
                window.location.reload();
              }}
              className="bg-surface border border-border text-text hover:border-text-muted font-medium px-8 py-4 rounded-lg transition-all duration-150"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </main>
    );
  }

  // First visit — show scan selection
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-3xl w-full mx-auto">
        <div className="text-center mb-12">
          <span className="text-brand text-sm font-medium tracking-wider uppercase">
            Choose Your Scan
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-text mt-4 mb-4">
            Sales Scale Simulator
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            Two options — both free, both instant. Pick the depth that fits what you need right now.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Scan */}
          <Link
            href="/scan/quick"
            onClick={() => analytics.scanTypeSelected('quick')}
            className="group bg-surface border border-border rounded-xl p-8 hover:border-brand transition-all duration-150 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-brand text-sm font-medium tracking-wider uppercase">
                Quick Scan
              </span>
              <span className="text-text-muted text-xs bg-background px-3 py-1 rounded-full">
                ~2 min
              </span>
            </div>
            <h2 className="font-display text-2xl text-text mb-2">
              7 quick questions
            </h2>
            <p className="text-brand text-sm font-medium mb-2">
              You want your #1 bottleneck, fast
            </p>
            <p className="text-text-secondary text-sm mb-6">
              See what&apos;s costing you revenue right now — booked calls, show rate, close rate, revenue, and your primary constraint.
            </p>
            <div className="text-brand text-sm font-medium group-hover:translate-x-1 transition-transform">
              Start Quick Scan &rarr;
            </div>
          </Link>

          {/* Deep Scan */}
          <Link
            href="/scan/deep"
            onClick={() => analytics.scanTypeSelected('deep')}
            className="group bg-surface border border-border rounded-xl p-8 hover:border-brand transition-all duration-150 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-brand text-sm font-medium tracking-wider uppercase">
                Deep Scan
              </span>
              <span className="text-text-muted text-xs bg-background px-3 py-1 rounded-full">
                ~5 min
              </span>
            </div>
            <h2 className="font-display text-2xl text-text mb-2">
              Full diagnostic
            </h2>
            <p className="text-brand text-sm font-medium mb-2">
              You want the complete funnel breakdown + fix roadmap
            </p>
            <p className="text-text-secondary text-sm mb-6">
              Get a full picture of your funnel, your team, and exactly what to fix first — raw counts, lead volume, team size, and industry context.
            </p>
            <div className="text-brand text-sm font-medium group-hover:translate-x-1 transition-transform">
              Start Deep Scan &rarr;
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
