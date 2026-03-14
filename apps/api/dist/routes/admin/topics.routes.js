"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const validateRequest_1 = require("../../middlewares/validateRequest");
const topic_schema_1 = require("../../schemas/topic.schema");
const slugify_1 = __importDefault(require("slugify"));
const router = (0, express_1.Router)();
// GET /api/admin/topics
router.get("/", async (req, res) => {
    try {
        const topics = await db_1.prisma.topic.findMany({
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
        return res.status(500).json({ error: "Failed to fetch topics" });
    }
});
// GET /api/admin/topics/:id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const topic = await db_1.prisma.topic.findUnique({
            where: { id },
        });
        if (!topic)
            return res.status(404).json({ error: "Topic not found" });
        return res.status(200).json(topic);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch topic" });
    }
});
// POST /api/admin/topics
router.post("/", (0, validateRequest_1.validateRequest)(topic_schema_1.createTopicSchema), async (req, res) => {
    try {
        const { name, description, thumbnailUrl, sortOrder, isPublished } = req.body;
        // Generate slug or use provided
        let slug = req.body.slug;
        if (!slug) {
            slug = (0, slugify_1.default)(name, { lower: true, strict: true });
        }
        else {
            slug = (0, slugify_1.default)(slug, { lower: true, strict: true });
        }
        // Check slug uniqueness
        const existing = await db_1.prisma.topic.findUnique({ where: { slug } });
        if (existing) {
            return res.status(400).json({ error: "Topic with this slug already exists" });
        }
        const topic = await db_1.prisma.topic.create({
            data: {
                name,
                slug,
                description,
                thumbnailUrl,
                sortOrder,
                isPublished,
            },
        });
        return res.status(201).json(topic);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to create topic" });
    }
});
// PUT /api/admin/topics/:id
router.put("/:id", (0, validateRequest_1.validateRequest)(topic_schema_1.updateTopicSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (data.slug) {
            data.slug = (0, slugify_1.default)(data.slug, { lower: true, strict: true });
            // Check slug uniqueness
            const existing = await db_1.prisma.topic.findFirst({
                where: { slug: data.slug, NOT: { id } },
            });
            if (existing) {
                return res.status(400).json({ error: "Topic with this slug already exists" });
            }
        }
        const topic = await db_1.prisma.topic.update({
            where: { id },
            data,
        });
        return res.status(200).json(topic);
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Topic not found" });
        }
        return res.status(500).json({ error: "Failed to update topic" });
    }
});
// DELETE /api/admin/topics/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.topic.delete({
            where: { id },
        });
        return res.status(200).json({ message: "Topic deleted successfully" });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Topic not found" });
        }
        return res.status(500).json({ error: "Failed to delete topic" });
    }
});
// POST /api/admin/topics/reorder
router.post("/reorder", (0, validateRequest_1.validateRequest)(topic_schema_1.reorderTopicsSchema), async (req, res) => {
    try {
        const { topicIds } = req.body;
        // Update in transaction to ensure all or nothing
        await db_1.prisma.$transaction(topicIds.map((id, index) => db_1.prisma.topic.update({
            where: { id },
            data: { sortOrder: index },
        })));
        return res.status(200).json({ message: "Topics reordered successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to reorder topics" });
    }
});
exports.default = router;
//# sourceMappingURL=topics.routes.js.map