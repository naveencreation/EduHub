'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface ContentItem {
  id: string;
  topicId: string;
  courseId: string | null;
  title: string;
  slug: string;
  type: string;
  isPublished: boolean;
  topic: { name: string };
  course?: { title: string };
  contentTags: { tag: { name: string } }[];
}

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchContent();
  }, [selectedTopicId, selectedCourseId]);

  const fetchFilters = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        api.get('/api/admin/topics'),
        api.get('/api/admin/courses')
      ]);
      setTopics(tRes.data);
      setCourses(cRes.data);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedTopicId) params.append('topicId', selectedTopicId);
      if (selectedCourseId) params.append('courseId', selectedCourseId);
      
      const res = await api.get(`/api/admin/content?${params.toString()}`);
      setContent(res.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => selectedTopicId ? c.topicId === selectedTopicId : true);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content Library</h1>
          <p className="text-sm text-muted-foreground">Manage lessons, videos, and articles across the platform.</p>
        </div>
        <Link 
          href="/admin/content/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
        >
          Upload Content
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4 py-2">
        <label className="text-sm font-medium text-gray-700">Topic Filter:</label>
        <select 
          className="border border-gray-300 rounded-md p-2 text-sm max-w-xs focus:ring-primary focus:border-primary bg-white"
          value={selectedTopicId}
          onChange={(e) => {
            setSelectedTopicId(e.target.value);
            setSelectedCourseId(''); // Reset course when topic changes
          }}
        >
          <option value="">All Topics</option>
          {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <label className="text-sm font-medium text-gray-700">Course Filter:</label>
        <select 
          className="border border-gray-300 rounded-md p-2 text-sm max-w-xs focus:ring-primary focus:border-primary bg-white disabled:bg-gray-100"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          disabled={!selectedTopicId}
        >
          <option value="">All Courses (in Topic)</option>
          {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      <div className="rounded-md border bg-white">
        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : content.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            No content found matching the filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {content.map((item) => (
                <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle font-medium max-w-xs truncate">{item.title}</td>
                  <td className="p-4 align-middle">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-gray-500">
                    {item.topic.name}
                    {item.course ? ` > ${item.course.title}` : ' (Standalone)'}
                  </td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      item.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right flex justify-end">
                    <Link
                      href={`/admin/content/${item.id}/edit`}
                      className="text-primary hover:underline font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
