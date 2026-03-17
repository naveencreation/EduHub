"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
// Mock Prisma and auth utilities before importing app
vitest_1.vi.mock('../../db', async () => {
    const { vi: vitestVi } = await Promise.resolve().then(() => __importStar(require('vitest')));
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
vitest_1.vi.mock('../../utils/auth', async () => {
    const { vi: vitestVi } = await Promise.resolve().then(() => __importStar(require('vitest')));
    return {
        generateToken: vitestVi.fn(() => 'fake-jwt-token'),
        verifyToken: vitestVi.fn(() => ({ id: 'admin-123' })),
        hashPassword: vitestVi.fn(),
        comparePasswords: vitestVi.fn(() => true),
    };
});
const index_1 = __importDefault(require("../../index"));
const db_1 = require("../../db");
const authUtils = __importStar(require("../../utils/auth"));
const mockAdminFindUnique = db_1.prisma.admin.findUnique;
const mockAdminUpdate = db_1.prisma.admin.update;
const mockTopicFindMany = db_1.prisma.topic.findMany;
const mockComparePasswords = authUtils.comparePasswords;
const mockGenerateToken = authUtils.generateToken;
(0, vitest_1.describe)('Admin auth + protected topics route', () => {
    (0, vitest_1.beforeEach)(() => {
        mockAdminFindUnique.mockReset();
        mockAdminUpdate.mockReset();
        mockTopicFindMany.mockReset();
    });
    (0, vitest_1.it)('allows login with valid credentials and returns token cookie', async () => {
        mockAdminFindUnique.mockResolvedValue({
            id: 'admin-123',
            email: 'admin@example.com',
            passwordHash: 'hashed',
            name: 'Admin',
        });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/auth/login')
            .send({ email: 'admin@example.com', password: 'password123' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toMatchObject({
            message: 'Login successful',
            admin: { id: 'admin-123', email: 'admin@example.com', name: 'Admin' },
        });
        (0, vitest_1.expect)(res.headers['set-cookie']).toBeDefined();
        // Update should have been called
        (0, vitest_1.expect)(mockAdminUpdate).toHaveBeenCalledWith({
            where: { id: 'admin-123' },
            data: { lastLoginAt: vitest_1.expect.any(Date) },
        });
    });
    (0, vitest_1.it)('returns 401 when credentials are invalid', async () => {
        mockAdminFindUnique.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/auth/login')
            .send({ email: 'admin@example.com', password: 'wrongpass' });
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Invalid email or password' });
    });
    (0, vitest_1.it)('returns 401 when password is incorrect', async () => {
        mockAdminFindUnique.mockResolvedValue({
            id: 'admin-123',
            email: 'admin@example.com',
            passwordHash: 'hashed',
            name: 'Admin',
        });
        mockComparePasswords.mockResolvedValue(false);
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/auth/login')
            .send({ email: 'admin@example.com', password: 'wrongpass' });
        (0, vitest_1.expect)(res.status).toBe(401);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Invalid email or password' });
    });
    (0, vitest_1.it)('returns 400 when login payload is invalid', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/auth/login')
            .send({ email: 'not-an-email' });
        (0, vitest_1.expect)(res.status).toBe(400);
    });
    (0, vitest_1.it)('allows logout and clears cookie', async () => {
        const res = await (0, supertest_1.default)(index_1.default).post('/api/admin/auth/logout');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ message: 'Logout successful' });
        (0, vitest_1.expect)(res.headers['set-cookie']).toBeDefined();
    });
    (0, vitest_1.it)('uses secure cookies when running in production', async () => {
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
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/auth/login')
            .send({ email: 'admin@example.com', password: 'password123' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.headers['set-cookie'][0]).toContain('Secure');
        process.env.NODE_ENV = original;
    });
    (0, vitest_1.it)('returns 500 when login throws an unexpected error', async () => {
        mockAdminFindUnique.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/auth/login')
            .send({ email: 'admin@example.com', password: 'password123' });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Internal server error' });
    });
    (0, vitest_1.it)('allows access to protected /api/admin/topics with valid token', async () => {
        // Ensure admin exists when verifying token
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTopicFindMany.mockResolvedValue([{ id: 'topic-1', name: 'Topic 1', slug: 'topic-1' }]);
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/topics')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual([{ id: 'topic-1', name: 'Topic 1', slug: 'topic-1' }]);
    });
});
//# sourceMappingURL=auth-and-topics.test.js.map