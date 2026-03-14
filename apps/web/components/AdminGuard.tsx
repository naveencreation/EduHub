'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../lib/store';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAdminAuthenticated && pathname !== '/admin') {
        router.push('/admin');
      } else if (isAdminAuthenticated && pathname === '/admin') {
        // If logged in and on the login page, redirect to dashboard
        router.push('/admin/dashboard');
      }
    }
  }, [isAdminAuthenticated, pathname, mounted, router]);

  // Prevent hydration mismatch or showing protected content until mounted
  if (!mounted) {
    return null;
  }

  // If not authenticated and not on the login page, we'll wait for the redirect
  if (!isAdminAuthenticated && pathname !== '/admin') {
    return null;
  }

  return <>{children}</>;
}
