import Link from 'next/link';
import { BookOpen } from 'lucide-react';

async function getTopics() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const res = await fetch(`${apiUrl}/api/topics`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export default async function TopicsIndexPage() {
  const topics = await getTopics();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">All Topics</h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          Browse our complete collection of educational categories. Find exactly what you want to learn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {topics.map((topic: any) => (
          <Link key={topic.id} href={`/topics/${topic.slug}`} className="group flex flex-col bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center p-3">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">{topic.name}</h2>
              </div>
            </div>
            <p className="text-gray-600 mb-6 flex-1">{topic.description || 'Dive into this topic to explore courses and singular lessons.'}</p>
            
            <div className="border-t pt-4 flex items-center justify-between text-sm font-medium text-gray-500">
              <span>{topic._count?.courses || 0} Courses</span>
              <span>{topic._count?.content || 0} Lessons</span>
            </div>
          </Link>
        ))}

        {topics.length === 0 && (
          <p className="text-gray-500 col-span-full">No topics available at the moment.</p>
        )}
      </div>
    </div>
  );
}
