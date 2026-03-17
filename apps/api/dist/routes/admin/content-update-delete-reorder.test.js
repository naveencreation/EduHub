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
vitest_1.vi.mock('../../db', async () => {
    const { vi: vitestVi } = await Promise.resolve().then(() => __importStar(require('vitest')));
    return {
        prisma: {
            admin: {
                findUnique: vitestVi.fn(),
            },
            content: {
                findUnique: vitestVi.fn(),
                findFirst: vitestVi.fn(),
                update: vitestVi.fn(),
                delete: vitestVi.fn(),
            },
            $transaction: vitestVi.fn(),
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
const mockContentFindUnique = db_1.prisma.content.findUnique;
const mockContentFindFirst = db_1.prisma.content.findFirst;
const mockContentUpdate = db_1.prisma.content.update;
const mockContentDelete = db_1.prisma.content.delete;
const mockTransaction = db_1.prisma.$transaction;
(0, vitest_1.describe)('Admin content update/delete/reorder routes', () => {
    (0, vitest_1.beforeEach)(() => {
        mockAdminFindUnique.mockReset();
        mockContentFindUnique.mockReset();
        mockContentFindFirst.mockReset();
        mockContentUpdate.mockReset();
        mockContentDelete.mockReset();
        mockTransaction.mockReset();
    });
    (0, vitest_1.it)('returns 404 when updating non-existent content', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindUnique.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ title: 'New title' });
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Content not found' });
    });
    (0, vitest_1.it)('returns 400 when updating with a duplicate slug', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindUnique.mockResolvedValue({ id: 'content-1', title: 'Old title', type: 'BLOG', isPublished: false });
        mockContentFindFirst.mockResolvedValue({ id: 'content-2' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ slug: 'new-slug' });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Content with this slug already exists' });
    });
    (0, vitest_1.it)('updates content and sets publishedAt when publishing', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindUnique.mockResolvedValue({
            id: 'content-1',
            title: 'Old title',
            type: 'BLOG',
            isPublished: false,
            body: '<p>old</p>',
            description: 'old desc',
        });
        mockContentUpdate.mockResolvedValue({ id: 'content-1', title: 'New title' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            title: 'New title',
            isPublished: true,
            body: '<script>alert(1)</script><p>ok</p>',
            tags: [
                '123e4567-e89b-12d3-a456-426614174001',
                '123e4567-e89b-12d3-a456-426614174002',
            ],
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ id: 'content-1', title: 'New title' });
        const updateCall = mockContentUpdate.mock.calls[0][0];
        (0, vitest_1.expect)(updateCall.where).toEqual({ id: 'content-1' });
        (0, vitest_1.expect)(updateCall.data).toMatchObject({
            title: 'New title',
            body: '<p>ok</p>',
            isPublished: true,
            contentTags: {
                deleteMany: {},
                create: [
                    { tag: { connect: { id: '123e4567-e89b-12d3-a456-426614174001' } } },
                    { tag: { connect: { id: '123e4567-e89b-12d3-a456-426614174002' } } },
                ],
            },
        });
        (0, vitest_1.expect)(updateCall.data.publishedAt).toBeDefined();
        (0, vitest_1.expect)(updateCall.data.searchVector).toContain('new title');
    });
    (0, vitest_1.it)('unpublishes content by setting publishedAt to null', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindUnique.mockResolvedValue({
            id: 'content-1',
            title: 'Old title',
            type: 'BLOG',
            isPublished: true,
            body: '<p>old</p>',
            description: 'old desc',
        });
        mockContentUpdate.mockResolvedValue({ id: 'content-1', title: 'Old title' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ isPublished: false });
        (0, vitest_1.expect)(res.status).toBe(200);
        const updateCall = mockContentUpdate.mock.calls[0][0];
        (0, vitest_1.expect)(updateCall.data.publishedAt).toBeNull();
    });
    (0, vitest_1.it)('updates content without slug (skips uniqueness check)', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindUnique.mockResolvedValue({
            id: 'content-1',
            title: 'Old title',
            type: 'VIDEO',
            isPublished: false,
            body: 'old',
            description: 'old desc',
            topicId: 'topic-1',
            courseId: 'course-1',
        });
        mockContentUpdate.mockResolvedValue({ id: 'content-1', title: 'New title' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ title: 'New title' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(mockContentFindFirst).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('does not sanitize body when content type is VIDEO', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindUnique.mockResolvedValue({
            id: 'content-1',
            title: 'Old title',
            type: 'VIDEO',
            isPublished: false,
            body: 'old',
            description: 'old desc',
            topicId: 'topic-1',
            courseId: 'course-1',
        });
        mockContentUpdate.mockResolvedValue({ id: 'content-1', title: 'New title' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ body: '<script>alert(1)</script>' });
        (0, vitest_1.expect)(res.status).toBe(200);
        const updateCall = mockContentUpdate.mock.calls[0][0];
        (0, vitest_1.expect)(updateCall.data.body).toBe('<script>alert(1)</script>');
    });
    (0, vitest_1.it)('uses provided courseId when checking slug uniqueness', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentFindUnique.mockResolvedValue({
            id: 'content-1',
            title: 'Old title',
            type: 'BLOG',
            isPublished: true,
            body: '<p>old</p>',
            description: 'old desc',
            courseId: 'course-1',
            topicId: 'topic-1',
        });
        mockContentFindFirst.mockResolvedValue(null);
        mockContentUpdate.mockResolvedValue({ id: 'content-1', title: 'New title' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ slug: 'new-slug', courseId: null });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(mockContentFindFirst).toHaveBeenCalledWith({
            where: { slug: 'new-slug', topicId: 'topic-1', courseId: null, NOT: { id: 'content-1' } },
        });
    });
    (0, vitest_1.it)('deletes content successfully', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentDelete.mockResolvedValue({});
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ message: 'Content deleted successfully' });
    });
    (0, vitest_1.it)('returns 404 when deleting non-existent content', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentDelete.mockRejectedValue({ code: 'P2025' });
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Content not found' });
    });
    (0, vitest_1.it)('reorders content entries', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockContentUpdate.mockImplementation((params) => params);
        mockTransaction.mockResolvedValue(undefined);
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content/reorder')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            contentIds: [
                '123e4567-e89b-12d3-a456-426614174010',
                '123e4567-e89b-12d3-a456-426614174011',
                '123e4567-e89b-12d3-a456-426614174012',
            ],
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ message: 'Content reordered successfully' });
        (0, vitest_1.expect)(mockTransaction).toHaveBeenCalledWith([
            vitest_1.expect.objectContaining({
                where: { id: '123e4567-e89b-12d3-a456-426614174010' },
                data: { sortOrder: 0 },
            }),
            vitest_1.expect.objectContaining({
                where: { id: '123e4567-e89b-12d3-a456-426614174011' },
                data: { sortOrder: 1 },
            }),
            vitest_1.expect.objectContaining({
                where: { id: '123e4567-e89b-12d3-a456-426614174012' },
                data: { sortOrder: 2 },
            }),
        ]);
    });
    (0, vitest_1.it)('returns 400 when reorder payload is invalid', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content/reorder')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ contentIds: ['not-a-uuid'] });
        (0, vitest_1.expect)(res.status).toBe(400);
    });
});
//# sourceMappingURL=content-update-delete-reorder.test.js.map