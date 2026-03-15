import { BookOpen, Github, Twitter } from 'lucide-react';
import Link from 'next/link';

const footerLinks = [
  { href: '/topics', label: 'Topics' },
  { href: '/courses', label: 'Courses' },
  { href: '/admin', label: 'Admin' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-slate-400 mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-brand-emerald rounded-md flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">EduHub</span>
            </Link>
            <p className="text-sm text-center sm:text-left text-slate-500 max-w-xs">
              Free, high-quality educational content for everyone.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center sm:justify-end gap-x-8 gap-y-3" aria-label="Footer">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-700 pt-8">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} EduHub. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-slate-600 hover:text-slate-300 transition-colors">
              <span className="sr-only">GitHub</span>
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-300 transition-colors">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
