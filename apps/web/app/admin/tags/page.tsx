'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count: {
    contentTags: number;
  };
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await api.get('/api/admin/tags');
      setTags(res.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${name}"?`)) return;
    try {
      await api.delete(`/api/admin/tags/${id}`);
      fetchTags();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete tag');
    }
  };

  if (isLoading) {
    return <div>Loading tags...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
          <p className="text-sm text-muted-foreground">Manage content categorization tags.</p>
        </div>
        <Link 
          href="/admin/tags/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
        >
          Create Tag
        </Link>
      </div>

      <div className="rounded-md border bg-white">
        {tags.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            No tags found. Create one to get started.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50/50">
              <tr>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Slug</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Used In</th>
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle font-medium">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {tag.name}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-gray-500">{tag.slug}</td>
                  <td className="p-4 align-middle">{tag._count.contentTags} items</td>
                  <td className="p-4 align-middle text-right space-x-3">
                    <Link
                      href={`/admin/tags/${tag.id}/edit`}
                      className="text-primary hover:underline font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(tag.id, tag.name)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
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
