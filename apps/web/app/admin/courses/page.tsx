'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import DraggableList from '@/components/admin/DraggableList';

interface Course {
  id: string;
  topicId: string;
  title: string;
  slug: string;
  isPublished: boolean;
  sortOrder: number;
  topic: { name: string };
  _count: { content: number };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingReorder, setIsSavingReorder] = useState(false);

  useEffect(() => {
    fetchTopics();
    fetchCourses();
  }, [selectedTopicId]);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/api/admin/topics');
      setTopics(res.data);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const url = selectedTopicId ? `/api/admin/courses?topicId=${selectedTopicId}` : '/api/admin/courses';
      const res = await api.get(url);
      setCourses(res.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (newOrder: Course[]) => {
    // Only allow reordering if filtered by a single topic, otherwise the sortOrder logic is flawed across topics.
    if (!selectedTopicId) {
      alert("Please filter by a specific topic to reorder its courses.");
      return;
    }

    setCourses(newOrder); // Optimistic UI
    setIsSavingReorder(true);
    try {
      const courseIds = newOrder.map(c => c.id);
      await api.post('/api/admin/courses/reorder', { courseIds });
    } catch (e) {
      console.error('Failed to save reorder', e);
      alert('Failed to save new order.');
      fetchCourses(); // Revert
    } finally {
      setIsSavingReorder(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground">Manage structured learning paths.</p>
        </div>
        <Link 
          href="/admin/courses/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
        >
          Create Course
        </Link>
      </div>

      <div className="flex items-center gap-4 py-2">
        <label className="text-sm font-medium text-gray-700">Filter by Topic:</label>
        <select 
          className="border border-gray-300 rounded-md p-2 text-sm max-w-xs focus:ring-primary focus:border-primary"
          value={selectedTopicId}
          onChange={(e) => setSelectedTopicId(e.target.value)}
        >
          <option value="">All Topics (Reorder disabled)</option>
          {topics.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="">
        {isLoading ? (
          <div>Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="flex items-center justify-center p-8 bg-white border rounded-md text-muted-foreground">
            No courses found.
          </div>
        ) : (
          <div className="flex flex-col relative">
            {isSavingReorder && (
              <div className="absolute -top-6 right-0 text-xs text-blue-600 font-medium animate-pulse">
                Saving order...
              </div>
            )}
            
            {selectedTopicId ? (
              <DraggableList 
                items={courses}
                onReorder={handleReorder}
                renderItem={(course) => (
                  <CourseListItem course={course} />
                )}
              />
            ) : (
              // Non-draggable list when showing all topics
              <div className="border rounded-md bg-white">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50/50">
                    <tr>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Topic</th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Content</th>
                      <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">{course.title}</td>
                        <td className="p-4 align-middle text-gray-500">{course.topic.name}</td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-4 align-middle">{course._count.content}</td>
                        <td className="p-4 align-middle text-right space-x-2">
                          <Link href={`/admin/courses/${course.id}/edit`} className="text-primary hover:underline font-medium">Edit</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseListItem({ course }: { course: Course }) {
  return (
    <div className="flex items-center justify-between w-full pr-4 py-1">
      <div className="flex items-center gap-4">
        <span className="font-medium min-w-[150px]">{course.title}</span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{course.topic.name}</span>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
          course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {course.isPublished ? 'Published' : 'Draft'}
        </span>
        <span className="text-sm text-gray-500 hidden md:inline-block">
          {course._count.content} Lessons
        </span>
      </div>
      <Link
        href={`/admin/courses/${course.id}/edit`}
        className="text-primary hover:underline font-medium text-sm"
      >
        Edit
      </Link>
    </div>
  );
}
