import { Router, Request, Response } from "express";
import { prisma } from "../../db";

const router = Router();

// GET /api/courses - List all published courses with topic info
router.get("/", async (_req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
      include: {
        topic: {
          select: { name: true, slug: true },
        },
        _count: {
          select: { content: { where: { isPublished: true } } },
        },
      },
    });
    return res.status(200).json(courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// GET /api/courses/:slug - Get single published course with published lessons
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const course = await prisma.course.findFirst({
      where: { slug, isPublished: true },
      include: {
        topic: { select: { name: true, slug: true } },
        content: {
          where: { isPublished: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch course" });
  }
});

export default router;
