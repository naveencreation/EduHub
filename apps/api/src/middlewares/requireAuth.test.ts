import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../utils/auth', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    verifyToken: vitestVi.fn(),
  };
});

vi.mock('../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      admin: {
        findUnique: vitestVi.fn(),
      },
    },
  };
});

import { requireAuth } from './requireAuth';
import { prisma } from '../db';
import { verifyToken } from '../utils/auth';

const mockAdminFindUnique = prisma.admin.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockVerifyToken = verifyToken as unknown as ReturnType<typeof vi.fn>;

describe('requireAuth middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    app.get('/protected', requireAuth, (req, res) => {
      return res.status(200).json({ ok: true, admin: req.admin });
    });

    mockAdminFindUnique.mockReset();
    mockVerifyToken.mockReset();
  });

  it('returns 401 if no token cookie', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized: No token provided' });
  });

  it('returns 401 if token is invalid', async () => {
    mockVerifyToken.mockReturnValue(null);

    const res = await request(app)
      .get('/protected')
      .set('Cookie', 'admin_token=invalid');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized: Invalid token' });
  });

  it('returns 401 if admin not found', async () => {
    mockVerifyToken.mockReturnValue({ id: 'admin-123' });
    mockAdminFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/protected')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized: Admin not found' });
  });

  it('allows access when token is valid and admin exists', async () => {
    mockVerifyToken.mockReturnValue({ id: 'admin-123' });
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });

    const res = await request(app)
      .get('/protected')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, admin: { id: 'admin-123', email: 'admin@example.com' } });
  });

  it('returns 500 when verifyToken throws', async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error('boom');
    });

    const res = await request(app)
      .get('/protected')
      .set('Cookie', 'admin_token=fake-jwt-token');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error during authentication' });
  });
});
