import { z } from "zod";

export const createCourseSchema = z.object({
  body: z.object({
    topicId: z.string().uuid("Invalid topic ID"),
    title: z.string().min(1, "Title is required").max(100),
    slug: z.string().min(1, "Slug is required").max(100),
    description: z.string().optional().nullable(),
    thumbnailUrl: z.string().url("Invalid URL").optional().nullable(),
    sortOrder: z.number().int().default(0),
    isPublished: z.boolean().default(false),
  }),
});

export const updateCourseSchema = z.object({
  body: z.object({
    topicId: z.string().uuid("Invalid topic ID").optional(),
    title: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    description: z.string().optional().nullable(),
    thumbnailUrl: z.string().url("Invalid URL").optional().nullable(),
    sortOrder: z.number().int().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const reorderCoursesSchema = z.object({
  body: z.object({
    courseIds: z.array(z.string().uuid("Invalid course ID")),
  }),
});
