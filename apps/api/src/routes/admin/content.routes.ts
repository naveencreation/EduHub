import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createContentSchema,
  updateContentSchema,
  reorderContentSchema,
} from "../../schemas/content.schema";
import slugify from "slugify";
import sanitizeHtml from "sanitize-html";

const router = Router();

// Helper to generate search vector text
const generateSearchText = (title: string, description?: string | null, body?: string | null) => {
  return `${title} ${description || ""} ${body ? sanitizeHtml(body, { allowedTags: [] }) : ""}`.toLowerCase();
};

// GET /api/admin/content
router.get("/", async (req: Request, res: Response) => {
  try {
    const { topicId, courseId } = req.query;
    const whereClause: any = {};
    if (topicId) whereClause.topicId = String(topicId);
    if (courseId) whereClause.courseId = String(courseId);

    const content = await prisma.content.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        topic: { select: { name: true } },
        course: { select: { title: true } },
        contentTags: { include: { tag: true } }
      },
    });
    return res.status(200).json(content);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch content" });
  }
});

// GET /api/admin/content/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const content = await prisma.content.findUnique({
      where: { id },
      include: { contentTags: { include: { tag: true } } }
    });
    if (!content) return res.status(404).json({ error: "Content not found" });
    return res.status(200).json(content);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch content block" });
  }
});

// POST /api/admin/content
router.post(
  "/",
  validateRequest(createContentSchema),
  async (req: Request, res: Response) => {
    try {
      const {
        topicId, courseId, title, type, description, body,
        fileUrl, streamId, thumbnailUrl, durationSecs, sortOrder, isPublished, tags
      } = req.body;
      
      let slug = req.body.slug || slugify(title, { lower: true, strict: true });
      slug = slugify(slug, { lower: true, strict: true });

      // Clean HTML if blog
      const cleanBody = type === "BLOG" && body ? sanitizeHtml(body, {
        allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'img'],
        allowedAttributes: { 'a': ['href'], 'img': ['src', 'alt'] }
      }) : body;

      const searchVector = generateSearchText(title, description, cleanBody);

      // Check slug uniqueness (topicId, courseId, slug)
      // courseId can be null, so we must query explicitly
      const existing = await prisma.content.findFirst({
        where: { topicId, courseId: courseId || null, slug },
      });
      if (existing) {
        return res.status(400).json({ error: "Content with this slug already exists in this context" });
      }

      const content = await prisma.content.create({
        data: {
          topicId,
          courseId,
          title,
          slug,
          type,
          description,
          body: cleanBody,
          fileUrl,
          streamId,
          thumbnailUrl,
          durationSecs,
          sortOrder,
          isPublished,
          publishedAt: isPublished ? new Date() : null,
          searchVector,
          contentTags: tags && tags.length > 0 ? {
            create: tags.map((tagId: string) => ({ tag: { connect: { id: tagId } } }))
          } : undefined
        },
      });

      return res.status(201).json(content);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create content" });
    }
  }
);

// PUT /api/admin/content/:id
router.put(
  "/:id",
  validateRequest(updateContentSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      // Get current to merge values and check logic
      const current = await prisma.content.findUnique({ where: { id }, include: { contentTags: true } });
      if (!current) return res.status(404).json({ error: "Content not found" });

      const targetTopicId = data.topicId || current.topicId;
      // Handle the fact that courseId might be missing in data (meaning no change) or explicitly null
      let targetCourseId = current.courseId;
      if (data.courseId !== undefined) targetCourseId = data.courseId;

      if (data.slug) {
        data.slug = slugify(data.slug, { lower: true, strict: true });
        
        const existing = await prisma.content.findFirst({
          where: { slug: data.slug, topicId: targetTopicId, courseId: targetCourseId, NOT: { id } },
        });
        if (existing) {
          return res.status(400).json({ error: "Content with this slug already exists" });
        }
      }

      // Handle publish toggle
      if (data.isPublished && !current.isPublished) {
        data.publishedAt = new Date();
      } else if (data.isPublished === false && current.isPublished) {
        data.publishedAt = null;
      }

      // Handle Body sanitization if blog & update search vector
      if (data.body && current.type === "BLOG") {
        data.body = sanitizeHtml(data.body, {
          allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'img'],
          allowedAttributes: { 'a': ['href'], 'img': ['src', 'alt'] }
        });
      }
      
      const newTitle = data.title || current.title;
      const newDesc = data.description !== undefined ? data.description : current.description;
      const newBody = data.body !== undefined ? data.body : current.body;
      data.searchVector = generateSearchText(newTitle, newDesc, newBody);

      // Handle tags update
      const tagsUpdate = data.tags ? {
        deleteMany: {}, // Clear existing tags
        create: data.tags.map((tagId: string) => ({ tag: { connect: { id: tagId } } }))
      } : undefined;
      
      delete data.tags; // Remove from typical data payload

      const content = await prisma.content.update({
        where: { id },
        data: {
          ...data,
          ...(tagsUpdate && { contentTags: tagsUpdate })
        },
      });

      return res.status(200).json(content);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update content" });
    }
  }
);

// DELETE /api/admin/content/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.content.delete({
      where: { id },
    });
    return res.status(200).json({ message: "Content deleted successfully" });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Content not found" });
    }
    return res.status(500).json({ error: "Failed to delete content" });
  }
});

// POST /api/admin/content/reorder
router.post(
  "/reorder",
  validateRequest(reorderContentSchema),
  async (req: Request, res: Response) => {
    try {
      const { contentIds } = req.body;

      await prisma.$transaction(
        contentIds.map((id: string, index: number) =>
          prisma.content.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );

      return res.status(200).json({ message: "Content reordered successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to reorder content" });
    }
  }
);

// Upload Presign routes (Placeholder for Cloudflare R2 / Stream)
router.post("/upload/presign", async (req: Request, res: Response) => {
  // TODO: Add AWS SDK to generate presigned R2 URLs
  return res.status(200).json({ uploadUrl: "placeholder_r2_url", fileUrl: "placeholder_file_url" });
});

router.post("/upload/video", async (req: Request, res: Response) => {
  // TODO: Call Cloudflare Stream API to get presigned upload URL
  return res.status(200).json({ uploadUrl: "placeholder_stream_url" });
});

export default router;
