'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';
import { useAnswers } from '@/lib/hooks/useAnswers';
import { calculateRevenue, calculatePrimaryConstraint, calculateScenarios, calculateTargetAnalysis, calculateRevenueCrossCheck, calculateHealthScore } from '@/lib/calculations/revenue';
import { analytics } from '@/lib/analytics';
import Link from 'next/link';
import type { RevenueResult, Scenario, ConstraintAnalysis, TargetAnalysis, AnswerValue } from '@/types';

export default function QuickResultsPage() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const { answers, saving: answersLoading } = useAnswers(session?.id ?? null);
  const [result, setResult] = useState<RevenueResult | null>(null);
  const [constraint, setConstraint] = useState<ConstraintAnalysis | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [target, setTarget] = useState<TargetAnalysis | null>(null);
  const [crossCheck, setCrossCheck] = useState<ReturnType<typeof calculateRevenueCrossCheck> | null>(null);
  const [health, setHealth] = useState<ReturnType<typeof calculateHealthScore> | null>(null);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const rev = calculateRevenue(answers);
      const con = calculatePrimaryConstraint(answers);
      const scen = calculateScenarios(answers);
      const tgt = calculateTargetAnalysis(answers);
      const cc = calculateRevenueCrossCheck(answers);
      const hs = calculateHealthScore(answers);
      setResult(rev);
      setConstraint(con);
      setScenarios(scen);
      setTarget(tgt);
      setCrossCheck(cc);
      setHealth(hs);
      analytics.resultsViewed('quick', scen[0]?.projected_revenue ?? 0);
    }
  }, [answers]);

  if (sessionLoading || answersLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-text-muted">Calculating your results...</div>
      </main>
    );
  }

  if (!result || !constraint || !scenarios || !health) {
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

  const currentScenario = scenarios[0];
  const expectedScenario = scenarios.find((s) => s.name === 'expected');
  const revenueGrowth = currentScenario.projected_revenue > 0 && expectedScenario
    ? ((expectedScenario.projected_revenue - currentScenario.projected_revenue) / currentScenario.projected_revenue * 100).toFixed(0)
    : '0';

  const metricLabels: Record<string, string> = {
    show_rate: 'Show Rate',
    close_rate: 'Close Rate',
    volume: 'Booking Volume',
    aov: 'Average Order Value',
    booking_rate: 'Booking Rate',
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full mx-auto">
        {/* Hero result */}
        <div className="text-center mb-12">
          <span className="text-brand text-sm font-medium tracking-wider uppercase">Your Sales Engine</span>
          <h1 className="font-display text-4xl md:text-5xl text-text mt-4 mb-4">
            ${Math.round(currentScenario.projected_revenue).toLocaleString()}
            <span className="text-text-secondary text-2xl block mt-2">current monthly revenue</span>
          </h1>
          {/* Health score */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border mt-4">
            <span className="text-text-muted text-sm">Sales Health Score:</span>
            <span className={`font-display text-lg ${health.color}`}>{health.score}/100</span>
            <span className={`text-xs ${health.color}`}>({health.label})</span>
          </div>
        </div>

        {/* Revenue cross-check warning */}
        {crossCheck && !crossCheck.match && (
          <div className="bg-surface border border-yellow-400/30 rounded-xl p-5 mb-8">
            <p className="text-yellow-400 text-sm font-medium mb-1">Revenue Check</p>
            <p className="text-text-secondary text-sm">
              Formula computes ${Math.round(crossCheck.formula_computed).toLocaleString()}/mo but you reported ${crossCheck.self_reported.toLocaleString()}. This usually means additional revenue sources or approximate funnel numbers.
            </p>
          </div>
        )}

        {/* PRE-OPT-IN GATE: Primary constraint + locked preview */}
        <div className="bg-surface border border-brand/20 rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-2">Your #1 Bottleneck</h2>
          <p className="text-brand text-2xl font-display mb-2">
            {metricLabels[constraint.primary.metric] ?? constraint.primary.metric}
          </p>
          <p className="text-text-secondary text-sm mb-6">{constraint.primary.impact}</p>

          {constraint.secondary && (
            <div className="pt-4 border-t border-border mb-6">
              <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Also limiting you</p>
              <p className="text-text font-medium">{metricLabels[constraint.secondary.metric] ?? constraint.secondary.metric}</p>
            </div>
          )}

          {/* Locked preview — blurred report sections */}
          <div className="relative">
            <div className="space-y-4 opacity-40 blur-[2px] pointer-events-none select-none">
              <div className="bg-background rounded-lg p-4">
                <div className="h-4 bg-border rounded w-1/3 mb-2" />
                <div className="grid grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-12 bg-border rounded" />)}
                </div>
              </div>
              <div className="bg-background rounded-lg p-4">
                <div className="h-4 bg-border rounded w-1/4 mb-3" />
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-3 bg-border rounded w-full" />)}
                </div>
              </div>
              <div className="bg-background rounded-lg p-4">
                <div className="h-4 bg-border rounded w-1/3 mb-3" />
                <div className="grid grid-cols-3 gap-3">
                  {[1,2,3].map(i => <div key={i} className="h-24 bg-border rounded" />)}
                </div>
              </div>
            </div>
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent rounded-lg" />
          </div>

          <p className="text-text-secondary text-sm text-center mt-4">
            Revenue scenarios, improvement roadmap, interactive simulator, and target analysis inside.
          </p>
        </div>

        {/* Lead gate CTA */}
        <div className="text-center">
          <Link
            href="/scan/quick/unlock"
            onClick={() => analytics.unlockClicked('quick')}
            className="inline-block bg-brand hover:bg-brand-hover text-background font-semibold px-10 py-4 rounded-lg text-base transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            Unlock Full Report
          </Link>
          <p className="text-text-muted text-xs mt-3">Free — enter your name, email, and phone</p>
        </div>
      </div>
    </main>
  );
}
