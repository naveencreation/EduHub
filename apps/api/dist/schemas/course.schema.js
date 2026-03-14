"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderCoursesSchema = exports.updateCourseSchema = exports.createCourseSchema = void 0;
const zod_1 = require("zod");
exports.createCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        topicId: zod_1.z.string().uuid("Invalid topic ID"),
        title: zod_1.z.string().min(1, "Title is required").max(100),
        slug: zod_1.z.string().min(1, "Slug is required").max(100).optional(),
        description: zod_1.z.string().optional().nullable(),
        thumbnailUrl: zod_1.z.string().url("Invalid URL").optional().nullable(),
        sortOrder: zod_1.z.number().int().default(0),
        isPublished: zod_1.z.boolean().default(false),
    }),
});
exports.updateCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        topicId: zod_1.z.string().uuid("Invalid topic ID").optional(),
        title: zod_1.z.string().min(1).max(100).optional(),
        slug: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().optional().nullable(),
        thumbnailUrl: zod_1.z.string().url("Invalid URL").optional().nullable(),
        sortOrder: zod_1.z.number().int().optional(),
        isPublished: zod_1.z.boolean().optional(),
    }),
});
exports.reorderCoursesSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseIds: zod_1.z.array(zod_1.z.string().uuid("Invalid course ID")),
    }),
});
//# sourceMappingURL=course.schema.js.map