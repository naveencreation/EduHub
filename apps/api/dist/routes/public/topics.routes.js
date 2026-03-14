"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const validation_1 = require("../../utils/validation");
const router = (0, express_1.Router)();
// GET /api/topics - List all published topics
router.get("/", async (req, res) => {
    try {
        const topics = await db_1.prisma.topic.findMany({
            where: { isPublished: true },
            orderBy: { sortOrder: "asc" },
            include: {
                _count: {
                    select: { courses: true, content: true },
                },
            },
        });
        return res.status(200).json(topics);
    }
    catch (error) {
        console.error("Failed to fetch topics:", error);
        return res.status(500).json({ error: "Failed to fetch topics" });
    }
});
// GET /api/topics/:slug - Get single published topic with published courses
router.get("/:slug", async (req, res) => {
    try {
        // Validate slug input
        const slug = (0, validation_1.validateSlug)(req.params.slug);
        const topic = await db_1.prisma.topic.findFirst({
            where: { slug, isPublished: true },
            include: {
                courses: {
                    where: { isPublished: true },
                    orderBy: { sortOrder: "asc" },
                    include: {
                        _count: {
                            select: { content: { where: { isPublished: true } } },
                        },
                    },
                },
                content: {
                    where: { isPublished: true, courseId: null }, // Standalone content only
                    orderBy: { sortOrder: "asc" },
                },
            },
        });
        if (!topic) {
            return res.status(404).json({ error: "Topic not found" });
        }
        return res.status(200).json(topic);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes("Invalid")) {
            return res.status(400).json({ error: error.message });
        }
        console.error("Failed to fetch topic:", error);
        return res.status(500).json({ error: "Failed to fetch topic" });
    }
});
exports.default = router;
//# sourceMappingURL=topics.routes.js.map