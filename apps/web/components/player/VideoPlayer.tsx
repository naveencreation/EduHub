'use client';

// In a real application, you'd use the official @cloudflare/stream-react component
// import { Stream } from "@cloudflare/stream-react";

interface VideoPlayerProps {
  streamId: string;
  title: string;
}

export default function VideoPlayer({ streamId, title }: VideoPlayerProps) {
  // Mock Cloudflare Stream Player for development
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg aspect-video relative flex items-center justify-center">
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">STREAM</span>
      </div>
      
      {streamId.startsWith('mock_') ? (
        <div className="text-center p-8">
          <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-300 font-medium">Mock Video Player</p>
          <p className="text-gray-500 text-sm mt-2">ID: {streamId}</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-colors">
            Play Video
          </button>
        </div>
      ) : (
        <iframe
          src={`https://customer-xxxxxxxxxxxx.cloudflarestream.com/${streamId}/iframe`}
          className="border-none absolute top-0 left-0 w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          title={title}
        ></iframe>
      )}
    </div>
  );
}
