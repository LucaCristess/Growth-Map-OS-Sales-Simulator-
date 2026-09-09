'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/hooks/useSession';
import { useAnswers } from '@/lib/hooks/useAnswers';
import {
  calculateRevenue,
  calculatePrimaryConstraint,
  calculateScenarios,
  type RevenueResult,
  type ConstraintResult,
} from '@/lib/calculations/revenue';
import Link from 'next/link';

export default function DeepReportPage() {
  const { session, loading: sessionLoading } = useSession();
  const { answers, saving: answersLoading } = useAnswers(session?.id ?? null);
  const [result, setResult] = useState<RevenueResult | null>(null);
  const [constraint, setConstraint] = useState<ConstraintResult | null>(null);
  const [scenarios, setScenarios] = useState<ReturnType<typeof calculateScenarios> | null>(null);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const rev = calculateRevenue(answers);
      const con = calculatePrimaryConstraint(answers);
      const scen = calculateScenarios(answers);
      setResult(rev);
      setConstraint(con);
      setScenarios(scen);
    }
  }, [answers]);

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

  return (
    <main className="min-h-screen px-6 py-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-brand text-sm font-medium tracking-wider uppercase">
            Deep Scan Report
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-text mt-4 mb-4">
            ${Math.round(scenarios.current).toLocaleString()}
            <span className="text-text-secondary text-2xl block mt-2">current monthly revenue</span>
          </h1>
        </div>

        {/* Scenario comparison */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Revenue Scenarios</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ScenarioCard label="Current" value={scenarios.current} subtitle="Where you are now" active />
            <ScenarioCard label="Conservative" value={scenarios.conservative} subtitle="Fix close rate" />
            <ScenarioCard label="Expected" value={scenarios.expected} subtitle="Balanced improvement" highlight />
            <ScenarioCard label="Aggressive" value={scenarios.aggressive} subtitle="Full optimization" />
          </div>
        </div>

        {/* Deep Scan specific — business context */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Business Context</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <FunnelMetric label="Leads/Month" value={String(answers.monthly_leads ?? '—')} />
            <FunnelMetric label="Team Size" value={String(answers.team_size ?? '—')} />
            <FunnelMetric label="Niche" value={String(answers.niche ?? '—')} />
            <FunnelMetric label="Years" value={String(answers.years_in_business ?? '—')} />
          </div>
        </div>

        {/* Funnel breakdown — raw counts */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Funnel Breakdown</h2>
          <div className="space-y-4">
            <FunnelRow label="Booked Calls" value={String(answers.booked_calls ?? '—')} />
            <FunnelRow label="Showed Up" value={String(answers.show_count ?? '—')} />
            <FunnelRow label="Closed" value={String(answers.close_count ?? '—')} />
            <FunnelRow label="Show Rate" value={answers.show_rate ? `${answers.show_rate}%` : '—'} />
            <FunnelRow label="Close Rate" value={answers.close_rate ? `${answers.close_rate}%` : '—'} />
            <FunnelRow label="AOV" value={answers.aov ? `$${Number(answers.aov).toLocaleString()}` : '—'} />
            <FunnelRow label="Revenue" value={answers.monthly_revenue ? `$${Number(answers.monthly_revenue).toLocaleString()}` : '—'} highlight />
          </div>
        </div>

        {/* Improvement roadmap */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Improvement Roadmap</h2>
          <div className="space-y-6">
            <RoadmapItem current={answers.show_rate as number} target={80} label="Show Rate" description="Getting more booked calls to actually attend" />
            <RoadmapItem current={answers.close_rate as number} target={30} label="Close Rate" description="Converting more attendees into customers" />
            <VolumeItem current={answers.booked_calls as number} target={Math.round((answers.booked_calls as number) * 1.5)} label="Booking Volume" description="Increasing the number of calls you book" />
          </div>
        </div>

        {/* Primary constraint */}
        <div className="bg-surface border border-brand/20 rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-2">What to Fix First</h2>
          <p className="text-brand text-2xl font-display mb-2">{constraint.label}</p>
          <p className="text-text-secondary text-sm mb-4">{constraint.description}</p>
          <div className="bg-background rounded-lg p-4">
            <p className="text-text-muted text-sm">
              {constraint.metric === 'show_rate' && 'Improving your show rate from ' +
                `${answers.show_rate}% to 80% would add ` +
                `$${Math.round((0.8 - (answers.show_rate as number) / 100) * (answers.booked_calls as number) * (answers.close_rate as number) / 100 * (answers.aov as number)).toLocaleString()}/month.`}
              {constraint.metric === 'close_rate' && 'Improving your close rate from ' +
                `${answers.close_rate}% to 30% would add ` +
                `$${Math.round(((answers.booked_calls as number) * (answers.show_rate as number) / 100 * (0.3 - (answers.close_rate as number) / 100) * (answers.aov as number))).toLocaleString()}/month.`}
              {constraint.metric === 'volume' && 'Doubling your booking volume from ' +
                `${answers.booked_calls} to ${(answers.booked_calls as number) * 2} would add ` +
                `$${Math.round((answers.booked_calls as number) * (answers.show_rate as number) / 100 * (answers.close_rate as number) / 100 * (answers.aov as number)).toLocaleString()}/month.`}
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-text-muted text-sm hover:text-text transition-colors">
            ← Back to start
          </Link>
        </div>
      </div>
    </main>
  );
}

function ScenarioCard({ label, value, subtitle, active = false, highlight = false }: { label: string; value: number; subtitle: string; active?: boolean; highlight?: boolean }) {
  return (
    <div className={`text-center p-4 rounded-lg border transition-all ${highlight ? 'bg-brand/5 border-brand' : active ? 'bg-surface border-text-muted' : 'bg-surface border-border'}`}>
      <div className="text-text-muted text-xs uppercase tracking-wider mb-2">{label}</div>
      <div className={`font-display text-2xl ${highlight ? 'text-brand' : 'text-text'}`}>${Math.round(value).toLocaleString()}</div>
      <div className="text-text-muted text-xs mt-1">{subtitle}</div>
    </div>
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

function FunnelRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border">
      <span className="text-text-secondary text-sm">{label}</span>
      <span className={`font-medium ${highlight ? 'text-brand' : 'text-text'}`}>{value}</span>
    </div>
  );
}

function RoadmapItem({ current, target, label, description }: { current: number; target: number; label: string; description: string }) {
  const progress = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-text font-medium">{label}</span>
          <span className="text-text-muted text-sm ml-2">{description}</span>
        </div>
        <span className="text-text text-sm">{current}% → {target}%</span>
      </div>
      <div className="h-2 bg-background rounded-full overflow-hidden">
        <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function VolumeItem({ current, target, label, description }: { current: number; target: number; label: string; description: string }) {
  const progress = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-text font-medium">{label}</span>
          <span className="text-text-muted text-sm ml-2">{description}</span>
        </div>
        <span className="text-text text-sm">{current} → {target} calls</span>
      </div>
      <div className="h-2 bg-background rounded-full overflow-hidden">
        <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
