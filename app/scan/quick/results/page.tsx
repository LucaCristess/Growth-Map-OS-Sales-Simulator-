'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';
import { useAnswers } from '@/lib/hooks/useAnswers';
import { calculateRevenue, calculatePrimaryConstraint, calculateScenarios, type RevenueResult, type ConstraintResult } from '@/lib/calculations/revenue';
import { calculateQualification, getTierLabel, getTierColor, type QualificationResult } from '@/lib/calculations/qualification';
import { analytics } from '@/lib/analytics';
import Link from 'next/link';

export default function QuickResultsPage() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const { answers, saving: answersLoading } = useAnswers(session?.id ?? null);
  const [result, setResult] = useState<RevenueResult | null>(null);
  const [constraint, setConstraint] = useState<ConstraintResult | null>(null);
  const [scenarios, setScenarios] = useState<ReturnType<typeof calculateScenarios> | null>(null);
  const [qualification, setQualification] = useState<QualificationResult | null>(null);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const rev = calculateRevenue(answers);
      const con = calculatePrimaryConstraint(answers);
      const scen = calculateScenarios(answers);
      const qual = calculateQualification(answers);
      setResult(rev);
      setConstraint(con);
      setScenarios(scen);
      setQualification(qual);
      analytics.resultsViewed('quick', scen.current);
    }
  }, [answers]);

  if (sessionLoading || answersLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-text-muted">Calculating your results...</div>
      </main>
    );
  }

  if (!result || !constraint || !scenarios || !qualification) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl text-text mb-4">No data yet</h1>
          <p className="text-text-secondary mb-8">Complete the scan to see your results.</p>
          <Link href="/scan" className="bg-brand hover:bg-brand-hover text-background font-medium px-6 py-3 rounded-lg transition-all duration-200">
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
          <span className="text-brand text-sm font-medium tracking-wider uppercase">Your Sales Engine</span>
          <h1 className="font-display text-4xl md:text-5xl text-text mt-4 mb-6">
            ${Math.round(scenarios.current).toLocaleString()}
            <span className="text-text-secondary text-2xl block mt-2">current monthly revenue</span>
          </h1>
        </div>

        {/* Qualification badge */}
        <div className="flex justify-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
            qualification.tier === 'high_priority' ? 'border-green-400/30 bg-green-400/5' :
            qualification.tier === 'qualified' ? 'border-brand/30 bg-brand/5' :
            'border-border bg-surface'
          }`}>
            <span className={`text-sm font-medium ${getTierColor(qualification.tier)}`}>
              {getTierLabel(qualification.tier)}
            </span>
            <span className="text-text-muted text-xs">•</span>
            <span className="text-text-secondary text-sm">Score: {qualification.score}/100</span>
          </div>
        </div>

        {/* Current funnel */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Your Current Funnel</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <FunnelMetric label="Booked" value={String(answers.booked_calls ?? '—')} />
            <FunnelMetric label="Show Rate" value={answers.show_rate ? `${answers.show_rate}%` : '—'} />
            <FunnelMetric label="Close Rate" value={answers.close_rate ? `${answers.close_rate}%` : '—'} />
            <FunnelMetric label="AOV" value={answers.aov ? `$${Number(answers.aov).toLocaleString()}` : '—'} />
            <FunnelMetric label="Revenue" value={answers.monthly_revenue ? `$${Number(answers.monthly_revenue).toLocaleString()}` : '—'} highlight />
          </div>
        </div>

        {/* Primary constraint */}
        <div className="bg-surface border border-brand/20 rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-2">Primary Constraint</h2>
          <p className="text-brand text-2xl font-display mb-2">{constraint.label}</p>
          <p className="text-text-secondary text-sm">{constraint.description}</p>
        </div>

        {/* Lead gate */}
        <div className="text-center bg-surface border border-border rounded-xl p-8">
          <h2 className="font-display text-2xl text-text mb-3">Your complete simulation is ready</h2>
          <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
            See target scenarios, improvement roadmap, and exactly what to fix first.
          </p>
          <Link
            href="/scan/quick/unlock"
            onClick={() => analytics.unlockClicked('quick')}
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
