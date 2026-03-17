import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      topic: {
        findMany: vitestVi.fn(),
        findFirst: vitestVi.fn(),
        count: vitestVi.fn(),
      },
    },
  };
});

import app from '../../index';
import { prisma } from '../../db';

const mockFindMany = prisma.topic.findMany as unknown as ReturnType<typeof vi.fn>;
const mockFindFirst = prisma.topic.findFirst as unknown as ReturnType<typeof vi.fn>;
const mockCount = prisma.topic.count as unknown as ReturnType<typeof vi.fn>;

describe('GET /api/topics', () => {
  beforeEach(() => {
    mockFindMany.mockReset();
    mockFindFirst.mockReset();
    mockCount.mockReset();
  });

  it('returns a list of topics', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'topic-1',
        name: 'Test Topic',
        slug: 'test-topic',
        description: 'Test description',
        sortOrder: 1,
        isPublished: true,
        thumbnailUrl: null,
        _count: { courses: 0, content: 0 },
      },
    ]);
    mockCount.mockResolvedValue(1);

    const res = await request(app).get('/api/topics');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ name: 'Test Topic', slug: 'test-topic' });
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      pages: 1,
    });
    expect(mockFindMany).toHaveBeenCalledWith({
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
      orderBy: { sortOrder: 'asc' },
      skip: 0,
      take: 10,
    });
    expect(mockCount).toHaveBeenCalledWith({ where: { isPublished: true } });
  });

  it('returns 500 when the database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('boom'));
    mockCount.mockRejectedValue(new Error('boom'));

    const res = await request(app).get('/api/topics');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch topics' });
  });

  describe('GET /api/topics/:slug', () => {
    it('returns 400 when slug is invalid', async () => {
      const res = await request(app).get('/api/topics/INVALID SLUG');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid slug: only alphanumeric, hyphens, and underscores allowed' });
    });

    it('returns 404 when topic is not found', async () => {
      mockFindFirst.mockResolvedValue(null);
      const res = await request(app).get('/api/topics/test-topic');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Topic not found' });
    });

    it('returns 200 when topic is found', async () => {
      mockFindFirst.mockResolvedValue({
        id: 'topic-1',
        slug: 'test-topic',
        name: 'Test Topic',
        isPublished: true,
        courses: [],
        content: [],
      });

      const res = await request(app).get('/api/topics/test-topic');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ slug: 'test-topic', name: 'Test Topic' });
    });

    it('returns 500 when fetching topic fails', async () => {
      mockFindFirst.mockRejectedValue(new Error('boom'));

      const res = await request(app).get('/api/topics/test-topic');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch topic' });
    });
  });
});
