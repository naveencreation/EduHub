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

// A stable color palette for topic cards
const TOPIC_COLORS = [
  { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', badge: 'text-indigo-600' },
  { bg: 'bg-sky-50', icon: 'bg-sky-100 text-sky-600', badge: 'text-sky-600' },
  { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', badge: 'text-amber-600' },
  { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', badge: 'text-emerald-600' },
  { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', badge: 'text-rose-600' },
  { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', badge: 'text-violet-600' },
  { bg: 'bg-teal-50', icon: 'bg-teal-100 text-teal-600', badge: 'text-teal-600' },
  { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', badge: 'text-orange-600' },
];

export default async function HomePage() {
  const topics = await getTopics();
  const recentCourses = await getRecentCourses();

  return (
    <div className="flex flex-col">
      {/* JSON-LD Schema for SEO */}
      <SchemaMarkup />

      {/* ─── Hero ─── */}
      <section className="relative bg-white pt-20 pb-24 sm:pt-28 sm:pb-32 overflow-hidden">
        {/* Subtle dot grid background */}
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Soft gradient overlay */}
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 mb-8">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wide uppercase">Free Learning Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Learn anything,{' '}
            <span className="text-primary">completely free.</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-slate-500 leading-relaxed">
            Access hundreds of courses, video lessons, podcasts, and articles. Build real skills at your own pace — no subscription needed.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors"
            >
              Browse Topics
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              View Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Topics Grid ─── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Categories</p>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Browse by Topic</h2>
            </div>
            <Link href="/topics" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
              All Topics <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {topics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {topics.map((topic: Topic, i: number) => {
                const palette = TOPIC_COLORS[i % TOPIC_COLORS.length];
                return (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.slug}`}
                    className={`group flex flex-col gap-4 p-5 rounded-2xl ${palette.bg} border border-transparent hover:border-slate-200 hover:shadow-card-hover transition-all`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${palette.icon} flex items-center justify-center shrink-0`}>
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-primary transition-colors truncate">
                        {topic.name}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {topic.description || 'Explore lessons and courses on this topic.'}
                      </p>
                    </div>
                    <div className={`flex items-center gap-3 text-xs font-medium ${palette.badge}`}>
                      <span>{topic._count?.courses || 0} Courses</span>
                      <span className="text-slate-300">·</span>
                      <span>{topic._count?.content || 0} Lessons</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-14 text-slate-400">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No topics have been added yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Featured Courses ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Learning Paths</p>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Featured Courses</h2>
            </div>
            <Link href="/courses" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
              All Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentCourses.map((course: Course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group flex flex-col rounded-2xl border border-slate-100 overflow-hidden hover:shadow-card-hover hover:border-slate-200 transition-all bg-white"
                >
                  <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-50">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                        <BookOpen className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                    {course.topic && typeof course.topic === 'object' && 'name' in course.topic && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                        {course.topic.name}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1 leading-relaxed">
                      {course.description || 'Start learning with this comprehensive course.'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-auto pt-4 border-t border-slate-50">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{course._count?.content || 0} lessons included</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-14 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No courses have been added yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="bg-slate-950 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to start learning?
          </h2>
          <p className="text-slate-400 mb-8 text-base">
            Everything is completely free. No hidden fees, no account required to browse.
          </p>
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-lg"
          >
            Explore All Topics <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
