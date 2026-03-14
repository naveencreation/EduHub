import { z } from "zod";

export const createTopicSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100),
    slug: z.string().min(1, "Slug is required").max(100).optional(),
    description: z.string().optional().nullable(),
    thumbnailUrl: z.string().url("Invalid URL").optional().nullable(),
    sortOrder: z.number().int().default(0),
    isPublished: z.boolean().default(false),
  }),
});

export const updateTopicSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    description: z.string().optional().nullable(),
    thumbnailUrl: z.string().url("Invalid URL").optional().nullable(),
    sortOrder: z.number().int().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const reorderTopicsSchema = z.object({
  body: z.object({
    topicIds: z.array(z.string().uuid("Invalid topic ID")),
  }),
});
