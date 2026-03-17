'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const courseSchema = z.object({
  topicId: z.string().uuid('Topic is required'),
  title: z.string().min(1, 'Title is required').max(100),
  slug: z.string().max(100).optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  readonly initialData?: any;
  readonly courseId?: string;
  readonly topics?: any[];
}

export default function CourseForm({ initialData, courseId, topics = [] }: CourseFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const isEditing = !!courseId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      topicId: initialData?.topicId || '',
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      thumbnailUrl: initialData?.thumbnailUrl || '',
      isPublished: initialData?.isPublished || false,
    },
  });

  const onSubmit = async (data: CourseFormValues) => {
    setError('');
    
    const payload = {
      ...data,
      thumbnailUrl: data.thumbnailUrl === '' ? null : data.thumbnailUrl,
      slug: data.slug === '' ? undefined : data.slug,
    };

    try {
      if (isEditing) {
        await api.put(`/api/admin/courses/${courseId}`, payload);
      } else {
        await api.post('/api/admin/courses', payload);
      }
      router.push('/admin/courses');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save course.');
    }
  };

  let submitButtonText: string;
  if (isSubmitting) {
    submitButtonText = 'Saving...';
  } else if (isEditing) {
    submitButtonText = 'Update Course';
  } else {
    submitButtonText = 'Create Course';
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-md shadow-sm border">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="topicId" className="block text-sm font-medium text-gray-700">Topic *</label>
          <select
            id="topicId"
            {...register('topicId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-white"
          >
            <option value="">Select a topic...</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {errors.topicId && <p className="mt-1 text-sm text-red-600">{errors.topicId.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Course Title *</label>
          <input
            id="title"
            {...register('title')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
            placeholder="e.g. Algebra 101"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (Optional)</label>
          <input
            id="slug"
            {...register('slug')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
            placeholder="e.g. algebra-101 (leave blank to auto-generate)"
          />
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
          <input
            id="thumbnailUrl"
            {...register('thumbnailUrl')}
            type="url"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
          />
          {errors.thumbnailUrl && <p className="mt-1 text-sm text-red-600">{errors.thumbnailUrl.message}</p>}
        </div>

        <div className="sm:col-span-2 flex items-center">
          <input
            id="isPublished"
            {...register('isPublished')}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
            Publish this course (visible to public)
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
          {submitButtonText}
        </button>
      </div>
    </form>
  );
}
