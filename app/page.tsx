'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative topo-bg">
        {/* Background contour lines */}
        <div className="absolute inset-0 contour-lines opacity-40 pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Brand mark */}
          <div className="mb-8">
            <span className="text-brand text-sm font-medium tracking-widest uppercase">
              Growth Map OS™
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-text mb-6 leading-tight">
            Find the exact leak<br />in your sales system
          </h1>

          {/* Subheadline */}
          <p className="text-text-secondary text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
            See your #1 bottleneck and get free resources to fix it — no cost, no card, under 2 minutes.
          </p>

          {/* CTA */}
          <button
            onClick={() => router.push('/scan')}
            className="bg-brand hover:bg-brand-hover text-background font-semibold px-10 py-4 rounded-lg text-base transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_0_1px_#C9A227]"
          >
            See My Bottleneck
          </button>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-text-muted text-sm">
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Free &amp; Instant
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              No Credit Card
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              2-Minute Scan
            </span>
          </div>
        </div>
      </section>

      {/* What This Reveals — example scenarios */}
      <section className="px-6 py-20 bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-brand text-sm font-medium tracking-wider uppercase">
              What This Reveals
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-text mt-4 mb-4">
              Real bottlenecks, not guesses
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Every sales system has one constraint holding back the most revenue. Here are three we commonly see.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Scenario 1 */}
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="text-brand text-sm font-medium mb-3">Show Rate</div>
              <h3 className="font-display text-xl text-text mb-3">
                80 booked calls, 35% show rate
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                This coaching business thought they needed more leads. They were actually losing $22K/month because booked callers weren&apos;t showing up.
              </p>
              <div className="text-brand font-display text-2xl">$22K/mo gap</div>
            </div>

            {/* Scenario 2 */}
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="text-brand text-sm font-medium mb-3">Close Rate</div>
              <h3 className="font-display text-xl text-text mb-3">
                60% show rate, 15% close rate
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                An agency getting plenty of conversations but converting less than 1 in 6. Fixing close rate alone would add $35K/month.
              </p>
              <div className="text-brand font-display text-2xl">$35K/mo gap</div>
            </div>

            {/* Scenario 3 */}
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="text-brand text-sm font-medium mb-3">AOV</div>
              <h3 className="font-display text-xl text-text mb-3">
                Good rates, low ticket
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                A consultant closing 40% of calls at $800 AOV. Raising AOV to $2,500 — same effort, same close rate — would 3x revenue.
              </p>
              <div className="text-brand font-display text-2xl">3x revenue</div>
            </div>
          </div>
        </div>
      </section>

      {/* Story section — composite narrative */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-text-secondary text-lg leading-relaxed max-w-2xl mx-auto">
            This is the pattern we see on almost every call: a founder doing $30–40K months, working every hour they have, sales calls stacking up, no idea which lever to pull.
            Two minutes with this scan usually surfaces the same thing — it&apos;s rarely the thing they thought it was.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-16 bg-surface">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl text-text mb-4">
            Ready to find your bottleneck?
          </h2>
          <p className="text-text-secondary mb-8">
            Free, instant, no credit card required.
          </p>
          <button
            onClick={() => router.push('/scan')}
            className="bg-brand hover:bg-brand-hover text-background font-semibold px-10 py-4 rounded-lg text-base transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_0_1px_#C9A227]"
          >
            Run Your Free Scan
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-text-muted text-sm">
          <span>Growth Map OS™</span>
          <span>Sales Scale Simulator</span>
        </div>
      </footer>
    </main>
  );
}
