'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function ReportPage() {
  const router = useRouter();
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

  const revenueGrowth = scenarios.current > 0
    ? ((scenarios.expected - scenarios.current) / scenarios.current * 100).toFixed(0)
    : 'N/A';

  return (
    <main className="min-h-screen px-6 py-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-brand text-sm font-medium tracking-wider uppercase">
            Full Report
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-text mt-4 mb-4">
            ${Math.round(scenarios.current).toLocaleString()}
            <span className="text-text-secondary text-2xl block mt-2">current monthly revenue</span>
          </h1>
          <p className="text-text-muted text-sm">
            Here&apos;s what your business could look like with targeted improvements.
          </p>
        </div>

        {/* Scenario comparison */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Revenue Scenarios</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ScenarioCard
              label="Current"
              value={scenarios.current}
              subtitle="Where you are now"
              active
            />
            <ScenarioCard
              label="Conservative"
              value={scenarios.conservative}
              subtitle="Fix close rate"
            />
            <ScenarioCard
              label="Expected"
              value={scenarios.expected}
              subtitle="Balanced improvement"
              highlight
            />
            <ScenarioCard
              label="Aggressive"
              value={scenarios.aggressive}
              subtitle="Full optimization"
            />
          </div>
        </div>

        {/* Improvement roadmap */}
        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-6">Improvement Roadmap</h2>

          <div className="space-y-6">
            {/* Show Rate */}
            <RoadmapItem
              current={Number(answers.show_rate ?? 0)}
              target={80}
              label="Show Rate"
              description="Getting more booked calls to actually attend"
            />

            {/* Close Rate */}
            <RoadmapItem
              current={Number(answers.close_rate ?? 0)}
              target={30}
              label="Close Rate"
              description="Converting more attendees into customers"
            />

            {/* Volume */}
            <VolumeItem
              current={Number(answers.booked_calls ?? 0)}
              target={Math.round(Number(answers.booked_calls ?? 0) * 1.5)}
              label="Booking Volume"
              description="Increasing the number of calls you book"
            />
          </div>
        </div>

        {/* Primary constraint */}
        <div className="bg-surface border border-brand/20 rounded-xl p-8 mb-8">
          <h2 className="text-text font-medium text-lg mb-2">What to Fix First</h2>
          <p className="text-brand text-2xl font-display mb-2">{constraint.label}</p>
          <p className="text-text-secondary text-sm mb-4">{constraint.description}</p>
          <div className="bg-background rounded-lg p-4">
            <p className="text-text-muted text-sm">
              {constraint.metric === 'show_rate' && (() => {
                const sr = Number(answers.show_rate ?? 0);
                const bc = Number(answers.booked_calls ?? 0);
                const cr = Number(answers.close_rate ?? 0);
                const aov = Number(answers.aov ?? 0);
                const impact = Math.round((0.8 - sr / 100) * bc * cr / 100 * aov);
                return `Improving your show rate from ${sr}% to 80% would add $${impact.toLocaleString()}/month.`;
              })()}
              {constraint.metric === 'close_rate' && (() => {
                const sr = Number(answers.show_rate ?? 0);
                const bc = Number(answers.booked_calls ?? 0);
                const cr = Number(answers.close_rate ?? 0);
                const aov = Number(answers.aov ?? 0);
                const impact = Math.round(bc * sr / 100 * (0.3 - cr / 100) * aov);
                return `Improving your close rate from ${cr}% to 30% would add $${impact.toLocaleString()}/month.`;
              })()}
              {constraint.metric === 'volume' && (() => {
                const sr = Number(answers.show_rate ?? 0);
                const bc = Number(answers.booked_calls ?? 0);
                const cr = Number(answers.close_rate ?? 0);
                const aov = Number(answers.aov ?? 0);
                const impact = Math.round(bc * sr / 100 * cr / 100 * aov);
                return `Doubling your booking volume from ${bc} to ${bc * 2} would add $${impact.toLocaleString()}/month.`;
              })()}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="text-text-muted text-sm hover:text-text transition-colors"
          >
            ← Back to start
          </Link>
        </div>
      </div>
    </main>
  );
}

function ScenarioCard({
  label,
  value,
  subtitle,
  active = false,
  highlight = false,
}: {
  label: string;
  value: number;
  subtitle: string;
  active?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`text-center p-4 rounded-lg border transition-all ${
        highlight
          ? 'bg-brand/5 border-brand'
          : active
          ? 'bg-surface border-text-muted'
          : 'bg-surface border-border'
      }`}
    >
      <div className="text-text-muted text-xs uppercase tracking-wider mb-2">{label}</div>
      <div className={`font-display text-2xl ${highlight ? 'text-brand' : 'text-text'}`}>
        ${Math.round(value).toLocaleString()}
      </div>
      <div className="text-text-muted text-xs mt-1">{subtitle}</div>
    </div>
  );
}

function RoadmapItem({
  current,
  target,
  label,
  description,
}: {
  current: number;
  target: number;
  label: string;
  description: string;
}) {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-text font-medium">{label}</span>
          <span className="text-text-muted text-sm ml-2">{description}</span>
        </div>
        <span className="text-text text-sm">
          {current}% → {target}%
        </span>
      </div>
      <div className="h-2 bg-background rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function VolumeItem({
  current,
  target,
  label,
  description,
}: {
  current: number;
  target: number;
  label: string;
  description: string;
}) {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-text font-medium">{label}</span>
          <span className="text-text-muted text-sm ml-2">{description}</span>
        </div>
        <span className="text-text text-sm">
          {current} → {target} calls
        </span>
      </div>
      <div className="h-2 bg-background rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
