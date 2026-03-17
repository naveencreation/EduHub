import Link from 'next/link';
import { BookOpen, Layers, ChevronRight, GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';
import type { Topic, Course } from '@/lib/api-types';

/**
 * JSON-LD Schema for SEO
 */
function SchemaMarkup() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'EduHub',
    url: 'https://eduhub.com',
    description: 'Free online learning platform with courses and lessons',
    sameAs: [
      'https://twitter.com/eduhub',
      'https://facebook.com/eduhub',
    ],
    founder: {
      '@type': 'Organization',
      name: 'EduHub Team',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Fetch all published topics with proper error handling
 */
async function getTopics(): Promise<Topic[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(`${apiUrl}/api/topics`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Failed to fetch topics: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching topics:', error.message);
    } else {
      console.error('Error fetching topics:', error);
    }
    return [];
  }
}

/**
 * Fetch all published courses and return first 3 as featured
 */
async function getRecentCourses(): Promise<Course[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(`${apiUrl}/api/courses`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Failed to fetch courses: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, 3) : [];
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching courses:', error.message);
    } else {
      console.error('Error fetching courses:', error);
    }
    return [];
  }
}

// Brand-aligned color palette for topic cards: Emerald, Coral, Slate
const TOPIC_COLORS = [
  { bg: 'bg-emerald-50', icon: 'bg-brand-emerald text-white', badge: 'text-brand-emerald' },
  { bg: 'bg-orange-50', icon: 'bg-accent text-white', badge: 'text-accent' },
  { bg: 'bg-emerald-50', icon: 'bg-brand-emerald text-white', badge: 'text-brand-emerald' },
  { bg: 'bg-slate-100', icon: 'bg-slate-600 text-white', badge: 'text-slate-600' },
  { bg: 'bg-emerald-50', icon: 'bg-emerald-600 text-white', badge: 'text-emerald-600' },
  { bg: 'bg-orange-50', icon: 'bg-orange-500 text-white', badge: 'text-orange-500' },
  { bg: 'bg-slate-100', icon: 'bg-slate-700 text-white', badge: 'text-slate-700' },
  { bg: 'bg-emerald-50', icon: 'bg-teal-600 text-white', badge: 'text-teal-600' },
];

