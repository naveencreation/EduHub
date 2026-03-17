import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { validateSlug } from "../../utils/validation";

const router = Router();

// GET /api/topics - List all published topics with pagination and caching
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    // Set cache headers for public data (5 minutes)
    res.set("Cache-Control", "public, max-age=300");
    res.set("ETag", `topics-${Date.now()}`);

    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          thumbnailUrl: true,
          sortOrder: true,
          _count: {
            select: { courses: true, content: true },
          },
        },
        orderBy: { sortOrder: "asc" },
        skip,
        take: limit,
      }),
      prisma.topic.count({ where: { isPublished: true } }),
    ]);

    return res.status(200).json({
      data: topics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch topics:", error);
    return res.status(500).json({ error: "Failed to fetch topics" });
  }
});

// GET /api/topics/:slug - Get single published topic with published courses
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    // Validate slug input
    const slug = validateSlug(req.params.slug);

    // Set cache headers for public data (5 minutes)
    res.set("Cache-Control", "public, max-age=300");

    const topic = await prisma.topic.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        thumbnailUrl: true,
        sortOrder: true,
        courses: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnailUrl: true,
            sortOrder: true,
            _count: {
              select: { content: { where: { isPublished: true } } },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        content: {
          where: { isPublished: true, courseId: null },
          select: {
            id: true,
            title: true,
            type: true,
            description: true,
            fileUrl: true,
            durationSecs: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    return res.status(200).json(topic);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid")) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Failed to fetch topic:", error);
    return res.status(500).json({ error: "Failed to fetch topic" });
  }
});

export default router;
