'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';
import { useAnswers } from '@/lib/hooks/useAnswers';
import { Wizard } from '@/components/wizard/Wizard';
import { QUICK_SCAN_SECTIONS } from '@/lib/config/questions';
import Link from 'next/link';

export default function QuickScanPage() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const { answers, setAnswer, saving } = useAnswers(session?.id ?? null);

  // Check for stored session but no active session — return visitor
  const hasStoredSession = typeof window !== 'undefined' && localStorage.getItem('growthmap_session');

  const handleComplete = () => {
    // Mark session as completed
    if (session) {
      fetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id }),
      });
    }
    router.push('/scan/quick/results');
  };

  // Loading state
  if (sessionLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-text-muted">Loading...</div>
      </main>
    );
  }

  // No session — redirect to scan selection
  if (!session && !sessionLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl text-text mb-4">Start fresh</h1>
          <p className="text-text-secondary mb-8">
            Let&apos;s begin your Quick Scan.
          </p>
          <Link
            href="/scan"
            className="bg-brand hover:bg-brand-hover text-background font-medium px-6 py-3 rounded-lg transition-all duration-200"
          >
            Choose Your Scan
          </Link>
        </div>
      </main>
    );
  }

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
