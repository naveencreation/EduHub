'use client';

import { useEffect, useState } from 'react';
import ContentForm from '@/components/admin/ContentForm';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function EditContentPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, tRes, cRes, tagsRes] = await Promise.all([
          api.get(`/api/admin/content/${contentId}`),
          api.get('/api/admin/topics'),
          api.get('/api/admin/courses'),
          api.get('/api/admin/tags')
        ]);
        
        setInitialData(contentRes.data);
        setTopics(tRes.data);
        setCourses(cRes.data);
        setTags(tagsRes.data);
      } catch (err) {
        setError('Failed to fetch content details.');
      } finally {
        setIsLoading(false);
      }
    };
    if (contentId) fetchData();
  }, [contentId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content? This cannot be undone.')) return;
    try {
      await api.delete(`/api/admin/content/${contentId}`);
      router.push('/admin/content');
      router.refresh();
    } catch (error) {
      const userMessage = getErrorMessage(error);
      alert(`Failed to delete content: ${userMessage}`);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/content" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Content</h1>
            <p className="text-sm text-muted-foreground">{initialData?.title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md border border-red-200 bg-red-50 py-2 px-4 text-sm font-medium text-red-600 shadow-sm hover:bg-red-100"
        >
          Delete Content
        </button>
      </div>

      <ContentForm initialData={initialData} contentId={contentId} topics={topics} courses={courses} allTags={tags} />
    </div>
  );
}
