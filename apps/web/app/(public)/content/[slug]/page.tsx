import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, CalendarDays } from 'lucide-react';
import VideoPlayer from '@/components/player/VideoPlayer';
import AudioPlayer from '@/components/player/AudioPlayer';
import ImageDisplay from '@/components/player/ImageDisplay';
import BlogReader from '@/components/player/BlogReader';

async function getContent(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const res = await fetch(`${apiUrl}/api/content/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch content');
  }
  return res.json();
}

export default async function ContentPage({ params }: { params: { slug: string } }) {
  const data = await getContent(params.slug);

  if (!data || !data.content) {
    notFound();
  }

  const { content } = data;

  const renderPlayer = () => {
    switch (content.type) {
      case 'VIDEO':
        return <VideoPlayer streamId={content.streamId!} title={content.title} />;
      case 'AUDIO':
        return <AudioPlayer fileUrl={content.fileUrl!} />;
      case 'IMAGE':
        return <ImageDisplay fileUrl={content.fileUrl!} title={content.title} />;
      case 'BLOG':
        return <BlogReader content={content.body || '<p>No content provided.</p>'} />;
      default:
        return <div>Unsupported content type.</div>;
    }
  };

  const formattedDate = new Date(content.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumbs / Navigation */}
      <div className="mb-8">
        <Link 
          href={content.course ? `/courses/${content.course.slug}` : `/topics/${content.topic.slug}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {content.course ? 'Course' : 'Topic'}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider">
            {content.type}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
            {content.topic.name}
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          {content.title}
        </h1>
        
        {content.description && (
          <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mb-6">
            {content.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          {content.durationSecs && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{Math.round(content.durationSecs / 60)} min {content.type === 'BLOG' ? 'read' : 'duration'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Player Area */}
      <div className="mb-16">
        {renderPlayer()}
      </div>

      {/* Footer / Tags */}
      {content.contentTags && content.contentTags.length > 0 && (
        <div className="border-t pt-8">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {content.contentTags.map((ct: any) => (
              <span key={ct.tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer transition-colors">
                #{ct.tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
