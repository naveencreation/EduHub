import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../db', async () => {
  const { vi: vitestVi } = await import('vitest');
  return {
    prisma: {
      admin: {
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

const envBackup = { ...process.env };

describe('Admin content upload routes', () => {
  beforeEach(() => {
    mockAdminFindUnique.mockReset();
    mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('returns 400 when presign payload missing required fields', async () => {
    const res = await request(app)
      .post('/api/admin/content/upload/presign')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'filename and contentType are required' });
  });

  it('returns 500 when presign env vars are missing', async () => {
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_API_TOKEN;
    delete process.env.CLOUDFLARE_R2_BUCKET_NAME;

    const res = await request(app)
      .post('/api/admin/content/upload/presign')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ filename: 'video.mp4', contentType: 'video/mp4' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'R2 upload not configured. Contact admin.' });
  });

  it('returns 200 with uploadUrl when presign env vars are present', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'acct-123';
    process.env.CLOUDFLARE_API_TOKEN = 'token-123';
    process.env.CLOUDFLARE_R2_BUCKET_NAME = 'bucket';

    const res = await request(app)
      .post('/api/admin/content/upload/presign')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({ filename: 'video.mp4', contentType: 'video/mp4' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('uploadUrl');
    expect(res.body).toHaveProperty('fileUrl');
    expect(res.body).toHaveProperty('warning');
  });

  it('returns 500 when video upload env vars are missing', async () => {
    delete process.env.CLOUDFLARE_STREAM_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_API_TOKEN;

    const res = await request(app)
      .post('/api/admin/content/upload/video')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({});

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Stream upload not configured. Contact admin.' });
  });

  it('returns 200 with stream upload info when env vars are provided', async () => {
    process.env.CLOUDFLARE_STREAM_ACCOUNT_ID = 'stream-acct-123';
    process.env.CLOUDFLARE_API_TOKEN = 'token-123';

    const res = await request(app)
      .post('/api/admin/content/upload/video')
      .set('Cookie', 'admin_token=fake-jwt-token')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('uploadUrl');
    expect(res.body).toHaveProperty('warning');
    expect(res.body).toHaveProperty('documentationLink');
  });
});
