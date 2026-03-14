import { Router, Request, Response } from "express";
import { prisma } from "../../db";

const router = Router();

// GET /api/tags/:slug/content - Get all published content with a specific tag
router.get("/:slug/content", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const tag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    const content = await prisma.content.findMany({
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
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch content by tag" });
  }
});

// GET /api/tags - Get all tags (optional but useful for public filtering UI)
router.get("/", async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
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
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch tags" });
  }
});

export default router;
