import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createCourseSchema,
  updateCourseSchema,
  reorderCoursesSchema,
} from "../../schemas/course.schema";
import slugify from "slugify";

const router = Router();

// GET /api/admin/courses (supports ?topicId=uuid)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { topicId } = req.query;
    const whereClause = topicId ? { topicId: String(topicId) } : {};

    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: { sortOrder: "asc" },
      include: {
        topic: { select: { name: true } },
        _count: { select: { content: true } },
      },
    });
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// GET /api/admin/courses/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
    });
    if (!course) return res.status(404).json({ error: "Course not found" });
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch course" });
  }
});

// POST /api/admin/courses
router.post(
  "/",
  validateRequest(createCourseSchema),
  async (req: Request, res: Response) => {
    try {
      const { topicId, title, description, thumbnailUrl, sortOrder, isPublished } = req.body;
      
      let slug = req.body.slug;
      if (!slug) {
        slug = slugify(title, { lower: true, strict: true });
      } else {
        slug = slugify(slug, { lower: true, strict: true });
      }

      // Check slug uniqueness within the topic
      const existing = await prisma.course.findUnique({
        where: { topicId_slug: { topicId, slug } },
      });
      if (existing) {
        return res.status(400).json({ error: "Course with this slug already exists in the selected topic" });
      }

      const course = await prisma.course.create({
        data: {
          topicId,
          title,
          slug,
          description,
          thumbnailUrl,
          sortOrder,
          isPublished,
        },
      });

      return res.status(201).json(course);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create course" });
    }
  }
);

// PUT /api/admin/courses/:id
router.put(
  "/:id",
  validateRequest(updateCourseSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      // Get current course to check topic ID
      const currentCourse = await prisma.course.findUnique({ where: { id } });
      if (!currentCourse) return res.status(404).json({ error: "Course not found" });

      const targetTopicId = data.topicId || currentCourse.topicId;

      if (data.slug) {
        data.slug = slugify(data.slug, { lower: true, strict: true });
        
        // Check slug uniqueness in target topic
        const existing = await prisma.course.findFirst({
          where: { slug: data.slug, topicId: targetTopicId, NOT: { id } },
        });
        if (existing) {
          return res.status(400).json({ error: "Course with this slug already exists in the selected topic" });
        }
      }

      const course = await prisma.course.update({
        where: { id },
        data,
      });

      return res.status(200).json(course);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update course" });
    }
  }
);

// DELETE /api/admin/courses/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // According to PRD, cascade is SetNull for content (Prisma handles this via schema definition)
    await prisma.course.delete({
      where: { id },
    });
    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.status(500).json({ error: "Failed to delete course" });
  }
});

// POST /api/admin/courses/reorder
router.post(
  "/reorder",
  validateRequest(reorderCoursesSchema),
  async (req: Request, res: Response) => {
    try {
      const { courseIds } = req.body;

      await prisma.$transaction(
        courseIds.map((id: string, index: number) =>
          prisma.course.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );

      return res.status(200).json({ message: "Courses reordered successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to reorder courses" });
    }
  }
);

export default router;
