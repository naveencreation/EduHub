import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      admin: {
        findUnique: vitestVi.fn(),
      },
      content: {
        findUnique: vitestVi.fn(),
        findFirst: vitestVi.fn(),
        update: vitestVi.fn(),
        delete: vitestVi.fn(),
      },
      $transaction: vitestVi.fn(),
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
const mockContentFindUnique = prisma.content.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockContentFindFirst = prisma.content.findFirst as unknown as ReturnType<typeof vi.fn>;
const mockContentUpdate = prisma.content.update as unknown as ReturnType<typeof vi.fn>;
const mockContentDelete = prisma.content.delete as unknown as ReturnType<typeof vi.fn>;
const mockTransaction = prisma.$transaction as unknown as ReturnType<typeof vi.fn>;

describe('Admin content update/delete/reorder routes', () => {
  beforeEach(() => {
    mockAdminFindUnique.mockReset();
    mockContentFindUnique.mockReset();
    mockContentFindFirst.mockReset();
    mockContentUpdate.mockReset();
    mockContentDelete.mockReset();
    mockTransaction.mockReset();
  });

  it('returns 404 when updating non-existent content', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ title: 'New title' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Content not found' });
  });

  it('returns 400 when updating with a duplicate slug', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindUnique.mockResolvedValue({ id: 'content-1', title: 'Old title', type: 'BLOG', isPublished: false });
    mockContentFindFirst.mockResolvedValue({ id: 'content-2' });

    const res = await request(app)
      .put('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ slug: 'new-slug' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Content with this slug already exists' });
  });

  it('updates content and sets publishedAt when publishing', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Old title',
      type: 'BLOG',
      isPublished: false,
      body: '<p>old</p>',
      description: 'old desc',
    });
    mockContentUpdate.mockResolvedValue({ id: 'content-1', title: 'New title' });

    const res = await request(app)
      .put('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        title: 'New title',
        isPublished: true,
        body: '<script>alert(1)</script><p>ok</p>',
        tags: [
          '123e4567-e89b-12d3-a456-426614174001',
          '123e4567-e89b-12d3-a456-426614174002',
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'content-1', title: 'New title' });

    const updateCall = mockContentUpdate.mock.calls[0][0];
    expect(updateCall.where).toEqual({ id: 'content-1' });
    expect(updateCall.data).toMatchObject({
      title: 'New title',
      body: '<p>ok</p>',
      isPublished: true,
      contentTags: {
        deleteMany: {},
        create: [
          { tag: { connect: { id: '123e4567-e89b-12d3-a456-426614174001' } } },
          { tag: { connect: { id: '123e4567-e89b-12d3-a456-426614174002' } } },
        ],
      },
    });
    expect(updateCall.data.publishedAt).toBeDefined();
    expect(updateCall.data.searchVector).toContain('new title');
  });

  it('unpublishes content by setting publishedAt to null', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Old title',
      type: 'BLOG',
      isPublished: true,
      body: '<p>old</p>',
      description: 'old desc',
    });
    mockContentUpdate.mockResolvedValue({ id: 'content-1', title: 'Old title' });

    const res = await request(app)
      .put('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ isPublished: false });

    expect(res.status).toBe(200);
    const updateCall = mockContentUpdate.mock.calls[0][0];
    expect(updateCall.data.publishedAt).toBeNull();
  });

  it('updates content without slug (skips uniqueness check)', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Old title',
      type: 'VIDEO',
      isPublished: false,
      body: 'old',
      description: 'old desc',
      topicId: 'topic-1',
      courseId: 'course-1',
    });
    mockContentUpdate.mockResolvedValue({ id: 'content-1', title: 'New title' });

    const res = await request(app)
      .put('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ title: 'New title' });

    expect(res.status).toBe(200);
    expect(mockContentFindFirst).not.toHaveBeenCalled();
  });

  it('does not sanitize body when content type is VIDEO', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Old title',
      type: 'VIDEO',
      isPublished: false,
      body: 'old',
      description: 'old desc',
      topicId: 'topic-1',
      courseId: 'course-1',
    });
    mockContentUpdate.mockResolvedValue({ id: 'content-1', title: 'New title' });

    const res = await request(app)
      .put('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ body: '<script>alert(1)</script>' });

    expect(res.status).toBe(200);
    const updateCall = mockContentUpdate.mock.calls[0][0];
    expect(updateCall.data.body).toBe('<script>alert(1)</script>');
  });

  it('uses provided courseId when checking slug uniqueness', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentFindUnique.mockResolvedValue({
      id: 'content-1',
      title: 'Old title',
      type: 'BLOG',
      isPublished: true,
      body: '<p>old</p>',
      description: 'old desc',
      courseId: 'course-1',
      topicId: 'topic-1',
    });
    mockContentFindFirst.mockResolvedValue(null);
    mockContentUpdate.mockResolvedValue({ id: 'content-1', title: 'New title' });

    const res = await request(app)
      .put('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ slug: 'new-slug', courseId: null });

    expect(res.status).toBe(200);
    expect(mockContentFindFirst).toHaveBeenCalledWith({
      where: { slug: 'new-slug', topicId: 'topic-1', courseId: null, NOT: { id: 'content-1' } },
    });
  });

  it('deletes content successfully', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentDelete.mockResolvedValue({});

    const res = await request(app)
      .delete('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Content deleted successfully' });
  });

  it('returns 404 when deleting non-existent content', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentDelete.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .delete('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Content not found' });
  });

  it('reorders content entries', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockContentUpdate.mockImplementation((params) => params);
    mockTransaction.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/admin/content/reorder')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        contentIds: [
          '123e4567-e89b-12d3-a456-426614174010',
          '123e4567-e89b-12d3-a456-426614174011',
          '123e4567-e89b-12d3-a456-426614174012',
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Content reordered successfully' });
    expect(mockTransaction).toHaveBeenCalledWith([
      expect.objectContaining({
        where: { id: '123e4567-e89b-12d3-a456-426614174010' },
        data: { sortOrder: 0 },
      }),
      expect.objectContaining({
        where: { id: '123e4567-e89b-12d3-a456-426614174011' },
        data: { sortOrder: 1 },
      }),
      expect.objectContaining({
        where: { id: '123e4567-e89b-12d3-a456-426614174012' },
        data: { sortOrder: 2 },
      }),
    ]);
  });

  it('returns 400 when reorder payload is invalid', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });

    const res = await request(app)
      .post('/api/admin/content/reorder')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ contentIds: ['not-a-uuid'] });

    expect(res.status).toBe(400);
  });

});
