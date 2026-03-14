import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma and auth utilities before importing app
vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      admin: {
        findUnique: vitestVi.fn(),
        update: vitestVi.fn(),
      },
      topic: {
        findMany: vitestVi.fn(),
      },
    },
  };
});

vi.mock('../../utils/auth', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    generateToken: vitestVi.fn(() => 'fake-jwt-token'),
    verifyToken: vitestVi.fn(() => ({ id: 'admin-123' })),
    hashPassword: vitestVi.fn(),
    comparePasswords: vitestVi.fn(() => true),
  };
});

import app from '../../index';
import { prisma } from '../../db';

import * as authUtils from '../../utils/auth';

const mockAdminFindUnique = prisma.admin.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockAdminUpdate = prisma.admin.update as unknown as ReturnType<typeof vi.fn>;
const mockTopicFindMany = prisma.topic.findMany as unknown as ReturnType<typeof vi.fn>;

const mockComparePasswords = authUtils.comparePasswords as unknown as ReturnType<typeof vi.fn>;
const mockGenerateToken = authUtils.generateToken as unknown as ReturnType<typeof vi.fn>;

describe('Admin auth + protected topics route', () => {
  beforeEach(() => {
    mockAdminFindUnique.mockReset();
    mockAdminUpdate.mockReset();
    mockTopicFindMany.mockReset();
  });

  it('allows login with valid credentials and returns token cookie', async () => {
    mockAdminFindUnique.mockResolvedValue({
      id: 'admin-123',
      email: 'admin@example.com',
      passwordHash: 'hashed',
      name: 'Admin',
    });

    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: 'Login successful',
      admin: { id: 'admin-123', email: 'admin@example.com', name: 'Admin' },
    });
    expect(res.headers['set-cookie']).toBeDefined();

    // Update should have been called
    expect(mockAdminUpdate).toHaveBeenCalledWith({
      where: { id: 'admin-123' },
      data: { lastLoginAt: expect.any(Date) },
    });
  });

  it('returns 401 when credentials are invalid', async () => {
    mockAdminFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'admin@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid email or password' });
  });

  it('returns 401 when password is incorrect', async () => {
    mockAdminFindUnique.mockResolvedValue({
      id: 'admin-123',
      email: 'admin@example.com',
      passwordHash: 'hashed',
      name: 'Admin',
    });
    mockComparePasswords.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'admin@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid email or password' });
  });

  it('returns 400 when login payload is invalid', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('allows logout and clears cookie', async () => {
    const res = await request(app).post('/api/admin/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Logout successful' });
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('uses secure cookies when running in production', async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    mockAdminFindUnique.mockResolvedValue({
      id: 'admin-123',
      email: 'admin@example.com',
      passwordHash: 'hashed',
      name: 'Admin',
    });
    mockComparePasswords.mockResolvedValue(true);
    mockAdminUpdate.mockResolvedValue({});
    mockGenerateToken.mockReturnValue('prod-token');

    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toContain('Secure');

    process.env.NODE_ENV = original;
  });

  it('returns 500 when login throws an unexpected error', async () => {
    mockAdminFindUnique.mockRejectedValue(new Error('boom'));

    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });

  it('allows access to protected /api/admin/topics with valid token', async () => {
    // Ensure admin exists when verifying token
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    mockTopicFindMany.mockResolvedValue([{ id: 'topic-1', name: 'Topic 1', slug: 'topic-1' }]);

    const res = await request(app)
      .get('/api/admin/topics')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'topic-1', name: 'Topic 1', slug: 'topic-1' }]);
  });
});
