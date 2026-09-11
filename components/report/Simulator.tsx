'use client';

import { useState, useMemo, useCallback } from 'react';
import { calculateRevenue, calculateScenarios } from '@/lib/calculations/revenue';
import { analytics } from '@/lib/analytics';
import type { AnswerValue, Scenario } from '@/types';

interface SimulatorState {
  booked_calls: number;
  aov: number;
  revenue_target: number;
}

function deriveShowRate(answers: Record<string, AnswerValue>): number {
  const sr = Number(answers.show_rate) || 0;
  if (sr > 0) return sr;
  const booked = Number(answers.booked_calls) || 0;
  const showCount = Number(answers.show_count) || 0;
  return booked > 0 ? (showCount / booked) * 100 : 0;
}

function deriveCloseRate(answers: Record<string, AnswerValue>): number {
  const cr = Number(answers.close_rate) || 0;
  if (cr > 0) return cr;
  const showCount = Number(answers.show_count) || 0;
  const closeCount = Number(answers.close_count) || 0;
  return showCount > 0 ? (closeCount / showCount) * 100 : 0;
}

export function Simulator({
  initialAnswers,
  onRecalculate,
}: {
  initialAnswers: Record<string, AnswerValue>;
  onRecalculate?: (answers: Record<string, AnswerValue>) => void;
}) {
  const initialShowRate = useMemo(() => deriveShowRate(initialAnswers), [initialAnswers]);
  const initialCloseRate = useMemo(() => deriveCloseRate(initialAnswers), [initialAnswers]);

  const [state, setState] = useState<SimulatorState>({
    booked_calls: Number(initialAnswers.booked_calls) || 0,
    aov: Number(initialAnswers.aov) || 0,
    revenue_target: Number(initialAnswers.revenue_target) || 0,
  });

  const [showRate, setShowRate] = useState(initialShowRate);
  const [closeRate, setCloseRate] = useState(initialCloseRate);

  const derivedAnswers = useMemo((): Record<string, AnswerValue> => ({
    ...initialAnswers,
    booked_calls: state.booked_calls,
    show_rate: showRate,
    close_rate: closeRate,
    aov: state.aov,
    revenue_target: state.revenue_target,
  }), [initialAnswers, state.booked_calls, showRate, closeRate, state.aov, state.revenue_target]);

  const revenue = useMemo(() => calculateRevenue(derivedAnswers), [derivedAnswers]);
  const scenarios = useMemo(() => calculateScenarios(derivedAnswers), [derivedAnswers]);

  const handleSliderChange = useCallback((metric: string, value: number) => {
    analytics.simulationAdjusted(metric, value);
  }, []);

  const handleScenarioClick = useCallback((scenario: Scenario) => {
    analytics.scenarioSelected(scenario.name, scenario.projected_revenue);
    setCloseRate(scenario.close_rate);
    setShowRate(scenario.show_rate);
    setState({
      booked_calls: scenario.qualified_leads,
      aov: scenario.aov,
      revenue_target: state.revenue_target,
    });
  }, [state.revenue_target]);

  const targetGap = state.revenue_target > 0
    ? state.revenue_target - revenue.projected_revenue
    : 0;
  const targetProgress = state.revenue_target > 0
    ? Math.min((revenue.projected_revenue / state.revenue_target) * 100, 100)
    : 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-text font-medium text-lg">Interactive Simulator</h2>
          <p className="text-text-muted text-sm">Adjust inputs to see real-time revenue impact</p>
        </div>
        <div className="text-right">
          <div className={`font-display text-3xl ${revenue.projected_revenue >= state.revenue_target && state.revenue_target > 0 ? 'text-green-400' : 'text-brand'}`}>
            ${Math.round(revenue.projected_revenue).toLocaleString()}
          </div>
          <div className="text-text-muted text-xs">projected monthly</div>
        </div>
      </div>

      {state.revenue_target > 0 && (
        <div className="mb-6 p-4 bg-background rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-text-secondary text-sm">Target: ${Math.round(state.revenue_target).toLocaleString()}</span>
            <span className={`text-sm font-medium ${targetGap <= 0 ? 'text-green-400' : 'text-text'}`}>
              {targetGap <= 0 ? 'Target reached!' : `$${Math.abs(Math.round(targetGap)).toLocaleString()} gap`}
            </span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${targetProgress >= 100 ? 'bg-green-400' : 'bg-brand'}`}
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Slider
          label="Booked Calls"
          value={state.booked_calls}
          min={0}
          max={200}
          step={1}
          onChange={(v) => { setState((s) => ({ ...s, booked_calls: v })); handleSliderChange('booked_calls', v); }}
          formatValue={(v) => String(v)}
        />
        <Slider
          label="Show Rate"
          value={showRate}
          min={0}
          max={100}
          step={1}
          onChange={(v) => { setShowRate(v); handleSliderChange('show_rate', v); }}
          formatValue={(v) => `${v.toFixed(0)}%`}
        />
        <Slider
          label="Close Rate"
          value={closeRate}
          min={0}
          max={100}
          step={1}
          onChange={(v) => { setCloseRate(v); handleSliderChange('close_rate', v); }}
          formatValue={(v) => `${v.toFixed(0)}%`}
        />
        <Slider
          label="Average Order Value"
          value={state.aov}
          min={0}
          max={50000}
          step={100}
          onChange={(v) => { setState((s) => ({ ...s, aov: v })); handleSliderChange('aov', v); }}
          formatValue={(v) => `$${v.toLocaleString()}`}
        />
        <Slider
          label="Revenue Target"
          value={state.revenue_target}
          min={0}
          max={100000}
          step={1000}
          onChange={(v) => { setState((s) => ({ ...s, revenue_target: v })); handleSliderChange('revenue_target', v); }}
          formatValue={(v) => `$${v.toLocaleString()}`}
        />
      </div>

      {/* Clickable scenario presets */}
      <div className="grid grid-cols-4 gap-3">
        {scenarios.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => handleScenarioClick(s)}
            className={`text-center p-3 rounded-lg border text-xs transition-all hover:border-brand cursor-pointer ${
              s.name === 'current' ? 'bg-surface border-text-muted' : 'bg-surface border-border'
            }`}
          >
            <div className="text-text-muted uppercase tracking-wider mb-1">{s.label}</div>
            <div className={`font-display text-lg ${s.name === 'expected' ? 'text-brand' : 'text-text'}`}>
              ${Math.round(s.projected_revenue).toLocaleString()}
            </div>
            {s.revenue_change !== 0 && (
              <div className={`text-xs mt-1 ${s.revenue_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {s.revenue_change > 0 ? '+' : ''}{s.revenue_change.toFixed(0)}%
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-5 gap-4 text-center text-sm">
          <div>
            <div className="text-text font-medium">{state.booked_calls}</div>
            <div className="text-text-muted text-xs">Booked</div>
          </div>
          <div>
            <div className="text-text font-medium">{Math.round(state.booked_calls * (showRate / 100))}</div>
            <div className="text-text-muted text-xs">Showed</div>
          </div>
          <div>
            <div className="text-text font-medium">{Math.round(state.booked_calls * (showRate / 100) * (closeRate / 100))}</div>
            <div className="text-text-muted text-xs">Closed</div>
          </div>
          <div>
            <div className="text-text font-medium">{showRate.toFixed(0)}%</div>
            <div className="text-text-muted text-xs">Show Rate</div>
          </div>
          <div>
            <div className="text-text font-medium">{closeRate.toFixed(0)}%</div>
            <div className="text-text-muted text-xs">Close Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue: (value: number) => string;
}) {
  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-text-secondary text-sm">{label}</label>
        <span className="text-text font-medium text-sm">{formatValue(value)}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer slider-brand"
          style={{
            background: `linear-gradient(to right, #D8B45A ${percentage}%, #2A2A2E ${percentage}%)`,
          }}
        />
      </div>
    </div>
  );
}
