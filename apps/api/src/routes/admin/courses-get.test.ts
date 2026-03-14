import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      admin: {
        findUnique: vitestVi.fn(),
      },
      course: {
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
const mockCourseFindUnique = prisma.course.findUnique as unknown as ReturnType<typeof vi.fn>;

describe('Admin courses GET/:id', () => {
  beforeEach(() => {
    mockAdminFindUnique.mockReset();
    mockCourseFindUnique.mockReset();

    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
  });

  it('returns course by id', async () => {
    mockCourseFindUnique.mockResolvedValue({ id: 'course-1', title: 'Course 1' });

    const res = await request(app)
      .get('/api/admin/courses/course-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'course-1', title: 'Course 1' });
  });

  it('returns 404 when course not found', async () => {
    mockCourseFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/admin/courses/course-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Course not found' });
  });

  it('returns 500 when fetching course fails', async () => {
    mockCourseFindUnique.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .get('/api/admin/courses/course-1')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch course' });
  });
});
