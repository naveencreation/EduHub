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
            course: {
                findMany: vitestVi.fn(),
                findFirst: vitestVi.fn(),
            },
        },
    };
});
const index_1 = __importDefault(require("../../index"));
const db_1 = require("../../db");
const mockFindMany = db_1.prisma.course.findMany;
const mockFindFirst = db_1.prisma.course.findFirst;
(0, vitest_1.describe)('GET /api/courses', () => {
    (0, vitest_1.beforeEach)(() => {
        mockFindMany.mockReset();
        mockFindFirst.mockReset();
    });
    (0, vitest_1.it)('returns a list of courses', async () => {
        mockFindMany.mockResolvedValue([
            {
                id: 'course-1',
                title: 'Test Course',
                slug: 'test-course',
                description: 'Test description',
                sortOrder: 1,
                isPublished: true,
                topic: { name: 'Topic', slug: 'topic' },
                _count: { content: 3 },
            },
        ]);
        const res = await (0, supertest_1.default)(index_1.default).get('/api/courses');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveLength(1);
        (0, vitest_1.expect)(res.body[0]).toMatchObject({ title: 'Test Course', slug: 'test-course' });
        (0, vitest_1.expect)(mockFindMany).toHaveBeenCalledWith({
            where: { isPublished: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                topic: {
                    select: { name: true, slug: true },
                },
                _count: {
                    select: { content: { where: { isPublished: true } } },
                },
            },
        });
    });
    (0, vitest_1.it)('returns 500 when the database throws on list', async () => {
        mockFindMany.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default).get('/api/courses');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch courses' });
    });
    (0, vitest_1.it)('returns a single course by slug', async () => {
        mockFindFirst.mockResolvedValue({
            id: 'course-1',
            title: 'Test Course',
            slug: 'test-course',
            description: 'Test description',
            sortOrder: 1,
            isPublished: true,
            topic: { name: 'Topic', slug: 'topic' },
            content: [],
        });
        const res = await (0, supertest_1.default)(index_1.default).get('/api/courses/test-course');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toMatchObject({ slug: 'test-course' });
        (0, vitest_1.expect)(mockFindFirst).toHaveBeenCalledWith({
            where: { slug: 'test-course', isPublished: true },
            include: {
                topic: { select: { name: true, slug: true } },
                content: {
                    where: { isPublished: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });
    });
    (0, vitest_1.it)('returns 404 when course is not found', async () => {
        mockFindFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(index_1.default).get('/api/courses/not-found');
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Course not found' });
    });
    (0, vitest_1.it)('returns 500 when fetching course fails unexpectedly', async () => {
        mockFindFirst.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default).get('/api/courses/test-course');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch course' });
    });
});
//# sourceMappingURL=courses.test.js.map