import { z } from "zod";

const ContentTypeEnum = z.enum(["VIDEO", "AUDIO", "IMAGE", "BLOG"]);

export const createContentSchema = z.object({
  body: z.object({
    topicId: z.string().uuid("Invalid topic ID"),
    courseId: z.string().uuid("Invalid course ID").optional().nullable(),
    title: z.string().min(1, "Title is required").max(100),
    slug: z.string().min(1, "Slug is required").max(100).optional(),
    type: ContentTypeEnum,
    description: z.string().optional().nullable(),
    body: z.string().optional().nullable(),
    fileUrl: z.string().optional().nullable(),
    streamId: z.string().optional().nullable(),
    thumbnailUrl: z.string().url("Invalid URL").optional().nullable(),
    durationSecs: z.number().int().optional().nullable(),
    sortOrder: z.number().int().default(0),
    isPublished: z.boolean().default(false),
    tags: z.array(z.string().uuid("Invalid tag ID")).max(5).optional(),
  }),
});

export const updateContentSchema = z.object({
  body: z.object({
    topicId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional().nullable(),
    title: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    // type is typically locked after creation, so we might omit it or allow if explicitly needed, but PRD says locked
    description: z.string().optional().nullable(),
    body: z.string().optional().nullable(),
    fileUrl: z.string().optional().nullable(),
    streamId: z.string().optional().nullable(),
    thumbnailUrl: z.string().url("Invalid URL").optional().nullable(),
    durationSecs: z.number().int().optional().nullable(),
    sortOrder: z.number().int().optional(),
    isPublished: z.boolean().optional(),
    tags: z.array(z.string().uuid("Invalid tag ID")).max(5).optional(),
  }),
});

export const reorderContentSchema = z.object({
  body: z.object({
    contentIds: z.array(z.string().uuid("Invalid content ID")),
  }),
});
