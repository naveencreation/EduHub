import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTagSchema, updateTagSchema } from "../../schemas/tag.schema";
import slugify from "slugify";

const router = Router();

// GET /api/admin/tags
router.get("/", async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { contentTags: true } },
      },
    });
    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// POST /api/admin/tags
router.post(
  "/",
  validateRequest(createTagSchema),
  async (req: Request, res: Response) => {
    try {
      // PRD enforces lowercase to prevent typos like "Beginner" vs "beginner"
      const name = req.body.name.toLowerCase().trim();
      const slug = slugify(name, { strict: true });

      const existing = await prisma.tag.findFirst({
        where: { OR: [{ name }, { slug }] },
      });

      if (existing) {
        return res.status(400).json({ error: "Tag already exists" });
      }

      const tag = await prisma.tag.create({
        data: { name, slug },
      });

      return res.status(201).json(tag);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create tag" });
    }
  }
);

// PUT /api/admin/tags/:id
router.put(
  "/:id",
  validateRequest(updateTagSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const name = req.body.name.toLowerCase().trim();
      const slug = slugify(name, { strict: true });

      const existing = await prisma.tag.findFirst({
        where: { 
          OR: [{ name }, { slug }],
          NOT: { id }
        },
      });

      if (existing) {
        return res.status(400).json({ error: "Tag name or slug already in use" });
      }

      const tag = await prisma.tag.update({
        where: { id },
        data: { name, slug },
      });

      return res.status(200).json(tag);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: "Tag not found" });
      }
      return res.status(500).json({ error: "Failed to update tag" });
    }
  }
);

// DELETE /api/admin/tags/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.tag.delete({
      where: { id },
    });
    return res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Tag not found" });
    }
    return res.status(500).json({ error: "Failed to delete tag" });
  }
});

export default router;
