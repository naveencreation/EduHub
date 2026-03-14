import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('db module', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Ensure we start with a clean global state so the module's init code runs.
    delete (global as any).prisma;
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('sets global.prisma when NODE_ENV is not production', async () => {
    process.env.NODE_ENV = 'test';

    vi.doMock('@prisma/client', () => {
      return {
        PrismaClient: class {
          // Intentionally empty; we just need the constructor to succeed.
        },
      };
    });

    const { prisma } = await import('./db');

    expect(prisma).toBeDefined();
    expect((global as any).prisma).toBe(prisma);
  });

  it('does not set global.prisma when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';

    vi.doMock('@prisma/client', () => {
      return {
        PrismaClient: class {
          // Intentionally empty; we just need the constructor to succeed.
        },
      };
    });

    const { prisma } = await import('./db');

    expect(prisma).toBeDefined();
    expect((global as any).prisma).toBeUndefined();
  });
});
