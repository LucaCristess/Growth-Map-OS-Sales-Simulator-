'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Brand mark */}
        <div className="mb-8">
          <span className="text-brand text-sm font-medium tracking-widest uppercase">
            Growth Map
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-text mb-6 leading-tight">
          Sales Scale Simulator
        </h1>

        {/* Subheadline */}
        <p className="text-text-secondary text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
          Identify exactly where your sales system is breaking.
          See the revenue you're leaving on the table.
        </p>

        {/* CTA */}
        <button
          onClick={() => router.push('/scan')}
          className="bg-brand hover:bg-brand-hover text-background font-medium px-8 py-4 rounded-lg text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Run Your Sales Scale Simulation
        </button>

        {/* Trust signals */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-text-muted text-sm">
          <span>Free & Instant</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>No Credit Card</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>2-Minute Scan</span>
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/[0.02] to-transparent" />
      </div>
    </main>
  );
}
