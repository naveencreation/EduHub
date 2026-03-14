import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      content: {
        findMany: vitestVi.fn(),
        findFirst: vitestVi.fn(),
      },
    },
  };
});

import app from '../../index';
import { prisma } from '../../db';

const mockContentFindMany = prisma.content.findMany as unknown as ReturnType<typeof vi.fn>;
const mockContentFindFirst = prisma.content.findFirst as unknown as ReturnType<typeof vi.fn>;

describe('Public content routes', () => {
  beforeEach(() => {
    mockContentFindMany.mockReset();
    mockContentFindFirst.mockReset();
  });

  describe('GET /api/search', () => {
    it('returns 400 when query is missing', async () => {
      const res = await request(app).get('/api/content/search');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Search query is required' });
    });

    it('returns 200 with results', async () => {
      mockContentFindMany.mockResolvedValue([{ id: 'c1', title: 'Test' }]);

      const res = await request(app).get('/api/content/search?q=test');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 'c1', title: 'Test' }]);
    });

    it('returns 500 when search fails', async () => {
      mockContentFindMany.mockRejectedValue(new Error('boom'));

      const res = await request(app).get('/api/content/search?q=test');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to search content' });
    });
  });

  describe('GET /api/content/latest', () => {
    it('returns 200 with list', async () => {
      mockContentFindMany.mockResolvedValue([{ id: 'c1', title: 'Recent' }]);

      const res = await request(app).get('/api/content/latest');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 'c1', title: 'Recent' }]);
    });

    it('returns 500 when latest fetch fails', async () => {
      mockContentFindMany.mockRejectedValue(new Error('boom'));

      const res = await request(app).get('/api/content/latest');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch latest content' });
    });
  });

  describe('GET /api/content/:slug', () => {
    it('returns 404 when content not found', async () => {
      mockContentFindFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/content/slug');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Content not found' });
    });

    it('returns 404 when topic or course is not published', async () => {
      mockContentFindFirst.mockResolvedValue({
        slug: 'slug',
        isPublished: true,
        sortOrder: 1,
        courseId: 'c1',
        topic: { isPublished: false },
        course: { isPublished: true },
      });

      const res = await request(app).get('/api/content/slug');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Content not found' });
    });

    it('returns 200 with navigation when content belongs to a course', async () => {
      mockContentFindFirst
        .mockResolvedValueOnce({
          slug: 'slug',
          isPublished: true,
          sortOrder: 1,
          courseId: 'c1',
          topic: { isPublished: true },
          course: { isPublished: true },
        })
        .mockResolvedValueOnce({ slug: 'prev', title: 'Prev' })
        .mockResolvedValueOnce({ slug: 'next', title: 'Next' });

      const res = await request(app).get('/api/content/slug');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('navigation');
      expect(res.body.navigation).toEqual({ prev: { slug: 'prev', title: 'Prev' }, next: { slug: 'next', title: 'Next' } });
    });

    it('returns 200 when content has no course (no navigation)', async () => {
      mockContentFindFirst
        .mockResolvedValue({
          slug: 'slug',
          isPublished: true,
          sortOrder: 1,
          courseId: null,
          topic: { isPublished: true },
          course: null,
        });

      const res = await request(app).get('/api/content/slug');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('navigation');
      expect(res.body.navigation).toEqual({ prev: null, next: null });
    });

    it('returns 500 when fetching content details fails', async () => {
      mockContentFindFirst.mockRejectedValue(new Error('boom'));

      const res = await request(app).get('/api/content/slug');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch content details' });
    });
  });
});
