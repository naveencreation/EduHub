import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma and auth utilities
vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      admin: {
        findUnique: vitestVi.fn(),
      },
      content: {
        findFirst: vitestVi.fn(),
        create: vitestVi.fn(),
      },
    },
  };
});

vi.mock('../../utils/auth', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    verifyToken: vitestVi.fn(() => ({ id: 'admin-123' })),
  };
});

import app from '../../index';
import { prisma } from '../../db';

const mockAdminFindUnique = prisma.admin.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockContentFindFirst = prisma.content.findFirst as unknown as ReturnType<typeof vi.fn>;
const mockContentCreate = prisma.content.create as unknown as ReturnType<typeof vi.fn>;

describe('POST /api/admin/content (protected)', () => {
  beforeEach(() => {
    mockAdminFindUnique.mockReset();
    mockContentFindFirst.mockReset();
    mockContentCreate.mockReset();
  });

  it('creates content when slug is unique', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindFirst.mockResolvedValue(null);
    mockContentCreate.mockResolvedValue({
      id: 'content-123',
      title: 'Test Content',
      slug: 'test-content',
      type: 'BLOG',
      isPublished: true,
    });

    const res = await request(app)
      .post('/api/admin/content')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        topicId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Content',
        type: 'BLOG',
        description: 'A test',
        body: '<p>test</p>',
        isPublished: true,
        tags: ['123e4567-e89b-12d3-a456-426614174001'],
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 'content-123',
      title: 'Test Content',
      slug: 'test-content',
      type: 'BLOG',
    });

    expect(mockContentFindFirst).toHaveBeenCalled();
    expect(mockContentCreate).toHaveBeenCalled();
  });

  it('creates content when type is VIDEO and html body is not sanitized', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindFirst.mockResolvedValue(null);
    mockContentCreate.mockResolvedValue({
      id: 'content-124',
      title: 'Video Content',
      slug: 'video-content',
      type: 'VIDEO',
      isPublished: false,
    });

    const res = await request(app)
      .post('/api/admin/content')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        topicId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Video Content',
        type: 'VIDEO',
        description: 'A test',
        body: '<script>alert(1)</script>',
        isPublished: false,
      });

    expect(res.status).toBe(201);
    expect(mockContentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          body: '<script>alert(1)</script>',
        }),
      })
    );
  });

  it('creates content with missing description/body', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindFirst.mockResolvedValue(null);
    mockContentCreate.mockResolvedValue({
      id: 'content-125',
      title: 'Empty Body',
      slug: 'empty-body',
      type: 'BLOG',
      isPublished: false,
    });

    const res = await request(app)
      .post('/api/admin/content')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        topicId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Empty Body',
        type: 'BLOG',
        isPublished: false,
      });

    expect(res.status).toBe(201);
  });

  it('returns 400 when content slug already exists', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindFirst.mockResolvedValue({ id: 'content-1', slug: 'test-content' });

    const res = await request(app)
      .post('/api/admin/content')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        topicId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Content',
        type: 'BLOG',
        description: 'A test',
        body: '<p>test</p>',
        isPublished: true,
        tags: [],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Content with this slug already exists in this context' });
  });

  it('returns 500 when content creation fails unexpectedly', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindFirst.mockResolvedValue(null);
    mockContentCreate.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .post('/api/admin/content')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        topicId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Content',
        type: 'BLOG',
        description: 'A test',
        body: '<p>test</p>',
        isPublished: true,
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to create content' });
  });

  it('creates content when tags are absent and courseId is null', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindFirst.mockResolvedValue(null);
    mockContentCreate.mockResolvedValue({
      id: 'content-2',
      title: 'No tags',
      slug: 'no-tags',
      type: 'VIDEO',
      isPublished: false,
    });

    const res = await request(app)
      .post('/api/admin/content')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        topicId: '123e4567-e89b-12d3-a456-426614174000',
        courseId: null,
        title: 'No tags',
        type: 'VIDEO',
        description: 'A test',
        body: 'plain text body',
        isPublished: false,
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 'content-2', title: 'No tags' });
    expect(mockContentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          courseId: null,
          body: 'plain text body',
        }),
      })
    );
  });
});
