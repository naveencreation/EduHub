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
            topic: {
                findMany: vitestVi.fn(),
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
const mockTopicFindMany = db_1.prisma.topic.findMany;
const mockTopicFindUnique = db_1.prisma.topic.findUnique;
const mockTopicFindFirst = db_1.prisma.topic.findFirst;
const mockTopicUpdate = db_1.prisma.topic.update;
const mockTopicDelete = db_1.prisma.topic.delete;
const mockTransaction = db_1.prisma.$transaction;
(0, vitest_1.describe)('Admin topics CRUD routes', () => {
    (0, vitest_1.beforeEach)(() => {
        mockAdminFindUnique.mockReset();
        mockTopicFindMany.mockReset();
        mockTopicFindUnique.mockReset();
        mockTopicFindFirst.mockReset();
        mockTopicUpdate.mockReset();
        mockTopicDelete.mockReset();
        mockTransaction.mockReset();
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    });
    (0, vitest_1.it)('lists topics', async () => {
        mockTopicFindMany.mockResolvedValue([{ id: 'topic-1', name: 'Topic 1' }]);
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/topics')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual([{ id: 'topic-1', name: 'Topic 1' }]);
    });
    (0, vitest_1.it)('returns 500 when listing topics fails', async () => {
        mockTopicFindMany.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/topics')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch topics' });
    });
    (0, vitest_1.it)('gets a topic by id', async () => {
        mockTopicFindUnique.mockResolvedValue({ id: 'topic-1', name: 'Topic 1' });
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/topics/topic-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ id: 'topic-1', name: 'Topic 1' });
    });
    (0, vitest_1.it)('returns 404 when topic not found', async () => {
        mockTopicFindUnique.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/topics/topic-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Topic not found' });
    });
    (0, vitest_1.it)('returns 500 when fetching a single topic fails', async () => {
        mockTopicFindUnique.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/topics/topic-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch topic' });
    });
    (0, vitest_1.it)('returns 400 when updating topic slug collides', async () => {
        mockTopicFindFirst.mockResolvedValue({ id: 'topic-2' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/topics/topic-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ slug: 'Existing Slug' });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Topic with this slug already exists' });
    });
    (0, vitest_1.it)('updates a topic when slug is unique', async () => {
        mockTopicFindFirst.mockResolvedValue(null);
        mockTopicUpdate.mockResolvedValue({ id: 'topic-1', name: 'Updated' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/topics/topic-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ slug: 'Updated Slug', name: 'Updated' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ id: 'topic-1', name: 'Updated' });
        (0, vitest_1.expect)(mockTopicUpdate).toHaveBeenCalledWith({
            where: { id: 'topic-1' },
            data: vitest_1.expect.objectContaining({
                slug: 'updated-slug',
                name: 'Updated',
            }),
        });
    });
    (0, vitest_1.it)('returns 404 when updating nonexistent topic', async () => {
        mockTopicUpdate.mockRejectedValue({ code: 'P2025' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/topics/topic-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ name: 'Updated' });
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Topic not found' });
    });
    (0, vitest_1.it)('returns 500 when topic update fails unexpectedly', async () => {
        mockTopicUpdate.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/topics/topic-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ name: 'Updated' });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to update topic' });
    });
    (0, vitest_1.it)('deletes a topic successfully', async () => {
        mockTopicDelete.mockResolvedValue({});
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/admin/topics/topic-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ message: 'Topic deleted successfully' });
    });
    (0, vitest_1.it)('returns 404 when deleting missing topic', async () => {
        mockTopicDelete.mockRejectedValue({ code: 'P2025' });
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/admin/topics/topic-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Topic not found' });
    });
    (0, vitest_1.it)('returns 500 when deleting topic fails unexpectedly', async () => {
        mockTopicDelete.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/admin/topics/topic-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to delete topic' });
    });
    (0, vitest_1.it)('reorders topics successfully', async () => {
        mockTopicUpdate.mockImplementation((params) => params);
        mockTransaction.mockResolvedValue(undefined);
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/topics/reorder')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ topicIds: ['123e4567-e89b-12d3-a456-426614174010', '123e4567-e89b-12d3-a456-426614174011'] });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ message: 'Topics reordered successfully' });
        (0, vitest_1.expect)(mockTransaction).toHaveBeenCalledWith([
            vitest_1.expect.objectContaining({
                where: { id: '123e4567-e89b-12d3-a456-426614174010' },
                data: { sortOrder: 0 },
            }),
            vitest_1.expect.objectContaining({
                where: { id: '123e4567-e89b-12d3-a456-426614174011' },
                data: { sortOrder: 1 },
            }),
        ]);
    });
    (0, vitest_1.it)('returns 500 when reorder fails', async () => {
        mockTopicUpdate.mockImplementation((params) => params);
        mockTransaction.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/topics/reorder')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ topicIds: ['123e4567-e89b-12d3-a456-426614174010'] });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to reorder topics' });
    });
    (0, vitest_1.it)('returns 400 when reorder payload invalid', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/topics/reorder')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ topicIds: ['not-a-uuid'] });
        (0, vitest_1.expect)(res.status).toBe(400);
    });
});
//# sourceMappingURL=topics-crud.test.js.map