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
// Mock Prisma and auth
vitest_1.vi.mock('../../db', async () => {
    const { vi: vitestVi } = await Promise.resolve().then(() => __importStar(require('vitest')));
    return {
        prisma: {
            admin: {
                findUnique: vitestVi.fn(),
            },
            course: {
                findMany: vitestVi.fn(),
                findUnique: vitestVi.fn(),
                findFirst: vitestVi.fn(),
                create: vitestVi.fn(),
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
const mockCourseFindMany = db_1.prisma.course.findMany;
const mockCourseFindUnique = db_1.prisma.course.findUnique;
const mockCourseFindFirst = db_1.prisma.course.findFirst;
const mockCourseCreate = db_1.prisma.course.create;
const mockCourseUpdate = db_1.prisma.course.update;
const mockCourseDelete = db_1.prisma.course.delete;
const mockTransaction = db_1.prisma.$transaction;
(0, vitest_1.describe)('Admin courses routes', () => {
    (0, vitest_1.beforeEach)(() => {
        mockAdminFindUnique.mockReset();
        mockCourseFindMany.mockReset();
        mockCourseFindUnique.mockReset();
        mockCourseFindFirst.mockReset();
        mockCourseCreate.mockReset();
        mockCourseUpdate.mockReset();
        mockCourseDelete.mockReset();
        mockTransaction.mockReset();
    });
    (0, vitest_1.it)('lists courses', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseFindMany.mockResolvedValue([{ id: 'course-1', title: 'Course 1' }]);
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/courses')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual([{ id: 'course-1', title: 'Course 1' }]);
    });
    (0, vitest_1.it)('lists courses filtered by topicId', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseFindMany.mockResolvedValue([{ id: 'course-2', title: 'Course 2' }]);
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/courses')
            .query({ topicId: 'topic-1' })
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual([{ id: 'course-2', title: 'Course 2' }]);
        (0, vitest_1.expect)(mockCourseFindMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ where: { topicId: 'topic-1' } }));
    });
    (0, vitest_1.it)('returns 500 when listing courses fails', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseFindMany.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/admin/courses')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to fetch courses' });
    });
    (0, vitest_1.it)('creates a course when slug is unique', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseFindUnique.mockResolvedValue(null);
        mockCourseCreate.mockResolvedValue({ id: 'course-1', title: 'Test Course', slug: 'test-course' });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/courses')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            topicId: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Course',
            description: 'Desc',
            isPublished: true,
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body).toHaveProperty('slug', 'test-course');
    });
    (0, vitest_1.it)('returns 500 when course creation fails unexpectedly', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseFindUnique.mockResolvedValue(null);
        mockCourseCreate.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/courses')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            topicId: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Course',
            description: 'Desc',
            isPublished: true,
        });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to create course' });
    });
    (0, vitest_1.it)('returns 400 when course slug already exists', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseFindUnique.mockResolvedValue({ id: 'course-1', slug: 'test-course' });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/courses')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({
            topicId: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Course',
            description: 'Desc',
            isPublished: true,
            slug: 'test-course',
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Course with this slug already exists in the selected topic' });
    });
    (0, vitest_1.it)('updates a course when it exists', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseFindUnique.mockResolvedValue({ id: 'course-1', topicId: 'topic-1', slug: 'old-slug' });
        mockCourseFindFirst.mockResolvedValue(null);
        mockCourseUpdate.mockResolvedValue({ id: 'course-1', slug: 'new-slug' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/courses/course-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ slug: 'new-slug' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty('slug', 'new-slug');
    });
    (0, vitest_1.it)('returns 404 when updating a missing course', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseFindUnique.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/courses/course-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ slug: 'new-slug' });
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Course not found' });
    });
    (0, vitest_1.it)('returns 400 when updating course slug collides', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseFindUnique.mockResolvedValue({ id: 'course-1', topicId: 'topic-1', slug: 'old-slug' });
        mockCourseFindFirst.mockResolvedValue({ id: 'course-2' });
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/courses/course-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ slug: 'existing-slug' });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Course with this slug already exists in the selected topic' });
    });
    (0, vitest_1.it)('returns 500 when updating course fails unexpectedly', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseFindUnique.mockResolvedValue({ id: 'course-1', topicId: 'topic-1', slug: 'old-slug' });
        mockCourseFindFirst.mockResolvedValue(null);
        mockCourseUpdate.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .put('/api/admin/courses/course-1')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ slug: 'new-slug' });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to update course' });
    });
    (0, vitest_1.it)('deletes a course', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseDelete.mockResolvedValue({});
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/admin/courses/course-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ message: 'Course deleted successfully' });
    });
    (0, vitest_1.it)('returns 404 when deleting missing course', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseDelete.mockRejectedValue({ code: 'P2025' });
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/admin/courses/course-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Course not found' });
    });
    (0, vitest_1.it)('returns 500 when deleting course fails unexpectedly', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockCourseDelete.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .delete('/api/admin/courses/course-1')
            .set('Cookie', 'admin_token=fake-jwt-token');
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to delete course' });
    });
    (0, vitest_1.it)('reorders courses', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTransaction.mockResolvedValue([]);
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/courses/reorder')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ courseIds: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'] });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toEqual({ message: 'Courses reordered successfully' });
        (0, vitest_1.expect)(mockTransaction).toHaveBeenCalled();
    });
    (0, vitest_1.it)('returns 400 when reorder payload is invalid', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/courses/reorder')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ courseIds: ['not-a-uuid'] });
        (0, vitest_1.expect)(res.status).toBe(400);
    });
    (0, vitest_1.it)('returns 500 when reorder fails', async () => {
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
        mockTransaction.mockRejectedValue(new Error('boom'));
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/courses/reorder')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ courseIds: ['123e4567-e89b-12d3-a456-426614174000'] });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Failed to reorder courses' });
    });
});
//# sourceMappingURL=courses.test.js.map