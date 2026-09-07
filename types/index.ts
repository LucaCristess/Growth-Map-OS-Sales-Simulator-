export interface Session {
  id: string;
  anonymous_id: string;
  created_at: string;
  scan_type: 'quick' | 'deep' | null;
  completed: boolean;
  utm_params: Record<string, string> | null;
}

export interface Answer {
  id: string;
  session_id: string;
  question_key: string;
  value: AnswerValue;
  created_at: string;
  updated_at: string;
}

export type AnswerValue = string | number | boolean | null;

export interface Lead {
  id: string;
  session_id: string;
  name: string;
  email: string;
  phone: string | null;
  qualification_score: number | null;
  qualification_tier: QualificationTier | null;
  created_at: string;
}

export type QualificationTier = 'education' | 'future_icp' | 'qualified' | 'high_priority';

export interface Report {
  id: string;
  session_id: string;
  result_json: SimulationResult;
  created_at: string;
}

export interface SimulationResult {
  current: RevenueBreakdown;
  scenarios: Scenario[];
  constraint: ConstraintAnalysis;
  target: TargetAnalysis;
  qualification: QualificationResult;
}

export interface RevenueBreakdown {
  qualified_leads: number;
  booking_rate: number;
  show_rate: number;
  close_rate: number;
  aov: number;
  projected_revenue: number;
}

export interface Scenario {
  name: 'current' | 'conservative' | 'expected' | 'aggressive';
  label: string;
  qualified_leads: number;
  booking_rate: number;
  show_rate: number;
  close_rate: number;
  aov: number;
  projected_revenue: number;
  revenue_change: number;
}

export interface ConstraintAnalysis {
  primary: Constraint;
  secondary: Constraint | null;
  scores: ConstraintScore[];
}

export interface Constraint {
  metric: string;
  current_value: number;
  benchmark_value: number;
  score: number;
  impact: string;
}

export interface ConstraintScore {
  metric: string;
  score: number;
  rank: number;
}

export interface TargetAnalysis {
  target_revenue: number;
  paths: TargetPath[];
  recommended_path: TargetPath;
}

export interface TargetPath {
  name: 'volume_only' | 'conversion_first' | 'balanced';
  label: string;
  qualified_leads: number;
  booking_rate: number;
  show_rate: number;
  close_rate: number;
  aov: number;
  projected_revenue: number;
}

export interface QualificationResult {
  score: number;
  tier: QualificationTier;
  factors: QualificationFactor[];
}

export interface QualificationFactor {
  metric: string;
  value: number;
  weight: number;
  contribution: number;
}

export interface Question {
  key: string;
  label: string;
  type: 'number' | 'percentage' | 'currency' | 'select';
  suffix?: string;
  prefix?: string;
  options?: { label: string; value: string }[];
  required: boolean;
  help_text?: string;
}

export interface QuestionSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}
