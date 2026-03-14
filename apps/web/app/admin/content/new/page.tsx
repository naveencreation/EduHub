'use client';

import { useEffect, useState } from 'react';
import ContentForm from '@/components/admin/ContentForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function NewContentPage() {
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [tRes, cRes, tagsRes] = await Promise.all([
          api.get('/api/admin/topics'),
          api.get('/api/admin/courses'),
          api.get('/api/admin/tags')
        ]);
        setTopics(tRes.data);
        setCourses(cRes.data);
        setTags(tagsRes.data);
      } catch (error) {
        console.error('Failed to fetch dependencies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDependencies();
  }, []);

  if (isLoading) return <div>Loading form dependencies...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/admin/content" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Upload New Content</h1>
          <p className="text-sm text-muted-foreground">Add a video, audio track, image, or blog post.</p>
        </div>
      </div>

      <ContentForm topics={topics} courses={courses} allTags={tags} />
    </div>
  );
}
