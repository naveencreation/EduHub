import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      admin: {
        findUnique: vitestVi.fn(),
      },
      tag: {
        findMany: vitestVi.fn(),
        findFirst: vitestVi.fn(),
        create: vitestVi.fn(),
        update: vitestVi.fn(),
        delete: vitestVi.fn(),
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
const mockTagFindMany = prisma.tag.findMany as unknown as ReturnType<typeof vi.fn>;
const mockTagFindFirst = prisma.tag.findFirst as unknown as ReturnType<typeof vi.fn>;
const mockTagCreate = prisma.tag.create as unknown as ReturnType<typeof vi.fn>;
const mockTagUpdate = prisma.tag.update as unknown as ReturnType<typeof vi.fn>;
const mockTagDelete = prisma.tag.delete as unknown as ReturnType<typeof vi.fn>;

describe('Admin tags routes', () => {
  beforeEach(() => {
    mockAdminFindUnique.mockReset();
    mockTagFindMany.mockReset();
    mockTagFindFirst.mockReset();
    mockTagCreate.mockReset();
    mockTagUpdate.mockReset();
    mockTagDelete.mockReset();
  });

  it('lists tags', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagFindMany.mockResolvedValue([{ id: 'tag-1', name: 'tag 1', slug: 'tag-1' }]);

    const res = await request(app)
      .get('/api/admin/tags')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'tag-1', name: 'tag 1', slug: 'tag-1' }]);
  });
  it('returns 500 when listing tags fails', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagFindMany.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .get('/api/admin/tags')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch tags' });
  });
  it('creates a tag when unique', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagFindFirst.mockResolvedValue(null);
    mockTagCreate.mockResolvedValue({ id: 'tag-1', name: 'tag 1', slug: 'tag-1' });

    const res = await request(app)
      .post('/api/admin/tags')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ name: 'Tag 1' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'tag 1', slug: 'tag-1' });
  });

  it('returns 400 when tag already exists', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagFindFirst.mockResolvedValue({ id: 'tag-1' });

    const res = await request(app)
      .post('/api/admin/tags')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ name: 'Tag 1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Tag already exists' });
  });

  it('returns 500 when creating tag fails unexpectedly', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagFindFirst.mockResolvedValue(null);
    mockTagCreate.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .post('/api/admin/tags')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ name: 'Tag 1' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to create tag' });
  });

  it('updates a tag when unique', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagFindFirst.mockResolvedValue(null);
    mockTagUpdate.mockResolvedValue({ id: 'tag-1', name: 'tag 1', slug: 'tag-1' });

    const res = await request(app)
      .put('/api/admin/tags/tag-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ name: 'Tag 1' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'tag 1', slug: 'tag-1' });
  });

  it('returns 400 when updating with existing name', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagFindFirst.mockResolvedValue({ id: 'tag-2' });

    const res = await request(app)
      .put('/api/admin/tags/tag-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ name: 'Tag 1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Tag name or slug already in use' });
  });

  it('returns 404 when updating missing tag', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagUpdate.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .put('/api/admin/tags/tag-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ name: 'Tag 1' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Tag not found' });
  });

  it('returns 500 when updating tag fails unexpectedly', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagUpdate.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .put('/api/admin/tags/tag-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ name: 'Tag 1' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to update tag' });
  });

  it('deletes a tag', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagDelete.mockResolvedValue({});

    const res = await request(app)
      .delete('/api/admin/tags/tag-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Tag deleted successfully' });
  });

  it('returns 404 when deleting missing tag', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagDelete.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .delete('/api/admin/tags/tag-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Tag not found' });
  });

  it('returns 500 when deleting tag fails unexpectedly', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTagDelete.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .delete('/api/admin/tags/tag-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to delete tag' });
  });
});
