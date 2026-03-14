"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const router = (0, express_1.Router)();
// GET /api/courses - List all published courses with topic info
router.get("/", async (req, res) => {
    try {
        const courses = await db_1.prisma.course.findMany({
            where: { isPublished: true },
            orderBy: { sortOrder: "asc" },
            include: {
                topic: {
                    select: { name: true, slug: true },
                },
                _count: {
                    select: { content: { where: { isPublished: true } } },
                },
            },
        });
        return res.status(200).json(courses);
    }
    catch (error) {
        console.error("Failed to fetch courses:", error);
        return res.status(500).json({ error: "Failed to fetch courses" });
    }
});
// GET /api/courses/:slug - Get single published course with published lessons
router.get("/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        const course = await db_1.prisma.course.findFirst({
            where: { slug, isPublished: true },
            include: {
                topic: { select: { name: true, slug: true } },
                content: {
                    where: { isPublished: true },
                    orderBy: { sortOrder: "asc" },
                },
            },
        });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        return res.status(200).json(course);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch course" });
    }
});
exports.default = router;
//# sourceMappingURL=courses.routes.js.map