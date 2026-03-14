'use client';

import AdminGuard from '@/components/AdminGuard';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin';

  return (
    <AdminGuard>
      {isLoginPage ? (
        // Login page has no sidebar
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          {children}
        </div>
      ) : (
        // Dashboard pages have the sidebar
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="hidden border-r bg-muted/40 md:block">
            <Sidebar />
          </div>
          <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
              {/* Mobile sidebar trigger could go here */}
              <div className="w-full flex-1">
                {/* Search or breadcrumbs could go here */}
              </div>
            </header>
            <main className="flex-1 p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
