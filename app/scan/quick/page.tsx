'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';
import { useAnswers } from '@/lib/hooks/useAnswers';
import { Wizard } from '@/components/wizard/Wizard';
import { QUICK_SCAN_SECTIONS } from '@/lib/config/questions';

export default function QuickScanPage() {
  const router = useRouter();
  const { session, loading: sessionLoading, createSession } = useSession();
  const { answers, setAnswer, saving } = useAnswers(session?.id ?? null);
  const createdRef = useRef(false);

  // Auto-create session if none exists
  useEffect(() => {
    if (!sessionLoading && !session && !createdRef.current) {
      createdRef.current = true;
      createSession('quick');
    }
  }, [session, sessionLoading, createSession]);

  const handleComplete = async () => {
    if (session?.id) {
      try {
        await fetch('/api/sessions/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: session.id }),
        });
      } catch {
        // Continue to results even if network fails
      }
    }
    router.push('/scan/quick/results');
  };

  return (
    <Wizard
      sections={QUICK_SCAN_SECTIONS}
      answers={answers}
      onAnswer={setAnswer}
      onComplete={handleComplete}
      scanType="quick"
      loading={saving}
    />
  );
}
