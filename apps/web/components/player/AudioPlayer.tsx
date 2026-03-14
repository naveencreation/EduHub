'use client';

interface AudioPlayerProps {
  fileUrl: string;
}

export default function AudioPlayer({ fileUrl }: AudioPlayerProps) {
  return (
    <div className="w-full bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-center mb-6">
        <div className="w-32 h-32 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shadow-inner">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      </div>
      
      {fileUrl.startsWith('https://mock.') ? (
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-600 text-sm mb-4">Mock Audio File: {fileUrl.split('/').pop()}</p>
          <div className="flex justify-center gap-4">
            <button className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow transition-transform hover:scale-105">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            </button>
          </div>
          <div className="mt-4 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 w-1/3 rounded-full"></div>
          </div>
        </div>
      ) : (
        <audio 
          controls 
          className="w-full focus:outline-none"
          src={fileUrl}
        >
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}
