'use client';

import { useEffect, useState } from 'react';
import CourseForm from '@/components/admin/CourseForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function NewCoursePage() {
  const [topics, setTopics] = useState([]);
  
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/api/admin/topics');
        setTopics(res.data);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      }
    };
    fetchTopics();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/admin/courses" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Course</h1>
          <p className="text-sm text-muted-foreground">Add a new structured course inside a topic.</p>
        </div>
      </div>

      <CourseForm topics={topics} />
    </div>
  );
}
