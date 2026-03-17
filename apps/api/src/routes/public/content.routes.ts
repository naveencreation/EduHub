import { Router, Request, Response } from "express";
import { prisma } from "../../db";

const router = Router();

// GET /api/search?q=:query - Full-text search
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Full text search via plain simple contains mapping on the server, since Postgres tsvector 
    // needs raw SQL which requires knowing the exact tsquery syntaxes. For Prisma standard:
    const content = await prisma.content.findMany({
      where: {
        isPublished: true,
        topic: { isPublished: true },
        OR: [
          { courseId: null },
          { course: { isPublished: true } }
        ],
        searchVector: {
          contains: q.toLowerCase()
        }
      },
      take: 20,
      include: {
        topic: { select: { name: true, slug: true } },
        course: { select: { title: true, slug: true } },
      },
    });

    return res.status(200).json(content);
  } catch (error) {
    return res.status(500).json({ error: "Failed to search content" });
  }
});

// GET /api/content/latest - 12 most recently published lessons
router.get("/latest", async (_req: Request, res: Response) => {
  try {
    const content = await prisma.content.findMany({
      where: {
        isPublished: true,
        topic: { isPublished: true },
        OR: [
          { courseId: null },
          { course: { isPublished: true } }
        ]
      },
      orderBy: { publishedAt: "desc" },
      take: 12,
      include: {
        topic: { select: { name: true, slug: true } },
        course: { select: { title: true, slug: true } },
      },
    });

    return res.status(200).json(content);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch latest content" });
  }
});

// GET /api/content/:slug - Get single published lesson details
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Using slug exclusively implies slugs are globally unique for lessons.
    // The PRD specifies slug uniqueness is (topicId, courseId, slug).
    // The public route /api/content/:slug assumes the slug provided from the URL uniquely identifies the lesson.
    // If slugs are reused, we might need a composite lookup! However, typically you find by slug directly if global.
    // Let's assume the frontend passes the unique path or we findFirst.
    const content = await prisma.content.findFirst({
      where: { slug, isPublished: true },
      include: {
        topic: { select: { name: true, slug: true, isPublished: true } },
        course: { select: { title: true, slug: true, isPublished: true, id: true } },
        contentTags: { include: { tag: true } }
      },
    });

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    // Verify parent visibility
    if (!content.topic?.isPublished || (content.courseId && !content.course?.isPublished)) {
      return res.status(404).json({ error: "Content not found" });
    }

    // Optionally fetch next/prev lessons if part of a course
    let prevLesson = null;
    let nextLesson = null;

    if (content.courseId) {
      prevLesson = await prisma.content.findFirst({
        where: { courseId: content.courseId, isPublished: true, sortOrder: { lt: content.sortOrder } },
        orderBy: { sortOrder: "desc" },
        select: { slug: true, title: true }
      });
      nextLesson = await prisma.content.findFirst({
        where: { courseId: content.courseId, isPublished: true, sortOrder: { gt: content.sortOrder } },
        orderBy: { sortOrder: "asc" },
        select: { slug: true, title: true }
      });
    }

    return res.status(200).json({
      content,
      navigation: { prev: prevLesson, next: nextLesson }
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch content details" });
  }
});

export default router;
