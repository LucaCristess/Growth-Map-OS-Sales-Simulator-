'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/hooks/useSession';
import { useAnswers } from '@/lib/hooks/useAnswers';
import { calculateRevenue, calculatePrimaryConstraint, calculateScenarios, calculateTargetAnalysis } from '@/lib/calculations/revenue';
import { calculateQualification } from '@/lib/calculations/qualification';
import { analytics } from '@/lib/analytics';
import { ScenarioCard, RoadmapItem, ConstraintSection, TargetSection, FunnelRow } from '@/components/report';
import { Simulator } from '@/components/report/Simulator';
import Link from 'next/link';
import type { RevenueResult, Scenario, ConstraintAnalysis, TargetAnalysis, QualificationResult, AnswerValue } from '@/types';

export default function DeepReportPage() {
  const { session, loading: sessionLoading } = useSession();
  const { answers, saving: answersLoading } = useAnswers(session?.id ?? null);
  const [result, setResult] = useState<RevenueResult | null>(null);
  const [constraint, setConstraint] = useState<ConstraintAnalysis | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [target, setTarget] = useState<TargetAnalysis | null>(null);
  const [reportSaved, setReportSaved] = useState(false);

  const compute = useCallback((ans: Record<string, AnswerValue>) => {
    const rev = calculateRevenue(ans);
    const con = calculatePrimaryConstraint(ans);
    const scen = calculateScenarios(ans);
    const tgt = calculateTargetAnalysis(ans);
    setResult(rev);
    setConstraint(con);
    setScenarios(scen);
    setTarget(tgt);
    return { rev, con, scen, tgt };
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const computed = compute(answers);
      analytics.reportViewed('deep', Number(answers.monthly_revenue) || 0, Number(answers.revenue_target) || 0);

      // Persist report to database
      if (session?.id && !reportSaved) {
        setReportSaved(true);
        const reportData = {
          current: computed.rev,
          scenarios: computed.scen,
          constraint: computed.con,
          target: computed.tgt,
        };
        fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: session.id, result_json: reportData }),
        }).catch(() => {});
      }
    }
  }, [answers, compute, session?.id, reportSaved]);

  const handleSimulatorRecalc = useCallback((newAnswers: Record<string, AnswerValue>) => {
    compute(newAnswers);
  }, [compute]);

  if (sessionLoading || answersLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-text-muted">Loading your report...</div>
      </main>
    );
  }

  if (!result || !constraint || !scenarios) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl text-text mb-4">No data yet</h1>
          <p className="text-text-secondary mb-8">Complete the scan to see your report.</p>
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
    <main className="min-h-screen px-6 py-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-brand text-sm font-medium tracking-wider uppercase">
            Deep Scan Report
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-text mt-4 mb-4">
            ${Math.round(currentScenario.projected_revenue).toLocaleString()}
            <span className="text-text-secondary text-2xl block mt-2">current monthly revenue</span>
          </h1>
        </div>

        {/* Scenario comparison */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Revenue Scenarios</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {scenarios.map((s) => (
              <ScenarioCard
                key={s.name}
                label={s.label}
                value={s.projected_revenue}
                subtitle={
                  s.name === 'current' ? 'Where you are now' :
                  s.name === 'conservative' ? 'Fix close rate' :
                  s.name === 'expected' ? 'Balanced improvement' :
                  'Full optimization'
                }
                active={s.name === 'current'}
                highlight={s.name === 'expected'}
                change={s.revenue_change}
              />
            ))}
          </div>
        </div>

        {/* Deep Scan specific — business context */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Business Context</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-lg font-medium text-text">{String(answers.monthly_leads ?? '—')}</div>
              <div className="text-text-muted text-xs mt-1">Leads/Month</div>
            </div>
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

        {/* Funnel breakdown — raw counts + derived rates */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Funnel Breakdown</h2>
          <div className="space-y-4">
            <FunnelRow label="Booked Calls" value={String(answers.booked_calls ?? '—')} />
            <FunnelRow label="Showed Up" value={String(answers.show_count ?? '—')} />
            <FunnelRow label="Closed" value={String(answers.close_count ?? '—')} />
            <FunnelRow label="Show Rate" value={result.show_rate > 0 ? `${result.show_rate.toFixed(0)}%` : '—'} />
            <FunnelRow label="Close Rate" value={result.close_rate > 0 ? `${result.close_rate.toFixed(0)}%` : '—'} />
            <FunnelRow label="AOV" value={answers.aov ? `$${Number(answers.aov).toLocaleString()}` : '—'} />
            <FunnelRow label="Revenue" value={answers.monthly_revenue ? `$${Number(answers.monthly_revenue).toLocaleString()}` : '—'} highlight />
          </div>
        </div>

        {/* Improvement roadmap */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Improvement Roadmap</h2>
          <div className="space-y-6">
            <RoadmapItem
              current={result.show_rate}
              target={80}
              label="Show Rate"
              description="Getting more booked calls to actually attend"
            />
            <RoadmapItem
              current={result.close_rate}
              target={30}
              label="Close Rate"
              description="Converting more attendees into customers"
            />
            <RoadmapItem
              current={Number(answers.booked_calls ?? 0)}
              target={Math.round(Number(answers.booked_calls ?? 0) * 1.5)}
              label="Booking Volume"
              description="Increasing the number of calls you book"
              isPercentage={false}
            />
          </div>
        </div>

        {/* Constraint analysis */}
        <ConstraintSection constraint={constraint} answers={answers} />

        {/* Target analysis */}
        {target && <TargetSection target={target} />}

        {/* Interactive simulator */}
        <Simulator initialAnswers={answers} onRecalculate={handleSimulatorRecalc} />

        <div className="text-center space-y-4">
          <a
            href="https://calendly.com/growthmap/audit"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.auditCtaClicked('deep')}
            className="inline-block bg-brand hover:bg-brand-hover text-background font-medium px-8 py-3 rounded-lg transition-all duration-200"
          >
            Book a Free Audit
          </a>
          <div>
            <Link href="/" className="text-text-muted text-sm hover:text-text transition-colors">
              &larr; Back to start
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
