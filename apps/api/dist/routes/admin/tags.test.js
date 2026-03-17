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
            tag: {
                findMany: vitestVi.fn(),
                findFirst: vitestVi.fn(),
                create: vitestVi.fn(),
                update: vitestVi.fn(),
                delete: vitestVi.fn(),
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
const mockTagFindMany = db_1.prisma.tag.findMany;
const mockTagFindFirst = db_1.prisma.tag.findFirst;
const mockTagCreate = db_1.prisma.tag.create;
const mockTagUpdate = db_1.prisma.tag.update;
const mockTagDelete = db_1.prisma.tag.delete;
(0, vitest_1.describe)('Admin tags routes', () => {
    (0, vitest_1.beforeEach)(() => {
        mockAdminFindUnique.mockReset();
        mockTagFindMany.mockReset();
        mockTagFindFirst.mockReset();
        mockTagCreate.mockReset();
        mockTagUpdate.mockReset();
        mockTagDelete.mockReset();
    });
    (0, vitest_1.it)('lists tags', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagFindMany.mockResolvedValue([{ id: 'tag-1', name: 'tag 1', slug: 'tag-1' }]);
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/tags')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual([{ id: 'tag-1', name: 'tag 1', slug: 'tag-1' }]);
    });
    (0, vitest_1.it)('returns 500 when listing tags fails', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagFindMany.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/tags')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch tags' });
    });
    (0, vitest_1.it)('creates a tag when unique', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagFindFirst.mockResolvedValue(null);
        mockTagCreate.mockResolvedValue({ id: 'tag-1', name: 'tag 1', slug: 'tag-1' });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/tags')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ name: 'Tag 1' });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body).toMatchObject({ name: 'tag 1', slug: 'tag-1' });
    });
    (0, vitest_1.it)('returns 400 when tag already exists', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagFindFirst.mockResolvedValue({ id: 'tag-1' });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/tags')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ name: 'Tag 1' });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Tag already exists' });
    });
    (0, vitest_1.it)('returns 500 when creating tag fails unexpectedly', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagFindFirst.mockResolvedValue(null);
        mockTagCreate.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/tags')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ name: 'Tag 1' });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to create tag' });
    });
    (0, vitest_1.it)('updates a tag when unique', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagFindFirst.mockResolvedValue(null);
        mockTagUpdate.mockResolvedValue({ id: 'tag-1', name: 'tag 1', slug: 'tag-1' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/tags/tag-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ name: 'Tag 1' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toMatchObject({ name: 'tag 1', slug: 'tag-1' });
    });
    (0, vitest_1.it)('returns 400 when updating with existing name', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagFindFirst.mockResolvedValue({ id: 'tag-2' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/tags/tag-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ name: 'Tag 1' });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Tag name or slug already in use' });
    });
    (0, vitest_1.it)('returns 404 when updating missing tag', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagUpdate.mockRejectedValue({ code: 'P2025' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/tags/tag-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ name: 'Tag 1' });
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Tag not found' });
    });
    (0, vitest_1.it)('returns 500 when updating tag fails unexpectedly', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagUpdate.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/tags/tag-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ name: 'Tag 1' });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to update tag' });
    });
    (0, vitest_1.it)('deletes a tag', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagDelete.mockResolvedValue({});
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/admin/tags/tag-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ message: 'Tag deleted successfully' });
    });
    (0, vitest_1.it)('returns 404 when deleting missing tag', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagDelete.mockRejectedValue({ code: 'P2025' });
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/admin/tags/tag-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Tag not found' });
    });
    (0, vitest_1.it)('returns 500 when deleting tag fails unexpectedly', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTagDelete.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/admin/tags/tag-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to delete tag' });
    });
});
//# sourceMappingURL=tags.test.js.map