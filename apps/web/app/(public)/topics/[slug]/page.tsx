import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FolderOpen, PlayCircle, BookOpen } from 'lucide-react';
import type { Topic } from '@/lib/api-types';

async function getTopic(slug: string): Promise<Topic | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${apiUrl}/api/topics/${slug}`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`Failed to fetch topic: HTTP ${res.status}`);
      throw new Error('Failed to fetch topic');
    }

    return await res.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching topic:', error.message);
    } else {
      console.error('Error fetching topic:', error);
    }
    throw error;
  }
}

export default async function TopicDetailPage({ params }: { params: { slug: string } }) {
  const topic = await getTopic(params.slug);

  if (!topic) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">{topic.name}</h1>
        {topic.description && (
          <p className="text-xl text-gray-500 max-w-3xl">
            {topic.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Main Content Area: Courses */}
        <div className="lg:col-span-2 space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <FolderOpen className="text-blue-500 w-6 h-6" />
              <h2 className="text-2xl font-bold text-gray-900">Structured Courses</h2>
            </div>
            
            {topic.courses && topic.courses.length > 0 ? (
              <div className="space-y-6">
                {topic.courses.map((course: any) => (
                  <Link key={course.id} href={`/courses/${course.slug}`} className="block group">
                    <div className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow sm:flex">
                      <div className="sm:w-1/3 bg-gray-100 relative aspect-video sm:aspect-auto">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50">
                            <BookOpen className="w-8 h-8 text-blue-200" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 sm:w-2/3 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                          {course.description || 'A comprehensive learning path guiding you from start to finish.'}
                        </p>
                        <div className="text-sm font-medium text-blue-600">
                          View Syllabus &rarr;
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No courses available in this topic yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar Area: Standalone Content */}
        <div>
          <div className="bg-gray-50 rounded-2xl p-6 border">
            <div className="flex items-center gap-3 mb-6">
              <PlayCircle className="text-purple-500 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-900">Standalone Lessons</h2>
            </div>

            {topic.content && topic.content.length > 0 ? (
              <div className="space-y-4">
                {topic.content.map((item: any) => (
                  <Link key={item.id} href={`/content/${item.slug}`} className="block group bg-white border p-4 rounded-xl hover:border-primary transition-colors">
                    <h4 className="font-semibold text-gray-900 group-hover:text-primary mb-1 line-clamp-2">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">{item.type}</span>
                      {item.durationSecs && <span>{Math.round(item.durationSecs / 60)} min read/watch</span>}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No standalone lessons available.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
