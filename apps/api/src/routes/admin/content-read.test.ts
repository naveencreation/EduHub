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
        findMany: vitestVi.fn(),
        findUnique: vitestVi.fn(),
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
const mockContentFindMany = prisma.content.findMany as unknown as ReturnType<typeof vi.fn>;
const mockContentFindUnique = prisma.content.findUnique as unknown as ReturnType<typeof vi.fn>;

describe('Admin content read routes', () => {
  beforeEach(() => {
    mockAdminFindUnique.mockReset();
    mockContentFindMany.mockReset();
    mockContentFindUnique.mockReset();

    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
  });

  it('lists content with query filters', async () => {
    mockContentFindMany.mockResolvedValue([
      { id: 'content-1', title: 'First' },
    ]);

    const res = await request(app)
      .get('/api/admin/content')
      .query({ topicId: 'topic1', courseId: 'course1' })
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'content-1', title: 'First' }]);
    expect(mockContentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ topicId: 'topic1', courseId: 'course1' }),
      })
    );
  });

  it('returns 500 when list content fails', async () => {
    mockContentFindMany.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .get('/api/admin/content')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch content' });
  });

  it('gets content by id', async () => {
    mockContentFindUnique.mockResolvedValue({ id: 'content-1', title: 'First' });

    const res = await request(app)
      .get('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'content-1', title: 'First' });
  });

  it('returns 404 when content by id not found', async () => {
    mockContentFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Content not found' });
  });

  it('returns 500 when fetching content by id fails', async () => {
    mockContentFindUnique.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .get('/api/admin/content/content-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch content block' });
  });
});
