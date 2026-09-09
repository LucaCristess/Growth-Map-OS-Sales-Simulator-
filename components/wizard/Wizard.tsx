'use client';

import { useState, useCallback } from 'react';
import { WizardQuestion } from './WizardQuestion';
import type { QuestionSection, AnswerValue } from '@/types';

interface WizardProps {
  sections: QuestionSection[];
  answers: Record<string, AnswerValue>;
  onAnswer: (key: string, value: AnswerValue) => void;
  onComplete: () => void;
  loading?: boolean;
}

export function Wizard({ sections, answers, onAnswer, onComplete, loading }: WizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const currentSection = sections[currentIndex];
  const currentQuestion = currentSection.questions[0]; // One question per section
  const currentValue = answers[currentQuestion.key] ?? null;

  const progress = ((currentIndex + 1) / sections.length) * 100;

  const handleNext = useCallback(() => {
    if (currentIndex < sections.length - 1) {
      setDirection('forward');
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  }, [currentIndex, sections.length, onComplete]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setDirection('backward');
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleAnswer = useCallback((value: AnswerValue) => {
    onAnswer(currentQuestion.key, value);
  }, [currentQuestion.key, onAnswer]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentValue !== null && currentValue !== '') {
      handleNext();
    }
  }, [currentValue, handleNext]);

  return (
    <div className="min-h-screen flex flex-col" onKeyDown={handleKeyDown}>
      {/* Back arrow */}
      <div className="fixed top-6 left-6 z-10">
        {currentIndex > 0 && (
          <button
            onClick={handleBack}
            className="text-text-muted hover:text-text transition-colors p-2"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-border z-20">
        <div
          className="h-full bg-brand transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question area with slide transition */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl w-full">
          <div
            key={currentIndex}
            className={`animate-slide-${direction}`}
          >
            <WizardQuestion
              question={currentQuestion}
              value={currentValue}
              onChange={handleAnswer}
              onNext={handleNext}
              sectionTitle={currentSection.title}
              sectionDescription={currentSection.description ?? ''}
              loading={loading}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-forward {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-backward {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-forward {
          animation: slide-forward 0.3s ease-out;
        }
        .animate-slide-backward {
          animation: slide-backward 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
