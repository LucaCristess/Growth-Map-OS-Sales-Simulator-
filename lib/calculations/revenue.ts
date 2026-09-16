import type { AnswerValue, Scenario, ConstraintAnalysis, Constraint, ConstraintScore, TargetAnalysis, TargetPath } from '@/types';

export interface RevenueResult {
  projected_revenue: number;
  qualified_leads: number;
  booking_rate: number;
  show_rate: number;
  close_rate: number;
  aov: number;
}

const BENCHMARKS = {
  show_rate: 80,
  close_rate: 30,
  aov: 2000,
};

const CEILINGS = {
  show_rate: 85,
  close_rate: 60,
};

function deriveRates(answers: Record<string, AnswerValue>): { showRate: number; closeRate: number } {
  const showRate = Number(answers.show_rate) || 0;
  const closeRate = Number(answers.close_rate) || 0;

  if (showRate > 0 && closeRate > 0) {
    return { showRate, closeRate };
  }

  const booked = Number(answers.booked_calls) || 0;
  const showCount = Number(answers.show_count) || 0;
  const closeCount = Number(answers.close_count) || 0;

  return {
    showRate: showRate > 0 ? showRate : (booked > 0 ? (showCount / booked) * 100 : 0),
    closeRate: closeRate > 0 ? closeRate : (showCount > 0 ? (closeCount / showCount) * 100 : 0),
  };
}

function clampToCeiling(value: number, ceiling: number): number {
  return Math.min(value, ceiling);
}

export function calculateHealthScore(answers: Record<string, AnswerValue>): { score: number; label: string; color: string } {
  const { showRate, closeRate } = deriveRates(answers);
  const booked = Number(answers.booked_calls) || 0;
  const aov = Number(answers.aov) || 0;
  const monthlyLeads = Number(answers.monthly_leads) || 0;

  // Show rate score (0-25 points): 0% → 0, 80%+ → 25
  const showScore = Math.min((showRate / BENCHMARKS.show_rate) * 25, 25);

  // Close rate score (0-25 points): 0% → 0, 30%+ → 25
  const closeScore = Math.min((closeRate / BENCHMARKS.close_rate) * 25, 25);

  // Volume score (0-25 points): 0 booked → 0, 20+ booked → 25
  const volumeScore = Math.min((booked / 20) * 25, 25);

  // AOV score (0-25 points): $0 → 0, $2000+ → 25
  const aovScore = aov > 0 ? Math.min((aov / BENCHMARKS.aov) * 25, 25) : 0;

  const raw = Math.round(showScore + closeScore + volumeScore + aovScore);
  const score = Math.max(0, Math.min(100, raw));

  if (score >= 80) return { score, label: 'Strong', color: 'text-green-400' };
  if (score >= 50) return { score, label: 'Needs Work', color: 'text-yellow-400' };
  return { score, label: 'Critical', color: 'text-red-400' };
}

export function calculateRevenue(answers: Record<string, AnswerValue>): RevenueResult {
  const booked = Number(answers.booked_calls) || 0;
  const { showRate, closeRate } = deriveRates(answers);
  const aov = Number(answers.aov) || 0;

  const qualifiedLeads = booked;
  const projectedRevenue = qualifiedLeads * (showRate / 100) * (closeRate / 100) * aov;

  return {
    projected_revenue: projectedRevenue,
    qualified_leads: qualifiedLeads,
    booking_rate: 1,
    show_rate: showRate,
    close_rate: closeRate,
    aov,
  };
}

export function calculateRevenueCrossCheck(answers: Record<string, AnswerValue>): {
  formula_computed: number;
  self_reported: number;
  match: boolean;
  variance_pct: number;
} | null {
  const selfReported = Number(answers.monthly_revenue) || 0;
  if (selfReported <= 0) return null;

  const result = calculateRevenue(answers);
  const formulaComputed = result.projected_revenue;

  const variancePct = selfReported > 0
    ? Math.abs(formulaComputed - selfReported) / selfReported * 100
    : 0;

  return {
    formula_computed: formulaComputed,
    self_reported: selfReported,
    match: variancePct < 20,
    variance_pct: variancePct,
  };
}

