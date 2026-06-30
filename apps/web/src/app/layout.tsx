import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LearnHub - Community-Driven AI Learning Platform',
  description: 'Create, share, and learn from AI-generated courses. The GitHub for Learning.',
  keywords: ['learning', 'courses', 'AI', 'education', 'community'],
  openGraph: {
    title: 'LearnHub',
    description: 'AI-powered community learning platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
