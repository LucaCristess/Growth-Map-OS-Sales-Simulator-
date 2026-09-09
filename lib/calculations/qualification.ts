import type { AnswerValue, QualificationTier } from '@/types';

export interface QualificationResult {
  score: number;
  tier: QualificationTier;
  factors: { metric: string; value: number; weight: number; contribution: number }[];
}

const WEIGHTS = {
  revenue: 0.25,
  close_rate: 0.20,
  show_rate: 0.15,
  aov: 0.15,
  booked_calls: 0.15,
  years: 0.10,
};

const BENCHMARKS = {
  revenue: { excellent: 50000, good: 20000, acceptable: 5000 },
  close_rate: { excellent: 40, good: 25, acceptable: 15 },
  show_rate: { excellent: 85, good: 70, acceptable: 50 },
  aov: { excellent: 5000, good: 2000, acceptable: 500 },
  booked_calls: { excellent: 50, good: 20, acceptable: 5 },
  years: { excellent: 5, good: 2, acceptable: 0.5 },
};

export function calculateQualification(answers: Record<string, AnswerValue>): QualificationResult {
  const factors: QualificationResult['factors'] = [];

  // Revenue score
  const revenue = Number(answers.monthly_revenue) || 0;
  const revenueScore = scoreMetric(revenue, BENCHMARKS.revenue);
  factors.push({ metric: 'revenue', value: revenue, weight: WEIGHTS.revenue, contribution: revenueScore * WEIGHTS.revenue });

  // Close rate score
  const closeRate = Number(answers.close_rate) || 0;
  const closeRateScore = scoreMetric(closeRate, BENCHMARKS.close_rate);
  factors.push({ metric: 'close_rate', value: closeRate, weight: WEIGHTS.close_rate, contribution: closeRateScore * WEIGHTS.close_rate });

  // Show rate score
  const showRate = Number(answers.show_rate) || 0;
  const showRateScore = scoreMetric(showRate, BENCHMARKS.show_rate);
  factors.push({ metric: 'show_rate', value: showRate, weight: WEIGHTS.show_rate, contribution: showRateScore * WEIGHTS.show_rate });

  // AOV score
  const aov = Number(answers.aov) || 0;
  const aovScore = scoreMetric(aov, BENCHMARKS.aov);
  factors.push({ metric: 'aov', value: aov, weight: WEIGHTS.aov, contribution: aovScore * WEIGHTS.aov });

  // Booked calls score
  const booked = Number(answers.booked_calls) || 0;
  const bookedScore = scoreMetric(booked, BENCHMARKS.booked_calls);
  factors.push({ metric: 'booked_calls', value: booked, weight: WEIGHTS.booked_calls, contribution: bookedScore * WEIGHTS.booked_calls });

  // Years in business score
  const years = Number(answers.years_in_business) || 0;
  const yearsScore = scoreMetric(years, BENCHMARKS.years);
  factors.push({ metric: 'years', value: years, weight: WEIGHTS.years, contribution: yearsScore * WEIGHTS.years });

  // Total score (0-100), clamped to prevent floating point overflow
  const totalScore = Math.min(Math.round(factors.reduce((sum, f) => sum + f.contribution, 0) * 100), 100);

  // Tier assignment
  const tier = assignTier(totalScore);

  return { score: totalScore, tier, factors };
}

function scoreMetric(value: number, benchmarks: { excellent: number; good: number; acceptable: number }): number {
  if (value >= benchmarks.excellent) return 1.0;
  if (value >= benchmarks.good) return 0.7;
  if (value >= benchmarks.acceptable) return 0.4;
  if (value > 0) return 0.2;
  return 0;
}

function assignTier(score: number): QualificationTier {
  if (score >= 75) return 'high_priority';
  if (score >= 50) return 'qualified';
  if (score >= 25) return 'future_icp';
  return 'education';
}

export function getTierLabel(tier: QualificationTier): string {
  switch (tier) {
    case 'high_priority': return 'High Priority';
    case 'qualified': return 'Qualified';
    case 'future_icp': return 'Future ICP';
    case 'education': return 'Education';
  }
}

export function getTierColor(tier: QualificationTier): string {
  switch (tier) {
    case 'high_priority': return 'text-green-400';
    case 'qualified': return 'text-brand';
    case 'future_icp': return 'text-yellow-400';
    case 'education': return 'text-text-muted';
  }
}
