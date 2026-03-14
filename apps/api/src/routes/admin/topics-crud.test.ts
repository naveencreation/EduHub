import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      admin: {
        findUnique: vitestVi.fn(),
      },
      topic: {
        findMany: vitestVi.fn(),
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
const mockTopicFindMany = prisma.topic.findMany as unknown as ReturnType<typeof vi.fn>;
const mockTopicFindUnique = prisma.topic.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockTopicFindFirst = prisma.topic.findFirst as unknown as ReturnType<typeof vi.fn>;
const mockTopicUpdate = prisma.topic.update as unknown as ReturnType<typeof vi.fn>;
const mockTopicDelete = prisma.topic.delete as unknown as ReturnType<typeof vi.fn>;
const mockTransaction = prisma.$transaction as unknown as ReturnType<typeof vi.fn>;

describe('Admin topics CRUD routes', () => {
  beforeEach(() => {
    mockAdminFindUnique.mockReset();
    mockTopicFindMany.mockReset();
    mockTopicFindUnique.mockReset();
    mockTopicFindFirst.mockReset();
    mockTopicUpdate.mockReset();
    mockTopicDelete.mockReset();
    mockTransaction.mockReset();

    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
  });

  it('lists topics', async () => {
    mockTopicFindMany.mockResolvedValue([{ id: 'topic-1', name: 'Topic 1' }]);

    const res = await request(app)
      .get('/api/admin/topics')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'topic-1', name: 'Topic 1' }]);
  });

  it('returns 500 when listing topics fails', async () => {
    mockTopicFindMany.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .get('/api/admin/topics')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch topics' });
  });

  it('gets a topic by id', async () => {
    mockTopicFindUnique.mockResolvedValue({ id: 'topic-1', name: 'Topic 1' });

    const res = await request(app)
      .get('/api/admin/topics/topic-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'topic-1', name: 'Topic 1' });
  });

  it('returns 404 when topic not found', async () => {
    mockTopicFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/admin/topics/topic-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Topic not found' });
  });

  it('returns 500 when fetching a single topic fails', async () => {
    mockTopicFindUnique.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .get('/api/admin/topics/topic-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch topic' });
  });

  it('returns 400 when updating topic slug collides', async () => {
    mockTopicFindFirst.mockResolvedValue({ id: 'topic-2' });

    const res = await request(app)
      .put('/api/admin/topics/topic-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ slug: 'Existing Slug' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Topic with this slug already exists' });
  });

  it('updates a topic when slug is unique', async () => {
    mockTopicFindFirst.mockResolvedValue(null);
    mockTopicUpdate.mockResolvedValue({ id: 'topic-1', name: 'Updated' });

    const res = await request(app)
      .put('/api/admin/topics/topic-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ slug: 'Updated Slug', name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'topic-1', name: 'Updated' });

    expect(mockTopicUpdate).toHaveBeenCalledWith({
      where: { id: 'topic-1' },
      data: expect.objectContaining({
        slug: 'updated-slug',
        name: 'Updated',
      }),
    });
  });

  it('returns 404 when updating nonexistent topic', async () => {
    mockTopicUpdate.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .put('/api/admin/topics/topic-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Topic not found' });
  });

  it('returns 500 when topic update fails unexpectedly', async () => {
    mockTopicUpdate.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .put('/api/admin/topics/topic-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ name: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to update topic' });
  });

  it('deletes a topic successfully', async () => {
    mockTopicDelete.mockResolvedValue({});

    const res = await request(app)
      .delete('/api/admin/topics/topic-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Topic deleted successfully' });
  });

  it('returns 404 when deleting missing topic', async () => {
    mockTopicDelete.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .delete('/api/admin/topics/topic-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Topic not found' });
  });

  it('returns 500 when deleting topic fails unexpectedly', async () => {
    mockTopicDelete.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .delete('/api/admin/topics/topic-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to delete topic' });
  });

  it('reorders topics successfully', async () => {
    mockTopicUpdate.mockImplementation((params) => params);
    mockTransaction.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/admin/topics/reorder')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ topicIds: ['123e4567-e89b-12d3-a456-426614174010', '123e4567-e89b-12d3-a456-426614174011'] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Topics reordered successfully' });
    expect(mockTransaction).toHaveBeenCalledWith([
      expect.objectContaining({
        where: { id: '123e4567-e89b-12d3-a456-426614174010' },
        data: { sortOrder: 0 },
      }),
      expect.objectContaining({
        where: { id: '123e4567-e89b-12d3-a456-426614174011' },
        data: { sortOrder: 1 },
      }),
    ]);
  });

  it('returns 500 when reorder fails', async () => {
    mockTopicUpdate.mockImplementation((params) => params);
    mockTransaction.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .post('/api/admin/topics/reorder')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ topicIds: ['123e4567-e89b-12d3-a456-426614174010'] });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to reorder topics' });
  });

  it('returns 400 when reorder payload invalid', async () => {
    const res = await request(app)
      .post('/api/admin/topics/reorder')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ topicIds: ['not-a-uuid'] });

    expect(res.status).toBe(400);
  });
});
