import React from 'react';

/**
 * Loading skeleton for topic cards
 */
export function TopicCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-slate-200 mb-4" />
      <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-full mb-1" />
      <div className="h-3 bg-slate-100 rounded w-2/3 mb-4" />
      <div className="flex gap-3 text-xs">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
}

/**
 * Loading skeleton for course cards
 */
export function CourseCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/9] w-full bg-slate-200" />
      <div className="p-5">
        <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-full mb-1" />
        <div className="h-3 bg-slate-100 rounded w-2/3 mb-4" />
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
          <div className="h-3 bg-slate-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton grid for topics
 */
export function TopicsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TopicCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Loading skeleton grid for courses
 */
export function CoursesGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Pulse loading animation component
 */
export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
      <p className="text-slate-600 mt-4 font-medium">Loading...</p>
    </div>
  );
}
