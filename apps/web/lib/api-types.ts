/**
 * Shared TypeScript types for API responses
 * These correspond to the backend Prisma models
 */

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  courses?: Course[];
  content?: CourseContent[];
  _count?: {
    courses: number;
    content: number;
  };
}

export interface CourseContent {
  id: string;
  title: string;
  slug: string;
  type: "blog" | "video" | "audio" | "image" | "gallery" | "document";
  description: string | null;
  isPublished: boolean;
  sortOrder: number;
  publishedAt: string | null;
  durationSecs?: number | null;
  topic?: Topic | { name: string; slug: string };
  course?: Course | { title: string; slug: string };
}

export interface Course {
  id: string;
  topicId: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  topic?: Topic | {
    name: string;
    slug: string;
  };
  content?: CourseContent[];
  _count?: {
    content: number;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  isNetworkError?: boolean;
  details?: string;
}
