'use client';

interface BlogReaderProps {
  content: string;
}

export default function BlogReader({ content }: BlogReaderProps) {
  // Uses Tailwind typography plugin for styling raw HTML content
  return (
    <div 
      className="prose prose-lg prose-blue max-w-none bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
