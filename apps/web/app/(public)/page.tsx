import Link from 'next/link';
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

// This is a Server Component. We can fetch data directly or use our axios instance carefully.
// Next.js fetch natively supports deduping and caching. Since we are using an external Express API,
// we can use the native fetch for Server Components to get Next.js caching benefits.
async function getTopics() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const res = await fetch(`${apiUrl}/api/topics`, { next: { revalidate: 60 } });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

async function getRecentCourses() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // Assuming the public courses route supports some form of fetching all or recent.
  // We'll fetch all and slice for the homepage.
  const res = await fetch(`${apiUrl}/api/courses`, { next: { revalidate: 60 } });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.slice(0, 3); // 3 recent
}

export default async function HomePage() {
  const topics = await getTopics();
  const recentCourses = await getRecentCourses();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-32 sm:pt-24 sm:pb-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 mb-8">
            Master Any Subject with <br/><span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">EduHub</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            Access hundreds of free courses, videos, podcasts, and articles. Elevate your skills at your own pace, completely free.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/topics" className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-black hover:bg-gray-800 rounded-full shadow-sm transition-all">
              Explore Topics
            </Link>
            <Link href="/courses" className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-full shadow-sm transition-all">
              Browse Courses
            </Link>
          </div>
        </div>
        
        {/* Decorative background block */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}></div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Explore Categories</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {topics.length > 0 ? topics.map((topic: any) => (
              <Link key={topic.id} href={`/topics/${topic.slug}`} className="group relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-100 flex flex-col items-start gap-4 h-full">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center p-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{topic.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{topic.description || 'Explore courses and lessons in this topic.'}</p>
                </div>
                <div className="mt-auto pt-4 flex gap-3 text-xs font-medium text-gray-400">
                  <span>{topic._count?.courses || 0} Courses</span>
                  <span>•</span>
                  <span>{topic._count?.content || 0} Lessons</span>
                </div>
              </Link>
            )) : (
              <p className="text-gray-500">No topics available yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Featured Courses</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentCourses.length > 0 ? recentCourses.map((course: any) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="flex flex-col group rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all h-full bg-white">
                <div className="aspect-[16/9] w-full bg-gray-100 relative overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                      <BookOpen className="w-12 h-12 text-blue-200" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm shadow-sm rounded-full text-xs font-semibold text-gray-700">
                      {course.topic?.name}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{course.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">{course.description || 'Start learning today with this comprehensive course.'}</p>
                  <div className="flex items-center text-sm font-medium text-gray-400 mt-auto">
                    <span>{course._count?.content || 0} Lessons included</span>
                  </div>
                </div>
              </Link>
            )) : (
              <p className="text-gray-500">No courses available yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
