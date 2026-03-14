'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import Link from 'next/link';
import DraggableList from '@/components/admin/DraggableList';

interface Topic {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  sortOrder: number;
  _count: {
    courses: number;
    content: number;
  };
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingReorder, setIsSavingReorder] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/api/admin/topics');
      setTopics(res.data);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (newOrder: Topic[]) => {
    setTopics(newOrder); // Optimistic UI update
    setIsSavingReorder(true);
    try {
      const topicIds = newOrder.map(t => t.id);
      await api.post('/api/admin/topics/reorder', { topicIds });
    } catch (error) {
      const userMessage = getErrorMessage(error);
      alert(`Failed to save new order: ${userMessage}`);
      fetchTopics(); // Revert
    } finally {
      setIsSavingReorder(false);
    }
  };

  if (isLoading) {
    return <div>Loading topics...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Topics</h1>
          <p className="text-sm text-muted-foreground">Manage your root-level categories. Drag to reorder.</p>
        </div>
        <Link 
          href="/admin/topics/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
        >
          Create Topic
        </Link>
      </div>

      <div className="">
        {topics.length === 0 ? (
          <div className="flex items-center justify-center p-8 bg-white border rounded-md text-muted-foreground">
            No topics found. Create one to get started.
          </div>
        ) : (
          <div className="flex flex-col relative">
            {isSavingReorder && (
              <div className="absolute -top-6 right-0 text-xs text-blue-600 font-medium animate-pulse">
                Saving order...
              </div>
            )}
            <DraggableList 
              items={topics}
              onReorder={handleReorder}
              renderItem={(topic) => (
                <div className="flex items-center justify-between w-full pr-4 py-1">
                  <div className="flex items-center gap-4">
                    <span className="font-medium min-w-[150px]">{topic.name}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      topic.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {topic.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-sm text-gray-500 hidden md:inline-block">
                      {topic._count.courses} Courses • {topic._count.content} Standalone Lessons
                    </span>
                  </div>
                  <Link
                    href={`/admin/topics/${topic.id}/edit`}
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Edit
                  </Link>
                </div>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
