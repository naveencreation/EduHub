import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduHub - Free Educational Content',
  description: 'Access free courses, videos, podcasts, and educational content',
  openGraph: {
    title: 'EduHub - Free Educational Content',
    description: 'Access free courses, videos, podcasts, and educational content',
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
      <body>{children}</body>
    </html>
  );
}
