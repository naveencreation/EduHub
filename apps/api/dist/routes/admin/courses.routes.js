"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const validateRequest_1 = require("../../middlewares/validateRequest");
const course_schema_1 = require("../../schemas/course.schema");
const slugify_1 = __importDefault(require("slugify"));
const router = (0, express_1.Router)();
// GET /api/admin/courses (supports ?topicId=uuid)
router.get("/", async (req, res) => {
    try {
        const { topicId } = req.query;
        const whereClause = topicId ? { topicId: String(topicId) } : {};
        const courses = await db_1.prisma.course.findMany({
            where: whereClause,
            orderBy: { sortOrder: "asc" },
            include: {
                topic: { select: { name: true } },
                _count: { select: { content: true } },
            },
        });
        return res.status(200).json(courses);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch courses" });
    }
});
// GET /api/admin/courses/:id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const course = await db_1.prisma.course.findUnique({
            where: { id },
        });
        if (!course)
            return res.status(404).json({ error: "Course not found" });
        return res.status(200).json(course);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch course" });
    }
});
// POST /api/admin/courses
router.post("/", (0, validateRequest_1.validateRequest)(course_schema_1.createCourseSchema), async (req, res) => {
    try {
        const { topicId, title, description, thumbnailUrl, sortOrder, isPublished } = req.body;
        let slug = req.body.slug;
        if (!slug) {
            slug = (0, slugify_1.default)(title, { lower: true, strict: true });
        }
        else {
            slug = (0, slugify_1.default)(slug, { lower: true, strict: true });
        }
        // Check slug uniqueness within the topic
        const existing = await db_1.prisma.course.findUnique({
            where: { topicId_slug: { topicId, slug } },
        });
        if (existing) {
            return res.status(400).json({ error: "Course with this slug already exists in the selected topic" });
        }
        const course = await db_1.prisma.course.create({
            data: {
                topicId,
                title,
                slug,
                description,
                thumbnailUrl,
                sortOrder,
                isPublished,
            },
        });
        return res.status(201).json(course);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to create course" });
    }
});
// PUT /api/admin/courses/:id
router.put("/:id", (0, validateRequest_1.validateRequest)(course_schema_1.updateCourseSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        // Get current course to check topic ID
        const currentCourse = await db_1.prisma.course.findUnique({ where: { id } });
        if (!currentCourse)
            return res.status(404).json({ error: "Course not found" });
        const targetTopicId = data.topicId || currentCourse.topicId;
        if (data.slug) {
            data.slug = (0, slugify_1.default)(data.slug, { lower: true, strict: true });
            // Check slug uniqueness in target topic
            const existing = await db_1.prisma.course.findFirst({
                where: { slug: data.slug, topicId: targetTopicId, NOT: { id } },
            });
            if (existing) {
                return res.status(400).json({ error: "Course with this slug already exists in the selected topic" });
            }
        }
        const course = await db_1.prisma.course.update({
            where: { id },
            data,
        });
        return res.status(200).json(course);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to update course" });
    }
});
// DELETE /api/admin/courses/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // According to PRD, cascade is SetNull for content (Prisma handles this via schema definition)
        await db_1.prisma.course.delete({
            where: { id },
        });
        return res.status(200).json({ message: "Course deleted successfully" });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Course not found" });
        }
        return res.status(500).json({ error: "Failed to delete course" });
    }
});
// POST /api/admin/courses/reorder
router.post("/reorder", (0, validateRequest_1.validateRequest)(course_schema_1.reorderCoursesSchema), async (req, res) => {
    try {
        const { courseIds } = req.body;
        await db_1.prisma.$transaction(courseIds.map((id, index) => db_1.prisma.course.update({
            where: { id },
            data: { sortOrder: index },
        })));
        return res.status(200).json({ message: "Courses reordered successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to reorder courses" });
    }
});
exports.default = router;
//# sourceMappingURL=courses.routes.js.map