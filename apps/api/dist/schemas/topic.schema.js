"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderTopicsSchema = exports.updateTopicSchema = exports.createTopicSchema = void 0;
const zod_1 = require("zod");
exports.createTopicSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required").max(100),
        slug: zod_1.z.string().min(1, "Slug is required").max(100).optional(),
        description: zod_1.z.string().optional().nullable(),
        thumbnailUrl: zod_1.z.string().url("Invalid URL").optional().nullable(),
        sortOrder: zod_1.z.number().int().default(0),
        isPublished: zod_1.z.boolean().default(false),
    }),
});
exports.updateTopicSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        slug: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().optional().nullable(),
        thumbnailUrl: zod_1.z.string().url("Invalid URL").optional().nullable(),
        sortOrder: zod_1.z.number().int().optional(),
        isPublished: zod_1.z.boolean().optional(),
    }),
});
exports.reorderTopicsSchema = zod_1.z.object({
    body: zod_1.z.object({
        topicIds: zod_1.z.array(zod_1.z.string().uuid("Invalid topic ID")),
    }),
});
//# sourceMappingURL=topic.schema.js.map