import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ElevateFlow - AI Lead Qualification',
  description: 'AI-driven lead qualification for crafts companies',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
