'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(30, 'Name must be 30 characters or less'),
});

type TagFormValues = z.infer<typeof tagSchema>;

interface TagFormProps {
  initialData?: any;
  tagId?: string;
}

export default function TagForm({ initialData, tagId }: TagFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const isEditing = !!tagId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: initialData?.name || '',
    },
  });

  const onSubmit = async (data: TagFormValues) => {
    setError('');

    try {
      if (isEditing) {
        await api.put(`/api/admin/tags/${tagId}`, data);
      } else {
        await api.post('/api/admin/tags', data);
      }
      router.push('/admin/tags');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save tag.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg bg-white p-6 rounded-md shadow-sm border">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Tag Name *</label>
        <input
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
          placeholder="e.g. beginner"
        />
        <p className="mt-1 text-xs text-gray-500">Will be converted to lowercase automatically.</p>
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-medium text-brand-slate shadow-sm hover:bg-brand-light-bg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand-emerald py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 disabled:bg-slate-400"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Tag' : 'Create Tag'}
        </button>
      </div>
    </form>
  );
}
