import { describe, it, expect, vi } from 'vitest';

describe('auth utils', () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.JWT_SECRET;
  });

  it('uses fallback secret in development when JWT_SECRET is unset', async () => {
    process.env.NODE_ENV = 'development';
    const { generateToken, verifyToken } = await import('./auth');

    const token = generateToken('admin-123');
    const payload = verifyToken(token);

    expect(payload).toBeTruthy();
    expect(payload).toHaveProperty('id', 'admin-123');
  });

  it('verifies token using JWT_SECRET when provided', async () => {
    process.env.JWT_SECRET = 'test-secret-1';
    process.env.NODE_ENV = 'production';
    const { generateToken, verifyToken } = await import('./auth');

    const token = generateToken('admin-456');
    const payload = verifyToken(token);

    expect(payload).toBeTruthy();
    expect(payload).toHaveProperty('id', 'admin-456');
  });

  it('verifyToken returns null for invalid token', async () => {
    process.env.JWT_SECRET = 'test-secret-2';
    process.env.NODE_ENV = 'production';
    const { verifyToken } = await import('./auth');

    const payload = verifyToken('invalid-token');
    expect(payload).toBeNull();
  });

  it('throws when JWT_SECRET is missing in production', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    await expect(import('./auth')).rejects.toThrow(
      'FATAL: JWT_SECRET environment variable is not set'
    );
  });

  it('hashPassword and comparePasswords work correctly', async () => {
    process.env.JWT_SECRET = 'test-secret-3';
    process.env.NODE_ENV = 'production';
    const { hashPassword, comparePasswords } = await import('./auth');

    const password = 'My$ecureP@ssw0rd';
    const hashed = await hashPassword(password);

    expect(typeof hashed).toBe('string');
    expect(hashed).not.toBe(password);

    const isMatch = await comparePasswords(password, hashed);
    expect(isMatch).toBe(true);

    const isWrong = await comparePasswords('wrong', hashed);
    expect(isWrong).toBe(false);
  });
});
