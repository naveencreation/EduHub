import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, PlayCircle, Clock, CheckCircle2 } from 'lucide-react';

async function getCourse(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const res = await fetch(`${apiUrl}/api/courses/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch course');
  }
  return res.json();
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourse(params.slug);

  if (!course) {
    notFound();
  }

  // Calculate total duration (naive fallback if no durationSecs)
  const totalSeconds = course.content?.reduce((acc: number, item: any) => acc + (item.durationSecs || 0), 0) || 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Link href={`/topics/${course.topic?.slug}`} className="text-blue-400 hover:text-blue-300 font-semibold tracking-wide text-sm uppercase mb-4 inline-block">
                {course.topic?.name}
              </Link>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">{course.title}</h1>
              <p className="text-xl text-gray-300 max-w-2xl mb-8">
                {course.description || 'A comprehensive learning path guiding you from start to finish.'}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-300 mb-8">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-gray-400" />
                  <span>{course.content?.length || 0} Lessons</span>
                </div>
                {totalSeconds > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>{durationText} Total</span>
                  </div>
                )}
              </div>

              {course.content && course.content.length > 0 && (
                <Link 
                  href={`/content/${course.content[0].slug}`} 
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-gray-900 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-transform hover:scale-105"
                >
                  Start Course
                </Link>
              )}
            </div>
            
            <div className="hidden lg:block relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <BookOpen className="w-24 h-24 text-gray-700" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Course Syllabus</h2>
          
          <div className="border rounded-2xl bg-white overflow-hidden shadow-sm">
            {course.content && course.content.length > 0 ? (
              <div className="divide-y">
                {course.content.map((item: any, index: number) => (
                  <Link 
                    key={item.id} 
                    href={`/content/${item.slug}`}
                    className="flex items-start sm:items-center gap-4 p-5 hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {item.description || 'Lesson material.'}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center gap-3 text-sm text-gray-400">
                      <span className="hidden sm:inline-block bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                        {item.type}
                      </span>
                      {item.durationSecs && (
                        <span>{Math.round(item.durationSecs / 60)}m</span>
                      )}
                      <PlayCircle className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                Syllabus is currently empty.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
