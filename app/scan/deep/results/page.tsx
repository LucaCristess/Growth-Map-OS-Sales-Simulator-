'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';
import { useAnswers } from '@/lib/hooks/useAnswers';
import { calculateRevenue, calculatePrimaryConstraint, calculateScenarios } from '@/lib/calculations/revenue';
import { analytics } from '@/lib/analytics';
import Link from 'next/link';
import type { RevenueResult, Scenario, ConstraintAnalysis } from '@/types';

export default function DeepResultsPage() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const { answers, saving: answersLoading } = useAnswers(session?.id ?? null);
  const [result, setResult] = useState<RevenueResult | null>(null);
  const [constraint, setConstraint] = useState<ConstraintAnalysis | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const rev = calculateRevenue(answers);
      const con = calculatePrimaryConstraint(answers);
      const scen = calculateScenarios(answers);
      setResult(rev);
      setConstraint(con);
      setScenarios(scen);
      analytics.resultsViewed('deep', scen[0]?.projected_revenue ?? 0);
    }
  }, [answers]);

  if (sessionLoading || answersLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-text-muted">Calculating your results...</div>
      </main>
    );
  }

  if (!result || !constraint || !scenarios) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl text-text mb-4">No data yet</h1>
          <p className="text-text-secondary mb-8">Complete the scan to see your results.</p>
          <Link
            href="/scan"
            className="bg-brand hover:bg-brand-hover text-background font-medium px-6 py-3 rounded-lg transition-all duration-200"
          >
            Start Scan
          </Link>
        </div>
      </main>
    );
  }

  const currentScenario = scenarios[0];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full mx-auto">
        {/* Hero result */}
        <div className="text-center mb-16">
          <span className="text-brand text-sm font-medium tracking-wider uppercase">
            Your Sales Engine
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-text mt-4 mb-6">
            {result.projected_revenue > 0
              ? `$${Math.round(result.projected_revenue).toLocaleString()}`
              : 'Incomplete data'}
            <span className="text-text-secondary text-2xl block mt-2">projected monthly</span>
          </h1>
        </div>

        {/* Current funnel — Deep Scan shows raw counts */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Your Current Funnel</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-lg font-medium text-text">{String(answers.booked_calls ?? '—')}</div>
              <div className="text-text-muted text-xs mt-1">Booked</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-text">{String(answers.show_count ?? '—')}</div>
              <div className="text-text-muted text-xs mt-1">Showed Up</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-text">{String(answers.close_count ?? '—')}</div>
              <div className="text-text-muted text-xs mt-1">Closed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-brand">{answers.monthly_revenue ? `$${Number(answers.monthly_revenue).toLocaleString()}` : '—'}</div>
              <div className="text-text-muted text-xs mt-1">Revenue</div>
            </div>
          </div>
        </div>

        {/* Derived rates display */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Derived Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-lg font-medium text-text">{result.show_rate > 0 ? `${result.show_rate.toFixed(0)}%` : '—'}</div>
              <div className="text-text-muted text-xs mt-1">Show Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-text">{result.close_rate > 0 ? `${result.close_rate.toFixed(0)}%` : '—'}</div>
              <div className="text-text-muted text-xs mt-1">Close Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-text">{answers.aov ? `$${Number(answers.aov).toLocaleString()}` : '—'}</div>
              <div className="text-text-muted text-xs mt-1">AOV</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-text">{String(answers.monthly_leads ?? '—')}</div>
              <div className="text-text-muted text-xs mt-1">Leads/Month</div>
            </div>
          </div>
        </div>

        {/* Additional Deep Scan data */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Business Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-lg font-medium text-text">{String(answers.team_size ?? '—')}</div>
              <div className="text-text-muted text-xs mt-1">Team Size</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-text capitalize">{String(answers.niche ?? '—')}</div>
              <div className="text-text-muted text-xs mt-1">Niche</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-text">{String(answers.years_in_business ?? '—')}</div>
              <div className="text-text-muted text-xs mt-1">Years</div>
            </div>
          </div>
        </div>

        {/* Primary constraint */}
        <div className="bg-surface border border-brand/20 rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-2">Primary Constraint</h2>
          <p className="text-brand text-2xl font-display mb-2">
            {constraint.primary.metric === 'show_rate' ? 'Show Rate' :
             constraint.primary.metric === 'close_rate' ? 'Close Rate' : 'Booking Volume'}
          </p>
          <p className="text-text-secondary text-sm">{constraint.primary.impact}</p>
        </div>

        {/* Lead gate */}
        <div className="text-center bg-surface border border-border rounded-xl p-8">
          <h2 className="font-display text-2xl text-text mb-3">
            Your complete simulation is ready
          </h2>
          <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
            See target scenarios, improvement roadmap, and exactly what to fix first.
          </p>
          <Link
            href="/scan/deep/unlock"
            onClick={() => analytics.unlockClicked('deep')}
            className="inline-block bg-brand hover:bg-brand-hover text-background font-medium px-8 py-3 rounded-lg transition-all duration-200"
          >
            Unlock Full Report
          </Link>
        </div>
      </div>
    </main>
  );
}
