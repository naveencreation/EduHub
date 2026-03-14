'use client';

import { useEffect, useState } from 'react';
import CourseForm from '@/components/admin/CourseForm';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, topicsRes] = await Promise.all([
          api.get(`/api/admin/courses/${courseId}`),
          api.get('/api/admin/topics')
        ]);
        setInitialData(courseRes.data);
        setTopics(topicsRes.data);
      } catch (err) {
        setError('Failed to fetch course details.');
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchData();
  }, [courseId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course? Its associated content will become standalone.')) return;
    try {
      await api.delete(`/api/admin/courses/${courseId}`);
      router.push('/admin/courses');
      router.refresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete course');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Course</h1>
            <p className="text-sm text-muted-foreground">{initialData?.title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md border border-red-200 bg-red-50 py-2 px-4 text-sm font-medium text-red-600 shadow-sm hover:bg-red-100"
        >
          Delete Course
        </button>
      </div>

      <CourseForm initialData={initialData} courseId={courseId} topics={topics} />
    </div>
  );
}
