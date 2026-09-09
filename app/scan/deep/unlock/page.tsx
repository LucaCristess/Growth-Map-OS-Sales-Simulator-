'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';

export default function DeepUnlockPage() {
  const router = useRouter();
  const { session } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session?.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save your information');
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/scan/deep/report');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-brand">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl text-text mb-3">You&apos;re in</h1>
          <p className="text-text-secondary">Loading your personalized report...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-10">
          <span className="text-brand text-sm font-medium tracking-wider uppercase">
            Unlock Your Report
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-text mt-4 mb-4">
            See your full simulation
          </h1>
          <p className="text-text-secondary text-sm">
            Target scenarios, improvement roadmap, and exactly what to fix first.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-8">
          <div className="mb-6">
            <label htmlFor="name" className="block text-text text-sm font-medium mb-2">
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full bg-background border border-border rounded-lg text-text px-4 py-3 focus:border-brand focus:outline-none transition-colors"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-text text-sm font-medium mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full bg-background border border-border rounded-lg text-text px-4 py-3 focus:border-brand focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-hover text-background font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Get My Full Report'}
          </button>

          <p className="text-text-muted text-xs text-center mt-4">
            We&apos;ll send your report to this email. No spam, ever.
          </p>
        </form>
      </div>
    </main>
  );
}
