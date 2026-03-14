import { Router, Request, Response } from "express";
import { prisma } from "../../db";

const router = Router();

// GET /api/topics - List all published topics
router.get("/", async (req: Request, res: Response) => {
  try {
    const topics = await prisma.topic.findMany({
      where: { isPublished: true },
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

// GET /api/topics/:slug - Get single published topic with published courses
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const topic = await prisma.topic.findFirst({
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
          orderBy: { publishedAt: "desc" },
        },
      },
    });

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    return res.status(200).json(topic);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch topic" });
  }
});

export default router;
