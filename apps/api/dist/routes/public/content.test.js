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
            content: {
                findMany: vitestVi.fn(),
                findFirst: vitestVi.fn(),
            },
        },
    };
});
const index_1 = __importDefault(require("../../index"));
const db_1 = require("../../db");
const mockContentFindMany = db_1.prisma.content.findMany;
const mockContentFindFirst = db_1.prisma.content.findFirst;
(0, vitest_1.describe)('Public content routes', () => {
    (0, vitest_1.beforeEach)(() => {
        mockContentFindMany.mockReset();
        mockContentFindFirst.mockReset();
    });
    (0, vitest_1.describe)('GET /api/search', () => {
        (0, vitest_1.it)('returns 400 when query is missing', async () => {
            const res = await (0, supertest_1.default)(index_1.default).get('/api/content/search');
            (0, vitest_1.expect)(res.status).toBe(400);
            (0, vitest_1.expect)(res.body).toEqual({ error: 'Search query is required' });
        });
        (0, vitest_1.it)('returns 200 with results', async () => {
            mockContentFindMany.mockResolvedValue([{ id: 'c1', title: 'Test' }]);
            const res = await (0, supertest_1.default)(index_1.default).get('/api/content/search?q=test');
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body).toEqual([{ id: 'c1', title: 'Test' }]);
        });
        (0, vitest_1.it)('returns 500 when search fails', async () => {
            mockContentFindMany.mockRejectedValue(new Error('boom'));
            const res = await (0, supertest_1.default)(index_1.default).get('/api/content/search?q=test');
            (0, vitest_1.expect)(res.status).toBe(500);
            (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to search content' });
        });
    });
    (0, vitest_1.describe)('GET /api/content/latest', () => {
        (0, vitest_1.it)('returns 200 with list', async () => {
            mockContentFindMany.mockResolvedValue([{ id: 'c1', title: 'Recent' }]);
            const res = await (0, supertest_1.default)(index_1.default).get('/api/content/latest');
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body).toEqual([{ id: 'c1', title: 'Recent' }]);
        });
        (0, vitest_1.it)('returns 500 when latest fetch fails', async () => {
            mockContentFindMany.mockRejectedValue(new Error('boom'));
            const res = await (0, supertest_1.default)(index_1.default).get('/api/content/latest');
            (0, vitest_1.expect)(res.status).toBe(500);
            (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch latest content' });
        });
    });
    (0, vitest_1.describe)('GET /api/content/:slug', () => {
        (0, vitest_1.it)('returns 404 when content not found', async () => {
            mockContentFindFirst.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(index_1.default).get('/api/content/slug');
            (0, vitest_1.expect)(res.status).toBe(404);
            (0, vitest_1.expect)(res.body).toEqual({ error: 'Content not found' });
        });
        (0, vitest_1.it)('returns 404 when topic or course is not published', async () => {
            mockContentFindFirst.mockResolvedValue({
                slug: 'slug',
                isPublished: true,
                sortOrder: 1,
                courseId: 'c1',
                topic: { isPublished: false },
                course: { isPublished: true },
            });
            const res = await (0, supertest_1.default)(index_1.default).get('/api/content/slug');
            (0, vitest_1.expect)(res.status).toBe(404);
            (0, vitest_1.expect)(res.body).toEqual({ error: 'Content not found' });
        });
        (0, vitest_1.it)('returns 200 with navigation when content belongs to a course', async () => {
            mockContentFindFirst
                .mockResolvedValueOnce({
                slug: 'slug',
                isPublished: true,
                sortOrder: 1,
                courseId: 'c1',
                topic: { isPublished: true },
                course: { isPublished: true },
            })
                .mockResolvedValueOnce({ slug: 'prev', title: 'Prev' })
                .mockResolvedValueOnce({ slug: 'next', title: 'Next' });
            const res = await (0, supertest_1.default)(index_1.default).get('/api/content/slug');
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body).toHaveProperty('navigation');
            (0, vitest_1.expect)(res.body.navigation).toEqual({ prev: { slug: 'prev', title: 'Prev' }, next: { slug: 'next', title: 'Next' } });
        });
        (0, vitest_1.it)('returns 200 when content has no course (no navigation)', async () => {
            mockContentFindFirst
                .mockResolvedValue({
                slug: 'slug',
                isPublished: true,
                sortOrder: 1,
                courseId: null,
                topic: { isPublished: true },
                course: null,
            });
            const res = await (0, supertest_1.default)(index_1.default).get('/api/content/slug');
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body).toHaveProperty('navigation');
            (0, vitest_1.expect)(res.body.navigation).toEqual({ prev: null, next: null });
        });
        (0, vitest_1.it)('returns 500 when fetching content details fails', async () => {
            mockContentFindFirst.mockRejectedValue(new Error('boom'));
            const res = await (0, supertest_1.default)(index_1.default).get('/api/content/slug');
            (0, vitest_1.expect)(res.status).toBe(500);
            (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch content details' });
        });
    });
});
//# sourceMappingURL=content.test.js.map