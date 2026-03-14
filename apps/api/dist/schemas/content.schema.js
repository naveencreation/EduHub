"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderContentSchema = exports.updateContentSchema = exports.createContentSchema = void 0;
const zod_1 = require("zod");
const ContentTypeEnum = zod_1.z.enum(["VIDEO", "AUDIO", "IMAGE", "BLOG"]);
exports.createContentSchema = zod_1.z.object({
    body: zod_1.z.object({
        topicId: zod_1.z.string().uuid("Invalid topic ID"),
        courseId: zod_1.z.string().uuid("Invalid course ID").optional().nullable(),
        title: zod_1.z.string().min(1, "Title is required").max(100),
        slug: zod_1.z.string().min(1, "Slug is required").max(100).optional(),
        type: ContentTypeEnum,
        description: zod_1.z.string().optional().nullable(),
        body: zod_1.z.string().optional().nullable(),
        fileUrl: zod_1.z.string().optional().nullable(),
        streamId: zod_1.z.string().optional().nullable(),
        thumbnailUrl: zod_1.z.string().url("Invalid URL").optional().nullable(),
        durationSecs: zod_1.z.number().int().optional().nullable(),
        sortOrder: zod_1.z.number().int().default(0),
        isPublished: zod_1.z.boolean().default(false),
        tags: zod_1.z.array(zod_1.z.string().uuid("Invalid tag ID")).max(5).optional(),
    }),
});
exports.updateContentSchema = zod_1.z.object({
    body: zod_1.z.object({
        topicId: zod_1.z.string().uuid().optional(),
        courseId: zod_1.z.string().uuid().optional().nullable(),
        title: zod_1.z.string().min(1).max(100).optional(),
        slug: zod_1.z.string().min(1).max(100).optional(),
        // type is typically locked after creation, so we might omit it or allow if explicitly needed, but PRD says locked
        description: zod_1.z.string().optional().nullable(),
        body: zod_1.z.string().optional().nullable(),
        fileUrl: zod_1.z.string().optional().nullable(),
        streamId: zod_1.z.string().optional().nullable(),
        thumbnailUrl: zod_1.z.string().url("Invalid URL").optional().nullable(),
        durationSecs: zod_1.z.number().int().optional().nullable(),
        sortOrder: zod_1.z.number().int().optional(),
        isPublished: zod_1.z.boolean().optional(),
        tags: zod_1.z.array(zod_1.z.string().uuid("Invalid tag ID")).max(5).optional(),
    }),
});
exports.reorderContentSchema = zod_1.z.object({
    body: zod_1.z.object({
        contentIds: zod_1.z.array(zod_1.z.string().uuid("Invalid content ID")),
    }),
});
//# sourceMappingURL=content.schema.js.map