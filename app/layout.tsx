import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Growth Map OS™ — Sales Scale Simulator',
  description: 'Find the exact leak in your sales system. See your #1 bottleneck and get free resources to fix it — no cost, no card, under 2 minutes.',
  openGraph: {
    title: 'Growth Map OS™ — Sales Scale Simulator',
    description: 'Find the exact leak in your sales system. See your #1 bottleneck and get free resources to fix it.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-background text-text antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
