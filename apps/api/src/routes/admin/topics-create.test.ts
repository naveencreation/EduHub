import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma (admin + topic) and auth so we can bypass real DB + JWT
vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      admin: {
        findUnique: vitestVi.fn(),
      },
      topic: {
        findUnique: vitestVi.fn(),
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
const mockTopicFindUnique = prisma.topic.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockTopicCreate = prisma.topic.create as unknown as ReturnType<typeof vi.fn>;

// NOTE: The policy in requireAuth expects a cookie named "admin_token"
// We can set it directly in Supertest requests.

describe('POST /api/admin/topics (protected)', () => {
  beforeEach(() => {
    mockAdminFindUnique.mockReset();
    mockTopicFindUnique.mockReset();
    mockTopicCreate.mockReset();
  });

  it('creates a topic when slug is unique', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTopicFindUnique.mockResolvedValue(null);
    mockTopicCreate.mockResolvedValue({
      id: 'topic-1',
      name: 'New Topic',
      slug: 'new-topic',
      description: 'A test topic',
      isPublished: true,
      sortOrder: 1,
    });

    const res = await request(app)
      .post('/api/admin/topics')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        name: 'New Topic',
        description: 'A test topic',
        sortOrder: 1,
        isPublished: true,
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'New Topic',
      slug: 'new-topic',
      description: 'A test topic',
    });

    expect(mockTopicFindUnique).toHaveBeenCalledWith({
      where: { slug: 'new-topic' },
    });

    expect(mockTopicCreate).toHaveBeenCalledWith({
      data: {
        name: 'New Topic',
        slug: 'new-topic',
        description: 'A test topic',
        thumbnailUrl: undefined,
        sortOrder: 1,
        isPublished: true,
      },
    });
  });

  it('returns 400 when slug already exists', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTopicFindUnique.mockResolvedValue({ id: 'topic-1', slug: 'existing-slug' });

    const res = await request(app)
      .post('/api/admin/topics')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        name: 'Existing Topic',
        slug: 'existing-slug',
        description: 'Duplicate slug',
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Topic with this slug already exists' });
  });

  it('returns 500 when topic creation fails unexpectedly', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTopicFindUnique.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .post('/api/admin/topics')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        name: 'New Topic',
        description: 'Error topic',
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to create topic' });
  });
});
