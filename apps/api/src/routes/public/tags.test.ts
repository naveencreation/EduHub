import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      tag: {
        findUnique: vitestVi.fn(),
        findMany: vitestVi.fn(),
      },
      content: {
        findMany: vitestVi.fn(),
      },
    },
  };
});

import app from '../../index';
import { prisma } from '../../db';

const mockTagFindUnique = prisma.tag.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockTagFindMany = prisma.tag.findMany as unknown as ReturnType<typeof vi.fn>;
const mockContentFindMany = prisma.content.findMany as unknown as ReturnType<typeof vi.fn>;

describe('GET /api/tags', () => {
  beforeEach(() => {
    mockTagFindUnique.mockReset();
    mockTagFindMany.mockReset();
    mockContentFindMany.mockReset();
  });

  it('returns a list of tags', async () => {
    mockTagFindMany.mockResolvedValue([
      { id: 'tag-1', name: 'Tag 1', slug: 'tag-1' },
      { id: 'tag-2', name: 'Tag 2', slug: 'tag-2' },
    ]);

    const res = await request(app).get('/api/tags');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('slug', 'tag-1');
  });

  it('returns 500 when the database throws on list', async () => {
    mockTagFindMany.mockRejectedValue(new Error('boom'));

    const res = await request(app).get('/api/tags');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch tags' });
  });

  it('returns content for a tag when found', async () => {
    mockTagFindUnique.mockResolvedValue({ id: 'tag-1', name: 'Tag 1', slug: 'tag-1' });
    mockContentFindMany.mockResolvedValue([
      {
        id: 'content-1',
        title: 'Content 1',
        slug: 'content-1',
        isPublished: true,
        topic: { name: 'Topic', slug: 'topic' },
        course: { title: 'Course', slug: 'course' },
        contentTags: [{ tag: { id: 'tag-1', name: 'Tag 1', slug: 'tag-1' } }],
      },
    ]);

    const res = await request(app).get('/api/tags/tag-1/content');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tag');
    expect(res.body).toHaveProperty('content');
    expect(res.body.content).toHaveLength(1);
  });

  it('returns 404 when tag not found', async () => {
    mockTagFindUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/tags/missing/content');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Tag not found' });
  });

  it('returns 500 when fetching content by tag fails', async () => {
    mockTagFindUnique.mockRejectedValue(new Error('boom'));

    const res = await request(app).get('/api/tags/tag-1/content');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch content by tag' });
  });
});
