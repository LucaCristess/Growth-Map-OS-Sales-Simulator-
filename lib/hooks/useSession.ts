'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Session } from '@/types';

const STORAGE_KEY = 'growthmap_session';

function generateAnonymousId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `anon_${timestamp}_${random}`;
}

function getStoredSession(): { sessionId: string; anonymousId: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

function storeSession(sessionId: string, anonymousId: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, anonymousId }));
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (scanType: 'quick' | 'deep') => {
    setLoading(true);
    setError(null);

    // Generate or retrieve anonymous ID
    let stored = getStoredSession();
    let anonymousId = stored?.anonymousId || generateAnonymousId();

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymous_id: anonymousId, scan_type: scanType }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const { session: newSession } = await response.json();
      storeSession(newSession.id, anonymousId);
      setSession(newSession);
      return newSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSession = useCallback(async () => {
    const stored = getStoredSession();
    if (!stored?.sessionId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/sessions?session_id=${stored.sessionId}`);
      if (response.ok) {
        const { session: existingSession } = await response.json();
        setSession(existingSession);
      } else {
        // Session expired or deleted, clear it
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    session,
    loading,
    error,
    createSession,
    loadSession,
  };
}
