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
// Mock Prisma and auth utilities
vitest_1.vi.mock('../../db', async () => {
    const { vi: vitestVi } = await Promise.resolve().then(() => __importStar(require('vitest')));
    return {
        prisma: {
            admin: {
                findUnique: vitestVi.fn(),
            },
            content: {
                findFirst: vitestVi.fn(),
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
const mockContentFindFirst = db_1.prisma.content.findFirst;
const mockContentCreate = db_1.prisma.content.create;
(0, vitest_1.describe)('POST /api/admin/content (protected)', () => {
    (0, vitest_1.beforeEach)(() => {
        mockAdminFindUnique.mockReset();
        mockContentFindFirst.mockReset();
        mockContentCreate.mockReset();
    });
    (0, vitest_1.it)('creates content when slug is unique', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindFirst.mockResolvedValue(null);
        mockContentCreate.mockResolvedValue({
            id: 'content-123',
            title: 'Test Content',
            slug: 'test-content',
            type: 'BLOG',
            isPublished: true,
        });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            topicId: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Content',
            type: 'BLOG',
            description: 'A test',
            body: '<p>test</p>',
            isPublished: true,
            tags: ['123e4567-e89b-12d3-a456-426614174001'],
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body).toMatchObject({
            id: 'content-123',
            title: 'Test Content',
            slug: 'test-content',
            type: 'BLOG',
        });
        (0, vitest_1.expect)(mockContentFindFirst).toHaveBeenCalled();
        (0, vitest_1.expect)(mockContentCreate).toHaveBeenCalled();
    });
    (0, vitest_1.it)('creates content when type is VIDEO and html body is not sanitized', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindFirst.mockResolvedValue(null);
        mockContentCreate.mockResolvedValue({
            id: 'content-124',
            title: 'Video Content',
            slug: 'video-content',
            type: 'VIDEO',
            isPublished: false,
        });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            topicId: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Video Content',
            type: 'VIDEO',
            description: 'A test',
            body: '<script>alert(1)</script>',
            isPublished: false,
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(mockContentCreate).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            data: vitest_1.expect.objectContaining({
                body: '<script>alert(1)</script>',
            }),
        }));
    });
    (0, vitest_1.it)('creates content with missing description/body', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindFirst.mockResolvedValue(null);
        mockContentCreate.mockResolvedValue({
            id: 'content-125',
            title: 'Empty Body',
            slug: 'empty-body',
            type: 'BLOG',
            isPublished: false,
        });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            topicId: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Empty Body',
            type: 'BLOG',
            isPublished: false,
        });
        (0, vitest_1.expect)(res.status).toBe(201);
    });
    (0, vitest_1.it)('returns 400 when content slug already exists', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindFirst.mockResolvedValue({ id: 'content-1', slug: 'test-content' });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            topicId: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Content',
            type: 'BLOG',
            description: 'A test',
            body: '<p>test</p>',
            isPublished: true,
            tags: [],
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Content with this slug already exists in this context' });
    });
    (0, vitest_1.it)('returns 500 when content creation fails unexpectedly', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindFirst.mockResolvedValue(null);
        mockContentCreate.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            topicId: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Content',
            type: 'BLOG',
            description: 'A test',
            body: '<p>test</p>',
            isPublished: true,
        });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to create content' });
    });
    (0, vitest_1.it)('creates content when tags are absent and courseId is null', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindFirst.mockResolvedValue(null);
        mockContentCreate.mockResolvedValue({
            id: 'content-2',
            title: 'No tags',
            slug: 'no-tags',
            type: 'VIDEO',
            isPublished: false,
        });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            topicId: '123e4567-e89b-12d3-a456-426614174000',
            courseId: null,
            title: 'No tags',
            type: 'VIDEO',
            description: 'A test',
            body: 'plain text body',
            isPublished: false,
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body).toMatchObject({ id: 'content-2', title: 'No tags' });
        (0, vitest_1.expect)(mockContentCreate).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            data: vitest_1.expect.objectContaining({
                courseId: null,
                body: 'plain text body',
            }),
        }));
    });
});
//# sourceMappingURL=content-create.test.js.map