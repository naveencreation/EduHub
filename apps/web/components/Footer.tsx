import { BookOpen, Github, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          <div className="pb-6 text-center">
            <Link href="/topics" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
              Topics
            </Link>
          </div>
          <div className="pb-6 text-center">
            <Link href="/courses" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
              Courses
            </Link>
          </div>
          <div className="pb-6 text-center">
            <Link href="/about" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
              About
            </Link>
          </div>
          <div className="pb-6 text-center">
            <Link href="/admin" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
              Admin Login
            </Link>
          </div>
        </nav>
        <div className="mt-10 flex justify-center space-x-10">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">GitHub</span>
            <Github className="h-6 w-6" aria-hidden="true" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-6 w-6" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-10 flex flex-col items-center justify-center">
          <BookOpen className="h-8 w-8 text-gray-300 mb-4" />
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} EduHub, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
