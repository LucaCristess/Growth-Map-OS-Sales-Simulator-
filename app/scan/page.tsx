'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';

export default function ScanPage() {
  const router = useRouter();
  const { createSession, loading } = useSession();

  const handleScanSelect = async (type: 'quick' | 'deep') => {
    const session = await createSession(type);
    if (session) {
      router.push(`/scan/${type}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Back link */}
        <Link
          href="/"
          className="text-text-muted hover:text-text text-sm mb-12 inline-block transition-colors"
        >
          Back to home
        </Link>

        <h1 className="font-display text-4xl md:text-5xl text-text mb-4">
          Choose Your Scan
        </h1>
        <p className="text-text-secondary text-lg mb-16 max-w-lg mx-auto">
          Both scans deliver value. Deep scan gives you a more complete picture.
        </p>

        {/* Scan options */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Quick Scan */}
          <button
            onClick={() => handleScanSelect('quick')}
            disabled={loading}
            className="group bg-surface border border-border rounded-xl p-8 text-left hover:border-brand/30 transition-all duration-200 disabled:opacity-50"
          >
            <div className="text-text-muted text-sm mb-4">~2 minutes</div>
            <h2 className="text-xl font-medium text-text mb-3 group-hover:text-brand transition-colors">
              Quick Scan
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Essential metrics. Core constraint. Fast insight.
            </p>
          </button>

          {/* Deep Scan */}
          <button
            onClick={() => handleScanSelect('deep')}
            disabled={loading}
            className="group bg-surface border border-brand/20 rounded-xl p-8 text-left relative overflow-hidden disabled:opacity-50"
          >
            <div className="absolute top-4 right-4">
              <span className="bg-brand/10 text-brand text-xs font-medium px-2 py-1 rounded">
                Recommended
              </span>
            </div>
            <div className="text-text-muted text-sm mb-4">~5-8 minutes</div>
            <h2 className="text-xl font-medium text-text mb-3 group-hover:text-brand transition-colors">
              Deep Scan
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Full diagnostic. Complete revenue analysis. Actionable roadmap.
            </p>
          </button>
        </div>

        {loading && (
          <p className="text-text-muted text-sm mt-8">Creating session...</p>
        )}
      </div>
    </main>
  );
}
