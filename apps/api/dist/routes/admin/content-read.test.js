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
                findMany: vitestVi.fn(),
                findUnique: vitestVi.fn(),
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
const mockContentFindMany = db_1.prisma.content.findMany;
const mockContentFindUnique = db_1.prisma.content.findUnique;
(0, vitest_1.describe)('Admin content read routes', () => {
    (0, vitest_1.beforeEach)(() => {
        mockAdminFindUnique.mockReset();
        mockContentFindMany.mockReset();
        mockContentFindUnique.mockReset();
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    });
    (0, vitest_1.it)('lists content with query filters', async () => {
        mockContentFindMany.mockResolvedValue([
            { id: 'content-1', title: 'First' },
        ]);
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/content')
            .query({ topicId: 'topic1', courseId: 'course1' })
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual([{ id: 'content-1', title: 'First' }]);
        (0, vitest_1.expect)(mockContentFindMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            where: vitest_1.expect.objectContaining({ topicId: 'topic1', courseId: 'course1' }),
        }));
    });
    (0, vitest_1.it)('returns 500 when list content fails', async () => {
        mockContentFindMany.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/content')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch content' });
    });
    (0, vitest_1.it)('gets content by id', async () => {
        mockContentFindUnique.mockResolvedValue({ id: 'content-1', title: 'First' });
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ id: 'content-1', title: 'First' });
    });
    (0, vitest_1.it)('returns 404 when content by id not found', async () => {
        mockContentFindUnique.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Content not found' });
    });
    (0, vitest_1.it)('returns 500 when fetching content by id fails', async () => {
        mockContentFindUnique.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/content/content-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch content block' });
    });
});
//# sourceMappingURL=content-read.test.js.map