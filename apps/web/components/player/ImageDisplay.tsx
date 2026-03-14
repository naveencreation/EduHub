'use client';

interface ImageDisplayProps {
  fileUrl: string;
  title: string;
}

export default function ImageDisplay({ fileUrl, title }: ImageDisplayProps) {
  return (
    <div className="w-full bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-200 flex items-center justify-center p-4 min-h-[400px]">
      {fileUrl.startsWith('https://mock.') ? (
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="inline-block px-4 py-2 bg-white rounded border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm">Mock Image File</p>
            <p className="text-xs text-gray-400 font-mono mt-1">{fileUrl.split('/').pop()}</p>
          </div>
        </div>
      ) : (
        <img 
          src={fileUrl} 
          alt={title} 
          className="max-w-full h-auto max-h-[70vh] object-contain rounded shadow-sm"
          loading="lazy"
        />
      )}
    </div>
  );
}
