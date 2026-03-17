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
            topic: {
                findMany: vitestVi.fn(),
                findFirst: vitestVi.fn(),
            },
        },
    };
});
const index_1 = __importDefault(require("../../index"));
const db_1 = require("../../db");
const mockFindMany = db_1.prisma.topic.findMany;
const mockFindFirst = db_1.prisma.topic.findFirst;
(0, vitest_1.describe)('GET /api/topics', () => {
    (0, vitest_1.beforeEach)(() => {
        mockFindMany.mockReset();
        mockFindFirst.mockReset();
    });
    (0, vitest_1.it)('returns a list of topics', async () => {
        mockFindMany.mockResolvedValue([
            {
                id: 'topic-1',
                name: 'Test Topic',
                slug: 'test-topic',
                description: 'Test description',
                sortOrder: 1,
                isPublished: true,
                _count: { courses: 0, content: 0 },
            },
        ]);
        const res = await (0, supertest_1.default)(index_1.default).get('/api/topics');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveLength(1);
        (0, vitest_1.expect)(res.body[0]).toMatchObject({ name: 'Test Topic', slug: 'test-topic' });
        (0, vitest_1.expect)(mockFindMany).toHaveBeenCalledWith({
            where: { isPublished: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { courses: true, content: true },
                },
            },
        });
    });
    (0, vitest_1.it)('returns 500 when the database throws', async () => {
        mockFindMany.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default).get('/api/topics');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch topics' });
    });
    (0, vitest_1.describe)('GET /api/topics/:slug', () => {
        (0, vitest_1.it)('returns 400 when slug is invalid', async () => {
            const res = await (0, supertest_1.default)(index_1.default).get('/api/topics/INVALID SLUG');
            (0, vitest_1.expect)(res.status).toBe(400);
            (0, vitest_1.expect)(res.body).toEqual({ error: 'Invalid slug: only alphanumeric, hyphens, and underscores allowed' });
        });
        (0, vitest_1.it)('returns 404 when topic is not found', async () => {
            mockFindFirst.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(index_1.default).get('/api/topics/test-topic');
            (0, vitest_1.expect)(res.status).toBe(404);
            (0, vitest_1.expect)(res.body).toEqual({ error: 'Topic not found' });
        });
        (0, vitest_1.it)('returns 200 when topic is found', async () => {
            mockFindFirst.mockResolvedValue({
                id: 'topic-1',
                slug: 'test-topic',
                name: 'Test Topic',
                isPublished: true,
                courses: [],
                content: [],
            });
            const res = await (0, supertest_1.default)(index_1.default).get('/api/topics/test-topic');
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body).toMatchObject({ slug: 'test-topic', name: 'Test Topic' });
        });
        (0, vitest_1.it)('returns 500 when fetching topic fails', async () => {
            mockFindFirst.mockRejectedValue(new Error('boom'));
            const res = await (0, supertest_1.default)(index_1.default).get('/api/topics/test-topic');
            (0, vitest_1.expect)(res.status).toBe(500);
            (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch topic' });
        });
    });
});
//# sourceMappingURL=topics.test.js.map