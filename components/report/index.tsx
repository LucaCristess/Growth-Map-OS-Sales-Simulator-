'use client';

import type { Scenario, ConstraintAnalysis, TargetAnalysis } from '@/types';

export function ScenarioCard({
  label,
  value,
  subtitle,
  active = false,
  highlight = false,
  change,
}: {
  label: string;
  value: number;
  subtitle: string;
  active?: boolean;
  highlight?: boolean;
  change?: number;
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
      {change !== undefined && change !== 0 && (
        <div className={`text-xs mt-1 font-medium ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? '+' : ''}{change.toFixed(0)}%
        </div>
      )}
    </div>
  );
}

export function RoadmapItem({
  current,
  target,
  label,
  description,
  isPercentage = true,
}: {
  current: number;
  target: number;
  label: string;
  description: string;
  isPercentage?: boolean;
}) {
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-text font-medium">{label}</span>
          <span className="text-text-muted text-sm ml-2">{description}</span>
        </div>
        <span className="text-text text-sm">
          {isPercentage ? `${current.toFixed(0)}% → ${target}%` : `${current} → ${target}`}
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

export function FunnelMetric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`text-lg font-medium ${highlight ? 'text-brand' : 'text-text'}`}>
        {value}
      </div>
      <div className="text-text-muted text-xs mt-1">{label}</div>
    </div>
  );
}

export function FunnelRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border">
      <span className="text-text-secondary text-sm">{label}</span>
      <span className={`font-medium ${highlight ? 'text-brand' : 'text-text'}`}>{value}</span>
    </div>
  );
}

export function ConstraintSection({
  constraint,
  answers,
}: {
  constraint: ConstraintAnalysis;
  answers: Record<string, unknown>;
}) {
  const { primary, secondary, scores } = constraint;

  const calcImpact = (metric: string): string => {
    const booked = Number(answers.booked_calls) || 0;
    const showRate = Number(answers.show_rate) || 0;
    const closeRate = Number(answers.close_rate) || 0;
    const aov = Number(answers.aov) || 0;

    if (metric === 'show_rate') {
      const impact = Math.round((0.8 - showRate / 100) * booked * (closeRate / 100) * aov);
      return `Improving show rate from ${showRate.toFixed(0)}% to 80% would add $${impact.toLocaleString()}/month.`;
    }
    if (metric === 'close_rate') {
      const impact = Math.round(booked * (showRate / 100) * (0.3 - closeRate / 100) * aov);
      return `Improving close rate from ${closeRate.toFixed(0)}% to 30% would add $${impact.toLocaleString()}/month.`;
    }
    if (metric === 'volume') {
      const impact = Math.round(booked * (showRate / 100) * (closeRate / 100) * aov);
      return `Doubling volume from ${booked} to ${booked * 2} would add $${impact.toLocaleString()}/month.`;
    }
    return '';
  };

  const metricLabels: Record<string, string> = {
    show_rate: 'Show Rate',
    close_rate: 'Close Rate',
    volume: 'Booking Volume',
  };

  return (
    <div className="bg-surface border border-brand/20 rounded-xl p-8 mb-8">
      <h2 className="text-text font-medium text-lg mb-2">What to Fix First</h2>
      <p className="text-brand text-2xl font-display mb-2">{metricLabels[primary.metric] ?? primary.metric}</p>
      <p className="text-text-secondary text-sm mb-4">{primary.impact}</p>

      <div className="bg-background rounded-lg p-4 mb-4">
        <p className="text-text-muted text-sm">{calcImpact(primary.metric)}</p>
      </div>

      {secondary && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Secondary Constraint</p>
          <p className="text-text font-medium">{metricLabels[secondary.metric] ?? secondary.metric}</p>
          <p className="text-text-secondary text-sm">{secondary.impact}</p>
        </div>
      )}

      {/* Constraint ranking */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-text-muted text-xs uppercase tracking-wider mb-3">Constraint Ranking</p>
        <div className="space-y-2">
          {scores.map((s) => (
            <div key={s.metric} className="flex items-center gap-3">
              <span className="text-text-muted text-xs w-4">#{s.rank}</span>
              <span className="text-text text-sm flex-1">{metricLabels[s.metric] ?? s.metric}</span>
              <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full"
                  style={{ width: `${Math.min((s.score / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TargetSection({
  target,
}: {
  target: TargetAnalysis;
}) {
  if (!target.paths.length) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 mb-8">
        <h2 className="text-text font-medium text-lg mb-2">Target Analysis</h2>
        <p className="text-green-400 font-display text-xl">You&apos;re already at your target!</p>
        <p className="text-text-secondary text-sm mt-2">
          Current revenue of ${Math.round(target.recommended_path.projected_revenue).toLocaleString()} meets your ${Math.round(target.target_revenue).toLocaleString()} goal.
        </p>
      </div>
    );
  }

  const pathDescriptions: Record<string, string> = {
    volume_only: 'Increase call volume while keeping current conversion rates',
    conversion_first: 'Improve show rate and close rate with existing volume',
    balanced: 'Split improvements across volume, conversion, and AOV',
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-8 mb-8">
      <h2 className="text-text font-medium text-lg mb-2">Target Analysis</h2>
      <p className="text-text-secondary text-sm mb-6">
        Your target: <span className="text-brand font-medium">${Math.round(target.target_revenue).toLocaleString()}/month</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {target.paths.map((path) => {
          const isRecommended = path.name === target.recommended_path.name;
          const gap = path.projected_revenue - target.target_revenue;
          return (
            <div
              key={path.name}
              className={`p-4 rounded-lg border transition-all ${
                isRecommended
                  ? 'bg-brand/5 border-brand'
                  : 'bg-surface border-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-text font-medium text-sm">{path.label}</span>
                {isRecommended && (
                  <span className="text-brand text-xs bg-brand/10 px-2 py-0.5 rounded-full">Recommended</span>
                )}
              </div>
              <div className={`font-display text-xl mb-1 ${gap >= 0 ? 'text-green-400' : 'text-text'}`}>
                ${Math.round(path.projected_revenue).toLocaleString()}
              </div>
              <div className="text-text-muted text-xs mb-3">{pathDescriptions[path.name]}</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Calls</span>
                  <span className="text-text">{path.qualified_leads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Show Rate</span>
                  <span className="text-text">{path.show_rate.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Close Rate</span>
                  <span className="text-text">{path.close_rate.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">AOV</span>
                  <span className="text-text">${Math.round(path.aov).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
