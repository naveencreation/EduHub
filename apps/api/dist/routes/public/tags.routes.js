"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const router = (0, express_1.Router)();
// GET /api/tags/:slug/content - Get all published content with a specific tag
router.get("/:slug/content", async (req, res) => {
    try {
        const { slug } = req.params;
        const tag = await db_1.prisma.tag.findUnique({
            where: { slug },
        });
        if (!tag) {
            return res.status(404).json({ error: "Tag not found" });
        }
        const content = await db_1.prisma.content.findMany({
            where: {
                isPublished: true,
                contentTags: {
                    some: { tagId: tag.id },
                },
                topic: { isPublished: true },
                // If it has a course, the course must be published
                OR: [
                    { courseId: null },
                    { course: { isPublished: true } }
                ]
            },
            include: {
                topic: { select: { name: true, slug: true } },
                course: { select: { title: true, slug: true } },
                contentTags: {
                    include: { tag: true }
                }
            },
            orderBy: { publishedAt: "desc" },
        });
        return res.status(200).json({ tag, content });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch content by tag" });
    }
});
// GET /api/tags - Get all tags (optional but useful for public filtering UI)
router.get("/", async (req, res) => {
    try {
        const tags = await db_1.prisma.tag.findMany({
            orderBy: { name: "asc" },
            where: {
                contentTags: {
                    some: {
                        content: { isPublished: true }
                    }
                }
            }
        });
        return res.status(200).json(tags);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch tags" });
    }
});
exports.default = router;
//# sourceMappingURL=tags.routes.js.map