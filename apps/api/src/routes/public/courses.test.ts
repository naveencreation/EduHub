import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      course: {
        findMany: vitestVi.fn(),
        findFirst: vitestVi.fn(),
      },
    },
  };
});

import app from '../../index';
import { prisma } from '../../db';

const mockFindMany = prisma.course.findMany as unknown as ReturnType<typeof vi.fn>;
const mockFindFirst = prisma.course.findFirst as unknown as ReturnType<typeof vi.fn>;

describe('GET /api/courses', () => {
  beforeEach(() => {
    mockFindMany.mockReset();
    mockFindFirst.mockReset();
  });

  it('returns a list of courses', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'course-1',
        title: 'Test Course',
        slug: 'test-course',
        description: 'Test description',
        sortOrder: 1,
        isPublished: true,
        topic: { name: 'Topic', slug: 'topic' },
        _count: { content: 3 },
      },
    ]);

    const res = await request(app).get('/api/courses');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ title: 'Test Course', slug: 'test-course' });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        topic: {
          select: { name: true, slug: true },
        },
        _count: {
          select: { content: { where: { isPublished: true } } },
        },
      },
    });
  });

  it('returns 500 when the database throws on list', async () => {
    mockFindMany.mockRejectedValue(new Error('boom'));

    const res = await request(app).get('/api/courses');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch courses' });
  });

  it('returns a single course by slug', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'course-1',
      title: 'Test Course',
      slug: 'test-course',
      description: 'Test description',
      sortOrder: 1,
      isPublished: true,
      topic: { name: 'Topic', slug: 'topic' },
      content: [],
    });

    const res = await request(app).get('/api/courses/test-course');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ slug: 'test-course' });

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { slug: 'test-course', isPublished: true },
      include: {
        topic: { select: { name: true, slug: true } },
        content: {
          where: { isPublished: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  });

  it('returns 404 when course is not found', async () => {
    mockFindFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/courses/not-found');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Course not found' });
  });

  it('returns 500 when fetching course fails unexpectedly', async () => {
    mockFindFirst.mockRejectedValue(new Error('boom'));

    const res = await request(app).get('/api/courses/test-course');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch course' });
  });
});
