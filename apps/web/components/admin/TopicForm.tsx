'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const topicSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
});

type TopicFormValues = z.infer<typeof topicSchema>;

interface TopicFormProps {
  initialData?: any;
  topicId?: string;
}

export default function TopicForm({ initialData, topicId }: TopicFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const isEditing = !!topicId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      thumbnailUrl: initialData?.thumbnailUrl || '',
      isPublished: initialData?.isPublished || false,
    },
  });

  const onSubmit = async (data: TopicFormValues) => {
    setError('');
    // Remove empty string URLs to match backend nullable expectations if necessary
    const payload = {
      ...data,
      thumbnailUrl: data.thumbnailUrl === '' ? null : data.thumbnailUrl,
      slug: data.slug === '' ? undefined : data.slug, // let backend generate if empty
    };

    try {
      if (isEditing) {
        await api.put(`/api/admin/topics/${topicId}`, payload);
      } else {
        await api.post('/api/admin/topics', payload);
      }
      router.push('/admin/topics');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save topic.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-md shadow-sm border border-slate-200">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-brand-dark">Topic Name *</label>
          <input
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
            placeholder="e.g. Mathematics"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-brand-dark">Slug (Optional)</label>
          <input
            {...register('slug')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
            placeholder="e.g. mathematics (leave blank to auto-generate)"
          />
          <p className="mt-1 text-xs text-gray-500">The URL friendly identifier. Auto-generated from name if left blank.</p>
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-brand-dark">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-brand-dark">Thumbnail URL</label>
          <input
            {...register('thumbnailUrl')}
            type="url"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
          />
          {errors.thumbnailUrl && <p className="mt-1 text-sm text-red-600">{errors.thumbnailUrl.message}</p>}
        </div>

        <div className="sm:col-span-2 flex items-center">
          <input
            {...register('isPublished')}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Publish this topic (visible to public)
          </label>
        </div>
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
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Topic' : 'Create Topic'}
        </button>
      </div>
    </form>
  );
}
