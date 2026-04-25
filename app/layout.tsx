import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import Script from 'next/script';

import { Providers } from '@/components/providers';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Pulse API',
  description:
    'Real-time monitoring and analytics for your critical API infrastructure.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        geistMono.variable,
        'font-sans',
        inter.variable,
      )}
    >
      <body className="min-h-full bg-background">
        {process.env.NODE_ENV === 'development' && (
          <Script
            id="react-scan"
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        <Providers>
          <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-16">
              <span className="text-base font-semibold tracking-tight">
                Pulse API
              </span>
              <ThemeToggle />
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}
