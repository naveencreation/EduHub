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
            tag: {
                findUnique: vitestVi.fn(),
                findMany: vitestVi.fn(),
            },
            content: {
                findMany: vitestVi.fn(),
            },
        },
    };
});
const index_1 = __importDefault(require("../../index"));
const db_1 = require("../../db");
const mockTagFindUnique = db_1.prisma.tag.findUnique;
const mockTagFindMany = db_1.prisma.tag.findMany;
const mockContentFindMany = db_1.prisma.content.findMany;
(0, vitest_1.describe)('GET /api/tags', () => {
    (0, vitest_1.beforeEach)(() => {
        mockTagFindUnique.mockReset();
        mockTagFindMany.mockReset();
        mockContentFindMany.mockReset();
    });
    (0, vitest_1.it)('returns a list of tags', async () => {
        mockTagFindMany.mockResolvedValue([
            { id: 'tag-1', name: 'Tag 1', slug: 'tag-1' },
            { id: 'tag-2', name: 'Tag 2', slug: 'tag-2' },
        ]);
        const res = await (0, supertest_1.default)(index_1.default).get('/api/tags');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveLength(2);
        (0, vitest_1.expect)(res.body[0]).toHaveProperty('slug', 'tag-1');
    });
    (0, vitest_1.it)('returns 500 when the database throws on list', async () => {
        mockTagFindMany.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default).get('/api/tags');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch tags' });
    });
    (0, vitest_1.it)('returns content for a tag when found', async () => {
        mockTagFindUnique.mockResolvedValue({ id: 'tag-1', name: 'Tag 1', slug: 'tag-1' });
        mockContentFindMany.mockResolvedValue([
            {
                id: 'content-1',
                title: 'Content 1',
                slug: 'content-1',
                isPublished: true,
                topic: { name: 'Topic', slug: 'topic' },
                course: { title: 'Course', slug: 'course' },
                contentTags: [{ tag: { id: 'tag-1', name: 'Tag 1', slug: 'tag-1' } }],
            },
        ]);
        const res = await (0, supertest_1.default)(index_1.default).get('/api/tags/tag-1/content');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty('tag');
        (0, vitest_1.expect)(res.body).toHaveProperty('content');
        (0, vitest_1.expect)(res.body.content).toHaveLength(1);
    });
    (0, vitest_1.it)('returns 404 when tag not found', async () => {
        mockTagFindUnique.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(index_1.default).get('/api/tags/missing/content');
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Tag not found' });
    });
    (0, vitest_1.it)('returns 500 when fetching content by tag fails', async () => {
        mockTagFindUnique.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default).get('/api/tags/tag-1/content');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch content by tag' });
    });
});
//# sourceMappingURL=tags.test.js.map