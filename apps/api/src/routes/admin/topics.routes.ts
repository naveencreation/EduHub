import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createTopicSchema,
  updateTopicSchema,
  reorderTopicsSchema,
} from "../../schemas/topic.schema";
import slugify from "slugify";

const router = Router();

// GET /api/admin/topics
router.get("/", async (_req: Request, res: Response) => {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { courses: true, content: true },
        },
      },
    });
    return res.status(200).json(topics);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch topics" });
  }
});

// GET /api/admin/topics/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const topic = await prisma.topic.findUnique({
      where: { id },
    });
    if (!topic) return res.status(404).json({ error: "Topic not found" });
    return res.status(200).json(topic);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch topic" });
  }
});

// POST /api/admin/topics
router.post(
  "/",
  validateRequest(createTopicSchema),
  async (req: Request, res: Response) => {
    try {
      const { name, description, thumbnailUrl, sortOrder, isPublished } = req.body;
      
      // Generate slug or use provided
      let slug = req.body.slug;
      if (!slug) {
        slug = slugify(name, { lower: true, strict: true });
      } else {
        slug = slugify(slug, { lower: true, strict: true });
      }

      // Check slug uniqueness
      const existing = await prisma.topic.findUnique({ where: { slug } });
      if (existing) {
        return res.status(400).json({ error: "Topic with this slug already exists" });
      }

      const topic = await prisma.topic.create({
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
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create topic" });
    }
  }
);

// PUT /api/admin/topics/:id
router.put(
  "/:id",
  validateRequest(updateTopicSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      if (data.slug) {
        data.slug = slugify(data.slug, { lower: true, strict: true });
        
        // Check slug uniqueness
        const existing = await prisma.topic.findFirst({
          where: { slug: data.slug, NOT: { id } },
        });
        if (existing) {
          return res.status(400).json({ error: "Topic with this slug already exists" });
        }
      }

      const topic = await prisma.topic.update({
        where: { id },
        data,
      });

      return res.status(200).json(topic);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: "Topic not found" });
      }
      return res.status(500).json({ error: "Failed to update topic" });
    }
  }
);

// DELETE /api/admin/topics/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.topic.delete({
      where: { id },
    });
    return res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Topic not found" });
    }
    return res.status(500).json({ error: "Failed to delete topic" });
  }
});

// POST /api/admin/topics/reorder
router.post(
  "/reorder",
  validateRequest(reorderTopicsSchema),
  async (req: Request, res: Response) => {
    try {
      const { topicIds } = req.body;

      // Update in transaction to ensure all or nothing
      await prisma.$transaction(
        topicIds.map((id: string, index: number) =>
          prisma.topic.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );

      return res.status(200).json({ message: "Topics reordered successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to reorder topics" });
    }
  }
);

export default router;
