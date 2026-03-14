import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma and auth
vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      admin: {
        findUnique: vitestVi.fn(),
      },
      course: {
        findMany: vitestVi.fn(),
        findUnique: vitestVi.fn(),
        findFirst: vitestVi.fn(),
        create: vitestVi.fn(),
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
const mockCourseFindMany = prisma.course.findMany as unknown as ReturnType<typeof vi.fn>;
const mockCourseFindUnique = prisma.course.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockCourseFindFirst = prisma.course.findFirst as unknown as ReturnType<typeof vi.fn>;
const mockCourseCreate = prisma.course.create as unknown as ReturnType<typeof vi.fn>;
const mockCourseUpdate = prisma.course.update as unknown as ReturnType<typeof vi.fn>;
const mockCourseDelete = prisma.course.delete as unknown as ReturnType<typeof vi.fn>;
const mockTransaction = prisma.$transaction as unknown as ReturnType<typeof vi.fn>;

describe('Admin courses routes', () => {
  beforeEach(() => {
    mockAdminFindUnique.mockReset();
    mockCourseFindMany.mockReset();
    mockCourseFindUnique.mockReset();
    mockCourseFindFirst.mockReset();
    mockCourseCreate.mockReset();
    mockCourseUpdate.mockReset();
    mockCourseDelete.mockReset();
    mockTransaction.mockReset();
  });

  it('lists courses', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseFindMany.mockResolvedValue([{ id: 'course-1', title: 'Course 1' }]);

    const res = await request(app)
      .get('/api/admin/courses')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'course-1', title: 'Course 1' }]);
  });

  it('lists courses filtered by topicId', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseFindMany.mockResolvedValue([{ id: 'course-2', title: 'Course 2' }]);

    const res = await request(app)
      .get('/api/admin/courses')
      .query({ topicId: 'topic-1' })
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'course-2', title: 'Course 2' }]);
    expect(mockCourseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { topicId: 'topic-1' } })
    );
  });

  it('returns 500 when listing courses fails', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseFindMany.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .get('/api/admin/courses')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch courses' });
  });

  it('creates a course when slug is unique', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseFindUnique.mockResolvedValue(null);
    mockCourseCreate.mockResolvedValue({ id: 'course-1', title: 'Test Course', slug: 'test-course' });

    const res = await request(app)
      .post('/api/admin/courses')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        topicId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Course',
        description: 'Desc',
        isPublished: true,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('slug', 'test-course');
  });

  it('returns 500 when course creation fails unexpectedly', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseFindUnique.mockResolvedValue(null);
    mockCourseCreate.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .post('/api/admin/courses')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        topicId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Course',
        description: 'Desc',
        isPublished: true,
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to create course' });
  });

  it('returns 400 when course slug already exists', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseFindUnique.mockResolvedValue({ id: 'course-1', slug: 'test-course' });

    const res = await request(app)
      .post('/api/admin/courses')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({
        topicId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Course',
        description: 'Desc',
        isPublished: true,
        slug: 'test-course',
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Course with this slug already exists in the selected topic' });
  });

  it('updates a course when it exists', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseFindUnique.mockResolvedValue({ id: 'course-1', topicId: 'topic-1', slug: 'old-slug' });
    mockCourseFindFirst.mockResolvedValue(null);
    mockCourseUpdate.mockResolvedValue({ id: 'course-1', slug: 'new-slug' });

    const res = await request(app)
      .put('/api/admin/courses/course-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ slug: 'new-slug' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('slug', 'new-slug');
  });

  it('returns 404 when updating a missing course', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/admin/courses/course-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ slug: 'new-slug' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Course not found' });
  });

  it('returns 400 when updating course slug collides', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseFindUnique.mockResolvedValue({ id: 'course-1', topicId: 'topic-1', slug: 'old-slug' });
    mockCourseFindFirst.mockResolvedValue({ id: 'course-2' });

    const res = await request(app)
      .put('/api/admin/courses/course-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ slug: 'existing-slug' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Course with this slug already exists in the selected topic' });
  });

  it('returns 500 when updating course fails unexpectedly', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseFindUnique.mockResolvedValue({ id: 'course-1', topicId: 'topic-1', slug: 'old-slug' });
    mockCourseFindFirst.mockResolvedValue(null);
    mockCourseUpdate.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .put('/api/admin/courses/course-1')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ slug: 'new-slug' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to update course' });
  });

  it('deletes a course', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseDelete.mockResolvedValue({});

    const res = await request(app)
      .delete('/api/admin/courses/course-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Course deleted successfully' });
  });

  it('returns 404 when deleting missing course', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseDelete.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .delete('/api/admin/courses/course-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Course not found' });
  });

  it('returns 500 when deleting course fails unexpectedly', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockCourseDelete.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .delete('/api/admin/courses/course-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to delete course' });
  });

  it('reorders courses', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTransaction.mockResolvedValue([]);

    const res = await request(app)
      .post('/api/admin/courses/reorder')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ courseIds: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Courses reordered successfully' });
    expect(mockTransaction).toHaveBeenCalled();
  });

  it('returns 400 when reorder payload is invalid', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });

    const res = await request(app)
      .post('/api/admin/courses/reorder')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ courseIds: ['not-a-uuid'] });

    expect(res.status).toBe(400);
  });

  it('returns 500 when reorder fails', async () => {
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTransaction.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .post('/api/admin/courses/reorder')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ courseIds: ['123e4567-e89b-12d3-a456-426614174000'] });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to reorder courses' });
  });
});
