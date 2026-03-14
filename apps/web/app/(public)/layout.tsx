import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EduHub - Free Online Learning Platform',
  description: 'Access hundreds of courses, video lessons, podcasts, and articles. Build real skills at your own pace — no subscription needed.',
  keywords: ['online learning', 'courses', 'education', 'free', 'learning platform'],
  openGraph: {
    title: 'EduHub - Free Online Learning',
    description: 'Learn anything, completely free. Access our complete collection of courses and lessons.',
    url: 'https://eduhub.com',
    siteName: 'EduHub',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduHub - Free Online Learning',
    description: 'Learn new skills online for free.',
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
