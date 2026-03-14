'use client';

import { useEffect, useState } from 'react';
import TagForm from '@/components/admin/TagForm';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EditTagPage() {
  const params = useParams();
  const tagId = params.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTag = async () => {
      try {
        // We need a specific tag, but our backend doesn't have GET /api/admin/tags/:id globally
        // Wait, the PRD / list doesn't explicitly define GET tags/:id, so we can fetch all and find it, 
        // or just rely on backend routes (we haven't implemented GET /api/admin/tags/:id).
        // Let's fetch all tags and filter.
        const res = await api.get('/api/admin/tags');
        const tag = res.data.find((t: any) => t.id === tagId);
        if (tag) setInitialData(tag);
        else setError('Tag not found.');
      } catch (err) {
        setError('Failed to fetch tag details.');
      } finally {
        setIsLoading(false);
      }
    };
    if (tagId) fetchTag();
  }, [tagId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/tags" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Tag</h1>
            <p className="text-sm text-muted-foreground">{initialData?.name}</p>
          </div>
        </div>
      </div>

      <TagForm initialData={initialData} tagId={tagId} />
    </div>
  );
}
