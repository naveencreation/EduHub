'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../lib/store';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Video,
  Tags,
  LogOut,
  Settings
} from 'lucide-react';
import api from '../lib/api';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Topics', href: '/admin/topics', icon: Library },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen },
  { name: 'Content', href: '/admin/content', icon: Video },
  { name: 'Tags', href: '/admin/tags', icon: Tags },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logoutAction } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/api/admin/auth/logout');
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      logoutAction();
    }
  };

  return (
      <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white/50">
      <div className="flex h-14 items-center border-b border-slate-200 px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-6 w-6 text-brand-emerald" />
          <span className="text-lg text-brand-dark">EduHub Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-brand-emerald hover:bg-emerald-50 ${
                  isActive ? 'bg-emerald-100 text-brand-emerald' : 'text-slate-600'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
