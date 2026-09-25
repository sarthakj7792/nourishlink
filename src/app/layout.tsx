import type { Metadata } from 'next';
import './globals.css';
import { AccessibilityProvider } from '@/components/AccessibilityProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'NourishLink | Local Food Bank Network & Surplus Food Distribution',
  description:
    'A mission-critical community food distribution platform connecting food donors, food banks, and recipients in need with WCAG AAA accessibility, real-time tracking, and AI triage.',
  keywords: ['food bank', 'food rescue', 'zero hunger', 'community pantry', 'food donation', 'accessibility'],
  authors: [{ name: 'Sarthak Sethi' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        <AccessibilityProvider>
          <Navbar />
          <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
