'use client';

import { useState } from 'react';
import type { AnswerValue, QuestionSection } from '@/types';

function formatValue(value: AnswerValue, type: string): string {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'currency') return `$${Number(value).toLocaleString()}`;
  if (type === 'percentage') return `${value}%`;
  if (type === 'select') return String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return String(value);
}

export function LiveInputSidebar({
  sections,
  answers,
  currentIndex,
  onJumpTo,
}: {
  sections: QuestionSection[];
  answers: Record<string, AnswerValue>;
  currentIndex: number;
  onJumpTo: (index: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const answeredSections = sections.slice(0, currentIndex).filter(
    (s) => s.questions[0] && answers[s.questions[0].key] !== undefined && answers[s.questions[0].key] !== null && answers[s.questions[0].key] !== ''
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-30 md:hidden bg-brand text-background w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        aria-label="Toggle answer summary"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="15" y2="12" />
              <line x1="3" y1="18" x2="9" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Sidebar — desktop: persistent, mobile: overlay */}
      <div
        className={`
          fixed top-0 right-0 h-full w-72 bg-surface border-l border-border z-20
          transform transition-transform duration-200 ease-out
          md:translate-x-0 md:static md:w-64 md:flex-shrink-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 h-full overflow-y-auto">
          <h3 className="text-text-muted text-xs uppercase tracking-wider mb-4">
            Your Answers
          </h3>

          {answeredSections.length === 0 ? (
            <p className="text-text-muted text-sm">Start answering to see your inputs here.</p>
          ) : (
            <div className="space-y-1">
              {answeredSections.map((section, i) => {
                const question = section.questions[0];
                if (!question) return null;
                const value = answers[question.key];
                const isActive = sections.indexOf(section) === currentIndex;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      onJumpTo(sections.indexOf(section));
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-150 animate-slide-up ${
                      isActive
                        ? 'bg-brand/10 border border-brand/20'
                        : 'hover:bg-background border border-transparent'
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="text-text-muted text-xs mb-0.5">{section.title}</div>
                    <div className="text-text text-sm font-medium truncate">
                      {formatValue(value, question.type)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
