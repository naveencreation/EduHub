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
const envBackup = { ...process.env };
(0, vitest_1.describe)('Admin content upload routes', () => {
    (0, vitest_1.beforeEach)(() => {
        mockAdminFindUnique.mockReset();
        mockAdminFindUnique.mockResolvedValue({ id: 'admin-123', email: 'admin@example.com' });
    });
    (0, vitest_1.afterEach)(() => {
        process.env = { ...envBackup };
    });
    (0, vitest_1.it)('returns 400 when presign payload missing required fields', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content/upload/presign')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({});
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'filename and contentType are required' });
    });
    (0, vitest_1.it)('returns 500 when presign env vars are missing', async () => {
        delete process.env.CLOUDFLARE_ACCOUNT_ID;
        delete process.env.CLOUDFLARE_API_TOKEN;
        delete process.env.CLOUDFLARE_R2_BUCKET_NAME;
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content/upload/presign')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ filename: 'video.mp4', contentType: 'video/mp4' });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'R2 upload not configured. Contact admin.' });
    });
    (0, vitest_1.it)('returns 200 with uploadUrl when presign env vars are present', async () => {
        process.env.CLOUDFLARE_ACCOUNT_ID = 'acct-123';
        process.env.CLOUDFLARE_API_TOKEN = 'token-123';
        process.env.CLOUDFLARE_R2_BUCKET_NAME = 'bucket';
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content/upload/presign')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({ filename: 'video.mp4', contentType: 'video/mp4' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty('uploadUrl');
        (0, vitest_1.expect)(res.body).toHaveProperty('fileUrl');
        (0, vitest_1.expect)(res.body).toHaveProperty('warning');
    });
    (0, vitest_1.it)('returns 500 when video upload env vars are missing', async () => {
        delete process.env.CLOUDFLARE_STREAM_ACCOUNT_ID;
        delete process.env.CLOUDFLARE_API_TOKEN;
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content/upload/video')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({});
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body).toEqual({ error: 'Stream upload not configured. Contact admin.' });
    });
    (0, vitest_1.it)('returns 200 with stream upload info when env vars are provided', async () => {
        process.env.CLOUDFLARE_STREAM_ACCOUNT_ID = 'stream-acct-123';
        process.env.CLOUDFLARE_API_TOKEN = 'token-123';
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/admin/content/upload/video')
            .set('Cookie', 'admin_token=fake-jwt-token')
            .send({});
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body).toHaveProperty('uploadUrl');
        (0, vitest_1.expect)(res.body).toHaveProperty('warning');
        (0, vitest_1.expect)(res.body).toHaveProperty('documentationLink');
    });
});
//# sourceMappingURL=content-upload.test.js.map