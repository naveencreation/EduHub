import Link from 'next/link';
import { BookOpen, Search } from 'lucide-react';

async function getCourses() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const res = await fetch(`${apiUrl}/api/courses`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export default async function CoursesIndexPage() {
  const courses = await getCourses();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">All Courses</h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          Structured learning paths designed to take you from beginner to expert.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course: any) => (
          <Link key={course.id} href={`/courses/${course.slug}`} className="group flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-[16/9] w-full bg-gray-100 relative">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
                  <BookOpen className="w-12 h-12 text-indigo-200" />
                </div>
              )}
              {course.topic && (
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm shadow-sm rounded-full text-xs font-semibold text-gray-700">
                    {course.topic.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">{course.title}</h2>
              <p className="text-gray-600 mb-6 flex-1 text-sm line-clamp-3">
                {course.description || 'Start learning today with this comprehensive course.'}
              </p>
              
              <div className="border-t pt-4 flex items-center justify-between text-sm font-medium text-gray-500">
                <span>{course._count?.content || 0} Lessons</span>
                <span className="text-primary font-bold">Free</span>
              </div>
            </div>
          </Link>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No courses published yet</h3>
            <p className="mt-1 text-gray-500">Check back later for new content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
