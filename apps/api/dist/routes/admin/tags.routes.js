"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const validateRequest_1 = require("../../middlewares/validateRequest");
const tag_schema_1 = require("../../schemas/tag.schema");
const slugify_1 = __importDefault(require("slugify"));
const router = (0, express_1.Router)();
// GET /api/admin/tags
router.get("/", async (req, res) => {
    try {
        const tags = await db_1.prisma.tag.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: { select: { contentTags: true } },
            },
        });
        return res.status(200).json(tags);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch tags" });
    }
});
// POST /api/admin/tags
router.post("/", (0, validateRequest_1.validateRequest)(tag_schema_1.createTagSchema), async (req, res) => {
    try {
        // PRD enforces lowercase to prevent typos like "Beginner" vs "beginner"
        const name = req.body.name.toLowerCase().trim();
        const slug = (0, slugify_1.default)(name, { strict: true });
        const existing = await db_1.prisma.tag.findFirst({
            where: { OR: [{ name }, { slug }] },
        });
        if (existing) {
            return res.status(400).json({ error: "Tag already exists" });
        }
        const tag = await db_1.prisma.tag.create({
            data: { name, slug },
        });
        return res.status(201).json(tag);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to create tag" });
    }
});
// PUT /api/admin/tags/:id
router.put("/:id", (0, validateRequest_1.validateRequest)(tag_schema_1.updateTagSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const name = req.body.name.toLowerCase().trim();
        const slug = (0, slugify_1.default)(name, { strict: true });
        const existing = await db_1.prisma.tag.findFirst({
            where: {
                OR: [{ name }, { slug }],
                NOT: { id }
            },
        });
        if (existing) {
            return res.status(400).json({ error: "Tag name or slug already in use" });
        }
        const tag = await db_1.prisma.tag.update({
            where: { id },
            data: { name, slug },
        });
        return res.status(200).json(tag);
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Tag not found" });
        }
        return res.status(500).json({ error: "Failed to update tag" });
    }
});
// DELETE /api/admin/tags/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.tag.delete({
            where: { id },
        });
        return res.status(200).json({ message: "Tag deleted successfully" });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Tag not found" });
        }
        return res.status(500).json({ error: "Failed to delete tag" });
    }
});
exports.default = router;
//# sourceMappingURL=tags.routes.js.map