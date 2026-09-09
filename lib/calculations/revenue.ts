import type { AnswerValue } from '@/types';

export interface RevenueResult {
  projected_revenue: number;
  qualified_leads: number;
  booking_rate: number;
  show_rate: number;
  close_rate: number;
  aov: number;
}

export interface ConstraintResult {
  metric: string;
  label: string;
  description: string;
  score: number;
}

const BENCHMARKS = {
  show_rate: 80,
  close_rate: 30,
  booking_rate: 100, // booked calls are already qualified
};

export function calculateRevenue(answers: Record<string, AnswerValue>): RevenueResult {
  const booked = Number(answers.booked_calls) || 0;
  const showRate = (Number(answers.show_rate) || 0) / 100;
  const closeRate = (Number(answers.close_rate) || 0) / 100;
  const aov = Number(answers.aov) || 0;

  const qualifiedLeads = booked;
  const projectedRevenue = qualifiedLeads * showRate * closeRate * aov;

  return {
    projected_revenue: projectedRevenue,
    qualified_leads: qualifiedLeads,
    booking_rate: 1, // Already booked
    show_rate: showRate * 100,
    close_rate: closeRate * 100,
    aov,
  };
}

export function calculatePrimaryConstraint(answers: Record<string, AnswerValue>): ConstraintResult | null {
  const showRate = Number(answers.show_rate) || 0;
  const closeRate = Number(answers.close_rate) || 0;
  const booked = Number(answers.booked_calls) || 0;

  // Calculate gap from benchmark for each metric
  const showGap = BENCHMARKS.show_rate - showRate;
  const closeGap = BENCHMARKS.close_rate - closeRate;

  // Volume constraint
  const volumeScore = booked < 20 ? 20 - booked : 0;

  // Rank constraints
  const constraints: ConstraintResult[] = [
    {
      metric: 'show_rate',
      label: 'Show Rate',
      description: `${showGap > 0 ? `${showGap.toFixed(0)}% below` : `${(-showGap).toFixed(0)}% above`} the recommended ${BENCHMARKS.show_rate}% target. ${showGap > 0 ? 'Improving this adds revenue from calls you\'re already booking.' : 'Your show rate is strong.'}`,
      score: showGap,
    },
    {
      metric: 'close_rate',
      label: 'Close Rate',
      description: `${closeGap > 0 ? `${closeGap.toFixed(0)}% below` : `${(-closeGap).toFixed(0)}% above`} the recommended ${BENCHMARKS.close_rate}% target. ${closeGap > 0 ? 'This is your conversion bottleneck.' : 'Your close rate is strong.'}`,
      score: closeGap,
    },
    {
      metric: 'volume',
      label: 'Booking Volume',
      description: `${booked < 20 ? 'Low call volume limits your revenue ceiling.' : 'Your booking volume is healthy.'}`,
      score: volumeScore,
    },
  ];

  // Sort by score (highest = biggest constraint)
  constraints.sort((a, b) => b.score - a.score);

  // Return the top constraint with positive score
  const primary = constraints.find(c => c.score > 0) ?? constraints[0];

  return primary;
}

export function calculateScenarios(answers: Record<string, AnswerValue>) {
  const booked = Number(answers.booked_calls) || 0;
  const showRate = Number(answers.show_rate) || 0;
  const closeRate = Number(answers.close_rate) || 0;
  const aov = Number(answers.aov) || 0;

  const base = booked * (showRate / 100) * (closeRate / 100) * aov;

  return {
    current: base,
    conservative: booked * 0.80 * (showRate / 100) * ((closeRate + 5) / 100) * aov,
    expected: booked * 1.1 * ((showRate + 10) / 100) * ((closeRate + 5) / 100) * (aov * 1.05),
    aggressive: booked * 1.3 * ((showRate + 15) / 100) * ((closeRate + 10) / 100) * (aov * 1.1),
  };
}
