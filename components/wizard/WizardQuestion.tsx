'use client';

import { useState, useEffect, useRef } from 'react';
import type { Question, AnswerValue } from '@/types';

interface WizardQuestionProps {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  onNext: () => void;
  sectionTitle: string;
  sectionDescription: string;
  isLast?: boolean;
  loading?: boolean;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US');
}

function parseCurrencyInput(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, '').replace(/(\d+\.\d*)\./g, '$1');
  if (cleaned === '') return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function WizardQuestion({
  question,
  value,
  onChange,
  onNext,
  sectionTitle,
  sectionDescription,
  isLast = false,
  loading,
}: WizardQuestionProps) {
  const [inputValue, setInputValue] = useState('');
  const [showUnknown, setShowUnknown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when question changes
  useEffect(() => {
    setShowUnknown(false);
    if (value !== null && value !== undefined) {
      if (question.type === 'currency') {
        setInputValue(formatCurrency(value as number));
      } else {
        setInputValue(String(value));
      }
    } else {
      setInputValue('');
    }
  }, [question.key, question.type, value]);

  // Auto-focus input
  useEffect(() => {
    if (question.type !== 'select' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [question.key, question.type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (question.type === 'currency') {
      // Allow only numbers and commas
      const cleaned = raw.replace(/[^0-9,]/g, '');
      setInputValue(cleaned);
      const parsed = parseCurrencyInput(cleaned);
      if (parsed !== null && parsed >= 0) {
        onChange(parsed);
      }
    } else if (question.type === 'percentage') {
      // Allow only numbers and single decimal
      const cleaned = raw.replace(/[^0-9.]/g, '').replace(/(\d+\.\d*)\./g, '$1');
      setInputValue(cleaned);
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        onChange(num);
      }
    } else {
      // Plain number — no decimals allowed
      const cleaned = raw.replace(/[^0-9]/g, '');
      setInputValue(cleaned);
      const num = parseInt(cleaned, 10);
      if (!isNaN(num) && num >= 0) {
        onChange(num);
      }
    }
  };

  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    // Auto-advance for select questions
    setTimeout(() => onNext(), 200);
  };

  const handleUnknown = () => {
    setShowUnknown(true);
    onChange(null);
  };

  const handleClearUnknown = () => {
    setShowUnknown(false);
  };

  const hasValue = value !== null && value !== undefined && value !== '';

  return (
    <div className="text-center">
      {/* Section title */}
      <h2 className="text-text-muted text-sm font-medium tracking-wider uppercase mb-3">
        {sectionTitle}
      </h2>

      {/* Question */}
      <h1 className="font-display text-3xl md:text-4xl text-text mb-3 leading-tight">
        {question.label}
      </h1>

      {/* Description */}
      <p className="text-text-secondary text-base mb-10 max-w-md mx-auto">
        {sectionDescription}
      </p>

      {/* Input area */}
      {question.type === 'select' ? (
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          {question.options?.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelectOption(option.value)}
              className={`w-full px-6 py-4 rounded-lg border text-left transition-all duration-200 ${
                value === option.value
                  ? 'bg-brand/10 border-brand text-text'
                  : 'bg-surface border-border text-text hover:border-text-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : showUnknown ? (
        <div className="max-w-sm mx-auto">
          <p className="text-text-muted text-sm mb-4">
            No problem — we&apos;ll work with what you have.
          </p>
          <button
            onClick={handleClearUnknown}
            className="text-brand text-sm hover:underline"
          >
            I know this — let me enter it
          </button>
        </div>
      ) : (
        <div className="max-w-sm mx-auto">
          <div className="relative">
            {/* Prefix */}
            {question.prefix && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                {question.prefix}
              </span>
            )}

            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={question.type === 'currency' ? '0' : question.type === 'percentage' ? '0' : '0'}
              className={`w-full bg-surface border border-border rounded-lg text-text text-lg focus:border-brand focus:outline-none transition-colors ${
                question.prefix ? 'pl-10 pr-12 py-4' : 'px-4 pr-12 py-4'
              }`}
            />

            {/* Suffix */}
            {question.suffix && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                {question.suffix}
              </span>
            )}
          </div>

          {/* Next button */}
          <button
            onClick={onNext}
            disabled={!hasValue || loading}
            className="mt-4 w-full bg-brand hover:bg-brand-hover text-background font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isLast ? 'See Results' : 'Next'}
          </button>

          {/* Unknown link */}
          {question.unknown_option && (
            <button
              onClick={handleUnknown}
              className="mt-4 text-text-muted text-sm hover:text-text transition-colors"
            >
              I don&apos;t know this
            </button>
          )}
        </div>
      )}

      {/* Help text */}
      {question.help_text && !showUnknown && (
        <p className="text-text-muted text-xs mt-6 max-w-sm mx-auto">
          {question.help_text}
        </p>
      )}
    </div>
  );
}
