'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import TipTapEditor from './TipTapEditor';

const contentSchema = z.object({
  topicId: z.string().uuid('Topic is required'),
  courseId: z.string().uuid().optional().or(z.literal('')),
  title: z.string().min(1, 'Title is required').max(100),
  slug: z.string().max(100).optional(),
  type: z.enum(['VIDEO', 'AUDIO', 'IMAGE', 'BLOG']),
  description: z.string().optional(),
  body: z.string().optional(),
  fileUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  streamId: z.string().optional(),
  thumbnailUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  durationSecs: z.number().int().optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
  tags: z.array(z.string()).max(5).optional(),
});

type ContentFormValues = z.infer<typeof contentSchema>;

interface ContentFormProps {
  initialData?: any;
  contentId?: string;
  topics?: any[];
  courses?: any[];
  allTags?: any[];
}

export default function ContentForm({ initialData, contentId, topics = [], courses = [], allTags = [] }: ContentFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const isEditing = !!contentId;

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      topicId: initialData?.topicId || '',
      courseId: initialData?.courseId || '',
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      type: initialData?.type || 'VIDEO',
      description: initialData?.description || '',
      body: initialData?.body || '',
      fileUrl: initialData?.fileUrl || '',
      streamId: initialData?.streamId || '',
      thumbnailUrl: initialData?.thumbnailUrl || '',
      durationSecs: initialData?.durationSecs || '',
      isPublished: initialData?.isPublished || false,
      tags: initialData?.contentTags?.map((ct: any) => ct.tagId) || [],
    },
  });

  const selectedType = watch('type');
  const selectedTopicId = watch('topicId');
  const availableCourses = courses.filter(c => c.topicId === selectedTopicId);

  // If topic changes, reset course if the new topic doesn't have the current course
  useEffect(() => {
    const currentCourse = watch('courseId');
    if (currentCourse && !availableCourses.find(c => c.id === currentCourse)) {
      setValue('courseId', '');
    }
  }, [selectedTopicId, availableCourses, watch, setValue]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, uploadType: 'R2' | 'STREAM') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (uploadType === 'STREAM') {
        // Mock Video Stream upload
        const res = await api.post('/api/admin/content/upload/video');
        console.log("Mock Stream URL:", res.data.uploadUrl);
        // Simulate completion by setting the ID directly from the mock
        setTimeout(() => {
          setValue('streamId', 'mock_cloudflare_stream_id_123');
          setIsUploading(false);
          alert('Mock Video Upload Complete!');
        }, 1500);
      } else {
        // Mock R2 upload for images/audio
        const res = await api.post('/api/admin/content/upload/presign');
        console.log("Mock R2 URL:", res.data.uploadUrl);
        setTimeout(() => {
          setValue('fileUrl', 'https://mock.pub.r2.dev/' + file.name);
          setIsUploading(false);
          alert('Mock File Upload Complete!');
        }, 1500);
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed.');
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ContentFormValues) => {
    setError('');
    
    // Clean payload for backend
    const payload = {
      ...data,
      courseId: data.courseId === '' ? null : data.courseId,
      fileUrl: data.fileUrl === '' ? null : data.fileUrl,
      streamId: data.streamId === '' ? null : data.streamId,
      thumbnailUrl: data.thumbnailUrl === '' ? null : data.thumbnailUrl,
      durationSecs: data.durationSecs === '' ? null : Number(data.durationSecs),
      slug: data.slug === '' ? undefined : data.slug,
      body: selectedType === 'BLOG' ? data.body : null,
    };

    try {
      if (isEditing) {
        await api.put(`/api/admin/content/${contentId}`, payload);
      } else {
        await api.post('/api/admin/content', payload);
      }
      router.push('/admin/content');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save content.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl bg-white p-6 rounded-md shadow-sm border">
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Core Metadata */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Topic *</label>
          <select {...register('topicId')} className="mt-1 block w-full rounded-md border p-2 text-sm bg-white">
            <option value="">Select Topic...</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {errors.topicId && <p className="mt-1 text-sm text-red-600">{errors.topicId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Course (Optional)</label>
          <select {...register('courseId')} className="mt-1 block w-full rounded-md border p-2 text-sm bg-white disabled:bg-gray-100" disabled={!selectedTopicId}>
            <option value="">Standalone (No Course)</option>
            {availableCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content Type *</label>
          <select {...register('type')} className="mt-1 block w-full rounded-md border p-2 text-sm bg-white disabled:bg-gray-100" disabled={isEditing}>
            <option value="VIDEO">Video (Cloudflare Stream)</option>
            <option value="AUDIO">Audio (R2)</option>
            <option value="IMAGE">Image (R2)</option>
            <option value="BLOG">Blog (TipTap)</option>
          </select>
          {isEditing && <p className="text-xs text-gray-500 mt-1">Type cannot be changed after creation.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input {...register('title')} className="mt-1 block w-full rounded-md border p-2 text-sm" placeholder="Lesson Title" />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description / Summary</label>
          <textarea {...register('description')} rows={2} className="mt-1 block w-full rounded-md border p-2 text-sm" />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 bg-gray-50 p-2 rounded">Type-Specific Details</h3>
        
        {/* VIDEO SPECIFIC */}
        {selectedType === 'VIDEO' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Video File</label>
              <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'STREAM')} disabled={isUploading} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-white hover:file:bg-black" />
              {isUploading && <p className="text-xs text-blue-600 mt-1">Simulating upload...</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cloudflare Stream ID</label>
              <input {...register('streamId')} className="mt-1 block w-full rounded-md border p-2 text-sm bg-gray-50 bg-opacity-50" placeholder="Auto-filled via upload" />
            </div>
          </div>
        )}

        {/* AUDIO/IMAGE SPECIFIC */}
        {(selectedType === 'AUDIO' || selectedType === 'IMAGE') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload {selectedType === 'AUDIO' ? 'Audio' : 'Image'} File</label>
              <input type="file" accept={selectedType === 'AUDIO' ? "audio/*" : "image/*"} onChange={(e) => handleFileUpload(e, 'R2')} disabled={isUploading} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-white hover:file:bg-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">R2 File URL</label>
              <input {...register('fileUrl')} className="mt-1 block w-full rounded-md border p-2 text-sm bg-gray-50 bg-opacity-50" placeholder="Auto-filled via upload" />
              {errors.fileUrl && <p className="mt-1 text-sm text-red-600">{errors.fileUrl.message}</p>}
            </div>
          </div>
        )}

        {/* BLOG SPECIFIC */}
        {selectedType === 'BLOG' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Blog Content</label>
            <Controller
              name="body"
              control={control}
              render={({ field }) => (
                <TipTapEditor value={field.value || ''} onChange={field.onChange} />
              )}
            />
          </div>
        )}
      </div>

      <div className="border-t pt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (Max 5)</label>
          <select multiple {...register('tags')} className="mt-1 block w-full rounded-md border p-2 text-sm min-h-[100px] bg-white">
            {allTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
            <input {...register('durationSecs')} type="number" className="mt-1 block w-full rounded-md border p-2 text-sm" placeholder="e.g. 120" />
          </div>
          <div className="flex items-center pt-4">
            <input {...register('isPublished')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary" />
            <label className="ml-2 block text-sm text-gray-900">Publish Content</label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={() => router.back()} className="rounded-md border bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting || isUploading} className="rounded-md bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:bg-gray-400">
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Content' : 'Create Content'}
        </button>
      </div>
    </form>
  );
}
