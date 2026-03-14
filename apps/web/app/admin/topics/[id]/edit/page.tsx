'use client';

import { useEffect, useState } from 'react';
import TopicForm from '@/components/admin/TopicForm';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function EditTopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await api.get(`/api/admin/topics/${topicId}`);
        setInitialData(res.data);
      } catch (err) {
        setError('Failed to fetch topic details.');
      } finally {
        setIsLoading(false);
      }
    };
    if (topicId) fetchTopic();
  }, [topicId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this topic? This action cannot be undone and will delete all associated courses and content.')) return;
    try {
      await api.delete(`/api/admin/topics/${topicId}`);
      router.push('/admin/topics');
      router.refresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete topic');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/topics" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Topic</h1>
            <p className="text-sm text-muted-foreground">{initialData?.name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md border border-red-200 bg-red-50 py-2 px-4 text-sm font-medium text-red-600 shadow-sm hover:bg-red-100"
        >
          Delete Topic
        </button>
      </div>

      <TopicForm initialData={initialData} topicId={topicId} />
    </div>
  );
}
