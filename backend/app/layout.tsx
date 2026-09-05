import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SWARA — AAC Communication System',
  description:
    'AI-powered Augmentative and Alternative Communication system for people who cannot reliably communicate through speech.',
  keywords: ['AAC', 'augmentative communication', 'accessibility', 'speech', 'disability'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
