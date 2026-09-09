'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';
import { useAnswers } from '@/lib/hooks/useAnswers';
import { calculateRevenue, calculatePrimaryConstraint, type RevenueResult, type ConstraintResult } from '@/lib/calculations/revenue';
import Link from 'next/link';

export default function DeepResultsPage() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const { answers, saving: answersLoading } = useAnswers(session?.id ?? null);
  const [result, setResult] = useState<RevenueResult | null>(null);
  const [constraint, setConstraint] = useState<ConstraintResult | null>(null);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const rev = calculateRevenue(answers);
      const con = calculatePrimaryConstraint(answers);
      setResult(rev);
      setConstraint(con);
    }
  }, [answers]);

  if (sessionLoading || answersLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-text-muted">Calculating your results...</div>
      </main>
    );
  }

  if (!result) {
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
            <FunnelMetric label="Booked" value={String(answers.booked_calls ?? '—')} />
            <FunnelMetric label="Showed Up" value={String(answers.show_count ?? '—')} />
            <FunnelMetric label="Closed" value={String(answers.close_count ?? '—')} />
            <FunnelMetric label="Revenue" value={answers.monthly_revenue ? `$${Number(answers.monthly_revenue).toLocaleString()}` : '—'} highlight />
          </div>
        </div>

        {/* Additional Deep Scan data */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Business Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <FunnelMetric label="Leads/Month" value={String(answers.monthly_leads ?? '—')} />
            <FunnelMetric label="Team Size" value={String(answers.team_size ?? '—')} />
            <FunnelMetric label="Niche" value={String(answers.niche ?? '—')} />
            <FunnelMetric label="Years" value={String(answers.years_in_business ?? '—')} />
          </div>
        </div>

        {/* Primary constraint */}
        {constraint && (
          <div className="bg-surface border border-brand/20 rounded-xl p-8 mb-8">
            <h2 className="text-text font-medium text-lg mb-2">Primary Constraint</h2>
            <p className="text-brand text-2xl font-display mb-2">{constraint.label}</p>
            <p className="text-text-secondary text-sm">{constraint.description}</p>
          </div>
        )}

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
            className="inline-block bg-brand hover:bg-brand-hover text-background font-medium px-8 py-3 rounded-lg transition-all duration-200"
          >
            Unlock Full Report
          </Link>
        </div>
      </div>
    </main>
  );
}

function FunnelMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-medium ${highlight ? 'text-brand' : 'text-text'}`}>{value}</div>
      <div className="text-text-muted text-xs mt-1">{label}</div>
    </div>
  );
}
