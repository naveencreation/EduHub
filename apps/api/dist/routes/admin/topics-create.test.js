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
// Mock Prisma (admin + topic) and auth so we can bypass real DB + JWT
vitest_1.vi.mock('../../db', async () => {
    const { vi: vitestVi } = await Promise.resolve().then(() => __importStar(require('vitest')));
    return {
        prisma: {
            admin: {
                findUnique: vitestVi.fn(),
            },
            topic: {
                findUnique: vitestVi.fn(),
                create: vitestVi.fn(),
            },
        },
    };
});
vitest_1.vi.mock('../../utils/auth', async () => {
    const { vi: vitestVi } = await Promise.resolve().then(() => __importStar(require('vitest')));
    return {
        verifyToken: vitestVi.fn(() => ({ id: 'admin-123' })),
    };
});
const index_1 = __importDefault(require("../../index"));
const db_1 = require("../../db");
const mockAdminFindUnique = db_1.prisma.admin.findUnique;
const mockTopicFindUnique = db_1.prisma.topic.findUnique;
const mockTopicCreate = db_1.prisma.topic.create;
// NOTE: The policy in requireAuth expects a cookie named "admin_token"
// We can set it directly in Supertest requests.
(0, vitest_1.describe)('POST /api/admin/topics (protected)', () => {
    (0, vitest_1.beforeEach)(() => {
        mockAdminFindUnique.mockReset();
        mockTopicFindUnique.mockReset();
        mockTopicCreate.mockReset();
    });
    (0, vitest_1.it)('creates a topic when slug is unique', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTopicFindUnique.mockResolvedValue(null);
        mockTopicCreate.mockResolvedValue({
            id: 'topic-1',
            name: 'New Topic',
            slug: 'new-topic',
            description: 'A test topic',
            isPublished: true,
            sortOrder: 1,
        });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/topics')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            name: 'New Topic',
            description: 'A test topic',
            sortOrder: 1,
            isPublished: true,
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body).toMatchObject({
            name: 'New Topic',
            slug: 'new-topic',
            description: 'A test topic',
        });
        (0, vitest_1.expect)(mockTopicFindUnique).toHaveBeenCalledWith({
            where: { slug: 'new-topic' },
        });
        (0, vitest_1.expect)(mockTopicCreate).toHaveBeenCalledWith({
            data: {
                name: 'New Topic',
                slug: 'new-topic',
                description: 'A test topic',
                thumbnailUrl: undefined,
                sortOrder: 1,
                isPublished: true,
            },
        });
    });
    (0, vitest_1.it)('returns 400 when slug already exists', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTopicFindUnique.mockResolvedValue({ id: 'topic-1', slug: 'existing-slug' });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/topics')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            name: 'Existing Topic',
            slug: 'existing-slug',
            description: 'Duplicate slug',
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Topic with this slug already exists' });
    });
    (0, vitest_1.it)('returns 500 when topic creation fails unexpectedly', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTopicFindUnique.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/topics')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            name: 'New Topic',
            description: 'Error topic',
        });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to create topic' });
    });
});
//# sourceMappingURL=topics-create.test.js.map