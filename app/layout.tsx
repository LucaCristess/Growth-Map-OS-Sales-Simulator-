import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Growth Map | Sales Scale Simulator',
  description: 'Run your sales simulation. Identify exactly where your sales system is breaking and unlock your revenue potential.',
  openGraph: {
    title: 'Growth Map | Sales Scale Simulator',
    description: 'Run your sales simulation. Identify exactly where your sales system is breaking.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