export default async function HomePage() {
  const topics = await getTopics();
  const recentCourses = await getRecentCourses();

  return (
    <div className="flex flex-col">
      {/* JSON-LD Schema for SEO */}
      <SchemaMarkup />

      {/* ─── Hero ─── */}
      <section className="relative bg-white pt-16 pb-16 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24 overflow-hidden">
        {/* Soft dot grid background */}
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 mb-8">
                <GraduationCap className="w-4 h-4 text-brand-emerald" />
                <span className="text-xs font-semibold text-brand-emerald tracking-wide uppercase">Free Learning Platform</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-brand-dark leading-tight mb-6">
                Learn anything,
                <span className="text-brand-emerald"> completely free.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
                Explore curated courses, lessons, and hands-on projects — no subscription or gatekeeping.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
                <Link
                  href="/topics"
                  aria-label="Browse topics"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-emerald px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-all"
                >
                  Browse Topics
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/courses"
                  aria-label="View courses"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-all"
                >
                  View Courses
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 sm:p-5 border border-emerald-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-emerald text-white shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-dark">All content is free</p>
                    <p className="text-xs text-slate-600 mt-1">No paywalls, no subscriptions, ever.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-orange-50 p-4 sm:p-5 border border-orange-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-dark">Learn at your pace</p>
                    <p className="text-xs text-slate-600 mt-1">Pick a course and move at your speed.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 sm:p-5 border border-emerald-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-emerald text-white shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-dark">No surprises</p>
                    <p className="text-xs text-slate-600 mt-1">No hidden fees, no trial periods — learning.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 sm:p-5 border border-blue-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-dark">High-quality courses</p>
                    <p className="text-xs text-slate-600 mt-1">Curated by experts, for everyone.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="w-full max-w-lg">
                <img 
                  src="/illustrations/Lesson-bro.svg" 
                  alt="Student learning illustration" 
                  className="w-full h-auto drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Topics Grid ─── */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Column: Illustration ONLY */}
            <div className="lg:col-span-5 hidden md:flex items-center justify-center lg:justify-start">
              <div className="w-full max-w-sm lg:max-w-md">
                <img 
                  src="/illustrations/Learning-rafiki.svg" 
                  alt="Student exploring learning topics"
                  className="w-full h-auto drop-shadow-lg"
                />
              </div>
            </div>

            {/* Right Column: Header + Cards */}
            <div className="lg:col-span-7 md:col-span-6 col-span-1">
              
              {/* Header Section */}
              <div className="mb-10">
                <p className="text-xs font-semibold text-brand-emerald uppercase tracking-widest mb-2">Categories</p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark tracking-tight mb-3">Browse by Topic</h2>
                <p className="text-sm text-slate-600">Explore our learning categories and find what interests you</p>
              </div>

              {/* View All Topics Link */}
              <div className="mb-8">
                <Link href="/topics" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-emerald hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald focus-visible:ring-offset-2 transition-colors">
                  View All Topics <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Cards Grid */}
              {topics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
              {topics.map((topic: Topic, i: number) => {
                const palette = TOPIC_COLORS[i % TOPIC_COLORS.length];
                return (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.slug}`}
                    className={`group flex flex-col gap-4 p-5 sm:p-6 rounded-xl ${palette.bg} border border-slate-100 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald focus-visible:ring-offset-2`}
                  >
                    <div className={`w-12 h-12 rounded-lg ${palette.icon} flex items-center justify-center shrink-0 shadow-md`}>
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-brand-dark mb-2 group-hover:text-brand-emerald transition-colors truncate">
                        {topic.name}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2 leading-snug">
                        {topic.description || 'Explore lessons and courses on this topic.'}
                      </p>
                    </div>
                    <div className={`pt-3 border-t border-slate-200 flex items-center gap-3 text-xs font-medium leading-normal ${palette.badge}`}>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-current"></span>
                        {topic._count?.courses || 0} {topic._count?.courses === 1 ? 'Course' : 'Courses'}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-current"></span>
                        {topic._count?.content || 0} {topic._count?.content === 1 ? 'Lesson' : 'Lessons'}
                      </span>
                    </div>
                  </Link>
                );
              })}
                </div>
              ) : (
                <div className="text-center py-16 rounded-2xl bg-white border border-slate-200">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-4">
                    <Layers className="w-7 h-7 text-brand-emerald" />
                  </div>
                  <h3 className="text-lg font-semibold text-brand-dark mb-2">No topics yet</h3>
                  <p className="text-sm text-slate-600 mb-4">Check back soon! Topics will be added regularly.</p>
                  <Link href="/courses" className="inline-flex items-center gap-2 rounded-lg bg-brand-emerald px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                    Browse Courses Instead
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Courses ─── */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 mb-12">
            <div className="flex-1">
              <p className="text-xs font-semibold text-brand-emerald uppercase tracking-widest mb-2">Learning Paths</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark tracking-tight">Featured Courses</h2>
              <p className="text-sm text-slate-600 mt-2">Discover our most popular courses and expand your skills</p>
            </div>
            <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-emerald hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald focus-visible:ring-offset-2 transition-colors whitespace-nowrap">
              View All Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {recentCourses.map((course: Course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group flex flex-col rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald focus-visible:ring-offset-2"
                >
                  <div className="aspect-[16/9] w-full relative overflow-hidden bg-gradient-to-br from-emerald-50 to-slate-100">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="object-cover w-full h-full group-hover:scale-[1.05] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100">
                        <BookOpen className="w-12 h-12 text-emerald-200" />
                      </div>
                    )}
                    {course.topic && typeof course.topic === 'object' && 'name' in course.topic && (
                      <span className="absolute top-3 left-3 px-3 py-1.5 bg-brand-emerald text-white backdrop-blur-sm rounded-full text-xs font-semibold shadow-md">
                        {course.topic.name}
                      </span>
                    )}
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-brand-dark mb-2 group-hover:text-brand-emerald transition-colors line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1 leading-snug">
                      {course.description || 'Start learning with this comprehensive course.'}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-brand-emerald mt-auto pt-4 border-t border-slate-100">
                      <BookOpen className="w-4 h-4" />
                      <span>{course._count?.content || 0} {course._count?.content === 1 ? 'lesson' : 'lessons'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white mb-4">
                <BookOpen className="w-7 h-7 text-brand-emerald" />
              </div>
              <h3 className="text-lg font-semibold text-brand-dark mb-2">No courses yet</h3>
              <p className="text-sm text-slate-600 mb-4">Featured courses will appear here soon.</p>
              <Link href="/topics" className="inline-flex items-center gap-2 rounded-lg bg-brand-emerald px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                Explore Topics
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="relative bg-gradient-to-r from-brand-emerald to-emerald-700 py-20 sm:py-24 lg:py-28 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 h-80 lg:w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 h-80 lg:w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 mb-6 border border-white/30">
            <span className="inline-block w-2 h-2 rounded-full bg-white/80"></span>
            <span className="text-xs font-semibold text-white uppercase tracking-wide">Limited Time Offer</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight max-w-2xl mx-auto">
            Ready to start learning?
          </h2>

          <p className="text-lg sm:text-lg text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners exploring free courses, lessons, and projects. Everything you need to grow is here—no hidden fees, no paywalls.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-emerald px-8 py-4 text-base font-semibold hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-emerald transition-all shadow-xl"
            >
              Explore All Topics <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm text-white px-8 py-4 text-base font-semibold border border-white/30 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 transition-all"
            >
              Browse Courses
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-white/70 mt-8">
            ✓ 100% free • ✓ No signup required • ✓ Learn at your own pace
          </p>
        </div>
      </section>

    </div>
  );
}