export function calculatePrimaryConstraint(answers: Record<string, AnswerValue>): { primary: Constraint; secondary: Constraint | null; scores: ConstraintScore[] } | null {
  const { showRate, closeRate } = deriveRates(answers);
  const booked = Number(answers.booked_calls) || 0;
  const aov = Number(answers.aov) || 0;
  const monthlyLeads = Number(answers.monthly_leads) || 0;

  const showGap = BENCHMARKS.show_rate - showRate;
  const closeGap = BENCHMARKS.close_rate - closeRate;
  const volumeScore = booked < 20 ? 20 - booked : 0;
  const aovGap = aov > 0 ? Math.max(0, (BENCHMARKS.aov - aov) / BENCHMARKS.aov * 100) : 50;
  const bookingRate = monthlyLeads > 0 ? (booked / monthlyLeads) * 100 : 0;
  const bookingGap = monthlyLeads > 0 ? Math.max(0, 100 - bookingRate) : 0;

  const scores: ConstraintScore[] = [
    { metric: 'show_rate', score: Math.max(showGap, 0), rank: 0 },
    { metric: 'close_rate', score: Math.max(closeGap, 0), rank: 0 },
    { metric: 'volume', score: volumeScore, rank: 0 },
    { metric: 'aov', score: aovGap, rank: 0 },
    { metric: 'booking_rate', score: bookingGap, rank: 0 },
  ];

  scores.sort((a, b) => b.score - a.score);
  scores.forEach((s, i) => { s.rank = i + 1; });

  const toConstraint = (s: ConstraintScore): Constraint => {
    const current = s.metric === 'show_rate' ? showRate
      : s.metric === 'close_rate' ? closeRate
      : s.metric === 'aov' ? aov
      : s.metric === 'booking_rate' ? bookingRate
      : booked;
    const benchmark = s.metric === 'show_rate' ? BENCHMARKS.show_rate
      : s.metric === 'close_rate' ? BENCHMARKS.close_rate
      : s.metric === 'aov' ? BENCHMARKS.aov
      : s.metric === 'booking_rate' ? 100
      : 20;

    const impacts: Record<string, string> = {
      show_rate: `${Math.abs(showGap).toFixed(0)}% ${showGap > 0 ? 'below' : 'above'} the ${BENCHMARKS.show_rate}% target`,
      close_rate: `${Math.abs(closeGap).toFixed(0)}% ${closeGap > 0 ? 'below' : 'above'} the ${BENCHMARKS.close_rate}% target`,
      volume: booked < 20 ? 'Low call volume limits revenue ceiling' : 'Booking volume is healthy',
      aov: `Current AOV is $${aov.toLocaleString()}, benchmark is $${BENCHMARKS.aov.toLocaleString()}`,
      booking_rate: monthlyLeads > 0 ? `Booking rate is ${bookingRate.toFixed(0)}% of leads` : 'Lead data needed to assess booking rate',
    };

    return {
      metric: s.metric,
      current_value: current,
      benchmark_value: benchmark,
      score: s.score,
      impact: impacts[s.metric],
    };
  };

  const primary = toConstraint(scores[0]);
  const secondary = scores[1].score > 0 ? toConstraint(scores[1]) : null;

  return { primary, secondary, scores };
}

export function calculateScenarios(answers: Record<string, AnswerValue>): Scenario[] {
  const booked = Number(answers.booked_calls) || 0;
  const { showRate, closeRate } = deriveRates(answers);
  const aov = Number(answers.aov) || 0;

  const base = booked * (showRate / 100) * (closeRate / 100) * aov;

  const scenarios: Scenario[] = [
    {
      name: 'current',
      label: 'Current',
      qualified_leads: booked,
      booking_rate: 1,
      show_rate: showRate,
      close_rate: closeRate,
      aov,
      projected_revenue: base,
      revenue_change: 0,
    },
    {
      name: 'conservative',
      label: 'Conservative',
      qualified_leads: Math.round(booked * 0.80),
      booking_rate: 1,
      show_rate: showRate,
      close_rate: clampToCeiling(closeRate + 5, CEILINGS.close_rate),
      aov,
      projected_revenue: booked * 0.80 * (showRate / 100) * (clampToCeiling(closeRate + 5, CEILINGS.close_rate) / 100) * aov,
      revenue_change: 0,
    },
    {
      name: 'expected',
      label: 'Expected',
      qualified_leads: Math.round(booked * 1.1),
      booking_rate: 1,
      show_rate: clampToCeiling(showRate + 10, CEILINGS.show_rate),
      close_rate: clampToCeiling(closeRate + 5, CEILINGS.close_rate),
      aov: aov * 1.05,
      projected_revenue: booked * 1.1 * (clampToCeiling(showRate + 10, CEILINGS.show_rate) / 100) * (clampToCeiling(closeRate + 5, CEILINGS.close_rate) / 100) * (aov * 1.05),
      revenue_change: 0,
    },
    {
      name: 'aggressive',
      label: 'Aggressive',
      qualified_leads: Math.round(booked * 1.3),
      booking_rate: 1,
      show_rate: clampToCeiling(showRate + 15, CEILINGS.show_rate),
      close_rate: clampToCeiling(closeRate + 10, CEILINGS.close_rate),
      aov: aov * 1.1,
      projected_revenue: booked * 1.3 * (clampToCeiling(showRate + 15, CEILINGS.show_rate) / 100) * (clampToCeiling(closeRate + 10, CEILINGS.close_rate) / 100) * (aov * 1.1),
      revenue_change: 0,
    },
  ];

  const currentRev = scenarios[0].projected_revenue;
  scenarios.forEach((s) => {
    s.revenue_change = currentRev > 0 ? ((s.projected_revenue - currentRev) / currentRev) * 100 : 0;
  });

  return scenarios;
}

