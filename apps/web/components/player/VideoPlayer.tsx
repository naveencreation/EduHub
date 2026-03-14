'use client';

// Official Cloudflare Stream player
// https://developers.cloudflare.com/stream/viewing-videos/using-the-player/
// import { Stream } from "@cloudflare/stream-react";

interface VideoPlayerProps {
  streamId: string;
  title: string;
}

/**
 * VideoPlayer Component
 * Renders Cloudflare Stream player for video content
 * 
 * In development: Shows mock player for testing
 * In production: Renders official Cloudflare Stream iframe
 */
export default function VideoPlayer({ streamId, title }: VideoPlayerProps) {
  // Get Cloudflare account ID from environment
  // In production, replace with actual environment variable
  const cloudflareAccountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;

  // Mock streams for development (don't use in production)
  const isMockStream = streamId.startsWith("mock_");

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg aspect-video relative flex items-center justify-center">
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
          {isMockStream ? "MOCK" : "LIVE"} VIDEO
        </span>
      </div>

      {isMockStream ? (
        // Development mock player
        <div className="text-center p-8">
          <svg
            className="w-16 h-16 text-gray-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-300 font-medium">Mock Video Player</p>
          <p className="text-gray-500 text-sm mt-2">ID: {streamId}</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-colors">
            Play Video (Development Only)
          </button>
          <p className="text-yellow-500 text-xs mt-4 max-w-xs">
            ⚠️ This is a mock player for development. In production, a real Cloudflare Stream
            video will be embedded here.
          </p>
        </div>
      ) : cloudflareAccountId ? (
        // Production Cloudflare Stream player
        <iframe
          src={`https://customer-${cloudflareAccountId}.cloudflarestream.com/${streamId}/iframe`}
          className="border-none absolute top-0 left-0 w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          title={title}
        />
      ) : (
        // Error: Missing configuration
        <div className="text-center p-8">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l-2.414-2.414a1 1 0 00-.707-.293h-3.172a1 1 0 00-.707.293l2.414 2.414A1 1 0 0010 7v2z"
            />
          </svg>
          <p className="text-red-400 font-medium">Configuration Error</p>
          <p className="text-gray-400 text-sm mt-2">
            Missing NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID environment variable
          </p>
        </div>
      )}
    </div>
  );
}
