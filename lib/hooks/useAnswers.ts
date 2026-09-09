'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnswerValue } from '@/types';

interface AnswerMap {
  [questionKey: string]: AnswerValue;
}

const ANSWERS_KEY = 'growthmap_answers';

function getStoredAnswers(): AnswerMap {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(ANSWERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    localStorage.removeItem(ANSWERS_KEY);
  }
  return {};
}

function storeAnswers(answers: AnswerMap) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

export function useAnswers(sessionId: string | null) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  // Load answers from localStorage on mount
  useEffect(() => {
    setAnswers(getStoredAnswers());
  }, []);

  const setAnswer = useCallback(async (key: string, value: AnswerValue) => {
    // Use functional updater to always read latest state
    setAnswers(prev => {
      const newAnswers = { ...prev, [key]: value };
      storeAnswers(newAnswers);
      return newAnswers;
    });

    // Persist to Supabase if we have a session
    if (sessionId && !savingRef.current) {
      savingRef.current = true;
      setSaving(true);
      try {
        await fetch('/api/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            question_key: key,
            value,
          }),
        });
      } catch (err) {
        // Silently fail — localStorage has the data
      } finally {
        setSaving(false);
        savingRef.current = false;
      }
    }
  }, [sessionId]);

  const getAnswer = useCallback((key: string): AnswerValue => {
    return answers[key] ?? null;
  }, [answers]);

  const clearAnswers = useCallback(() => {
    setAnswers({});
    localStorage.removeItem(ANSWERS_KEY);
  }, []);

  return {
    answers,
    saving,
    setAnswer,
    getAnswer,
    clearAnswers,
  };
}