export function calculateTargetAnalysis(answers: Record<string, AnswerValue>): TargetAnalysis | null {
  const targetRevenue = Number(answers.revenue_target) || 0;
  if (targetRevenue <= 0) return null;

  const booked = Number(answers.booked_calls) || 0;
  const { showRate, closeRate } = deriveRates(answers);
  const aov = Number(answers.aov) || 0;
  const currentRevenue = booked * (showRate / 100) * (closeRate / 100) * aov;

  if (currentRevenue >= targetRevenue) {
    return {
      target_revenue: targetRevenue,
      paths: [],
      recommended_path: {
        name: 'balanced',
        label: 'Already at target',
        qualified_leads: booked,
        booking_rate: 1,
        show_rate: showRate,
        close_rate: closeRate,
        aov,
        projected_revenue: currentRevenue,
      },
    };
  }

  const volumeNeeded = aov > 0 && showRate > 0 && closeRate > 0
    ? Math.ceil(targetRevenue / (aov * (showRate / 100) * (closeRate / 100)))
    : booked * 3;
  const volumeOnly: TargetPath = {
    name: 'volume_only',
    label: 'Volume Only',
    qualified_leads: volumeNeeded,
    booking_rate: 1,
    show_rate: showRate,
    close_rate: closeRate,
    aov,
    projected_revenue: volumeNeeded * (showRate / 100) * (closeRate / 100) * aov,
  };

  const neededCloseRate = booked > 0 && showRate > 0 && aov > 0
    ? Math.min((targetRevenue / (booked * (showRate / 100) * aov)) * 100, CEILINGS.close_rate)
    : Math.min(closeRate + 20, CEILINGS.close_rate);
  const conversionFirst: TargetPath = {
    name: 'conversion_first',
    label: 'Conversion First',
    qualified_leads: booked,
    booking_rate: 1,
    show_rate: clampToCeiling(showRate + 10, CEILINGS.show_rate),
    close_rate: clampToCeiling(neededCloseRate, CEILINGS.close_rate),
    aov,
    projected_revenue: booked * (clampToCeiling(showRate + 10, CEILINGS.show_rate) / 100) * (clampToCeiling(neededCloseRate, CEILINGS.close_rate) / 100) * aov,
  };

  const balancedBooked = Math.round(booked * 1.2);
  const balancedShow = clampToCeiling(showRate + 5, CEILINGS.show_rate);
  const balancedClose = clampToCeiling(closeRate + 5, CEILINGS.close_rate);
  const balancedAov = aov * 1.05;
  const balanced: TargetPath = {
    name: 'balanced',
    label: 'Balanced',
    qualified_leads: balancedBooked,
    booking_rate: 1,
    show_rate: balancedShow,
    close_rate: balancedClose,
    aov: balancedAov,
    projected_revenue: balancedBooked * (balancedShow / 100) * (balancedClose / 100) * balancedAov,
  };

  const paths = [volumeOnly, conversionFirst, balanced];
  const recommended = paths.reduce((best, p) => {
    const bestGap = Math.abs(best.projected_revenue - targetRevenue);
    const pGap = Math.abs(p.projected_revenue - targetRevenue);
    return pGap < bestGap ? p : best;
  });

  return {
    target_revenue: targetRevenue,
    paths,
    recommended_path: recommended,
  };
}
