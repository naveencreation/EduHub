import Link from 'next/link';
import { Search as SearchIcon, PlayCircle, FolderOpen, BookOpen } from 'lucide-react';

async function performSearch(query: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // Use no-store for search to ensure fresh results based on query parameter
  const res = await fetch(`${apiUrl}/api/content/search?q=${encodeURIComponent(query)}`, { 
    cache: 'no-store' 
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  
  let results: any[] = [];
  if (query) {
    results = await performSearch(query);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-primary" />
          Search Results
        </h1>
        {query ? (
          <p className="mt-4 text-lg text-gray-500">
            Showing results for <span className="font-semibold text-gray-900">"{query}"</span>
          </p>
        ) : (
          <p className="mt-4 text-lg text-gray-500">
            Enter a search term in the navigation bar to find content.
          </p>
        )}
      </div>

      {query && results.length > 0 ? (
        <div className="space-y-6">
          {results.map((item) => (
            <Link key={item.id} href={`/content/${item.slug}`} className="block group bg-white border rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                
                {/* Visual Indicator */}
                <div className="hidden sm:flex flex-shrink-0 w-16 h-16 bg-blue-50 text-blue-600 rounded-xl items-center justify-center">
                  {item.type === 'VIDEO' && <PlayCircle className="w-8 h-8" />}
                  {item.type === 'BLOG' && <BookOpen className="w-8 h-8" />}
                  {item.type !== 'VIDEO' && item.type !== 'BLOG' && <FolderOpen className="w-8 h-8" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.type}
                    </span>
                    {item.topic && (
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        • {item.topic.name}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 md:line-clamp-3 mb-4">
                    {item.description || 'No description available.'}
                  </p>

                  {item.course && (
                    <div className="inline-flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md border">
                      Part of Course: <span className="text-gray-900 ml-1">{item.course.title}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
          <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No results found</h3>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">
            We couldn't find anything matching "{query}". Try adjusting your search term or exploring our Topics.
          </p>
          <div className="mt-6">
            <Link href="/topics" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-blue-50 hover:bg-blue-100">
              Explore Topics
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
