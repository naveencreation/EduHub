import request from 'supertest';
import express from 'express';
import { describe, it, expect } from 'vitest';
import { validateRequest } from './validateRequest';
import { z } from 'zod';

const makeApp = (schema: any) => {
  const app = express();
  app.use(express.json());

  app.post('/test', validateRequest(schema), (req, res) => {
    res.status(200).json({ ok: true, body: req.body, query: req.query, params: req.params });
  });

  // error handler to surface errors
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(500).json({ error: err?.message || 'unknown' });
  });

  return app;
};

describe('validateRequest middleware', () => {
  it('allows valid bodies through', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
    });

    const app = makeApp(schema);

    const res = await request(app)
      .post('/test')
      .send({ name: 'Naveen' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, body: { name: 'Naveen' } });
  });

  it('returns 400 with details for invalid request body', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
    });

    const app = makeApp(schema);

    const res = await request(app)
      .post('/test')
      .send({ name: 123 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details[0]).toMatchObject({ field: 'body.name' });
  });

  it('passes non-Zod errors to error handler', async () => {
    const schema = {
      parseAsync: () => Promise.reject(new Error('boom')),
    } as any;

    const app = makeApp(schema);

    const res = await request(app)
      .post('/test')
      .send({});

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'boom' });
  });
});
